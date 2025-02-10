'use client'

import { Database } from '@/types/supabase'
import {
  hasReachedTemplateLimit,
  hasReachedItemLimit,
  hasReachedUploadLimit,
  getRemainingUploads,
  getLimitWarning,
} from '@/lib/utils/subscription-limits'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']
type SubscriptionLimits = Database['public']['Tables']['subscription_limits']['Row']

interface UsageLimitsProps {
  profile: Profile & { subscription_limits: SubscriptionLimits }
  currentTemplates?: number
  currentItems?: number
}

export default function UsageLimits({
  profile,
  currentTemplates = 0,
  currentItems = 0,
}: UsageLimitsProps) {
  const templateWarning = getLimitWarning(profile, 'templates', currentTemplates)
  const itemWarning = getLimitWarning(profile, 'items', currentItems)
  const uploadWarning = getLimitWarning(profile, 'uploads', profile.daily_upload_count)

  const templateLimit = profile.subscription_limits.max_templates
  const itemLimit = profile.subscription_limits.max_items_per_template
  const uploadLimit = profile.subscription_limits.max_daily_uploads

  return (
    <div className="space-y-4">
      {/* Template Usage */}
      {templateLimit !== -1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Templates Used</span>
            <span>
              {currentTemplates} / {templateLimit}
            </span>
          </div>
          <Progress
            value={(currentTemplates / templateLimit) * 100}
            className={
              hasReachedTemplateLimit(profile, currentTemplates)
                ? 'bg-destructive'
                : undefined
            }
          />
          {templateWarning && (
            <Alert className="mt-2">
              <Info className="h-4 w-4" />
              <AlertDescription>{templateWarning}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Items per Template Usage */}
      {itemLimit !== -1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Items in Template</span>
            <span>
              {currentItems} / {itemLimit}
            </span>
          </div>
          <Progress
            value={(currentItems / itemLimit) * 100}
            className={
              hasReachedItemLimit(profile, currentItems)
                ? 'bg-destructive'
                : undefined
            }
          />
          {itemWarning && (
            <Alert className="mt-2">
              <Info className="h-4 w-4" />
              <AlertDescription>{itemWarning}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Daily Upload Usage */}
      {uploadLimit !== -1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Daily Uploads</span>
            <span>
              {profile.daily_upload_count} / {uploadLimit}
            </span>
          </div>
          <Progress
            value={(profile.daily_upload_count / uploadLimit) * 100}
            className={
              hasReachedUploadLimit(profile) ? 'bg-destructive' : undefined
            }
          />
          {uploadWarning && (
            <Alert className="mt-2">
              <Info className="h-4 w-4" />
              <AlertDescription>{uploadWarning}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}