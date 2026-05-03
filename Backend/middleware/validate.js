// ─── Validation Middleware ────────────────────────────────────────────────────
// Pure functions — no dependencies. Easy to unit test.

const VALID_CATEGORIES = [
  'Food', 'Rent', 'Salary', 'Transport', 'Health',
  'Entertainment', 'Shopping', 'Other',
];
const VALID_TYPES = ['Income', 'Expense'];

/**
 * Validate the body of POST /api/transactions
 * Returns an array of error strings (empty = valid).
 */
function validateTransaction(body) {
  const errors = [];
  const { amount, category, type, date } = body;

  // amount
  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required');
  } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
    errors.push('amount must be a positive number');
  }

  // category
  if (!category) {
    errors.push('category is required');
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // type
  if (!type) {
    errors.push('type is required');
  } else if (!VALID_TYPES.includes(type)) {
    errors.push('type must be "Income" or "Expense"');
  }

  // date — optional, but must be a real date if provided
  if (date && isNaN(Date.parse(date))) {
    errors.push('date must be a valid ISO date string (e.g. 2026-04-25)');
  }

  return errors;
}

/**
 * Express middleware — rejects requests with invalid transaction bodies.
 * Attach to POST and PUT transaction routes.
 */
function validateTransactionMiddleware(req, res, next) {
  const errors = validateTransaction(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
}

/**
 * Validate that :id looks like a MongoDB ObjectId before hitting the DB.
 * Prevents Mongoose CastError spam in logs.
 */
function validateObjectId(req, res, next) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(400).json({ message: 'Invalid transaction ID format' });
  }
  next();
}

module.exports = { validateTransactionMiddleware, validateObjectId };
