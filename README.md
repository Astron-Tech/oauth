# Custom OAuth 2.0 Provider

A production-ready, extensible OAuth 2.0 server built with Node.js and Express.  
It includes secure password handling, JWT tokens, PostgreSQL storage, CSRF protection, rate limiting, and more.

## Features

- Authorization Code and Refresh Token grants
- JWT-signed access and refresh tokens
- Secure password hashing (bcrypt)
- Persistent storage (PostgreSQL)
- Strict redirect URI validation
- CSRF protection and rate limiting
- Extensible scopes and grant types
- Sample frontend with a custom OAuth button

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/YOUR-ORG/YOUR-REPO.git
cd YOUR-REPO
npm install
```

### 2. Database Setup

Create a PostgreSQL database and apply the schema:

```bash
psql -d your_database -f schema.sql
```

### 3. Environment Variables

Copy `.env.example` to `.env` and set your secrets and database connection.

### 4. Run the Server

```bash
node server.js
```

### 5. Try the Demo Frontend

Open `public/index.html` in a browser. Click **Sign in with MyOAuth** to test the flow.

## Security Notes

- Store secrets securely and use HTTPS in production.
- Always hash passwords and validate all inputs.
- Implement proper error handling, logging, and monitoring.

## Extending

- Add more scopes and grant types.
- Implement user registration and client management UIs.
- Integrate with your existing user management systems.

## License

MIT