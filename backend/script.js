const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const qr = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const { encrypt3DES, decrypt3DES } = require('./3des');

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

const Order = mongoose.model('Order', orderSchema);

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

//functions and API endpoints
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
  const orderID = req.body.orderID;
  const receiverID = req.body.receiverID;

  const secretkey = generateRandomString(10);
  const randomStr = "DemoString";

  const encryptionKey = Buffer.from(secretkey.padEnd(24, '\0'));
  let encryptedLink = encrypt3DES(randomStr, encryptionKey);

  //QR-Code Generation
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

      //encrypt secretKey using receivers public key and then store in DB

      insertData(orderID, receiverID, secretkey, randomStr, localPath, encryptedLink);
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
    console.log('Fetched image from db');
    res.contentType('image/jpeg');
    res.send(order.imageData);
  } catch (error) {
    console.error('Error retrieving order with image:', error);
    res.status(500).send('Error retrieving order with image');
  }
});

app.post('/api/update-status', async (req, res) => {
  const { orderID, randomStr } = req.body;
  try {
    const order = await Order.findOne({ orderID }).exec();
    if (!order) {
      return res.status(404).send('Order not found');
    }
    if (order.randomStr === randomStr) {
      order.received = true;
      await order.save();
      return res.send('Status updated to true');
    } else {
      console.error('RandomStr does not match.');
      return res.status(400).send('RandomStr does not match.');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send('Error updating status');
  }
});

app.post('/api/update-status/:orderID/:randomStr', async (req, res) => {
  const orderID = req.params.orderID;
  const randomStr = req.params.randomStr;
  try {
    const order = await Order.findOne({ orderID }).exec();
    if (!order) {
      return res.status(404).send('Order not found');
    }
    if (order.randomStr === randomStr) {
      order.received = true;
      await order.save();
      return res.send('Status updated to true');
    } else {
      console.error('RandomStr does not match.');
      return res.status(400).send('RandomStr does not match.');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send('Error updating status');
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

app.get('/api/decrypt', async (req, res) => {
  const { orderID, encryptedData } = req.body;
  try {
    const order = await Order.findOne({ orderID: orderID }).exec();
    if (!order) {
      return res.status(404).send('Order not found');
    }

    //take the secretKey, decrypt 

    const decryptionKey = Buffer.from(order.secretKey.padEnd(24, '\0'));
    if (order.randomStr === decrypt3DES(encryptedData, decryptionKey)) {
      return res.send(order.randomStr);
    } else {
      console.error('RandomStr does not match, intruder detected!');
      return res.status(400).send('RandomStr does not match, intruder detected!');
    }
  } catch (error) {
    console.error('RandomStr does not match, intruder detected!');
    res.status(500).send('RandomStr does not match, intruder detected!');
  }
});

// app.get('/api/decrypt/:orderID/:encryptedData', async (req, res) => {
//   const orderID = req.params.orderID;
//   const encryptedData = req.params.encryptedData;
//   try {
//     const order = await Order.findOne({ orderID: orderID }).exec();
//     if (!order) {
//       return res.status(404).send('Order not found');
//     }
//     const decryptionKey = Buffer.from(order.secretKey.padEnd(24, '\0'));
//     if (order.randomStr === decrypt3DES(encryptedData, decryptionKey)) {
//       return res.send(order.randomStr);
//     } else {
//       console.error('RandomStr does not match, intruder detected!');
//       return res.status(400).send('RandomStr does not match, intruder detected!');
//     }
//   } catch (error) {
//     console.error('RandomStr does not match, intruder detected!');
//     res.status(500).send('RandomStr does not match, intruder detected!');
//   }
// });

// app.post('/api/verify2/:orderID/:encryptedData/:key', async (req, res) => {
//   const orderID = req.params.orderID;
//   const encryptedData = req.params.encryptedData;
//   let key = req.params.key;
//   // console.log(orderID + ' ' + encryptedData + ' ' + key);

//   try {
//     const order = await Order.findOne({ orderID: orderID }).exec();
//     if (!order) {
//       return res.status(404).send('Order not found');
//     }
//     key = Buffer.from(key.padEnd(24, '\0'));
//     // const some = Buffer.from(order.secretKey.padEnd(24, '\0'));
//     if (order.randomStr === decrypt3DES(encryptedData, key)) {
//       //randomStr matches -> decrypted correctly
//       order.received = true;
//       await order.save(); 
//       return res.send('Status updated to true');
//     } else {
//       console.error('Invalid data, intruder detected!');
//       return res.status(400).send('Invalid data, intruder detected!');
//     }
//   } catch (error) {
//     console.error('Invalid data, intruder detected!');
//     res.status(500).send('Invalid data, intruder detected!');
//   }
// });

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

app.get('/api/getSecretKey', async (req, res) => {
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


module.exports = { getOrderDataByOrderID, Order };

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});