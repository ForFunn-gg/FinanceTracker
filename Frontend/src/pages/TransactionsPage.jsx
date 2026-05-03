import { useTransactions } from '../hooks/useTransactions'
import { useCurrency }     from '../context/CurrencyContext'
import TransactionList     from '../components/TransactionList'

export default function TransactionsPage() {
  const { transactions, summary, loading, error, deleteTx, updateTx } = useTransactions()
  const { formatCurrency } = useCurrency()

  if (error) return <div className="error-msg">{error}</div>

  const totals = summary?.totals ?? { income: 0, expense: 0 }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2>Transactions</h2>
          <p>{transactions.length} entries · Income {formatCurrency(totals.income)} · Expenses {formatCurrency(totals.expense)}</p>
        </div>
        <a href="/add" className="btn btn-primary" style={{ textDecoration: 'none' }}>+ Add New</a>
      </div>
      <TransactionList transactions={transactions} onDelete={deleteTx} onUpdate={updateTx} loading={loading} />
    </div>
  )
}