import { Metadata } from 'next'
import { getCollections } from '@/lib/services/collections'
import { getServerClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/services/subscriptions'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import CollectionList from './collection-list'
import UpgradeBanner from '@/components/upgrade-banner'
import UsageLimits from '@/components/usage-limits'
import { hasReachedTemplateLimit } from '@/lib/utils/subscription-limits'

export const metadata: Metadata = {
  title: 'Collections - Print Vision Bolt',
  description: 'Manage your print collections',
}

export default async function CollectionsPage() {
  const { session } = await getServerClient()

  if (!session) {
    redirect('/login')
  }

  const [collections, profile] = await Promise.all([
    getCollections(),
    getUserProfile(session.user.id),
  ])

  if (!profile) {
    redirect('/login')
  }

  const templateCount = collections.length
  const hasReachedLimit = hasReachedTemplateLimit(profile, templateCount)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Collections</h1>
            <p className="text-lg text-muted-foreground">
              Manage your print collections and their settings
            </p>
          </div>
          <Button asChild disabled={hasReachedLimit}>
            <Link href="/collections/new">
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Link>
          </Button>
        </div>

        <div className="mt-6">
          <UsageLimits 
            profile={profile} 
            currentTemplates={templateCount} 
          />
        </div>
      </div>

      <UpgradeBanner
        tier={profile.subscription_tier}
        type="templates"
        showBanner={hasReachedLimit}
      />

      {collections.length > 0 ? (
        <CollectionList collections={collections} />
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No collections</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {hasReachedLimit
                ? "You've reached your template limit. Upgrade your plan to create more collections."
                : "You haven't created any collections yet. Create one to get started."}
            </p>
            {!hasReachedLimit && (
              <Button asChild>
                <Link href="/collections/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Collection
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
