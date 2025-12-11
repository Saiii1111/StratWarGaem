// netlify/functions/utils/validation.js
const Filter = require('bad-words');
const filter = new Filter();

// Add custom swear words if needed
filter.addWords(...[]); // Add any specific words here

function validateUsername(username) {
  const errors = [];
  
  // Length check
  if (username.length < 3) errors.push("Username must be at least 3 characters");
  if (username.length > 20) errors.push("Username must be at most 20 characters");
  
  // Character pattern (letters and numbers only)
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    errors.push("Username can only contain letters (a-z, A-Z) and numbers (0-9)");
  }
  
  // No swear words
  if (filter.isProfane(username)) {
    errors.push("Username contains inappropriate language");
  }
  
  // Check for phone number pattern (basic check)
  const phonePatterns = [
    /^\d{10}$/,           // 1234567890
    /^\d{3}-\d{3}-\d{4}$/, // 123-456-7890
    /^\d{3}\.\d{3}\.\d{4}$/, // 123.456.7890
    /^\(\d{3}\)\s?\d{3}-\d{4}$/ // (123) 456-7890
  ];
  
  if (phonePatterns.some(pattern => pattern.test(username))) {
    errors.push("Username cannot be a phone number");
  }
  
  // Check for repeated characters (like 'aaaaaa')
  if (/(.)\1{4,}/.test(username)) {
    errors.push("Username has too many repeated characters");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (password.length > 100) errors.push("Password is too long");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number");
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validateUsername, validatePassword };
