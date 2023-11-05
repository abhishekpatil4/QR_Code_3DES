const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const qr = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');

const uri = "mongodb+srv://abhishek:JJ0l5I2i8WzgTeQF@cluster0.7k55j13.mongodb.net/qrcryption?retryWrites=true&w=majority";
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

const orderSchema = new mongoose.Schema({
  orderID: String,
  receiverID: String,
  secretKey: String,
  randomStr: String,
  received: Boolean,
  imageData: Buffer,
  encryptedData: String
});

const Order = mongoose.model('Order', orderSchema);

function insertData(order_id, receiver_id, secret_key, random_str, imageDataBuffer, encryptedLink) {
  const newOrder = new Order({
    orderID: order_id,
    receiverID: receiver_id,
    secretKey: secret_key,
    randomStr: random_str,
    received: false,
    imageData: imageDataBuffer,
    encryptedData: encryptedLink
  });

  newOrder.save()
    .then((result) => {
      console.log('Order inserted with Mongo ID:', result._id);
      console.log('Actual ID: ', order_id);
    })
    .catch((error) => {
      console.error('Error inserting order:', error);
    });

}

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

async function getOrderDataByOrderID(orderID) {
  try {
    const order = await Order.findOne({ orderID: orderID }).exec();

    if (order) {
      console.log('Order found:', order);
    } else {
      console.log('Order not found.');
    }
  } catch (error) {
    console.error('Error retrieving order data:', error);
  }
}

// 3DES encryption function
function encrypt3DES(input, key) {
  const cipher = crypto.createCipheriv('des-ede3', key, '');
  let encrypted = cipher.update(input, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

app.post('/api/encrypt-link', (req, res) => {
  const orderID = req.body.orderID; // Access the correct property
  const receiverID = req.body.receiverID;
  console.log('Data from frontend => OrderID: ', orderID);
  console.log('Data from frontend => ReceiverID: ', receiverID);
  const secretkey = generateRandomString(10);
  const randomStr = generateRandomString(5);
  console.log('Data generated at backend => Secretkey: ', secretkey);
  console.log('Data generated at backend => RandomStr: ', randomStr);

  const encryptionKey = Buffer.from(secretkey.padEnd(24, '\0'));
  const encryptedLink = encrypt3DES(randomStr, encryptionKey);

  // Generate a QR code from the encrypted link
  qr.toFile('../frontend/public/' + orderID + '_qr.png', encryptedLink, {
    errorCorrectionLevel: 'H', // High error correction
    type: 'png', // PNG format
  }, (err) => {
    if (err) {
      console.error('Error generating QR code:', err);
      res.status(500).json({ error: 'Error generating QR code' });
    } else {
      console.log('QR code generated as encrypted_qr.png');
      res.json({ message: 'Link encrypted and QR code generated successfully' });
      const imageDataBuffer = fs.readFileSync('../frontend/public/' + orderID + '_qr.png');
      insertData(orderID, receiverID, secretkey, randomStr, imageDataBuffer, encryptedLink);
    }
  });
});

app.get('/api/get-image/:orderID', async (req, res) => {
  const orderID = req.params.orderID;

  try {
    const order = await Order.findOne({ orderID: orderID }).exec();

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Set the appropriate content type based on the image format (e.g., 'image/jpeg')
    res.contentType('image/jpeg'); // Change 'image/jpeg' based on your image format
    res.send(order.imageData);
  } catch (error) {
    console.error('Error retrieving order with image:', error);
    res.status(500).send('Error retrieving order with image');
  }
});


module.exports = { getOrderDataByOrderID, Order };

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});