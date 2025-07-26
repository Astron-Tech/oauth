const { pool } = require('./db');
const { comparePassword, generateAccessToken, generateRefreshToken } = require('./security');
const crypto = require('crypto');

// HTML render for login/consent
function renderLoginConsent(client_id, redirect_uri, scope, state, csrfToken) {
  return `
    <form method="POST" action="/oauth/authorize">
      <input type="hidden" name="client_id" value="${client_id}" />
      <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
      <input type="hidden" name="scope" value="${scope}" />
      <input type="hidden" name="state" value="${state}" />
      <input type="hidden" name="_csrf" value="${csrfToken}" />
      <label>Username: <input name="username" /></label><br/>
      <label>Password: <input name="password" type="password" /></label><br/>
      <label><input type="checkbox" name="consent" value="yes" checked /> Consent to scopes: ${scope}</label><br/>
      <button type="submit">Login & Authorize</button>
    </form>
  `;
}

async function validateClientAndRedirectURI(client_id, redirect_uri) {
  const client = await pool.query('SELECT * FROM clients WHERE id = $1', [client_id]);
  return client.rows.length && client.rows[0].redirect_uri === redirect_uri ? client.rows[0] : null;
}

async function handleAuthorizeGet(req, res) {
  const { client_id, redirect_uri, response_type, scope, state } = req.query;
  const client = await validateClientAndRedirectURI(client_id, redirect_uri);
  if (!client || response_type !== 'code') return res.status(400).send('Invalid client or response_type');
  res.send(renderLoginConsent(client_id, redirect_uri, scope, state, req.csrfToken()));
}

async function handleAuthorizePost(req, res) {
  const { username, password, client_id, redirect_uri, scope, state, consent } = req.body;
  const client = await validateClientAndRedirectURI(client_id, redirect_uri);
  if (!client || !consent) return res.status(400).send('Invalid client or consent');
  const userRes = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (!userRes.rows.length || !await comparePassword(password, userRes.rows[0].password_hash)) {
    return res.status(401).send('Invalid credentials');
  }
  const code = crypto.randomBytes(32).toString('hex');
  await pool.query('INSERT INTO auth_codes (code, user_id, client_id, scope, expires_at) VALUES ($1,$2,$3,$4,NOW()+INTERVAL\'10 MINUTES\')',
    [code, userRes.rows[0].id, client_id, scope]);
  let redirectUrl = `${redirect_uri}?code=${code}`;
  if (state) redirectUrl += `&state=${state}`;
  res.redirect(redirectUrl);
}

async function handleToken(req, res) {
  const { grant_type, code, refresh_token, client_id, client_secret, redirect_uri } = req.body;
  const clientRes = await pool.query('SELECT * FROM clients WHERE id = $1 AND secret = $2', [client_id, client_secret]);
  if (!clientRes.rows.length) return res.status(401).send('Invalid client credentials');
  if (grant_type === 'authorization_code') {
    const codeRes = await pool.query('SELECT * FROM auth_codes WHERE code = $1 AND client_id = $2 AND expires_at > NOW()', [code, client_id]);
    if (!codeRes.rows.length) return res.status(400).send('Invalid or expired code');
    const payload = { user_id: codeRes.rows[0].user_id, client_id, scope: codeRes.rows[0].scope };
    const access_token = generateAccessToken(payload);
    const ref_token = generateRefreshToken(payload);
    await pool.query('INSERT INTO refresh_tokens (token, user_id, client_id, scope, expires_at) VALUES ($1,$2,$3,$4,NOW()+INTERVAL\'14 DAYS\')',
      [ref_token, codeRes.rows[0].user_id, client_id, codeRes.rows[0].scope]);
    await pool.query('DELETE FROM auth_codes WHERE code = $1', [code]);
    res.json({
      access_token,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: ref_token,
      scope: codeRes.rows[0].scope
    });
  } else if (grant_type === 'refresh_token') {
    const jwt = require('jsonwebtoken');
    try {
      const payload = jwt.verify(refresh_token, process.env.JWT_SECRET);
      const tokenRes = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND client_id = $2 AND expires_at > NOW()',
        [refresh_token, client_id]
      );
      if (!tokenRes.rows.length) return res.status(400).send('Invalid refresh token');
      const access_token = generateAccessToken(payload);
      res.json({ access_token, token_type: 'Bearer', expires_in: 3600, scope: payload.scope });
    } catch (e) {
      return res.status(400).send('Invalid refresh token');
    }
  } else {
    res.status(400).send('Unsupported grant_type');
  }
}

async function handleUserinfo(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).send('Missing token');
  const jwt = require('jsonwebtoken');
  try {
    const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [payload.user_id]);
    if (!userRes.rows.length) return res.status(404).send('User not found');
    const resp = {};
    if (payload.scope.includes('profile')) resp.profile = { id: userRes.rows[0].id, username: userRes.rows[0].username };
    if (payload.scope.includes('email')) resp.email = userRes.rows[0].email;
    res.json(resp);
  } catch (e) {
    res.status(401).send('Invalid or expired token');
  }
}

module.exports = { renderLoginConsent, handleAuthorizeGet, handleAuthorizePost, handleToken, handleUserinfo };