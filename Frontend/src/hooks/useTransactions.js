import { useState, useEffect, useCallback } from 'react'
import { txService } from '../services/api'

/**
 * useTransactions
 *
 * Centralises all transaction data fetching + mutations.
 * Components only call { transactions, summary, loading, error,
 *                        createTx, deleteTx, updateTx, refetch }
 * — no fetch logic leaks into UI components.
 *
 * @param {Object} filters  
 */
export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const filterKey = JSON.stringify(filters) 

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [txRes, summaryRes] = await Promise.all([
        txService.getAll(filters),
        txService.getSummary(filters),
      ])
      setTransactions(txRes.transactions)
      setSummary(summaryRes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }

  }, [filterKey])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function createTx(data) {
    const tx = await txService.create(data)
    await fetchAll() 
    return tx
  }

  async function deleteTx(id) {
    await txService.delete(id)
    await fetchAll()
  }

  async function updateTx(id, data) {
    const tx = await txService.update(id, data)
    await fetchAll()
    return tx
  }

  return { transactions, summary, loading, error, createTx, deleteTx, updateTx, refetch: fetchAll }
}