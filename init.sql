CREATE TABLE short_urls (
  short_url_id SERIAL PRIMARY KEY,
  short_url VARCHAR(50) NOT NULL,
  long_url VARCHAR(2048) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP
);

CREATE TABLE clicks (
  click_id SERIAL UNIQUE NOT NULL,
  short_url_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  FOREIGN KEY (short_url_id) REFERENCES short_urls(short_url_id)
);
