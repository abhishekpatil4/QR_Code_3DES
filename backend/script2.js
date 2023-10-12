const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const qr = require('qrcode');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors()); 
app.use(bodyParser.json());

// 3DES encryption function
function encrypt3DES(input, key) {
  const cipher = crypto.createCipheriv('des-ede3', key, '');
  let encrypted = cipher.update(input, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

app.post('/api/encrypt-link', (req, res) => {
  const link = req.body.link;
  console.log('Data from frontend: ', link);
  const encryptionKey = Buffer.from('YourSecretEncryptionKey'.padEnd(24, '\0'));
  const encryptedLink = encrypt3DES(link, encryptionKey);

  // Generate a QR code from the encrypted link
  qr.toFile('../frontend/public/encrypted_qr.png', encryptedLink, {
    errorCorrectionLevel: 'H', // High error correction
    type: 'png', // PNG format
  }, (err) => {
    if (err) {
      console.error('Error generating QR code:', err);
      res.status(500).json({ error: 'Error generating QR code' });
    } else {
      console.log('QR code generated as encrypted_qr.png');
      res.json({ message: 'Link encrypted and QR code generated successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// '../frontend/public/'