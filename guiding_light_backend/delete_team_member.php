<?php
require 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

try {
    $stmt = $conn->prepare("SELECT image_path FROM team_members WHERE id = ?");
    $stmt->execute([$id]);
    $member = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($member) {
        if (!empty($member['image_path'])) {
            $filename = basename($member['image_path']);
            // Targets guiding_light_backend/uploads/team/
            $filepath = __DIR__ . "/uploads/team/" . $filename;
            
            if (file_exists($filepath)) {
                unlink($filepath);
            }
        }
        
        $del = $conn->prepare("DELETE FROM team_members WHERE id = ?");
        $del->execute([$id]);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>