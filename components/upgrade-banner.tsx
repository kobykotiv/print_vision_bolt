'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Database } from '@/types/supabase'
import { getUpgradeMessage } from '@/lib/utils/subscription-limits'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface UpgradeBannerProps {
  tier: Database['public']['Enums']['subscription_tier']
  type: 'templates' | 'items' | 'uploads'
  showBanner: boolean
}

export default function UpgradeBanner({ tier, type, showBanner }: UpgradeBannerProps) {
  if (!showBanner) return null

  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {type === 'templates'
          ? 'Template Limit Reached'
          : type === 'items'
          ? 'Item Limit Reached'
          : 'Upload Limit Reached'}
      </AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between">
        <span>{getUpgradeMessage(tier)}</span>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings/billing">Upgrade Plan</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}