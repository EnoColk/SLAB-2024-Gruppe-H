<?php
include 'db_config.php';

$sql = "SELECT content FROM code WHERE id=1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo $row['content'];
} else {
    echo "// Start coding...";
}

$conn->close();
?>
