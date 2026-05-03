import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }             from './context/AuthContext'
import Sidebar                 from './components/Sidebar'
import Dashboard               from './pages/Dashboard'
import TransactionsPage        from './pages/TransactionsPage'
import AddTransactionPage      from './pages/AddTransactionPage'
import AuthPage                from './pages/AuthPage'
import ResetPasswordPage       from './pages/ResetPasswordPage'

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Authenticating…</div>
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading FinFlow…</div>

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route path="/" element={
          <PrivateRoute><AppShell><Dashboard /></AppShell></PrivateRoute>
        } />
        <Route path="/transactions" element={
          <PrivateRoute><AppShell><TransactionsPage /></AppShell></PrivateRoute>
        } />
        <Route path="/add" element={
          <PrivateRoute><AppShell><AddTransactionPage /></AppShell></PrivateRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
