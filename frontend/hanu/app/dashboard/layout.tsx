import AuthGuard from '@/components/auth/AuthGuard'
import SidebarWithUsage from '@/components/dashboard/SidebarWithUsage'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="dashboard-page">
        <div className="app-shell">
          <SidebarWithUsage />
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
