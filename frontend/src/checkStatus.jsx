import React, { useEffect, useState } from 'react';

function CheckStatus() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [imageData, setImageData] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3000/api/all-orders')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok (status ${response.status})`);
                }
                return response.json();
            })
            .then((data) => {
                console.log('Data received');
                console.log(data);
                // setImageData(data[0].imageData);
                setOrders(data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error);
            });
    }, []);


    function getData() {
        return (
            <tbody>
                {orders.map((val, index) => (
                    <tr key={index}>
                        <td scope="row">{val.orderID}</td>
                        <td>{val.receiverID}</td>
                        <td className={val.received ? 'bg-success-subtle' : 'bg-danger-subtle'}>
                            {val.received ? 'Received' : 'Not Yet Received'}
                        </td>
                    </tr>
                ))}
            </tbody>
        );
    }
    
    return (
        <div>
            <div className="text-center" id="chkStatusDiv">
                {error ? (
                    <div>Error: {error.message}</div>
                ) : (
                    <table className="table table-striped container">
                        <thead>
                            <tr>
                                <th scope="col">Order ID</th>
                                <th scope="col">Receiver ID</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        {getData()}
                    </table>
                )}
            </div>
        </div>

    );
}

export default CheckStatus;
