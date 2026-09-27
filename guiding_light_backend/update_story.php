<?php

require 'db_connect.php';
require 'auth.php';
require_once 'story_uploads.php';

header(
    "Content-Type: application/json; charset=UTF-8"
);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        'error' => 'Method not allowed.'
    ]);

    exit;
}

$currentUser = requireRole([
    'admin',
    'media'
]);

try {

    $postId = filter_var(
        $_POST['post_id'] ?? null,
        FILTER_VALIDATE_INT
    );

    if (!$postId || $postId <= 0) {

        http_response_code(400);

        echo json_encode([
            'error' =>
                'A valid post ID is required.'
        ]);

        exit;
    }

    $title =
        trim($_POST['title'] ?? '');

    $excerpt =
        trim($_POST['excerpt'] ?? '');

    $content =
        $_POST['content'] ?? '';

    $contentType =
        $_POST['content_type'] ?? 'article';

    if (
        !in_array(
            $contentType,
            ['article', 'publication'],
            true
        )
    ) {

        http_response_code(400);

        echo json_encode([
            'error' =>
                'Invalid content type.'
        ]);

        exit;
    }

    if (
        $title === '' ||
        $content === ''
    ) {

        http_response_code(400);

        echo json_encode([
            'error' =>
                'Post ID, title, and content are required.'
        ]);

        exit;
    }

    if (mb_strlen($title) > 150) {

        http_response_code(400);

        echo json_encode([
            'error' =>
                'Title must not exceed 150 characters.'
        ]);

        exit;
    }

    if (mb_strlen($excerpt) > 255) {

        http_response_code(400);

        echo json_encode([
            'error' =>
                'Excerpt must not exceed 255 characters.'
        ]);

        exit;
    }

    $categoryId = null;

    if (
        isset($_POST['category_id']) &&
        $_POST['category_id'] !== ''
    ) {

        $categoryId = filter_var(
            $_POST['category_id'],
            FILTER_VALIDATE_INT
        );

        if (!$categoryId) {

            throw new InvalidArgumentException(
                'Invalid category.'
            );
        }
    }

    $isPinned =
        ($_POST['is_pinned'] ?? 'false')
        === 'true'
            ? 1
            : 0;

    $pinUntil =
        !empty($_POST['pin_until'])
            ? $_POST['pin_until']
            : null;

    $removeImage =
        ($_POST['remove_image'] ?? 'false')
        === 'true';

    /*
     * Load the current story.
     */
    $storyStmt = $conn->prepare(
        "SELECT image_path
         FROM stories
         WHERE post_id = ?
         LIMIT 1"
    );

    $storyStmt->execute([
        $postId
    ]);

    $currentStory =
        $storyStmt->fetch(
            PDO::FETCH_ASSOC
        );

    if (!$currentStory) {

        http_response_code(404);

        echo json_encode([
            'error' =>
                'Story not found.'
        ]);

        exit;
    }

    $currentImagePath =
        $currentStory['image_path'];

    /*
     * Validate new PDF attachments
     * before modifying anything.
     */
    $attachmentFiles = [];

    if (
        isset($_FILES['attachments']) &&
        is_array(
            $_FILES['attachments']['name']
        )
    ) {

        $count =
            count(
                $_FILES['attachments']['name']
            );

        for (
            $i = 0;
            $i < $count;
            $i++
        ) {

            $file =
                uploadedFileAt(
                    $_FILES['attachments'],
                    $i
                );

            if (
                $file['error']
                === UPLOAD_ERR_NO_FILE
            ) {
                continue;
            }

            validateStoryPdf(
                $file
            );

            $attachmentFiles[] =
                $file;
        }
    }

    /*
     * Check existing PDFs.
     */
    $attachmentCountStmt =
        $conn->prepare(
            "SELECT COUNT(*)
             FROM story_attachments
             WHERE post_id = ?"
        );

    $attachmentCountStmt->execute([
        $postId
    ]);

    $existingAttachmentCount =
        (int)
        $attachmentCountStmt
            ->fetchColumn();

    if (
        $contentType === 'publication' &&
        $existingAttachmentCount === 0 &&
        count($attachmentFiles) === 0
    ) {

        throw new InvalidArgumentException(
            'A publication must have a PDF attachment.'
        );
    }

    /*
     * Prepare cover image update.
     *
     * The old image is deleted only after
     * the database update succeeds.
     */
    $imagePath =
        $currentImagePath;

    $newImagePath = null;

    $shouldDeleteOldImage = false;

    if ($removeImage) {

        $imagePath = null;

        $shouldDeleteOldImage =
            !empty($currentImagePath);

    } elseif (
        isset($_FILES['image']) &&
        $_FILES['image']['error']
            !== UPLOAD_ERR_NO_FILE
    ) {

        $newImagePath =
            saveStoryCoverImage(
                $_FILES['image']
            );

        $imagePath =
            $newImagePath;

        $shouldDeleteOldImage =
            !empty($currentImagePath);
    }

    /*
     * Start database transaction.
     */
    $conn->beginTransaction();

    $updateStmt =
        $conn->prepare(
            "UPDATE stories
             SET
                title = :title,
                content_type = :content_type,
                excerpt = :excerpt,
                content = :content,
                image_path = :image_path,
                category_id = :category_id,
                is_pinned = :is_pinned,
                pin_until = :pin_until
             WHERE post_id = :post_id"
        );

    $updateStmt->execute([
        ':title' =>
            $title,

        ':content_type' =>
            $contentType,

        ':excerpt' =>
            $excerpt,

        ':content' =>
            $content,

        ':image_path' =>
            $imagePath,

        ':category_id' =>
            $categoryId,

        ':is_pinned' =>
            $isPinned,

        ':pin_until' =>
            $pinUntil,

        ':post_id' =>
            $postId
    ]);

    /*
     * Save newly uploaded PDFs.
     */
    $newlySavedAttachments = [];

    foreach (
        $attachmentFiles
        as $file
    ) {

        $attachment =
            saveStoryPdf(
                $file
            );

        $newlySavedAttachments[] =
            $attachment['file_path'];

        $attachmentStmt =
            $conn->prepare(
                "INSERT INTO story_attachments (
                    post_id,
                    file_name,
                    file_path,
                    file_type,
                    file_size
                 )
                 VALUES (?, ?, ?, ?, ?)"
            );

        $attachmentStmt->execute([
            $postId,
            $attachment['file_name'],
            $attachment['file_path'],
            $attachment['file_type'],
            $attachment['file_size']
        ]);
    }

    /*
     * Record edit history.
     */
    $changes =
        'Updated story content, text, category, or pin status.';

    if (
        $removeImage ||
        $newImagePath
    ) {

        $changes .=
            ' (Cover image was modified or removed).';
    }

    $historyStmt =
        $conn->prepare(
            "INSERT INTO story_edit_history (
                post_id,
                user_id,
                changes_made
             )
             VALUES (
                :post_id,
                :user_id,
                :changes
             )"
        );

    $historyStmt->execute([
        ':post_id' =>
            $postId,

        ':user_id' =>
            $currentUser['id'],

        ':changes' =>
            $changes
    ]);

    $conn->commit();

    /*
     * Delete the old cover only after
     * the database transaction succeeds.
     */
    if (
        $shouldDeleteOldImage &&
        $currentImagePath
    ) {

        $oldImage =
            __DIR__ .
            '/uploads/stories/' .
            basename(
                $currentImagePath
            );

        if (
            file_exists($oldImage) &&
            is_file($oldImage)
        ) {

            @unlink($oldImage);
        }
    }

    echo json_encode([
        'success' => true
    ]);

} catch (InvalidArgumentException $e) {

    if (
        isset($conn) &&
        $conn->inTransaction()
    ) {
        $conn->rollBack();
    }

    /*
     * Remove a newly stored cover if
     * the database operation failed.
     */
    if (!empty($newImagePath)) {

        $newImageFile =
            __DIR__ .
            '/uploads/stories/' .
            basename(
                $newImagePath
            );

        if (
            file_exists($newImageFile) &&
            is_file($newImageFile)
        ) {
            @unlink($newImageFile);
        }
    }

    http_response_code(400);

    echo json_encode([
        'error' =>
            $e->getMessage()
    ]);

} catch (Throwable $e) {

    if (
        isset($conn) &&
        $conn->inTransaction()
    ) {
        $conn->rollBack();
    }

    if (!empty($newImagePath)) {

        $newImageFile =
            __DIR__ .
            '/uploads/stories/' .
            basename(
                $newImagePath
            );

        if (
            file_exists($newImageFile) &&
            is_file($newImageFile)
        ) {
            @unlink($newImageFile);
        }
    }

    /*
     * Remove PDFs that were written to disk
     * before the transaction failed.
     */
    if (
        isset($newlySavedAttachments)
    ) {

        foreach (
            $newlySavedAttachments
            as $relativePath
        ) {

            $filePath =
                __DIR__ .
                '/uploads/stories/attachments/' .
                basename(
                    $relativePath
                );

            if (
                file_exists($filePath) &&
                is_file($filePath)
            ) {
                @unlink($filePath);
            }
        }
    }

    http_response_code(500);

    echo json_encode([
        'error' =>
            'Failed to update story.'
    ]);
}