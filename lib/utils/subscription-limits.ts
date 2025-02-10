import { Database } from '@/types/supabase'

type SubscriptionTier = Database['public']['Enums']['subscription_tier']
type Profile = Database['public']['Tables']['profiles']['Row']
type SubscriptionLimits = Database['public']['Tables']['subscription_limits']['Row']

export function hasReachedTemplateLimit(
  profile: Profile & { subscription_limits: SubscriptionLimits },
  currentCount: number
): boolean {
  const { max_templates } = profile.subscription_limits
  return max_templates !== -1 && currentCount >= max_templates
}

export function hasReachedItemLimit(
  profile: Profile & { subscription_limits: SubscriptionLimits },
  currentCount: number
): boolean {
  const { max_items_per_template } = profile.subscription_limits
  return max_items_per_template !== -1 && currentCount >= max_items_per_template
}

export function hasReachedUploadLimit(
  profile: Profile & { subscription_limits: SubscriptionLimits }
): boolean {
  const { max_daily_uploads } = profile.subscription_limits
  return max_daily_uploads !== -1 && profile.daily_upload_count >= max_daily_uploads
}

export function getRemainingUploads(
  profile: Profile & { subscription_limits: SubscriptionLimits }
): number | 'unlimited' {
  const { max_daily_uploads } = profile.subscription_limits
  if (max_daily_uploads === -1) return 'unlimited'
  return Math.max(0, max_daily_uploads - profile.daily_upload_count)
}

export function getLimitWarning(
  profile: Profile & { subscription_limits: SubscriptionLimits },
  type: 'templates' | 'items' | 'uploads',
  currentCount: number
): string | null {
  const limits = profile.subscription_limits

  switch (type) {
    case 'templates': {
      if (limits.max_templates === -1) return null
      const remaining = limits.max_templates - currentCount
      if (remaining <= 0) {
        return 'You have reached your template limit. Upgrade your plan to create more templates.'
      }
      if (remaining <= 2) {
        return `You can create ${remaining} more template${remaining === 1 ? '' : 's'}.`
      }
      return null
    }
    case 'items': {
      if (limits.max_items_per_template === -1) return null
      const remaining = limits.max_items_per_template - currentCount
      if (remaining <= 0) {
        return 'You have reached your items per template limit. Upgrade your plan to add more items.'
      }
      if (remaining <= 3) {
        return `You can add ${remaining} more item${remaining === 1 ? '' : 's'} to this template.`
      }
      return null
    }
    case 'uploads': {
      if (limits.max_daily_uploads === -1) return null
      const remaining = limits.max_daily_uploads - profile.daily_upload_count
      if (remaining <= 0) {
        return 'You have reached your daily upload limit. Try again tomorrow or upgrade your plan.'
      }
      if (remaining <= 3) {
        return `You can upload ${remaining} more design${remaining === 1 ? '' : 's'} today.`
      }
      return null
    }
    default:
      return null
  }
}

export const PLAN_FEATURES = {
  free: {
    maxTemplates: 3,
    maxItemsPerTemplate: 5,
    maxDailyUploads: 10,
    hasAds: true,
  },
  creator: {
    maxTemplates: 10,
    maxItemsPerTemplate: 10,
    maxDailyUploads: -1,
    hasAds: false,
  },
  pro: {
    maxTemplates: 20,
    maxItemsPerTemplate: 30,
    maxDailyUploads: -1,
    hasAds: false,
  },
  enterprise: {
    maxTemplates: -1,
    maxItemsPerTemplate: -1,
    maxDailyUploads: -1,
    hasAds: false,
  },
} as const

export function getUpgradeMessage(currentTier: SubscriptionTier): string {
  switch (currentTier) {
    case 'free':
      return 'Upgrade to Creator for more templates and unlimited uploads'
    case 'creator':
      return 'Upgrade to Pro for more templates and items per template'
    case 'pro':
      return 'Upgrade to Enterprise for unlimited usage'
    default:
      return 'Contact us for custom enterprise solutions'
  }
}