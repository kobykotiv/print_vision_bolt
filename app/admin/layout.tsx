import { Metadata } from 'next'
import { getServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin - Print Vision Bolt',
  description: 'Admin dashboard for Print Vision Bolt',
}

async function checkAdminAccess() {
  const { session } = await getServerClient()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await (await getServerClient()).supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    redirect('/')
  }

  return profile.role
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkAdminAccess()

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Admin Sidebar */}
        <div className="w-64 border-r bg-muted/50">
          <div className="flex h-16 items-center border-b px-6">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </div>
          <nav className="space-y-1 p-4">
            <a
              href="/admin"
              className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-accent"
            >
              <span>Overview</span>
            </a>
            <a
              href="/admin/users"
              className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-accent"
            >
              <span>Users</span>
            </a>
            <a
              href="/admin/subscriptions"
              className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-accent"
            >
              <span>Subscriptions</span>
            </a>
            <a
              href="/admin/metrics"
              className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-accent"
            >
              <span>Metrics</span>
            </a>
            <a
              href="/admin/logs"
              className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-accent"
            >
              <span>Logs</span>
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="h-16 border-b" />
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}