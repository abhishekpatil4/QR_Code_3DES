import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Navbar from './components/navbar';
import CheckStatus from './checkStatus';
import GenerateNewQRCode from './genNewCode';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route exact path='/' element={<GenerateNewQRCode />} />
          <Route path='/checkstatus' element={<CheckStatus />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
