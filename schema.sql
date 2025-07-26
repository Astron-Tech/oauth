CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255)
);

CREATE TABLE clients (
  id VARCHAR(255) PRIMARY KEY,
  secret VARCHAR(255) NOT NULL,
  redirect_uri VARCHAR(255) NOT NULL,
  allowed_scopes VARCHAR(255)
);

CREATE TABLE auth_codes (
  code VARCHAR(255) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  client_id VARCHAR(255) REFERENCES clients(id),
  scope VARCHAR(255),
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE refresh_tokens (
  token VARCHAR(255) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  client_id VARCHAR(255) REFERENCES clients(id),
  scope VARCHAR(255),
  expires_at TIMESTAMP NOT NULL
);