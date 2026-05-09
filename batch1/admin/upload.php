<?php
/**
 * MK Studio Pune — File Upload Handler
 * Handles image and video uploads from admin panel
 * 
 * SETUP: Place at admin/upload.php on your hosting server.
 * Ensure images/ subfolders have write permissions.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'POST only']); exit;
}

$allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime'];
$maxSize       = 50 * 1024 * 1024; // 50MB
$context       = isset($_POST['context']) ? preg_replace('/[^a-z]/', '', $_POST['context']) : 'gallery';

$uploadDirs = [
    'gallery'     => '../images/gallery/',
    'equipment'   => '../images/equipment/',
    'productions' => '../images/productions/',
    'hero'        => '../images/hero/',
];

$uploadDir = $uploadDirs[$context] ?? $uploadDirs['gallery'];
$webPath   = str_replace('../', '', $uploadDir);

// Create dir
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

if (!isset($_FILES['file'])) {
    echo json_encode(['success' => false, 'message' => 'No file received']); exit;
}

$file     = $_FILES['file'];
$mime     = mime_content_type($file['tmp_name']);
$isImage  = in_array($mime, $allowedImages);
$isVideo  = in_array($mime, $allowedVideos);

if (!$isImage && !$isVideo) {
    echo json_encode(['success' => false, 'message' => "File type not allowed: $mime"]); exit;
}
if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'message' => 'File too large (max 50MB)']); exit;
}

// Sanitize filename
$ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
$filename = $safeName . '_' . time() . '.' . $ext;
$dest     = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    echo json_encode(['success' => false, 'message' => 'Upload failed']); exit;
}

// Generate thumbnail URL
$thumbUrl = $webPath . $filename;

echo json_encode([
    'success'  => true,
    'url'      => $webPath . $filename,
    'thumb'    => $isImage ? $thumbUrl : '',
    'type'     => $isImage ? 'image' : 'video',
    'filename' => $filename,
    'size'     => $file['size'],
]);
?>
