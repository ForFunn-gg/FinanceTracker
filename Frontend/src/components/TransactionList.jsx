import { useState } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import { CAT_COLORS, CAT_ICONS, CAT_BG, CATEGORIES, formatDate } from '../constants'
import TransactionForm from './TransactionForm'

const TYPE_FILTERS = ['All', 'Income', 'Expense']

export default function TransactionList({ transactions, onDelete, onUpdate, loading }) {
  const { formatCurrency } = useCurrency()
  const [typeFilter, setTypeFilter] = useState('All')
  const [catFilter,  setCatFilter]  = useState('All')
  const [editTx,     setEditTx]     = useState(null)
  const [deleting,   setDeleting]   = useState(null)

  const filtered = transactions.filter(tx => {
    const matchType = typeFilter === 'All' || tx.type === typeFilter
    const matchCat  = catFilter  === 'All' || tx.category === catFilter
    return matchType && matchCat
  })

  async function handleDelete(id) {
    setDeleting(id)
    try { await onDelete(id) }
    finally { setDeleting(null) }
  }

  async function handleEditSubmit(data) {
    await onUpdate(editTx._id, data)
    setEditTx(null)
  }

  if (loading) return <div className="loading">Loading transactions…</div>

  return (
    <div>
      <div className="filter-bar">
        <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Type:</span>
        {TYPE_FILTERS.map(f => (
          <button key={f} className={`filter-chip ${typeFilter === f ? 'active' : ''}`} onClick={() => setTypeFilter(f)}>{f}</button>
        ))}
        <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 8 }}>Category:</span>
        <button className={`filter-chip ${catFilter === 'All' ? 'active' : ''}`} onClick={() => setCatFilter('All')}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-chip ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>
            {CAT_ICONS[c]} {c}
          </button>
        ))}
      </div>

      {editTx && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--ink-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 500 }}>Edit Transaction</span>
            <button className="btn btn-sm" onClick={() => setEditTx(null)}>Cancel</button>
          </div>
          <TransactionForm
            initialValues={{ type: editTx.type, amount: editTx.amount, category: editTx.category, date: editTx.date?.slice(0, 10), note: editTx.note || '' }}
            onSubmit={handleEditSubmit}
            submitLabel="Save Changes"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗒️</div>
          <strong>No transactions found</strong>
          <p>Try adjusting your filters or add a new transaction.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="tx-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.25rem' }}>Category</th>
                <th>Date</th>
                <th>Note</th>
                <th style={{ textAlign: 'right', paddingRight: '1.25rem' }}>Amount</th>
                <th style={{ textAlign: 'right', paddingRight: '1.25rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx._id} className="tx-row">
                  <td style={{ paddingLeft: '1.25rem' }}>
                    <span className="cat-pill" style={{ background: CAT_BG[tx.category] || '#f3f2f0', color: CAT_COLORS[tx.category] || '#7a746b' }}>
                      <span className="cat-dot" style={{ background: CAT_COLORS[tx.category] || '#7a746b' }} />
                      {CAT_ICONS[tx.category]} {tx.category}
                    </span>
                  </td>
                  <td>{formatDate(tx.date)}</td>
                  <td className="tx-note">{tx.note || '—'}</td>
                  <td style={{ paddingRight: '1.25rem' }}>
                    <span className={`tx-amount ${tx.type.toLowerCase()}`}>
                      {tx.type === 'Income' ? '+' : '−'}{formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td style={{ paddingRight: '1.25rem' }}>
                    <div className="tx-actions">
                      <button className="btn btn-sm" onClick={() => setEditTx(tx)}>Edit</button>
                      <button className="btn btn-sm btn-danger" disabled={deleting === tx._id} onClick={() => handleDelete(tx._id)}>
                        {deleting === tx._id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.75rem', textAlign: 'right' }}>
          Showing {filtered.length} of {transactions.length} transactions
        </p>
      )}
    </div>
  )
}