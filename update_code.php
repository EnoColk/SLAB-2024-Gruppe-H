<?php
include 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = $_POST['code'];

    $sql = "INSERT INTO code (id, content) VALUES (1, ?) ON DUPLICATE KEY UPDATE content=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ss', $code, $code);
    $stmt->execute();
    $stmt->close();
}

$conn->close();
?>
