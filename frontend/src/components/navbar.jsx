import '../App.css'
import {Link, useLocation } from "react-router-dom";


function Navbar() {
  const location = useLocation();
  return (
    <>
      <h1 className='py-5 text-center display-3 fw-medium' id="title"><u>Qris</u></h1>
      <div className="container">
        <div className='row text-center'>
          <Link  to="/" className={`col  p-1 fs-4 px-3 py-2 me-5 navLinks ${location.pathname === '/' ? 'navLinksActive' : 'navLinksInActive'}`} id="navLinkCol">Generate New QR Code</Link>
          <Link  to="/checkstatus" className={`col p-1 fs-4 px-3 py-2 ms-5 navLinks ${location.pathname === '/checkstatus' ? 'navLinksActive' : 'navLinksInActive'}`} id="navLinkCol">Check Status</Link>
        </div>
      </div>
    </>
  )
}

export default Navbar
