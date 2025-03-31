-- Create table to store room completion data
CREATE TABLE IF NOT EXISTS room_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    room_number INT NOT NULL,
    runtime_seconds INT NOT NULL,
    completion_time DATETIME NOT NULL,
    INDEX idx_username (username),
    INDEX idx_room_number (room_number)
);