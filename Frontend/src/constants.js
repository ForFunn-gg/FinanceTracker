// ─── Categories ──────────────────────────────────────────────────────────────
export const CATEGORIES = [
  'Food', 'Rent', 'Salary', 'Transport',
  'Health', 'Entertainment', 'Shopping', 'Other',
]

export const CAT_COLORS = {
  Food:          '#c06b3a',
  Rent:          '#5c7c60',
  Salary:        '#4a6fa5',
  Transport:     '#8b6ab5',
  Health:        '#b85c6e',
  Entertainment: '#c4963a',
  Shopping:      '#6b8fa8',
  Other:         '#7a746b',
}

export const CAT_ICONS = {
  Food:          '🍔',
  Rent:          '🏠',
  Salary:        '💼',
  Transport:     '🚗',
  Health:        '💊',
  Entertainment: '🎬',
  Shopping:      '🛍️',
  Other:         '📌',
}

export const CAT_BG = {
  Food:          '#fdf0ea',
  Rent:          '#edf4ee',
  Salary:        '#eaf0f8',
  Transport:     '#f4f0f9',
  Health:        '#faedf0',
  Entertainment: '#fdf5e8',
  Shopping:      '#edf3f7',
  Other:         '#f3f2f0',
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}