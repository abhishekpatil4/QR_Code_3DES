import { useState } from "react";

function GenerateNewQRCode() {
const [orderID, setOrderID] = useState("");
const [receiverID, setReceiverID] = useState("");

const handleGenerate = async () => {
    // Send the orderID to your Node.js server for encryption
    const response = await fetch('http://localhost:3000/api/encrypt-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderID, receiverID }),
    });
  
    if (response.ok) {
      console.log('Data sent to backend');
    } else {
      console.error('Failed to send data to backend');
      // Handle errors if the request is not successful.
    }
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
                <input type="number" class="form-control" id="orderID" value={orderID} onChange={(e) => setOrderID(e.target.value)}/>
            </div>
            <div class="mb-4">
                <label for="receiverID" class="form-label fw-medium fs-5">Receiver ID</label>
                <input type="number" class="form-control" id="receiverID" value={receiverID} onChange={(e) => setReceiverID(e.target.value)}/>
            </div>
            <button type="submit" class="btn fw-medium fs-5" id="generateBtn">Generate</button>
        </form>
    </>
}

export default GenerateNewQRCode;