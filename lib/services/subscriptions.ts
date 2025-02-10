import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import Stripe from 'stripe'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type SubscriptionLimit = Database['public']['Tables']['subscription_limits']['Row']

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const SUBSCRIPTION_PRICES = {
  creator: process.env.STRIPE_CREATOR_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
}

export async function getUserProfile(userId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      subscription_limits(
        max_items_per_template,
        max_templates,
        max_daily_uploads,
        has_ads
      )
    `)
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createCheckoutSession(userId: string, tier: keyof typeof SUBSCRIPTION_PRICES) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', userId)
    .single()

  if (!profile) throw new Error('Profile not found')

  let customerId = profile.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: {
        userId,
      },
    })
    customerId = customer.id

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId)
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: SUBSCRIPTION_PRICES[tier],
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: {
      userId,
      tier,
    },
  })

  return session
}

export async function createPortalSession(userId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (!profile?.stripe_customer_id) {
    throw new Error('No Stripe customer found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  return session
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  customerId: string
) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) throw new Error('Profile not found')

  // Map Stripe price IDs to subscription tiers
  const tierMap: { [key: string]: Database['public']['Enums']['subscription_tier'] } = {
    [SUBSCRIPTION_PRICES.creator]: 'creator',
    [SUBSCRIPTION_PRICES.pro]: 'pro',
    [SUBSCRIPTION_PRICES.enterprise]: 'enterprise',
  }

  const priceId = subscription.items.data[0].price.id
  const tier = tierMap[priceId] || 'free'
  const status = subscription.status

  await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: status,
      stripe_subscription_id: subscription.id,
    })
    .eq('id', profile.id)
}

export async function checkSubscriptionLimits(
  userId: string,
  type: 'templates' | 'items' | 'uploads'
): Promise<boolean> {
  const profile = await getUserProfile(userId)
  
  if (!profile || !profile.subscription_limits) {
    return false
  }

  const limits = profile.subscription_limits

  switch (type) {
    case 'templates':
      return limits.max_templates === -1 || profile.template_count < limits.max_templates
    case 'items':
      return limits.max_items_per_template === -1
    case 'uploads':
      if (limits.max_daily_uploads === -1) return true
      
      // Reset daily count if it's a new day
      if (profile.daily_upload_reset < new Date().setHours(0, 0, 0, 0)) {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)
        await supabase
          .from('profiles')
          .update({
            daily_upload_count: 0,
            daily_upload_reset: new Date().toISOString(),
          })
          .eq('id', userId)
        return true
      }

      return profile.daily_upload_count < limits.max_daily_uploads
  }
}