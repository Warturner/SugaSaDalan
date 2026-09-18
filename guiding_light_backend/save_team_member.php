<?php
require 'db_connect.php';

$currentUser = requireAdmin();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

try {
    $id = $_POST['id'] ?? null;
    $name = $_POST['name'] ?? '';
    $role = $_POST['role'] ?? '';
    $email = $_POST['email'] ?? '';
    // NEW: Capture display order
    $display_order = $_POST['display_order'] ?? 999;

    if (empty($name) || empty($role)) {
        echo json_encode(['error' => 'Name and Role are required.']);
        exit;
    }

    $image_path = null;

    if ($id) {
        $stmt = $conn->prepare("SELECT image_path FROM team_members WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($existing) $image_path = $existing['image_path'];
    }

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/team/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

        $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $new_filename = uniqid('team_') . '.' . $file_extension;
        $target_file = $upload_dir . $new_filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            if ($image_path && file_exists($image_path)) unlink($image_path);
            $image_path = $target_file;
        }
    }

    // UPDATED SQL TO INCLUDE DISPLAY ORDER
    if ($id) {
        $sql = "UPDATE team_members SET name = ?, role = ?, email = ?, image_path = ?, display_order = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$name, $role, $email, $image_path, $display_order, $id]);
    } else {
        $sql = "INSERT INTO team_members (name, role, email, image_path, display_order) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$name, $role, $email, $image_path, $display_order]);
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>