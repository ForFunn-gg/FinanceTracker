import { useTransactions }  from '../hooks/useTransactions'
import { useCurrency }      from '../context/CurrencyContext'
import SpendingDoughnut     from '../components/SpendingDoughnut'
import MonthlyBarChart      from '../components/MonthlyBarChart'
import { CAT_ICONS, CAT_BG, formatDate } from '../constants'

export default function Dashboard() {
  const { transactions, summary, loading, error } = useTransactions()
  const { formatCurrency } = useCurrency()

  if (loading) return <div className="loading">Building your dashboard…</div>
  if (error)   return <div className="error-msg">{error}</div>

  const { totals, expenseByCategory, monthlyBreakdown } = summary ?? {
    totals: { income: 0, expense: 0, balance: 0, savingsRate: 0 },
    expenseByCategory: [],
    monthlyBreakdown:  [],
  }

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Your financial overview at a glance.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card balance">
          <div className="stat-label">Net Balance</div>
          <div className="stat-value">{formatCurrency(totals.balance)}</div>
          <div className="stat-sub"><span className="savings-badge">↑ {totals.savingsRate}% saved</span></div>
        </div>
        <div className="stat-card income">
          <div className="stat-label">Total Income</div>
          <div className="stat-value">{formatCurrency(totals.income)}</div>
          <div className="stat-sub">{summary?.transactionCount ?? 0} transactions total</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{formatCurrency(totals.expense)}</div>
          <div className="stat-sub">{expenseByCategory.length} categories</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <div className="chart-title">Monthly Overview</div>
          <div className="chart-subtitle">Income vs. expenses by month</div>
          <MonthlyBarChart monthlyBreakdown={monthlyBreakdown} />
        </div>
        <div className="chart-card">
          <div className="chart-title">Spending Split</div>
          <div className="chart-subtitle">Where your money is going</div>
          <SpendingDoughnut expenseByCategory={expenseByCategory} />
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <div className="chart-title">Recent Transactions</div>
          <a href="/transactions" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', textDecoration: 'underline' }}>View all</a>
        </div>
        <div className="chart-subtitle" style={{ marginBottom: '0.5rem' }}>Last 5 entries</div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <strong>No transactions yet</strong>
            <p>Add your first income or expense to get started.</p>
          </div>
        ) : (
          <div className="recent-list">
            {recent.map(tx => (
              <div key={tx._id} className="recent-item">
                <div className="recent-icon" style={{ background: CAT_BG[tx.category] || '#f3f2f0' }}>
                  {CAT_ICONS[tx.category]}
                </div>
                <div className="recent-info">
                  <div className="recent-cat">{tx.category}</div>
                  <div className="recent-date">
                    {formatDate(tx.date)}
                    {tx.note && <span style={{ marginLeft: 6, color: 'var(--ink-muted)' }}>— {tx.note}</span>}
                  </div>
                </div>
                <div className="recent-amt" style={{ color: tx.type === 'Income' ? 'var(--income)' : 'var(--expense)' }}>
                  {tx.type === 'Income' ? '+' : '−'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}