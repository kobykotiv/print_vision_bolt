import { Metadata } from 'next'
import { getUsersWithProfile } from '@/lib/services/admin'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import UserActionsDropdown from './user-actions-dropdown'

export const metadata: Metadata = {
  title: 'User Management - Print Vision Bolt',
  description: 'Manage users and their permissions',
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'superadmin':
      return 'destructive'
    case 'admin':
      return 'default'
    default:
      return 'secondary'
  }
}

function getSubscriptionBadgeVariant(tier: string) {
  switch (tier) {
    case 'enterprise':
      return 'default'
    case 'pro':
    case 'creator':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getStatusBadgeVariant(status: string | null) {
  switch (status) {
    case 'active':
      return 'default'
    case 'suspended':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string }
}) {
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 10

  const { users, total } = await getUsersWithProfile(page, limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getSubscriptionBadgeVariant(user.subscription_tier)}>
                    {user.subscription_tier}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.subscription_status)}>
                    {user.subscription_status || 'none'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <UserActionsDropdown user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} to{' '}
          {Math.min(page * limit, total)} of {total} users
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => {
              const searchParams = new URLSearchParams(window.location.search)
              searchParams.set('page', String(page - 1))
              window.location.search = searchParams.toString()
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * limit >= total}
            onClick={() => {
              const searchParams = new URLSearchParams(window.location.search)
              searchParams.set('page', String(page + 1))
              window.location.search = searchParams.toString()
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}