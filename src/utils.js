// Add any helper functions here, e.g., input validation, error formatting, etc.
function sanitizeInput(input) {
  return String(input).replace(/[<>]/g, '');
}
module.exports = { sanitizeInput };