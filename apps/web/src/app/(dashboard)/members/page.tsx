'use client'

import { trpc } from '@/lib/trpc'
import Link from 'next/link'

export default function MembersPage() {
  const { data: members, isLoading } = trpc.members.list.useQuery({})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Register Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Member Code</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Full Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Phone Number</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading members...</td></tr>
            ) : members?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No members found.</td></tr>
            ) : (
              members?.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.memberCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.user?.phoneNumber}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {member.membershipStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/members/${member.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </Link>
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
