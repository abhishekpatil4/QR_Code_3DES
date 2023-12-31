import { useState, useEffect } from "react";
import config from "./config/index.js";

function GenerateNewQRCode() {
  const [orderID, setOrderID] = useState("");
  const [receiverID, setReceiverID] = useState("");
  const [isImagePresent, setIsImagePresent] = useState(false);
  const renderApi = config.backendEndpoint;

  const handleGenerate = async () => {
    // Send the orderID to your Node.js server for encryption
    const response = await fetch(renderApi + '/api/encrypt-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderID, receiverID }),
    });

    if (response.ok) {
      console.log('Data sent to backend');
      const path = orderID + "_qr.png"
      const image = new Image();
      image.src = path;
      // When the image loads, enable the download button
      image.onload = () => {
        setIsImagePresent(true);
      };
    } else {
      console.error('Failed to send data to backend');
      
      try {
        const errorData = await response.json();
        alert('Error from backend');
        // Display the error message to the user (you can use a state variable for this)
      } catch (error) {
        alert('Error parsing JSON response');
        // Handle any unexpected errors
      }

    }
  };
  const openImage = () => {
    const path = orderID + "_qr.png"
    window.open(path, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(orderID + ' ' + receiverID);
    handleGenerate();
  }


  return <>
    <form id="generateQRForm" className="border rounded-2 shadow-sm text-center" onSubmit={handleSubmit}>
      <h2 class="mb-5">Enter Details</h2>
      <div class="mb-4">
        <label for="orderID" class="form-label fw-medium fs-5">Order ID</label>
        <input type="number" class="form-control" id="orderID" value={orderID} onChange={(e) => setOrderID(e.target.value)} />
      </div>
      <div class="mb-4">
        <label for="receiverID" class="form-label fw-medium fs-5">Receiver ID</label>
        <input type="text" class="form-control" id="receiverID" value={receiverID} onChange={(e) => setReceiverID(e.target.value)} />
      </div>
      <button type="submit" class="btn fw-medium fs-5" id="generateBtn">Generate</button>
      <button type="button" class="btn fw-medium fs-5 mt-3" id="generateBtn" disabled={!isImagePresent} onClick={openImage}>Download</button>
    </form>
  </>
}

export default GenerateNewQRCode;