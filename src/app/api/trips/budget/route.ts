import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripId, category, amount, description, paidBy, splitWith } = body

    if (!tripId || !category || !amount || !paidBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create expense entry
    const expense = await prisma.tripExpense.create({
      data: {
        tripId,
        category,
        amount: parseFloat(amount),
        description,
        paidBy,
        splitWith: splitWith || [],
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const tripId = request.nextUrl.searchParams.get('tripId')

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID required' },
        { status: 400 }
      )
    }

    const expenses = await prisma.tripExpense.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate budget summary
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const byCategory: Record<string, number> = {}
    const byPerson: Record<string, number> = {}

    expenses.forEach((expense) => {
      byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount
      byPerson[expense.paidBy] = (byPerson[expense.paidBy] || 0) + expense.amount
    })

    return NextResponse.json({
      expenses,
      summary: {
        total: totalExpenses,
        byCategory,
        byPerson,
      },
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}
