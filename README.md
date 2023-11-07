# QR_Code_3DES

This projects adds an extra layer of security to QR codes by encrypting the plain text using 3DES algorithm 


## Demo

<img width="1680" alt="Screenshot 2023-11-05 at 12 49 04 AM" src="https://github.com/abhishekpatil4/QR_Code_3DES/assets/83769052/539d6f1b-6299-4df3-b05e-22b164cf0034">



Clone the repo

```bash
  git clone https://github.com/abhishekpatil4/QR_Code_3DES.git

```

Run frontend

```bash
  cd frontend 
  npm i
  npm run dev
```

Run backend

```bash
  cd backend 
  npm i
  nodemon script.js
```

## Basic System Design

![qr_code_flow](https://github.com/abhishekpatil4/QR_Code_3DES/assets/83769052/8ee5792b-45a9-493c-997e-76168a5b0415)

1. Enter receivers Id, to uniquely identity a receiver 
2. Enter the link where the status will be updated by the user 
3. Upon clicking generate, a new key will be generated along with it a unique ID will be assigned to differentiate the previous QR code and used to 
encrypt (3DES) 
4. The new key generated will be stored along with other details in the DB
5. Receiver will login using his receiver ID and password, scan the QR code
6. After scanning the QR code decode the link and decrypt the link using the key present in the DB, after decoding the receiver will get the link 
7. After clicking in click the status will be updated in the DB (which later on the sender can use to check whether the receiver has received it or 
not)

