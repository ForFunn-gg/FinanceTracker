/**
 * tests/transactionCalculator.test.js
 *
 * Run with:  node tests/transactionCalculator.test.js
 * (No test framework needed — uses Node's built-in assert module.)
 */

const assert = require('assert');
const {
  sumByCategory,
  computeTotals,
  sumByMonth,
  topSpendingCategories,
  buildSummary,
  round2,
  toMonthKey,
  maxByAmount,
} = require('../helpers/transactionCalculator');

// ─── Fixture data ─────────────────────────────────────────────────────────────
const TRANSACTIONS = [
  { _id: '1', type: 'Income',  category: 'Salary',    amount: 5000, date: new Date('2026-04-01') },
  { _id: '2', type: 'Income',  category: 'Salary',    amount: 800,  date: new Date('2026-04-10') },
  { _id: '3', type: 'Expense', category: 'Rent',      amount: 1200, date: new Date('2026-04-02') },
  { _id: '4', type: 'Expense', category: 'Food',      amount: 350,  date: new Date('2026-04-05') },
  { _id: '5', type: 'Expense', category: 'Food',      amount: 150,  date: new Date('2026-04-18') },
  { _id: '6', type: 'Expense', category: 'Transport', amount: 90,   date: new Date('2026-04-12') },
  { _id: '7', type: 'Expense', category: 'Transport', amount: 60,   date: new Date('2026-03-28') },
  { _id: '8', type: 'Income',  category: 'Salary',    amount: 5000, date: new Date('2026-03-01') },
  { _id: '9', type: 'Expense', category: 'Rent',      amount: 1200, date: new Date('2026-03-02') },
];

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗  ${name}`);
    console.log(`     ${err.message}`);
    failed++;
  }
}

// ─── round2 ───────────────────────────────────────────────────────────────────
console.log('\nround2');

test('rounds down correctly', () => {
  assert.strictEqual(round2(1.234), 1.23);
});
test('rounds up correctly', () => {
  assert.strictEqual(round2(1.235), 1.24);
});
test('fixes floating-point drift (0.1 + 0.2)', () => {
  assert.strictEqual(round2(0.1 + 0.2), 0.3);
});
test('handles zero', () => {
  assert.strictEqual(round2(0), 0);
});

// ─── toMonthKey ───────────────────────────────────────────────────────────────
console.log('\ntoMonthKey');

test('formats Date object to YYYY-MM', () => {
  assert.strictEqual(toMonthKey(new Date('2026-04-25')), '2026-04');
});
test('pads single-digit months', () => {
  assert.strictEqual(toMonthKey(new Date('2026-03-01')), '2026-03');
});
test('accepts ISO date string', () => {
  assert.strictEqual(toMonthKey('2026-11-01'), '2026-11');
});

// ─── sumByCategory ────────────────────────────────────────────────────────────
console.log('\nsumByCategory');

test('sums expenses correctly per category', () => {
  const result = sumByCategory(TRANSACTIONS, 'Expense');
  const rent = result.find((r) => r.category === 'Rent');
  assert.strictEqual(rent.total, 2400);  // 1200 + 1200
  assert.strictEqual(rent.count, 2);
});

test('sorts by total descending', () => {
  const result = sumByCategory(TRANSACTIONS, 'Expense');
  for (let i = 0; i < result.length - 1; i++) {
    assert.ok(result[i].total >= result[i + 1].total, 'not sorted descending');
  }
});

test('percentages sum to 100', () => {
  const result = sumByCategory(TRANSACTIONS, 'Expense');
  const sum = result.reduce((s, r) => s + r.percentage, 0);
  assert.ok(Math.abs(sum - 100) < 0.01, `percentages summed to ${sum}, expected 100`);
});

test('returns empty array for empty input', () => {
  const result = sumByCategory([], 'Expense');
  assert.deepStrictEqual(result, []);
});

test('filters by type — Income only includes Salary', () => {
  const result = sumByCategory(TRANSACTIONS, 'Income');
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].category, 'Salary');
  assert.strictEqual(result[0].total, 10800); // 5000 + 800 + 5000
});

test('no type filter includes all categories', () => {
  const result = sumByCategory(TRANSACTIONS);
  const categories = result.map((r) => r.category);
  assert.ok(categories.includes('Salary'));
  assert.ok(categories.includes('Rent'));
  assert.ok(categories.includes('Food'));
});

// ─── computeTotals ────────────────────────────────────────────────────────────
console.log('\ncomputeTotals');

test('computes correct income total', () => {
  const { income } = computeTotals(TRANSACTIONS);
  assert.strictEqual(income, 10800); // 5000 + 800 + 5000
});

test('computes correct expense total', () => {
  const { expense } = computeTotals(TRANSACTIONS);
  assert.strictEqual(expense, 3050); // 1200+350+150+90+60+1200
});

test('computes correct balance', () => {
  const { balance } = computeTotals(TRANSACTIONS);
  assert.strictEqual(balance, 7750); // 10800 - 3050
});

test('computes savings rate correctly', () => {
  const { savingsRate } = computeTotals(TRANSACTIONS);
  // (10800 - 3050) / 10800 * 100 = 71.76
  assert.strictEqual(savingsRate, 71.76);
});

test('returns zeros for empty input', () => {
  const result = computeTotals([]);
  assert.deepStrictEqual(result, { income: 0, expense: 0, balance: 0, savingsRate: 0 });
});

test('savingsRate is 0 when there is no income', () => {
  const expensesOnly = TRANSACTIONS.filter((t) => t.type === 'Expense');
  const { savingsRate } = computeTotals(expensesOnly);
  assert.strictEqual(savingsRate, 0);
});

// ─── sumByMonth ───────────────────────────────────────────────────────────────
console.log('\nsumByMonth');

test('returns two distinct months', () => {
  const result = sumByMonth(TRANSACTIONS);
  assert.strictEqual(result.length, 2);
});

test('months are in chronological order', () => {
  const result = sumByMonth(TRANSACTIONS);
  assert.strictEqual(result[0].month, '2026-03');
  assert.strictEqual(result[1].month, '2026-04');
});

test('March income is correct', () => {
  const march = sumByMonth(TRANSACTIONS).find((m) => m.month === '2026-03');
  assert.strictEqual(march.income, 5000);
  assert.strictEqual(march.expense, 1260); // 1200 + 60
});

test('April income is correct', () => {
  const april = sumByMonth(TRANSACTIONS).find((m) => m.month === '2026-04');
  assert.strictEqual(april.income, 5800); // 5000 + 800
});

test('balance = income - expense per month', () => {
  const result = sumByMonth(TRANSACTIONS);
  for (const m of result) {
    assert.strictEqual(m.balance, round2(m.income - m.expense));
  }
});

// ─── topSpendingCategories ────────────────────────────────────────────────────
console.log('\ntopSpendingCategories');

test('returns at most N results', () => {
  const result = topSpendingCategories(TRANSACTIONS, 2);
  assert.ok(result.length <= 2);
});

test('top category is highest spender', () => {
  const result = topSpendingCategories(TRANSACTIONS, 5);
  assert.strictEqual(result[0].category, 'Rent'); // 2400 is highest
});

test('only includes Expense transactions', () => {
  const result = topSpendingCategories(TRANSACTIONS, 10);
  const hasSalary = result.some((r) => r.category === 'Salary');
  assert.strictEqual(hasSalary, false);
});

// ─── maxByAmount ──────────────────────────────────────────────────────────────
console.log('\nmaxByAmount');

test('returns null for empty array', () => {
  assert.strictEqual(maxByAmount([]), null);
});

test('returns the single item if only one', () => {
  const result = maxByAmount([TRANSACTIONS[0]]);
  assert.strictEqual(result._id, '1');
});

test('returns transaction with highest amount', () => {
  const expenses = TRANSACTIONS.filter((t) => t.type === 'Expense');
  const result = maxByAmount(expenses);
  assert.strictEqual(result._id, '3'); // Rent 1200 (first occurrence)
});

// ─── buildSummary ─────────────────────────────────────────────────────────────
console.log('\nbuildSummary');

test('returns all expected top-level keys', () => {
  const result = buildSummary(TRANSACTIONS);
  const keys = ['totals','transactionCount','expenseByCategory',
                 'incomeByCategory','monthlyBreakdown','topSpending',
                 'largestExpense','largestIncome'];
  for (const key of keys) {
    assert.ok(key in result, `missing key: ${key}`);
  }
});

test('transactionCount matches input length', () => {
  const result = buildSummary(TRANSACTIONS);
  assert.strictEqual(result.transactionCount, TRANSACTIONS.length);
});

test('totals are consistent with individual helpers', () => {
  const summary = buildSummary(TRANSACTIONS);
  const direct  = computeTotals(TRANSACTIONS);
  assert.deepStrictEqual(summary.totals, direct);
});

test('largestExpense is a valid transaction object', () => {
  const result = buildSummary(TRANSACTIONS);
  assert.ok(result.largestExpense !== null);
  assert.ok('amount' in result.largestExpense);
  assert.strictEqual(result.largestExpense.type, 'Expense');
});

test('largestIncome is a valid transaction object', () => {
  const result = buildSummary(TRANSACTIONS);
  assert.ok(result.largestIncome !== null);
  assert.strictEqual(result.largestIncome.type, 'Income');
});

test('handles empty transaction array gracefully', () => {
  const result = buildSummary([]);
  assert.strictEqual(result.transactionCount, 0);
  assert.strictEqual(result.totals.balance, 0);
  assert.deepStrictEqual(result.expenseByCategory, []);
  assert.strictEqual(result.largestExpense, null);
});

// ─── Results ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`  ${passed} passed  |  ${failed} failed`);
console.log(`${'─'.repeat(40)}\n`);

if (failed > 0) process.exit(1);
