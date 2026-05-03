import { useState } from 'react'
import { CATEGORIES } from '../constants'
import { useCurrency } from '../context/CurrencyContext'

const EMPTY = {
  type:     'Expense',
  amount:   '',
  category: 'Food',
  date:     new Date().toISOString().split('T')[0],  
  note:     '',
}

export default function TransactionForm({ onSubmit, initialValues, submitLabel = 'Add Transaction' }) {
  const { currency } = useCurrency()
  const [form, setForm]       = useState(initialValues ?? EMPTY)
  const [error, setError]     = useState('')
  const [saving, setSaving]   = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function setType(type) {
    setForm(prev => ({
      ...prev,
      type,
      category: type === 'Income' ? 'Salary' : 'Food',
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid amount greater than 0.')
      return
    }
    if (!form.date) {
      setError('Please select a date.')
      return
    }

    try {
      setSaving(true)
      await onSubmit({
        amount:   Number(form.amount),
        category: form.category,
        type:     form.type,
        date:     form.date,
        note:     form.note.trim(),
      })
      if (!initialValues) setForm(EMPTY)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const categoryOptions = form.type === 'Income'
    ? ['Salary', 'Other']
    : CATEGORIES.filter(c => c !== 'Salary')

  return (
    <form className="tx-form" onSubmit={handleSubmit} noValidate>

      {error && <div className="error-msg full">{error}</div>}

      <div className="field-group full">
        <label>Type</label>
        <div className="type-toggle">
          <button
            type="button"
            className={`type-btn ${form.type === 'Income' ? 'active-income' : ''}`}
            onClick={() => setType('Income')}
          >
            ↑ Income
          </button>
          <button
            type="button"
            className={`type-btn ${form.type === 'Expense' ? 'active-expense' : ''}`}
            onClick={() => setType('Expense')}
          >
            ↓ Expense
          </button>
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="amount">Amount ({currency.symbol})</label>
        <input
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={handleChange}
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]} 
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          {categoryOptions.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label htmlFor="note">Note <span style={{ opacity: 0.5 }}>(optional)</span></label>
        <input
          id="note"
          name="note"
          type="text"
          placeholder="e.g. Weekly groceries"
          value={form.note}
          onChange={handleChange}
          maxLength={200}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>

    </form>
  )
}