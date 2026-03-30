import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <header className="h-16 bg-white border-b flex items-center px-8">
          <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
