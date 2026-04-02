import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './LoginPage'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Suppliers from './pages/Suppliers'
import Layout from './components/Layout'

function App() {
  const token = localStorage.getItem('token')

  const ComingSoon = ({ page }) => (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{page}</h1>
      <p className="text-muted-foreground mt-2">Coming soon! 🚀</p>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/dashboard" element={token ? <Layout><ComingSoon page="Dashboard" /></Layout> : <Navigate to="/" />} />
        <Route path="/products" element={token ? <Layout><Products /></Layout> : <Navigate to="/" />} />
        <Route path="/inventory" element={token ? <Layout><Inventory /></Layout> : <Navigate to="/" />} />
        <Route path="/suppliers" element={token ? <Layout><Suppliers /></Layout> : <Navigate to="/" />} />
        <Route path="/customers" element={token ? <Layout><ComingSoon page="Customers" /></Layout> : <Navigate to="/" />} />
        <Route path="/sales" element={token ? <Layout><ComingSoon page="Sales" /></Layout> : <Navigate to="/" />} />
        <Route path="/expenses" element={token ? <Layout><ComingSoon page="Expenses" /></Layout> : <Navigate to="/" />} />
        <Route path="/reports" element={token ? <Layout><ComingSoon page="Reports" /></Layout> : <Navigate to="/" />} />
        <Route path="/logs" element={token ? <Layout><ComingSoon page="User Logs" /></Layout> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App