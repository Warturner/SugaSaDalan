<?php
require 'db_connect.php';

// Set headers for CORS and content type
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    // Check if a specific story ID is requested
    $postId = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($postId) {
        // Fetch a single story (Added category and pin fields)
        $sql = "SELECT 
                    s.post_id, 
                    s.title, 
                    s.excerpt,
                    s.content, 
                    s.image_path,
                    s.published_date,
                    s.category_id,
                    s.is_pinned,
                    s.pin_until,
                    c.name AS category_name,
                    u.username AS author
                FROM stories s
                LEFT JOIN users u ON s.author_id = u.user_id
                LEFT JOIN story_categories c ON s.category_id = c.id
                WHERE s.post_id = :post_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':post_id', $postId, PDO::PARAM_INT);
    } else {
        // Fetch all stories (Added active_pin calculation for proper sorting)
        $sql = "SELECT 
                    s.post_id, 
                    s.title, 
                    s.content,
                    s.excerpt, 
                    s.image_path,
                    s.published_date,
                    s.category_id,
                    s.is_pinned,
                    s.pin_until,
                    c.name AS category_name,
                    u.username AS author,
                    CASE 
                        WHEN s.is_pinned = 1 AND (s.pin_until IS NULL OR s.pin_until > NOW()) THEN 1 
                        ELSE 0 
                    END as active_pin
                FROM stories s
                LEFT JOIN users u ON s.author_id = u.user_id
                LEFT JOIN story_categories c ON s.category_id = c.id
                ORDER BY active_pin DESC, s.published_date DESC";
        $stmt = $conn->prepare($sql);
    }

    $stmt->execute();

    $base_url = "https://thirty-dragons-appear.loca.lt/GuidingLight_Project/guiding_light_backend/";

    if ($postId) {
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($result && !empty($result['image_path'])) {
            $result['image'] = $base_url . $result['image_path'];
        }
        // Return the single story object, or null if not found
        echo json_encode($result);
    } else {
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($results as &$row) {
            if (!empty($row['image_path'])) {
                $row['image'] = $base_url . $row['image_path'];
            }
        }
        unset($row); // break the reference with the last element
        // Return the array of all stories
        echo json_encode($results);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>