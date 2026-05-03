import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { useCurrency } from '../context/CurrencyContext'
import { CAT_COLORS } from '../constants'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function SpendingDoughnut({ expenseByCategory = [] }) {
  const { formatCurrency } = useCurrency()

  if (!expenseByCategory.length) {
    return (
      <div className="empty-state" style={{ padding: '2rem 0' }}>
        <div className="empty-icon">🍩</div>
        <strong>No expense data yet</strong>
        <p>Add some transactions to see the spending split.</p>
      </div>
    )
  }

  const labels  = expenseByCategory.map(c => c.category)
  const data    = expenseByCategory.map(c => c.total)
  const colors  = labels.map(l => CAT_COLORS[l] || '#7a746b')
  const total   = data.reduce((s, n) => s + n, 0)


  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor:  colors,
      borderColor:      '#ffffff',
      borderWidth:      3,
      hoverBorderWidth: 2,
      hoverOffset:      6,
    }],
  }

  const options = {
    cutout:     '68%',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = ((ctx.parsed / total) * 100).toFixed(1)
            return `  ${formatCurrency(ctx.parsed)}  (${pct}%)`
          },
        },
        padding:         10,
        bodyFont:        { family: "'DM Sans', sans-serif", size: 13 },
        backgroundColor: '#1a1814',
        titleColor:      '#faf8f4',
        bodyColor:       '#c9c2b5',
      },
    },
  }

  return (
    <div>
      <div style={{ position: 'relative', width: 200, margin: '0 auto' }}>
        <Doughnut data={chartData} options={options} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Total
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 500, color: 'var(--ink)' }}>
            {formatCurrency(total)}
          </div>
        </div>
      </div>

      <ul className="legend-list">
        {expenseByCategory.map(({ category, total: catTotal, percentage }) => (
          <li key={category} className="legend-item">
            <span className="legend-dot" style={{ background: CAT_COLORS[category] || '#7a746b' }} />
            <span className="legend-name">{category}</span>
            <span className="legend-pct">{percentage}%</span>
            <span className="legend-amt">{formatCurrency(catTotal)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}