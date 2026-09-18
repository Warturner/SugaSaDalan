<?php

require 'db_connect.php';

header("Content-Type: application/json; charset=UTF-8");

try {

    $stmt = $conn->query("
        SELECT *
        FROM team_members
        ORDER BY display_order ASC, id ASC
    ");

    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $base_url = "/guiding_light_backend/";

    foreach ($members as &$member) {

        if (!empty($member['image_path'])) {
            $member['image_url'] =
                $base_url . $member['image_path'];
        } else {
            $member['image_url'] = null;
        }
    }

    unset($member);

    echo json_encode($members);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'error' => 'Unable to load team members.'
    ]);
}