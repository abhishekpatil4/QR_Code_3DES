const crypto = require('crypto');

// Encrypted text to be decrypted
const encryptedText = 'yE1QlbbnezQ='; // Replace with the actual encrypted text

// Secret key for 3DES decryption (must be 24 bytes)
const decryptionKey = Buffer.from('K0TqkwEjqn'.padEnd(24, '\0'));

// Decrypt the encrypted text using 3DES
function decrypt3DES(encrypted, key) {
  const decipher = crypto.createDecipheriv('des-ede3', key, '');
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Decrypt the encrypted text
const decryptedString = decrypt3DES(encryptedText, decryptionKey);
console.log('Decrypted String:', decryptedString);
