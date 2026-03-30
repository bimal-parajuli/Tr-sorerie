'use client'

import { trpc } from '@/lib/trpc'
import Link from 'next/link'

export default function LoansPage() {
  // In a real app, we might want a global list or filtered by status
  const { data: loans, isLoading } = trpc.loans.listByMember.useQuery('placeholder-id', {
    enabled: false // Disabled for now since we don't have a specific member ID on this list page
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Loan Portfolio</h1>
        <Link href="/members" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          New Loan Application
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Loan Number</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Principal</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Rate</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Outstanding</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">
                Navigate to a specific member to manage their loans.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
