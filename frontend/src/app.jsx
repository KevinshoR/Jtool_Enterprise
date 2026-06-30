import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home/Home'
import Productos from './pages/Productos/Productos'
import Precios from './pages/Precios/Precios'
import Contacto from './pages/Contacto/Contacto'
import Login from './pages/Login/Login'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/precios" element={<Precios />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App