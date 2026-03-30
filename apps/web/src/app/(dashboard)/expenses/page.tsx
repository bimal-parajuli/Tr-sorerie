'use client'

import { trpc } from '@/lib/trpc'

export default function ExpensesPage() {
  const { data: expenses, isLoading } = trpc.expenses.list.useQuery({})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Organization Expenses</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Record Expense
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading expenses...</td></tr>
            ) : expenses?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No expenses recorded.</td></tr>
            ) : (
              expenses?.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{expense.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{expense.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">NPR {Number(expense.amount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {expense.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
