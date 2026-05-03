import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ResetPasswordPage() {
  const { token }  = useParams()
  const navigate   = useNavigate()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Reset failed')

      localStorage.setItem('finflow_token', data.token)
      setSuccess(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Password reset!</h1>
          <p>Your password has been updated. Redirecting you to the dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Set new password</h1>
        <p>Choose a strong password for your FinFlow account.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="password">New password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="min 6 characters"
                required
                minLength={6}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '0.75rem',
                  color: 'var(--ink-muted)',
                }}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="field-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="confirm">Confirm new password</label>
            <input
              id="confirm"
              type={showPass ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="repeat your password"
              required
            />
            {confirm.length > 0 && (
              <span style={{
                fontSize: '0.7rem', marginTop: 2,
                color: password === confirm ? 'var(--income)' : 'var(--expense)',
              }}>
                {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <div className="auth-switch">
          <a href="/auth" style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', textDecoration: 'underline' }}>
            ← Back to sign in
          </a>
        </div>
      </div>
    </div>
  )
}
