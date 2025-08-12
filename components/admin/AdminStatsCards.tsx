import { Card, CardContent } from "@/components/ui/card"
import { Users, FileText, Activity, AlertTriangle } from 'lucide-react'
import { DashboardStats } from './types'

interface AdminStatsCardsProps {
  stats: DashboardStats
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: `+${stats.newUsersToday} today`,
      icon: Users,
      gradient: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      textColor: "text-blue-600",
      valueColor: "text-blue-900",
      iconColor: "text-blue-500"
    },
    {
      title: "Total Posts",
      value: stats.totalPosts,
      change: `+${stats.newPostsToday} today`,
      icon: FileText,
      gradient: "from-green-50 to-green-100",
      border: "border-green-200",
      textColor: "text-green-600",
      valueColor: "text-green-900",
      iconColor: "text-green-500"
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      change: "Last 24 hours",
      icon: Activity,
      gradient: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      textColor: "text-orange-600",
      valueColor: "text-orange-900",
      iconColor: "text-orange-500"
    },
    {
      title: "Flagged Posts",
      value: stats.flaggedPosts,
      change: "Needs attention",
      icon: AlertTriangle,
      gradient: "from-red-50 to-red-100",
      border: "border-red-200",
      textColor: "text-red-600",
      valueColor: "text-red-900",
      iconColor: "text-red-500"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => {
        const IconComponent = card.icon
        return (
          <Card key={card.title} className={`bg-gradient-to-br ${card.gradient} ${card.border}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${card.textColor} text-sm font-medium`}>{card.title}</p>
                  <p className={`text-3xl font-bold ${card.valueColor}`}>
                    {card.value.toLocaleString()}
                  </p>
                  <p className={`${card.textColor} text-sm mt-1`}>{card.change}</p>
                </div>
                <IconComponent className={`h-12 w-12 ${card.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
