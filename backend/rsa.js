const crypto = require('crypto');

// Function to generate RSA key pair
function generateKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
}

// Function to encrypt a message using a public key
function encryptWithPublicKey(publicKey, message) {
  const bufferMessage = Buffer.from(message, 'utf8');
  const encrypted = crypto.publicEncrypt({
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256',
  }, bufferMessage);

  return encrypted.toString('base64');
}

// Function to decrypt a message using a private key
function decryptWithPrivateKey(privateKey, encryptedMessage) {
  const bufferEncrypted = Buffer.from(encryptedMessage, 'base64');
  const decrypted = crypto.privateDecrypt({
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256',
  }, bufferEncrypted);

  return decrypted.toString('utf8');
}

module.exports = {generateKeyPair, encryptWithPublicKey, decryptWithPrivateKey};

