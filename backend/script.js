const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const qr = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const { encrypt3DES, decrypt3DES } = require('./3des');
const { generateKeyPair, encryptWithPublicKey, decryptWithPrivateKey } = require('./rsa');

//express
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());

//mongoDB
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
  imageData: String,
  encryptedData: String
});

const customerSchema = new mongoose.Schema({
  receiverID: String,
  publicKey: String,
});

const Order = mongoose.model('Order', orderSchema);
const Customer = mongoose.model('Customer', customerSchema);

function insertData(order_id, receiver_id, secret_key, random_str, imagePath, encryptedLink) {
  const newOrder = new Order({
    orderID: order_id,
    receiverID: receiver_id,
    secretKey: secret_key,
    randomStr: random_str,
    received: false,
    imageData: imagePath,
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

app.post('/api/newCustomer', (req, res) => {
  const { receiver_id } = req.body;
  if (!receiver_id) {
    return res.status(400).json({ error: 'Please enter receiver ID' });
  }

  //generating new keypair using RSA
  const keyPair = generateKeyPair();
  const public_key = keyPair.publicKey;
  const private_key = keyPair.privateKey;

  const newCustomer = new Customer({
    receiverID: receiver_id,
    publicKey: public_key,
  });

  newCustomer.save()
    .then((result) => {
      console.log('Customer Data inserted with Mongo ID:', result._id);
      res.status(201).json({
        message: 'Customer data inserted successfully.',
        receiverID: receiver_id,
        publicKey: public_key,
        privateKey: private_key
      });
    })
    .catch((error) => {
      console.error('Error inserting customer data:', error);
      res.status(500).json({ error: 'Internal server error.' });
    });
});

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

app.post('/api/encrypt-link', async (req, res) => {
  const orderID = req.body.orderID;
  const receiverID = req.body.receiverID;

  try {
    // Check if the receiverID exists in the database
    const customer = await Customer.findOne({ receiverID });

    if (!customer) {
      console.log('Receiver ID not found');
      return res.status(400).json({ error: 'Receiver ID not found' });
    }
    console.log(customer.publicKey);
    const secretKey = generateRandomString(10);
    const randomStr = "DemoString";

    // Encrypt the secretKey using the receiver's public key
    const encryptedSecretKey = encryptWithPublicKey(customer.publicKey, secretKey);

    const encryptionKey = Buffer.from(secretKey.padEnd(24, '\0'));
    let encryptedLink = encrypt3DES(randomStr, encryptionKey);

    // QR-Code Generation
    const path = '../frontend/public/' + orderID + '_qr.png';
    encryptedLink = orderID + ' ' + encryptedLink;
    qr.toFile(path, encryptedLink, {
      errorCorrectionLevel: 'H', // High error correction
      type: 'png', // PNG format
    }, (err) => {
      if (err) {
        console.error('Error generating QR code:', err);
        res.status(500).json({ error: 'Error generating QR code' });
      } else {
        console.log('QR code generated as encrypted_qr.png');
        res.json({ message: 'Link encrypted and QR code generated successfully' });
        const localPath = "../public/" + orderID + '_qr.png';

        // Store encrypted secretKey in the database
        insertData(orderID, receiverID, encryptedSecretKey, randomStr, localPath, encryptedLink);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/all-orders', async (req, res) => {
  try {
    let orders = await Order.find().exec();
    res.json(orders);
  } catch (error) {
    console.error('Error retrieving all orders:', error);
    res.status(500).send('Error retrieving all orders');
  }
});

app.post('/api/verify', async (req, res) => {
  let { orderID, encryptedData, key } = req.body;
  try {
    const order = await Order.findOne({ orderID: orderID }).exec();
    if (!order) {
      return res.status(404).send('Order not found');
    }
    key = Buffer.from(key.padEnd(24, '\0'));
    if (order.randomStr === decrypt3DES(encryptedData, key)) {
      //randomStr matches -> decrypted correctly
      order.received = true;
      await order.save();
      return res.send('Status updated to true');
    } else {
      console.error('Invalid data, intruder detected!');
      return res.status(400).send('Invalid data, intruder detected!');
    }
  } catch (error) {
    console.error('Invalid data, intruder detected!');
    res.status(500).send('Invalid data, intruder detected!');
  }
});

// app.get('/api/getSecretKey', async (req, res) => {
//   let { orderID } = req.body;
//   try {
//     const order = await Order.findOne({ orderID: orderID }).exec();
//     if (!order) {
//       return res.status(404).send('Order not found');
//     }
//     const secretKey = order.secretKey;
//     if (!secretKey) {
//       return res.status(404).send('Secret key not found for the order');
//     }
//     return res.json({ secretKey: secretKey });
//   } catch (error) {
//     console.error('Error retrieving secretKey:', error);
//     return res.status(500).send('Internal Server Error');
//   }
// });

app.post('/api/getSecretKey', async (req, res) => {
  let { orderID } = req.body;
  try {
    const order = await Order.findOne({ orderID: orderID }).exec();
    if (!order) {
      return res.status(404).send('Order not found');
    }
    const secretKey = order.secretKey;
    if (!secretKey) {
      return res.status(404).send('Secret key not found for the order');
    }
    return res.json({ secretKey: secretKey });
  } catch (error) {
    console.error('Error retrieving secretKey:', error);
    return res.status(500).send('Internal Server Error');
  }
});



// module.exports = { getOrderDataByOrderID, Order };

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});