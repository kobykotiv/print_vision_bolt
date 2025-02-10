'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Database } from '@/types/supabase'
import { Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type SubscriptionTier = Database['public']['Enums']['subscription_tier']

interface BillingFormProps {
  currentTier: SubscriptionTier
  stripeCustomerId: string | null
}

const plans = [
  {
    name: 'Free',
    tier: 'free' as const,
    description: 'Perfect for getting started',
    price: '0',
    features: [
      'Up to 5 Items per Template',
      'Up to 3 Templates',
      'Up to 10 Design uploads per day',
      'Ad supported',
    ],
  },
  {
    name: 'Creator',
    tier: 'creator' as const,
    description: 'Great for small businesses',
    price: '19',
    features: [
      'Up to 10 Items per Template',
      'Up to 10 Templates',
      'Unlimited Design uploads',
      'No ads',
    ],
  },
  {
    name: 'Pro',
    tier: 'pro' as const,
    description: 'Perfect for growing businesses',
    price: '29',
    features: [
      'Up to 30 Items per Template',
      'Up to 20 Templates',
      'Unlimited Design uploads',
      'No ads',
    ],
  },
  {
    name: 'Enterprise',
    tier: 'enterprise' as const,
    description: 'For businesses at scale',
    price: '99',
    features: [
      'Unlimited Items per Template',
      'Unlimited Templates',
      'Unlimited Design uploads',
      'No ads',
    ],
  },
]

export default function BillingForm({ currentTier, stripeCustomerId }: BillingFormProps) {
  const [isLoading, setIsLoading] = useState<SubscriptionTier | null>(null)
  const { toast } = useToast()

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (tier === 'free') return

    setIsLoading(tier)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      window.location.href = data.url
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      })
      setIsLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    setIsLoading(currentTier)

    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      window.location.href = data.url
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      })
      setIsLoading(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <Card 
          key={plan.tier}
          className={currentTier === plan.tier ? 'border-primary' : undefined}
        >
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              ${plan.price}
              <span className="text-sm font-normal text-muted-foreground">
                /month
              </span>
            </div>
            <ul className="space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {currentTier === plan.tier ? (
              <Button
                className="w-full"
                onClick={handleManageSubscription}
                disabled={isLoading !== null || !stripeCustomerId}
              >
                {isLoading === plan.tier ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {stripeCustomerId ? 'Manage Subscription' : 'Current Plan'}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan.tier)}
                disabled={isLoading !== null}
                variant={plan.tier === 'free' ? 'outline' : 'default'}
              >
                {isLoading === plan.tier ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {plan.tier === 'free' ? 'Current Plan' : 'Subscribe'}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}