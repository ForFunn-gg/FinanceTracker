import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useCurrency } from '../context/CurrencyContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function MonthlyBarChart({ monthlyBreakdown = [] }) {
  const { formatCurrency, currency } = useCurrency()

  if (!monthlyBreakdown.length) {
    return <div className="empty-state" style={{ padding: '1.5rem 0' }}><p>No monthly data yet.</p></div>
  }

  const labels = monthlyBreakdown.map(m => {
    const [y, mo] = m.month.split('-')
    return new Date(y, mo - 1).toLocaleString('en', { month: 'short', year: '2-digit' })
  })

  const chartData = {
    labels,
    datasets: [
      {
        label:           'Income',
        data:            monthlyBreakdown.map(m => m.income),
        backgroundColor: '#3d7a5c',
        borderRadius:    4,
        borderSkipped:   false,
      },
      {
        label:           'Expense',
        data:            monthlyBreakdown.map(m => m.expense),
        backgroundColor: '#b85040',
        borderRadius:    4,
        borderSkipped:   false,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top', align: 'end',
        labels: {
          boxWidth: 10, boxHeight: 10, borderRadius: 5, useBorderRadius: true,
          font: { family: "'DM Sans', sans-serif", size: 11 },
          color: '#7a746b',
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => `  ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
        padding: 10,
        backgroundColor: '#1a1814',
        titleColor: '#faf8f4',
        bodyColor: '#c9c2b5',
        bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "'DM Sans', sans-serif", size: 11 }, color: '#7a746b' },
        border: { color: '#e2dbd0' },
      },
      y: {
        grid: { color: '#f0ece4' },
        ticks: {
          font: { family: "'DM Sans', sans-serif", size: 11 },
          color: '#7a746b',
          callback: v => currency.symbol + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
        },
        border: { dash: [4, 4], color: 'transparent' },
      },
    },
  }

  return <Bar data={chartData} options={options} />
}