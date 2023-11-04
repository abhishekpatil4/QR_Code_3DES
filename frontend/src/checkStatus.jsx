function CheckStatus() {
    const data = [
        {
            orderID: 1234,
            ReceiverID: 1890,
            status: false
        },
        {
            orderID: 5646,
            ReceiverID: 4256,
            status: false
        },
        {
            orderID: 6888,
            ReceiverID: 5211,
            status: true
        },
        {
            orderID: 3123,
            ReceiverID: 5645,
            status: false
        },
        {
            orderID: 3455,
            ReceiverID: 5465,
            status: true
        }
    ];

    function getData() {
        return (
              <tbody>
                {data.map((val, index) => (
                  <tr key={index}>
                    <th scope="row">{val.orderID}</th>
                    <td>{val.ReceiverID}</td>
                    <td>{val.status ? 'True' : 'False'}</td>
                  </tr>
                  
                ))}
              </tbody>
          );
    }

    return <>
        <div className="text-center" id="chkStatusDiv">
            <table class="table table-striped container">
                <thead>
                    <tr>
                        <th scope="col">Order ID</th>
                        <th scope="col">Receiver ID</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                {getData()}
            </table>
        </div>
    </>
}

export default CheckStatus;