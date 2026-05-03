import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCurrency, CURRENCIES } from '../context/CurrencyContext'

const NAV = [
  {
    to: '/', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  },
  {
    to: '/transactions', label: 'Transactions',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M2 8h8M2 12h5"/></svg>,
  },
  {
    to: '/add', label: 'Add Transaction',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 5v6M5 8h6"/></svg>,
  },
]

export default function Sidebar() {
  const { user, logout }         = useAuth()
  const { code, setCurrency }    = useCurrency()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>FinFlow</h1>
        <p>Personal Finance</p>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {icon}{label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '0 1.5rem 1rem', borderTop: '1px solid #2a2820', paddingTop: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#6b6558',
          marginBottom: 6,
        }}>
          Currency
        </label>
        <select
          value={code}
          onChange={e => setCurrency(e.target.value)}
          style={{
            width: '100%',
            background: '#222018',
            color: '#c9c2b5',
            border: '1px solid #2a2820',
            borderRadius: 6,
            padding: '7px 10px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            appearance: 'auto',
          }}
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <strong>{user?.username}</strong>
          {user?.email}
        </div>
        <button className="btn btn-sm" style={{ width: '100%' }} onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  )
}