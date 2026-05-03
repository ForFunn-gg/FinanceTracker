const mongoose = require('mongoose');

// ─── Phase 1: Transaction Schema ──────────────────────────────────────────────
const CATEGORIES = [
  'Food', 'Rent', 'Salary', 'Transport', 'Health',
  'Entertainment', 'Shopping', 'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // index for fast user-based queries
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: ['Income', 'Expense'],
        message: 'Type must be Income or Expense',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for efficient filtering by user + date range
transactionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
