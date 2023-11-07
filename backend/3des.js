const crypto = require('crypto');

function encrypt3DES(input, key) {
  const cipher = crypto.createCipheriv('des-ede3', key, '');
  let encrypted = cipher.update(input, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

function decrypt3DES(encrypted, key) {
  const decipher = crypto.createDecipheriv('des-ede3', key, '');
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {encrypt3DES, decrypt3DES};

