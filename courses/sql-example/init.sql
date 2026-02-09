-- Create a simple table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    role VARCHAR(50)
);

INSERT INTO users (name, role) VALUES ('Alice', 'admin');
INSERT INTO users (name, role) VALUES ('Bob', 'user');
INSERT INTO users (name, role) VALUES ('Charlie', 'user');
