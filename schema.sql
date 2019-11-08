DROP TABLE IF EXISTS locations, movies;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7)
  );

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR (255),
    overview VARCHAR (1000),
    average_votes REAL,
    total_votes INTEGER,
    image_url VARCHAR (255),
    popularity NUMERIC (6, 4),
    released_on CHAR (10),
    created_at CHAR (10),
    location_id INTEGER NOT NULL REFERENCES locations(id)
);


