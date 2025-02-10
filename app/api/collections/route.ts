import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'
import { createCollection, getCollections } from '@/lib/services/collections'
import { getUserProfile, checkSubscriptionLimits } from '@/lib/services/subscriptions'
import { z } from 'zod'
import { Json } from '@/types/supabase'

const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  store_id: z.string().uuid('Invalid store ID'),
  settings: z.record(z.any()).optional().transform((val): Json => val || null),
})

export async function GET(request: NextRequest) {
  try {
    const { session } = await getServerClient()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')
    const collections = await getCollections(storeId || undefined)

    return NextResponse.json(collections)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session } = await getServerClient()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check template limits before creating
    const canCreateTemplate = await checkSubscriptionLimits(session.user.id, 'templates')
    
    if (!canCreateTemplate) {
      return NextResponse.json(
        { error: 'Template limit reached for your subscription tier' },
        { status: 403 }
      )
    }

    const json = await request.json()
    const validatedData = createCollectionSchema.parse(json)
    const collection = await createCollection({
      name: validatedData.name,
      store_id: validatedData.store_id,
      settings: validatedData.settings,
    })

    return NextResponse.json(collection)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}