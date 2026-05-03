import { useState } from 'react'
import { useAuth }  from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AuthPage() {
  const [mode,     setMode]     = useState('login')   // 'login' | 'register' | 'forgot'
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  function switchMode(next) {
    setMode(next)
    setError('')
    setSuccess('')
  }

  // ── Login / Register ───────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        navigate('/')
      } else {
        if (!username.trim()) { setError('Username is required.'); setLoading(false); return }
        await register(username.trim(), email, password)
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot password ────────────────────────────────────────────────────────
  async function handleForgot(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Request failed')

      if (data.resetLink) {
        setSuccess(`Dev mode — copy this link:\n${data.resetLink}`)
      } else {
        setSuccess('Check your email for a reset link. It expires in 15 minutes.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot password screen ─────────────────────────────────────────────────
  if (mode === 'forgot') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Forgot password</h1>
          <p>Enter your email and we'll send you a reset link.</p>

          {error   && <div className="error-msg">{error}</div>}
          {success && (
            <div style={{
              background: '#edf7f2', border: '1px solid #c3e8d5',
              color: '#1a5c3a', fontSize: '0.8rem', padding: '10px 12px',
              borderRadius: 6, marginBottom: '1rem',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {success}
            </div>
          )}

          {!success && (
            <form onSubmit={handleForgot} noValidate>
              <div className="field-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="forgot-email">Email address</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="auth-switch">
            <button onClick={() => switchMode('login')}>← Back to sign in</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Login / Register screen ────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p>
          {mode === 'login'
            ? 'Sign in to FinFlow to track your finances.'
            : 'Start tracking your income and expenses today.'}
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="field-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="johndoe"
                required
              />
            </div>
          )}

          <div className="field-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field-group" style={{ marginBottom: mode === 'login' ? '0.5rem' : '1rem' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="min 6 characters"
              required
              minLength={6}
            />
          </div>

          {/* Forgot password — only on login */}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--ink-muted)', fontSize: '0.75rem',
                  cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
