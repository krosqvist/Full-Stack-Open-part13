CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes integer DEFAULT 0
);

INSERT INTO blogs (author, url, title) VALUES
('Matti Luukkainen', 'fullstack.com', 'Full Stack SQL'),
('Test Testerson', 'test.com', 'Test Test Test');