// Minimal test stub, expand as needed
const axios = require('axios');

async function testAuthorizeEndpoint() {
  try {
    const res = await axios.get('http://localhost:3000/oauth/authorize?client_id=client1&redirect_uri=http://localhost:3000/callback&response_type=code&scope=profile%20email');
    console.log('Authorize GET response:', res.status);
  } catch (err) {
    console.error('Authorize endpoint test failed:', err.response ? err.response.data : err.message);
  }
}

testAuthorizeEndpoint();