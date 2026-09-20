CREATE TABLE library (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_user_id INTEGER REFERENCES user_data(id) ON DELETE CASCADE,
    is_global BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE library_entry (
    id SERIAL PRIMARY KEY,
    library_id INTEGER REFERENCES library(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    media_type VARCHAR(20) NOT NULL
);

-- Insert the Global Library
INSERT INTO library (name, owner_user_id, is_global) VALUES ('Global Library', NULL, TRUE);
