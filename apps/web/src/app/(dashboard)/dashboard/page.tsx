'use client'

import { trpc } from '@/lib/trpc'
import { 
  Users, 
  HandCoins, 
  ArrowDownCircle, 
  ArrowUpCircle 
} from 'lucide-react'

export default function DashboardPage() {
  const { data: summary, isLoading } = trpc.reports.portfolioSummary.useQuery()

  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  const cards = [
    { 
      label: 'Total Members', 
      value: summary?.totalMembers ?? 0, 
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Total Savings', 
      value: `NPR ${summary?.totalSavings?.toLocaleString() ?? 0}`, 
      icon: ArrowDownCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      label: 'Loans Outstanding', 
      value: `NPR ${summary?.totalLoansOutstanding?.toLocaleString() ?? 0}`, 
      icon: ArrowUpCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    { 
      label: 'Total Expenses', 
      value: `NPR ${summary?.totalExpenses?.toLocaleString() ?? 0}`, 
      icon: HandCoins,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-3 rounded-lg`}>
                <card.icon className={card.color} size={24} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
          <div className="space-y-4">
            <p className="text-gray-500 text-sm italic">No recent activities to show.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Loan Portfolio Distribution</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-sm">Chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  )
}
