import { Activity, Users, FileText } from 'lucide-react'

interface AdminTabsProps {
  currentView: 'overview' | 'users' | 'posts'
  onTabChange: (view: 'overview' | 'users' | 'posts') => void
}

export function AdminTabs({ currentView, onTabChange }: AdminTabsProps) {
  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: Activity },
    { key: 'users' as const, label: 'Users', icon: Users },
    { key: 'posts' as const, label: 'Posts', icon: FileText }
  ]

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              currentView === key
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
