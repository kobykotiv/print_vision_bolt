'use client'

import { useState } from 'react'
import { Database } from '@/types/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Settings, Ban, Crown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type Profile = Database['public']['Tables']['profiles']['Row']

interface UserActionsDropdownProps {
  user: Profile
}

export default function UserActionsDropdown({ user }: UserActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAction = async (action: string) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          ...getActionUpdates(action),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      toast({
        title: 'Success',
        description: `User ${action} successfully`,
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getActionUpdates = (action: string) => {
    switch (action) {
      case 'promote to admin':
        return { role: 'admin' }
      case 'demote to user':
        return { role: 'user' }
      case 'suspend':
        return { subscription_status: 'suspended' }
      case 'reactivate':
        return { subscription_status: 'active' }
      default:
        return {}
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {user.role === 'user' ? (
          <DropdownMenuItem onClick={() => handleAction('promote to admin')}>
            <Crown className="mr-2 h-4 w-4" />
            Promote to Admin
          </DropdownMenuItem>
        ) : user.role === 'admin' ? (
          <DropdownMenuItem onClick={() => handleAction('demote to user')}>
            <Crown className="mr-2 h-4 w-4" />
            Demote to User
          </DropdownMenuItem>
        ) : null}

        {user.subscription_status !== 'suspended' ? (
          <DropdownMenuItem
            onClick={() => handleAction('suspend')}
            className="text-destructive"
          >
            <Ban className="mr-2 h-4 w-4" />
            Suspend User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleAction('reactivate')}>
            <Settings className="mr-2 h-4 w-4" />
            Reactivate User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}