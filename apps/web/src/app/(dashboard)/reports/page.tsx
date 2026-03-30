'use client'

import { trpc } from '@/lib/trpc'

export default function ReportsPage() {
  const { data: summary, isLoading } = trpc.reports.portfolioSummary.useQuery()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-6">Portfolio Health Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Total Assets (Loans)</p>
            <p className="text-2xl font-bold text-gray-900">NPR {Number(summary?.totalLoansOutstanding ?? 0).toLocaleString()}</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Total Liabilities (Savings)</p>
            <p className="text-2xl font-bold text-gray-900">NPR {Number(summary?.totalSavings ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
