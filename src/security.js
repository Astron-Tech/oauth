const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (pwd) => await bcrypt.hash(pwd, 12);
const comparePassword = async (pwd, hash) => await bcrypt.compare(pwd, hash);

function generateAccessToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}
function generateRefreshToken(payload, expiresIn = '14d') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

module.exports = { hashPassword, comparePassword, generateAccessToken, generateRefreshToken };