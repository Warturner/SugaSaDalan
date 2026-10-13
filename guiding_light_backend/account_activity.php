<?php
/**
 * Call within the SAME database transaction as the account mutation.
 * Snapshots preserve actor and target usernames after users are deleted.
 * Never pass passwords, password hashes, session tokens or secret values.
 */
function recordAccountActivity(
    PDO $conn,
    int $actorUserId,
    string $actorUsername,
    int $targetUserId,
    string $targetUsername,
    string $action,
    string $details
): void {
    $stmt = $conn->prepare(
        'INSERT INTO account_activity_logs
         (actor_user_id, actor_username, target_user_id, target_username, action, details)
         VALUES (:actor_id, :actor_name, :target_id, :target_name, :action, :details)'
    );
    $stmt->execute([
        ':actor_id' => $actorUserId,
        ':actor_name' => $actorUsername,
        ':target_id' => $targetUserId,
        ':target_name' => $targetUsername,
        ':action' => $action,
        ':details' => $details
    ]);
}
