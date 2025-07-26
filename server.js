require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const { pool } = require('./src/db');
const { renderLoginConsent, handleAuthorizeGet, handleAuthorizePost, handleToken, handleUserinfo } = require('./src/oauth');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, sameSite: 'lax' }
}));
app.use(csrf({ cookie: false }));
app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 60 }));

// OAuth endpoints
app.get('/oauth/authorize', handleAuthorizeGet);
app.post('/oauth/authorize', handleAuthorizePost);
app.post('/oauth/token', handleToken);
app.get('/oauth/userinfo', handleUserinfo);

// Static files for demo (frontend)
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OAuth server running on http://localhost:${PORT}`));