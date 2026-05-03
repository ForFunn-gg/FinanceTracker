const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const { validateTransactionMiddleware, validateObjectId } = require('../middleware/validate');
const { buildSummary, sumByCategory } = require('../helpers/transactionCalculator');

const router = express.Router();

// ─── All transaction routes require a valid JWT ───────────────────────────────
router.use(protect);

// =============================================================================
// POST /api/transactions
// Add a new income or expense for the authenticated user.
//
// Body (JSON):
//   { amount, category, type, date?, note? }
//
// Responses:
//   201  { transaction }       — created
//   400  { message, errors[] } — validation failure
//   401                        — missing / invalid token (handled by `protect`)
//   500  { message }           — server error
// =============================================================================
router.post('/', validateTransactionMiddleware, async (req, res) => {
  try {
    const { amount, category, type, date, note } = req.body;

    const transaction = await Transaction.create({
      userId:   req.user._id,       // always from verified JWT — never from body
      amount:   Number(amount),
      category,
      type,
      date:     date ? new Date(date) : new Date(),
      note:     note?.trim() || '',
    });

    res.status(201).json({
      message: 'Transaction created',
      transaction,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    console.error('[POST /transactions]', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
});

// =============================================================================
// GET /api/transactions
// Fetch all transactions for the authenticated user.
//
// Optional query params:
//   type       — "Income" | "Expense"
//   category   — e.g. "Food"
//   from       — ISO date (inclusive lower bound)
//   to         — ISO date (inclusive upper bound)
//   page       — page number (default: 1)
//   limit      — results per page (default: 20, max: 100)
//
// Responses:
//   200  { transactions[], pagination }
//   401  — missing / invalid token
//   500  { message }
// =============================================================================
router.get('/', async (req, res) => {
  try {
    const { type, category, from, to } = req.query;
    let { page = 1, limit = 20 } = req.query;

    // Clamp pagination inputs
    page  = Math.max(1, parseInt(page)  || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    // Always scope to the requesting user
    const filter = { userId: req.user._id };

    if (type && ['Income', 'Expense'].includes(type)) filter.type = type;
    if (category && ['Food','Rent','Salary','Transport','Health',
                      'Entertainment','Shopping','Other'].includes(category)) {
      filter.category = category;
    }
    if (from || to) {
      filter.date = {};
      if (from && !isNaN(Date.parse(from))) filter.date.$gte = new Date(from);
      if (to   && !isNaN(Date.parse(to)))   filter.date.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    // Run query + count in parallel
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages:   Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('[GET /transactions]', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// =============================================================================
// GET /api/transactions/summary
// Returns a fully-calculated summary for the authenticated user.
// All maths is handled by helpers/transactionCalculator.js — this route
// only handles HTTP concerns: auth, date filtering, DB fetch, response.
//
// Optional query params:
//   from  — ISO date string (inclusive lower bound)
//   to    — ISO date string (inclusive upper bound)
//
// Response shape:
// {
//   totals:            { income, expense, balance, savingsRate },
//   transactionCount:  number,
//   expenseByCategory: [{ category, total, count, percentage }],
//   incomeByCategory:  [{ category, total, count, percentage }],
//   monthlyBreakdown:  [{ month, income, expense, balance }],
//   topSpending:       [{ category, total, count, percentage }],
//   largestExpense:    transaction | null,
//   largestIncome:     transaction | null,
// }
// =============================================================================
router.get('/summary', async (req, res) => {
  try {
    const { from, to } = req.query;

    // Build the MongoDB filter — always scope to this user
    const filter = { userId: req.user._id };
    if (from || to) {
      filter.date = {};
      if (from && !isNaN(Date.parse(from))) filter.date.$gte = new Date(from);
      if (to   && !isNaN(Date.parse(to)))   filter.date.$lte = new Date(to);
    }

    // Fetch raw transactions — lean() returns plain JS objects, faster than full Mongoose docs
    const transactions = await Transaction.find(filter).lean();

    // Hand off ALL calculations to the helper — zero maths in the route
    const summary = buildSummary(transactions);

    res.json(summary);
  } catch (error) {
    console.error('[GET /transactions/summary]', error);
    res.status(500).json({ message: 'Failed to compute summary' });
  }
});

// =============================================================================
// DELETE /api/transactions/:id
// Remove a transaction. Only the owner can delete their own record.
//
// Responses:
//   200  { message, deleted }  — success
//   400  { message }           — invalid ID format
//   401  — missing / invalid token
//   404  { message }           — not found or not owned by this user
//   500  { message }           — server error
// =============================================================================
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    // Ownership enforced inside the query — no separate check needed
    const deleted = await Transaction.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found or not yours to delete' });
    }

    res.json({
      message: 'Transaction deleted successfully',
      deleted,
    });
  } catch (error) {
    console.error('[DELETE /transactions/:id]', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

// =============================================================================
// PUT /api/transactions/:id — update an existing transaction
// =============================================================================
router.put('/:id', validateObjectId, validateTransactionMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or not yours to update' });
    }

    const { amount, category, type, date, note } = req.body;
    if (amount   !== undefined) transaction.amount   = Number(amount);
    if (category)               transaction.category = category;
    if (type)                   transaction.type     = type;
    if (date)                   transaction.date     = new Date(date);
    if (note     !== undefined) transaction.note     = note.trim();

    await transaction.save();
    res.json({ message: 'Transaction updated', transaction });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    console.error('[PUT /transactions/:id]', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
});

module.exports = router;
