import { Sidebar } from '@/components/layout/sidebar'
import { currentUser } from '@clerk/nextjs/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  return (
    <div className="flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
          {user && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs text-gray-400">
                {user.emailAddresses?.[0]?.emailAddress}
              </span>
            </div>
          )}
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
