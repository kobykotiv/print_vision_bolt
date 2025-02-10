import { Metadata } from 'next'
import { getSystemMetrics } from '@/lib/services/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CircleCheck, Users, CreditCard, Box } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Overview - Print Vision Bolt',
  description: 'Admin dashboard overview',
}

export default async function AdminPage() {
  const metrics = await getSystemMetrics('24h')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">System metrics and stats</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <CircleCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dailyActiveUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageResponseTime.toFixed(2)}ms
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TODO: Add charts and graphs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add user growth chart here */}
            <div className="h-[200px] rounded-lg border p-4">
              <p className="text-center text-muted-foreground">
                User growth chart coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add subscription pie chart here */}
            <div className="h-[200px] rounded-lg border p-4">
              <p className="text-center text-muted-foreground">
                Subscription distribution chart coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}