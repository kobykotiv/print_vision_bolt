import { Metadata } from 'next'
import { getServerClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/services/subscriptions'
import { redirect } from 'next/navigation'
import CollectionForm from '../collection-form'
import UpgradeBanner from '@/components/upgrade-banner'
import UsageLimits from '@/components/usage-limits'
import { hasReachedTemplateLimit } from '@/lib/utils/subscription-limits'
import { getCollections } from '@/lib/services/collections'

export const metadata: Metadata = {
  title: 'New Collection - Print Vision Bolt',
  description: 'Create a new collection',
}

export default async function NewCollectionPage() {
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

  // Redirect if user has reached their template limit
  if (hasReachedLimit) {
    redirect('/collections')
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Create Collection</h1>
          <p className="text-lg text-muted-foreground">
            Create a new collection to organize your print designs
          </p>
        </div>

        <div className="mb-8">
          <UsageLimits 
            profile={profile} 
            currentTemplates={templateCount} 
          />
        </div>

        <CollectionForm />
      </div>
    </div>
  )
}