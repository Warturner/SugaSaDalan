<?php
require 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    // UPDATED: Now sorts by display_order first!
    $stmt = $conn->query("SELECT * FROM team_members ORDER BY display_order ASC, id ASC");
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $base_url = "/guiding_light_backend/";
    
    foreach ($members as &$member) {
        if (!empty($member['image_path'])) {
            $member['image_url'] = $base_url . $member['image_path'];
        }
    }

    echo json_encode($members);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>