'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, SignOutButton } from '@clerk/nextjs'
import { 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  Receipt, 
  BarChart3,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Members', icon: Users, href: '/members' },
  { label: 'Loans', icon: HandCoins, href: '/loans' },
  { label: 'Expenses', icon: Receipt, href: '/expenses' },
  { label: 'Reports', icon: BarChart3, href: '/reports' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Trésorerie</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-colors",
              pathname === item.href 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t space-y-3">
        <div className="flex items-center space-x-3 p-3">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
          <span className="text-sm font-medium text-gray-700">Account</span>
        </div>
        <SignOutButton>
          <button className="flex items-center space-x-3 p-3 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}
