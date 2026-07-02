import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import DemoRouter from './pages/Demo/DemoRouter'
import Home from './pages/Home/Home'
import ProductoDetalle from './pages/Productos/ProductoDetalle'
import Productos from './pages/Productos/Productos'
import Precios from './pages/Precios/Precios'
import Contacto from './pages/Contacto/Contacto'
import Login from './pages/Login/Login'
import Registro from './pages/Registro/Registro'
import ChatWidget from './components/Chat/ChatWidget'
import NotFound from './pages/NotFound/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import ClientDashboard from './pages/Dashboard/Dashboard'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/Admin/AdminLayout'
import Dashboard from './pages/Admin/Dashboard/Dashboard'
import Usuarios from './pages/Admin/Usuarios/Usuarios'
import Clientes from './pages/Admin/Clientes/Clientes'

function PublicChrome({ children }) {
  const { pathname } = useLocation()
  const hideChrome = pathname.startsWith('/admin') || pathname.startsWith('/demo')
  return (
    <>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && <Footer />}
    </>
  )
  function PublicChrome({ children }) {
  const { pathname } = useLocation()
  const hideChrome = pathname.startsWith('/admin') || pathname.startsWith('/demo')
  return (
    <>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && <Footer />}
      {!hideChrome && <ChatWidget />}
    </>
  )
}
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PublicChrome>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/:code" element={<ProductoDetalle />} />
            <Route path="/demo/:code" element={<DemoRouter />} />
            <Route path="/precios" element={<Precios />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="clientes" element={<Clientes />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </PublicChrome>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App