import Navbar from './components/Navbar'
import './App.css'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import About from './components/About'

function App() {

  return (
   <>
   <Navbar />

   <Routes  >
    <Route path='/'  element={<Home/>}  />
    <Route path='/about'  element={<About/>} />
   </Routes>
   <Footer/>
   </>
  )
}

export default App
