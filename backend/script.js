const crypto = require('crypto');
const qr = require('qrcode');
const fs = require('fs');

// Input string to be encrypted
const inputString = 'abhi';

// Encrypt the input string using 3DES
function encrypt3DES(input, key) {
  const cipher = crypto.createCipheriv('des-ede3', key, '');
  let encrypted = cipher.update(input, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

// Secret key for 3DES encryption (must be 24 bytes)
const encryptionKey = Buffer.from('YourSecretEncryptionKey'.padEnd(24, '\0'));

// Encrypt the input string
const encryptedString = encrypt3DES(inputString, encryptionKey);

// Generate a QR code from the encrypted string
qr.toFile('encrypted_qr.png', encryptedString, {
  errorCorrectionLevel: 'H', // High error correction
  type: 'png', // PNG format
}, (err) => {
  if (err) {
    console.error('Error generating QR code:', err);
  } else {
    console.log('QR code generated as encrypted_qr.png');
  }
});
