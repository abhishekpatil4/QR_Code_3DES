import './App.css'

function Navbar() {
  return (
    <>
      <h1 className='py-5 text-center display-3 fw-medium'>QRcryption</h1>
      <div className="container">
        <div className='row text-center'>
          <div className='col border border-2 rounded p-1 fs-4 px-3 py-2 me-5 border-danger'>Generate New QR Code</div>
          <div className='col border border-2 rounded p-1 fs-4 px-3 py-2 ms-5 border-danger'>Check Status</div>
        </div>
      </div>
    </>
  )
}

export default Navbar
