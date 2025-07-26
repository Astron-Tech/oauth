// Usage: Call from /callback endpoint handler after receiving ?code= from redirect
async function exchangeCodeForToken(code) {
  const res = await fetch('/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: 'client1',
      client_secret: 'clientsecret',
      redirect_uri: 'http://localhost:3000/callback'
    })
  });
  const data = await res.json();
  console.log(data); // { access_token, refresh_token, ... }
}