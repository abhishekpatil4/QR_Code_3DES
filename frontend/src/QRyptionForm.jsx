import React, { useState } from 'react';

const QRyptionForm = () => {
  const [receiverID, setReceiverID] = useState('');
  const [link, setLink] = useState('');

  const handleGenerate = () => {
    console.log('Receiver ID:', receiverID);
    console.log('Link:', link);
  };

  return (
    <div className="container ">
      <h1 className="mb-4">QRyption</h1>
      <div className="mb-3">
        <label htmlFor="receiverID" className="form-label">Receiver ID</label>
        <input
          type="text"
          className="form-control"
          id="receiverID"
          value={receiverID}
          onChange={(e) => setReceiverID(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="link" className="form-label">Link</label>
        <input
          type="text"
          className="form-control"
          id="link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleGenerate}>Generate</button>
    </div>
  );
};

export default QRyptionForm;
