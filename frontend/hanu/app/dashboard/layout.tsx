import AuthGuard from '@/components/auth/AuthGuard'
import Sidebar from '@/components/dashboard/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="dashboard-page">
        <div className="app-shell">
          <Sidebar usagePercent={34} usageUsed="34 min" usageTotal="120 min" />
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
