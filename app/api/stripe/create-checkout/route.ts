import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/services/subscriptions'
import { z } from 'zod'

const createCheckoutSchema = z.object({
  tier: z.enum(['creator', 'pro', 'enterprise']),
})

export async function POST(request: NextRequest) {
  try {
    const { session } = await getServerClient()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()
    const { tier } = createCheckoutSchema.parse(json)

    const checkoutSession = await createCheckoutSession(session.user.id, tier)

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}