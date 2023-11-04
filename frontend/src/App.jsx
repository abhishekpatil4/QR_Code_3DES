import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import QRyptionForm from './QRyptionForm';
import Navbar from './navbar';
import CheckStatus from './checkStatus';
import GenerateNewQRCode from './genNewCode';

function App() {
  return (
    <>
   <Router>
   <Navbar />
    {/* <QRyptionForm /> */}
    {/* <QRcode /> */}
    <Routes>
    <Route exact path='/' element={<GenerateNewQRCode/>} />
    <Route path='/checkstatus' element={<CheckStatus/>} />
    </Routes> 
   </Router>
    </>
  )
}

export default App
