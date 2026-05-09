<?php
/**
 * MK Studio Pune — Content Save Handler
 * Receives JSON from admin panel and writes to data/content.json
 * 
 * SETUP: Place this file at admin/save.php on your hosting server.
 * Ensure the data/ folder has write permissions (chmod 755 or 775).
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST requests accepted']);
    exit;
}

// Read JSON body
$input = file_get_contents('php://input');
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

// Validate JSON
$data = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

// Path to content file
$contentFile = dirname(__DIR__) . '/data/content.json';
$dataDir = dirname(__DIR__) . '/data';

// Create data directory if not exists
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Backup existing content
if (file_exists($contentFile)) {
    $backupDir = $dataDir . '/backups';
    if (!is_dir($backupDir)) mkdir($backupDir, 0755, true);
    $backupFile = $backupDir . '/content_' . date('Y-m-d_H-i-s') . '.json';
    copy($contentFile, $backupFile);
    // Keep only last 10 backups
    $backups = glob($backupDir . '/content_*.json');
    if (count($backups) > 10) {
        usort($backups, fn($a, $b) => filemtime($a) - filemtime($b));
        array_splice($backups, 10);
        foreach ($backups as $old) unlink($old);
    }
}

// Write new content
$result = file_put_contents(
    $contentFile,
    json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

if ($result === false) {
    echo json_encode([
        'success' => false,
        'message' => 'Could not write file. Check folder permissions on /data/'
    ]);
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Content saved successfully',
        'bytes'   => $result,
        'time'    => date('Y-m-d H:i:s')
    ]);
}
?>
