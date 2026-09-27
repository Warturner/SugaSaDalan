<?php

function uploadedFileAt(
    array $files,
    int $index
): array {
    return [
        'name' =>
            $files['name'][$index] ?? '',
        'type' =>
            $files['type'][$index] ?? '',
        'tmp_name' =>
            $files['tmp_name'][$index] ?? '',
        'error' =>
            $files['error'][$index] ?? UPLOAD_ERR_NO_FILE,
        'size' =>
            $files['size'][$index] ?? 0
    ];
}

function detectUploadMime(
    string $tmpName
): string {
    $finfo =
        new finfo(FILEINFO_MIME_TYPE);

    $mime =
        $finfo->file($tmpName);

    if (!$mime) {
        throw new InvalidArgumentException(
            'Unable to determine uploaded file type.'
        );
    }

    return $mime;
}

function validateStoryCoverImage(
    array $file
): string {
    if (
        ($file['error'] ?? UPLOAD_ERR_NO_FILE)
        !== UPLOAD_ERR_OK
    ) {
        throw new InvalidArgumentException(
            'Cover image upload failed.'
        );
    }

    if (
        ($file['size'] ?? 0) >
        5 * 1024 * 1024
    ) {
        throw new InvalidArgumentException(
            'Cover image must not exceed 5 MB.'
        );
    }

    $mime =
        detectUploadMime(
            $file['tmp_name']
        );

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp'
    ];

    if (!isset($allowed[$mime])) {
        throw new InvalidArgumentException(
            'Cover image must be JPG, PNG, or WEBP.'
        );
    }

    return $allowed[$mime];
}

function saveStoryCoverImage(
    array $file
): string {
    $extension =
        validateStoryCoverImage($file);

    $relativeDir =
        'uploads/stories/';

    $absoluteDir =
        __DIR__ . '/' . $relativeDir;

    if (
        !is_dir($absoluteDir) &&
        !mkdir(
            $absoluteDir,
            0777,
            true
        )
    ) {
        throw new RuntimeException(
            'Unable to create story upload directory.'
        );
    }

    $filename =
        'story_' .
        bin2hex(random_bytes(12)) .
        '.' .
        $extension;

    if (
        !move_uploaded_file(
            $file['tmp_name'],
            $absoluteDir . $filename
        )
    ) {
        throw new RuntimeException(
            'Unable to save cover image.'
        );
    }

    return $relativeDir . $filename;
}

function validateStoryPdf(
    array $file
): void {
    if (
        ($file['error'] ?? UPLOAD_ERR_NO_FILE)
        !== UPLOAD_ERR_OK
    ) {
        throw new InvalidArgumentException(
            'PDF upload failed.'
        );
    }

    $mime =
        detectUploadMime(
            $file['tmp_name']
        );

    if ($mime !== 'application/pdf') {
        throw new InvalidArgumentException(
            'Publication attachments must be valid PDF files.'
        );
    }
}

function saveStoryPdf(
    array $file
): array {
    validateStoryPdf($file);

    $relativeDir =
        'uploads/stories/attachments/';

    $absoluteDir =
        __DIR__ . '/' . $relativeDir;

    if (
        !is_dir($absoluteDir) &&
        !mkdir(
            $absoluteDir,
            0777,
            true
        )
    ) {
        throw new RuntimeException(
            'Unable to create attachment directory.'
        );
    }

    $filename =
        'doc_' .
        bin2hex(random_bytes(12)) .
        '.pdf';

    if (
        !move_uploaded_file(
            $file['tmp_name'],
            $absoluteDir . $filename
        )
    ) {
        throw new RuntimeException(
            'Unable to save PDF attachment.'
        );
    }

    return [
        'file_name' =>
            basename($file['name']),
        'file_path' =>
            $relativeDir . $filename,
        'file_type' =>
            'pdf',
        'file_size' =>
            (int) $file['size']
    ];
}