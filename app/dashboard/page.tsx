import { Metadata } from 'next'
import { getServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Dashboard - Print Vision Bolt',
  description: 'Manage your print on demand business',
}

export default async function DashboardPage() {
  const { session } = await getServerClient()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome back!</h1>
        <p className="text-lg text-muted-foreground">
          Manage your print on demand business from one place
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/collections/new"
              className="block rounded-md bg-primary px-4 py-2 text-center text-primary-foreground hover:bg-primary/90"
            >
              Create Collection
            </a>
            <a
              href="/designs/upload"
              className="block rounded-md bg-secondary px-4 py-2 text-center text-secondary-foreground hover:bg-secondary/90"
            >
              Upload Designs
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Overview</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Collections</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Designs</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connected Stores</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}