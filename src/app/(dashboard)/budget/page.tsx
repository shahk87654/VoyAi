'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Plus, TrendingUp, Users, PieChart } from 'lucide-react'
import toast from 'react-hot-toast'

interface Expense {
  id: string
  category: string
  amount: number
  description: string
  paidBy: string
  createdAt: string
}

interface BudgetData {
  expenses: Expense[]
  summary: {
    total: number
    byCategory: Record<string, number>
    byPerson: Record<string, number>
  }
}

const EXPENSE_CATEGORIES = [
  '🏨 Accommodation',
  '✈️ Flights',
  '🍽️ Food & Dining',
  '🚗 Transportation',
  '🎭 Activities',
  '🛍️ Shopping',
  '📸 Tours',
  '💆 Wellness',
  '🎪 Entertainment',
  '📱 Other',
]

export default function BudgetPage() {
  const [tripId] = useState('sample-trip-123') // Would come from URL params
  const [budget, setBudget] = useState<BudgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [newExpense, setNewExpense] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    description: '',
    paidBy: '',
  })

  useEffect(() => {
    fetchBudget()
  }, [])

  const fetchBudget = async () => {
    try {
      const res = await fetch(`/api/trips/budget?tripId=${tripId}`)
      if (res.ok) {
        const data = await res.json()
        setBudget(data)
      }
    } catch (error) {
      console.error('Error fetching budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newExpense.category || !newExpense.amount || !newExpense.paidBy) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      const res = await fetch('/api/trips/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          ...newExpense,
          amount: parseFloat(newExpense.amount),
        }),
      })

      if (res.ok) {
        setNewExpense({ category: EXPENSE_CATEGORIES[0], amount: '', description: '', paidBy: '' })
        await fetchBudget()
        toast.success('Expense added!')
      }
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[var(--color-text-muted)]">Loading budget...</p>
      </div>
    )
  }

  const total = budget?.summary.total || 0

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/30 backdrop-blur-sm">
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <DollarSign className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">💰 Group Budget</p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-[var(--color-text)]">
                Trip Expenses
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)]">
            Track and split expenses among group members.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[var(--color-text-muted)] uppercase">Total Spent</p>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-display font-bold text-emerald-500">${total.toFixed(2)}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">{budget?.expenses.length || 0} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[var(--color-text-muted)] uppercase">Avg Per Person</p>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-4xl font-display font-bold text-blue-500">
            ${(total / Math.max(1, Object.keys(budget?.summary.byPerson || {}).length)).toFixed(2)}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">{Object.keys(budget?.summary.byPerson || {}).length} members</p>
        </div>

        <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[var(--color-text-muted)] uppercase">Top Category</p>
            <PieChart className="w-5 h-5 text-amber-400" />
          </div>
          {budget?.summary.byCategory && Object.keys(budget.summary.byCategory).length > 0 ? (
            <>
              <p className="text-2xl font-display font-bold text-amber-500">
                {Object.entries(budget.summary.byCategory).sort(([, a], [, b]) => b - a)[0]?.[0]}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                ${Object.values(budget.summary.byCategory).sort((a, b) => b - a)[0]?.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-lg text-[var(--color-text-muted)]">No expenses yet</p>
          )}
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Expense
        </h2>

        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Category</label>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Amount ($)</label>
            <input
              type="number"
              placeholder="0.00"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:border-emerald-500 focus:outline-none"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Paid By</label>
            <input
              type="text"
              placeholder="Your name"
              value={newExpense.paidBy}
              onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Description</label>
            <input
              type="text"
              placeholder="Optional"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="lg:col-span-4 sm:col-span-2 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
          >
            Add Expense
          </button>
        </form>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--color-text)]">Transactions</h2>
        {budget && budget.expenses.length > 0 ? (
          <div className="space-y-2">
            {budget.expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-[var(--color-text)]">{expense.category}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Paid by {expense.paidBy} {expense.description && `• ${expense.description}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-500">${expense.amount.toFixed(2)}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 rounded-2xl border-2 border-dashed border-[var(--color-border)]">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-[var(--color-text-muted)]/30 mx-auto mb-3" />
              <p className="text-[var(--color-text-muted)]">No expenses yet. Add one above!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
