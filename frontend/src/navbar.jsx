import icon from "../public/vite.svg";

function Navbar() {
  return (
    <>
      <nav class="navbar bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">
    <img src={icon} alt="Your SVG" width="30" height="24" class="d-inline-block align-text-top"/>
      QRyption
    </a>
  </div>
</nav>
    </>
  )
}

export default Navbar
