<?php
/** Admin-only, read-only login-security history. */
require 'db_connect.php';
require 'auth.php';
header('Content-Type: application/json; charset=UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    return;
}
requireAdmin();

try {
    $search = $_GET['search'] ?? '';
    $from = $_GET['from'] ?? '';
    $to = $_GET['to'] ?? '';
    $type = $_GET['type'] ?? '';
    $pageValue = $_GET['page'] ?? '1';

    if (!is_string($search) || !is_string($from) || !is_string($to) ||
        !is_string($type) || !is_scalar($pageValue)) {
        throw new InvalidArgumentException('Invalid filters.');
    }
    $search = trim($search);
    if (mb_strlen($search, 'UTF-8') > 100) {
        throw new InvalidArgumentException('Search must not exceed 100 characters.');
    }

    if ($type !== '' && !in_array($type, [
        'login_failed', 'login_success', 'login_restricted', 'admin_unlocked'
    ], true)) {
        throw new InvalidArgumentException('Unknown security event type.');
    }
    foreach (['start' => $from, 'end' => $to] as $label => $date) {
        if ($date === '') continue;
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/D', $date)) {
            throw new InvalidArgumentException('Invalid ' . $label . ' date.');
        }
        [$year, $month, $day] = array_map('intval', explode('-', $date));
        if (!checkdate($month, $day, $year)) {
            throw new InvalidArgumentException('Invalid ' . $label . ' date.');
        }
    }
    if ($from !== '' && $to !== '' && $from > $to) {
        throw new InvalidArgumentException('Start date must not be after end date.');
    }
    $page = filter_var($pageValue, FILTER_VALIDATE_INT);
    if (!$page || $page < 1 || $page > 1000) {
        throw new InvalidArgumentException('Invalid page.');
    }

    $filters = [];
    $params = [];
    if ($search !== '') {
        $filters[] = '(attempted_username LIKE :username OR details LIKE :details)';
        $pattern = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search) . '%';
        $params[':username'] = $pattern;
        $params[':details'] = $pattern;
    }
    if ($type !== '') {
        $filters[] = 'event_type = :type';
        $params[':type'] = $type;
    }
    if ($from !== '') {
        $filters[] = 'occurred_at >= :date_from';
        $params[':date_from'] = $from . ' 00:00:00';
    }
    if ($to !== '') {
        $filters[] = 'occurred_at < DATE_ADD(:date_to, INTERVAL 1 DAY)';
        $params[':date_to'] = $to . ' 00:00:00';
    }
    $where = $filters ? ' WHERE ' . implode(' AND ', $filters) : '';
    $stmt = $conn->prepare(
        'SELECT event_id, attempted_username, event_type, details, admin_actor, occurred_at
           FROM login_security_events' . $where . '
          ORDER BY occurred_at DESC, event_id DESC
          LIMIT :limit OFFSET :offset'
    );
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', 51, PDO::PARAM_INT);
    $stmt->bindValue(':offset', ($page - 1) * 50, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $hasMore = count($rows) > 50;
    if ($hasMore) $rows = array_slice($rows, 0, 50);

    echo json_encode([
        'success' => true,
        'events' => $rows,
        'page' => $page,
        'has_more' => $hasMore
    ], JSON_INVALID_UTF8_SUBSTITUTE);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (Throwable $e) {
    error_log('Unable to load login security history.');
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Unable to load security history.']);
}
