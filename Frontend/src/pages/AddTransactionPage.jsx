import { useNavigate }       from 'react-router-dom'
import { useTransactions }   from '../hooks/useTransactions'
import TransactionForm       from '../components/TransactionForm'

export default function AddTransactionPage() {
  const { createTx } = useTransactions()
  const navigate     = useNavigate()

  async function handleSubmit(data) {
    await createTx(data)
    navigate('/transactions')
  }

  return (
    <div>
      <div className="page-header">
        <h2>Add Transaction</h2>
        <p>Record a new income or expense entry.</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <TransactionForm onSubmit={handleSubmit} submitLabel="Add Transaction" />
      </div>
    </div>
  )
}