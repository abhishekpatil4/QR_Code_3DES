import React, { useState, useEffect } from 'react';
import './App.css';

const QRyptionForm = () => {
  const [link, setLink] = useState('');
  const [imageAvailable, setImageAvailable] = useState(false);
  
  const handleGenerate = async () => {
    // Send the link to your Node.js server for encryption
    const response = await fetch('http://localhost:3000/api/encrypt-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ link }),
    });

    if (response.ok) {
      console.log('Link sent for encryption');
      setImageAvailable(true); // Set the state to indicate that the image is available
    } else {
      console.error('Failed to send link for encryption');
      // Handle errors if the request is not successful.
    }
  };

  useEffect(() => {
    // Check if the image is available
    try {
      fetch('../public/encrypted_qr.png'); // Adjust the URL to match the actual image path
      setImageAvailable(true);
      console.log('img-available');
    } catch (error) {
      setImageAvailable(false);
    }
  }, []);

  return (
    <>
    <div className="container form-div shadow p-3 mb-5 bg-body-tertiary rounded">
      <div className="mb-3">
        <label htmlFor="link" className="form-label"><b>Link</b></label>
        <input
          type="text"
          className="form-control"
          id="link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleGenerate}>Generate QR Code</button>
    </div>
    <div>
    {imageAvailable ? (
        <img src='../public/encrypted_qr.png' alt="Generated QR Code" id="qr-code-img"/>
      ) : (
        <p>No QR code available.</p>
      )}
    </div>
  </>
  );
};

export default QRyptionForm;




