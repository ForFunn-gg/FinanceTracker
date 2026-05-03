/**
 * helpers/transactionCalculator.js
 *
 * Pure helper functions for summarising transaction data.
 * "Pure" means: no DB calls, no Express, no side effects.
 * Input: a plain array of transaction objects.
 * Output: plain objects ready to be sent as JSON.
 *
 * This keeps all maths in one tested place. Routes just fetch
 * data from MongoDB and pass it here — no calculation logic
 * lives in the route handlers themselves.
 */

// ─── 1. Sum by category ───────────────────────────────────────────────────────
/**
 * Groups transactions by category and sums their amounts.
 * Works for any subset — pass only expenses, or all transactions,
 * depending on what the caller needs.
 *
 * @param  {Array}  transactions  - Array of transaction documents
 * @param  {string} [type]        - Optional filter: "Income" | "Expense"
 * @returns {Array}  Sorted array: [{ category, total, count, percentage }, ...]
 *
 * Example:
 *   sumByCategory([
 *     { category: 'Food',      type: 'Expense', amount: 350 },
 *     { category: 'Food',      type: 'Expense', amount: 150 },
 *     { category: 'Transport', type: 'Expense', amount: 200 },
 *   ])
 *   // → [
 *   //     { category: 'Food',      total: 500, count: 2, percentage: 71.43 },
 *   //     { category: 'Transport', total: 200, count: 1, percentage: 28.57 },
 *   //   ]
 */
function sumByCategory(transactions, type = null) {
  // Optionally filter to a single type before grouping
  const rows = type
    ? transactions.filter((t) => t.type === type)
    : transactions;

  // Accumulate totals into a plain object keyed by category name
  const map = {};
  for (const t of rows) {
    if (!map[t.category]) {
      map[t.category] = { total: 0, count: 0 };
    }
    map[t.category].total += t.amount;
    map[t.category].count += 1;
  }

  // Grand total for computing percentage share
  const grandTotal = Object.values(map).reduce((sum, v) => sum + v.total, 0);

  // Convert to a sorted array (highest spend first)
  return Object.entries(map)
    .map(([category, { total, count }]) => ({
      category,
      total:      round2(total),
      count,
      percentage: grandTotal > 0 ? round2((total / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// ─── 2. Overall totals ────────────────────────────────────────────────────────
/**
 * Computes total income, total expenses, and the net balance.
 *
 * @param  {Array} transactions
 * @returns {{ income, expense, balance, savingsRate }}
 *
 * savingsRate — what % of income was saved (not spent).
 *   e.g. income 5000, expense 2000 → savingsRate = 60.00 (%)
 */
function computeTotals(transactions) {
  let income  = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === 'Income')  income  += t.amount;
    if (t.type === 'Expense') expense += t.amount;
  }

  const balance     = income - expense;
  const savingsRate = income > 0 ? round2(((income - expense) / income) * 100) : 0;

  return {
    income:      round2(income),
    expense:     round2(expense),
    balance:     round2(balance),
    savingsRate, // percentage, e.g. 45.50
  };
}

// ─── 3. Monthly breakdown ─────────────────────────────────────────────────────
/**
 * Groups transactions by calendar month (YYYY-MM) and sums income + expense
 * per month. Useful for the chart on the dashboard.
 *
 * @param  {Array} transactions
 * @returns {Array}  Sorted chronologically: [{ month, income, expense, balance }, ...]
 *
 * Example output:
 *   [
 *     { month: '2026-02', income: 5000, expense: 1800, balance: 3200 },
 *     { month: '2026-03', income: 5000, expense: 2100, balance: 2900 },
 *     { month: '2026-04', income: 5800, expense: 1550, balance: 4250 },
 *   ]
 */
function sumByMonth(transactions) {
  const map = {};

  for (const t of transactions) {
    const month = toMonthKey(t.date); // "YYYY-MM"
    if (!map[month]) {
      map[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'Income')  map[month].income  += t.amount;
    if (t.type === 'Expense') map[month].expense += t.amount;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b)) // chronological order
    .map(([month, { income, expense }]) => ({
      month,
      income:  round2(income),
      expense: round2(expense),
      balance: round2(income - expense),
    }));
}

// ─── 4. Top-N spenders ────────────────────────────────────────────────────────
/**
 * Returns the N categories with the highest total spend (Expense only).
 * Convenience wrapper around sumByCategory for dashboard widgets.
 *
 * @param  {Array}  transactions
 * @param  {number} [n=5]          - How many top categories to return
 * @returns {Array}
 */
function topSpendingCategories(transactions, n = 5) {
  return sumByCategory(transactions, 'Expense').slice(0, n);
}

// ─── 5. Full summary (the one the route calls) ────────────────────────────────
/**
 * Master helper — computes everything the frontend dashboard needs in one go.
 * The route handler fetches the raw transactions; this function turns them
 * into a fully calculated summary object.
 *
 * @param  {Array}  transactions   - Raw transaction documents for one user
 * @returns {Object}
 *   {
 *     totals:               { income, expense, balance, savingsRate },
 *     transactionCount:     number,
 *     expenseByCategory:    [{ category, total, count, percentage }],
 *     incomeByCategory:     [{ category, total, count, percentage }],
 *     monthlyBreakdown:     [{ month, income, expense, balance }],
 *     topSpending:          [{ category, total, count, percentage }],   // top 5
 *     largestExpense:       transaction | null,
 *     largestIncome:        transaction | null,
 *   }
 */
function buildSummary(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      totals:            { income: 0, expense: 0, balance: 0, savingsRate: 0 },
      transactionCount:  0,
      expenseByCategory: [],
      incomeByCategory:  [],
      monthlyBreakdown:  [],
      topSpending:       [],
      largestExpense:    null,
      largestIncome:     null,
    };
  }

  const expenses = transactions.filter((t) => t.type === 'Expense');
  const incomes  = transactions.filter((t) => t.type === 'Income');

  return {
    totals:            computeTotals(transactions),
    transactionCount:  transactions.length,
    expenseByCategory: sumByCategory(transactions, 'Expense'),
    incomeByCategory:  sumByCategory(transactions, 'Income'),
    monthlyBreakdown:  sumByMonth(transactions),
    topSpending:       topSpendingCategories(transactions, 5),
    largestExpense:    maxByAmount(expenses),
    largestIncome:     maxByAmount(incomes),
  };
}

// ─── Internal utilities ───────────────────────────────────────────────────────

/** Round to 2 decimal places — avoids 0.1 + 0.2 = 0.30000000000004 */
function round2(n) {
  return Math.round(n * 100) / 100;
}

/** "2026-04-25T..." → "2026-04" */
function toMonthKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Return the transaction with the highest amount from an array, or null */
function maxByAmount(transactions) {
  if (!transactions.length) return null;
  return transactions.reduce((max, t) => (t.amount > max.amount ? t : max));
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  buildSummary,            // used by the /summary route
  sumByCategory,           // usable independently in other routes
  computeTotals,           // usable independently
  sumByMonth,              // usable independently
  topSpendingCategories,   // usable independently
  // internals exposed for unit testing
  round2,
  toMonthKey,
  maxByAmount,
};
