import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './LoginPage'
import Products from './pages/Products'
import Layout from './components/Layout'
import Inventory from './pages/Inventory'
import Suppliers from './pages/Suppliers'

function App() {
  const token = localStorage.getItem('token')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/products" /> : <LoginPage />} />
        <Route path="/products" element={token ? <Layout><Products /></Layout> : <Navigate to="/" />} />
        <Route path="/inventory" element={token ? <Layout><Inventory /></Layout> : <Navigate to="/" />} />
        <Route path="/dashboard" element={token ? <Layout><div className="p-8"><h1 className="text-2xl font-bold">Dashboard — Coming Soon!</h1></div></Layout> : <Navigate to="/" />} />
        <Route path="/suppliers" element={token ? <Layout><Suppliers /></Layout> : <Navigate to="/" />} />
        <Route path="/customers" element={token ? <Layout><div className="p-8"><h1 className="text-2xl font-bold">Customers — Coming Soon!</h1></div></Layout> : <Navigate to="/" />} />
        <Route path="/logs" element={token ? <Layout><div className="p-8"><h1 className="text-2xl font-bold">User Logs — Coming Soon!</h1></div></Layout> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App