import { Metadata } from 'next'
import { getServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/services/subscriptions'
import BillingForm from './billing-form'

export const metadata: Metadata = {
  title: 'Billing Settings - Print Vision Bolt',
  description: 'Manage your subscription and billing settings',
}

export default async function BillingPage() {
  const { session } = await getServerClient()

  if (!session) {
    redirect('/login')
  }

  const profile = await getUserProfile(session.user.id)

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Billing Settings</h1>
          <p className="text-lg text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        <div className="space-y-8">
          <BillingForm
            currentTier={profile.subscription_tier}
            stripeCustomerId={profile.stripe_customer_id}
          />
        </div>
      </div>
    </div>
  )
}