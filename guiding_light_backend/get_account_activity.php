<?php
require 'db_connect.php';
require 'auth.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

// Enforce ADMIN ONLY on the backend. Hiding the sidebar is not enough.
requireAdmin();

try {
    $search = $_GET['search'] ?? '';
    $from = $_GET['from'] ?? '';
    $to = $_GET['to'] ?? '';
    $action = $_GET['action'] ?? '';
    $pageValue = $_GET['page'] ?? '1';

    if (!is_string($search) || !is_string($from) || !is_string($to) ||
        !is_string($action) || !is_scalar($pageValue)) {
        throw new InvalidArgumentException('Invalid filters.');
    }
    $search = trim($search);
    if (mb_strlen($search) > 100) {
        throw new InvalidArgumentException('Search must not exceed 100 characters.');
    }

    $validActions = [
        'account_created', 'username_changed', 'role_changed',
        'password_changed', 'account_deleted'
    ];
    if ($action !== '' && !in_array($action, $validActions, true)) {
        throw new InvalidArgumentException('Invalid action filter.');
    }

    foreach (['from' => $from, 'to' => $to] as $key => $date) {
        if ($date === '') continue;
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/D', $date)) {
            throw new InvalidArgumentException('Invalid ' . $key . ' date.');
        }
        [$year, $month, $day] = array_map('intval', explode('-', $date));
        if (!checkdate($month, $day, $year)) {
            throw new InvalidArgumentException('Invalid ' . $key . ' date.');
        }
    }
    if ($from !== '' && $to !== '' && $from > $to) {
        throw new InvalidArgumentException('Start date must not be after end date.');
    }

    $page = filter_var($pageValue, FILTER_VALIDATE_INT);
    if (!$page || $page < 1 || $page > 1000) {
        throw new InvalidArgumentException('Invalid page number.');
    }

    $filters = [];
    $params = [];
    if ($search !== '') {
        $filters[] = '(actor_username LIKE :s_actor OR target_username LIKE :s_target
                       OR action LIKE :s_action OR details LIKE :s_details)';
        $pattern = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search) . '%';
        $params[':s_actor'] = $pattern;
        $params[':s_target'] = $pattern;
        $params[':s_action'] = $pattern;
        $params[':s_details'] = $pattern;
    }
    if ($action !== '') {
        $filters[] = 'action = :action';
        $params[':action'] = $action;
    }
    if ($from !== '') {
        $filters[] = 'created_at >= :from_date';
        $params[':from_date'] = $from . ' 00:00:00';
    }
    if ($to !== '') {
        $filters[] = 'created_at < DATE_ADD(:to_date, INTERVAL 1 DAY)';
        $params[':to_date'] = $to . ' 00:00:00';
    }

    $where = $filters ? (' WHERE ' . implode(' AND ', $filters)) : '';
    $sql = 'SELECT log_id, actor_username, target_username, action, details, created_at
            FROM account_activity_logs' . $where . '
            ORDER BY created_at DESC, log_id DESC
            LIMIT :limit OFFSET :offset';

    $stmt = $conn->prepare($sql);
    foreach ($params as $placeholder => $value) {
        $stmt->bindValue($placeholder, $value, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', 51, PDO::PARAM_INT);
    $stmt->bindValue(':offset', ($page - 1) * 50, PDO::PARAM_INT);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $hasMore = count($rows) > 50;
    if ($hasMore) $rows = array_slice($rows, 0, 50);

    echo json_encode([
        'success' => true,
        'logs' => $rows,
        'page' => $page,
        'has_more' => $hasMore
    ], JSON_INVALID_UTF8_SUBSTITUTE);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Unable to load account activity.']);
}
