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
            'error' => 'Invalid content type.'
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
                'Title and content are required.'
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

    /*
     * Validate attachments BEFORE creating
     * the database record.
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

            validateStoryPdf($file);

            $attachmentFiles[] =
                $file;
        }
    }

    if (
        $contentType === 'publication' &&
        count($attachmentFiles) === 0
    ) {
        throw new InvalidArgumentException(
            'A publication must have a PDF attachment.'
        );
    }

    $imagePath = null;

    if (isset($_FILES['image'])) {
        $imagePath =
            saveStoryCoverImage(
                $_FILES['image']
            );
    }

    $stmt = $conn->prepare(
        "INSERT INTO stories (
            title,
            content_type,
            excerpt,
            content,
            author_id,
            image_path,
            category_id,
            is_pinned,
            pin_until
        )
        VALUES (
            :title,
            :content_type,
            :excerpt,
            :content,
            :author_id,
            :image_path,
            :category_id,
            :is_pinned,
            :pin_until
        )"
    );

    $stmt->execute([
        ':title' =>
            $title,
        ':content_type' =>
            $contentType,
        ':excerpt' =>
            $excerpt,
        ':content' =>
            $content,
        ':author_id' =>
            $currentUser['id'],
        ':image_path' =>
            $imagePath,
        ':category_id' =>
            $categoryId,
        ':is_pinned' =>
            $isPinned,
        ':pin_until' =>
            $pinUntil
    ]);

    $postId =
        (int) $conn->lastInsertId();

    foreach (
        $attachmentFiles
        as $file
    ) {
        $attachment =
            saveStoryPdf($file);

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

    echo json_encode([
        'success' => true,
        'post_id' => $postId
    ]);

} catch (InvalidArgumentException $e) {

    http_response_code(400);

    echo json_encode([
        'error' => $e->getMessage()
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'error' =>
            'Failed to create story.'
    ]);
}