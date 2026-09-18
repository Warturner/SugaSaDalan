<?php

require 'db_connect.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed.'
    ]);

    exit;
}

$currentUser = requireRole([
    'admin',
    'media'
]);

try {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (
        !is_array($data) ||
        empty($data)
    ) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'Invalid team order data.'
        ]);

        exit;
    }

    $conn->beginTransaction();

    $stmt = $conn->prepare("
        UPDATE team_members
        SET display_order = :display_order
        WHERE id = :id
    ");

    foreach ($data as $item) {

        if (
            !isset($item['id']) ||
            !isset($item['display_order'])
        ) {
            throw new Exception(
                'Missing team member ID or display order.'
            );
        }

        $id =
            (int) $item['id'];

        $displayOrder =
            (int) $item['display_order'];

        if (
            $id <= 0 ||
            $displayOrder <= 0
        ) {
            throw new Exception(
                'Invalid team member order values.'
            );
        }

        $stmt->execute([
            ':id' => $id,
            ':display_order' =>
                $displayOrder
        ]);
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' =>
            'Team order updated successfully.'
    ]);

} catch (Throwable $e) {

    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' =>
            'Unable to update team order.'
    ]);
}