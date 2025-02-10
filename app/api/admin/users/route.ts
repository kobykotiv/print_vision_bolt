import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'
import { getUsersWithProfile, updateUserProfile } from '@/lib/services/admin'
import { z } from 'zod'

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  role: z.enum(['user', 'admin', 'superadmin']).optional(),
  subscription_tier: z.enum(['free', 'creator', 'pro', 'enterprise']).optional(),
  search: z.string().optional(),
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

    // Check if user is admin or superadmin
    const { data: profile } = await (await getServerClient()).supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validatedParams = querySchema.parse(params)

    // Get users with profiles
    const result = await getUsersWithProfile(
      validatedParams.page,
      validatedParams.limit,
      {
        role: validatedParams.role,
        subscription_tier: validatedParams.subscription_tier,
        search: validatedParams.search,
      }
    )

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const updateUserSchema = z.object({
  role: z.enum(['user', 'admin', 'superadmin']).optional(),
  subscription_tier: z.enum(['free', 'creator', 'pro', 'enterprise']).optional(),
  subscription_status: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
) {
  try {
    const { session } = await getServerClient()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is superadmin
    const { data: profile } = await (await getServerClient()).supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden - Requires superadmin' },
        { status: 403 }
      )
    }

    const json = await request.json()
    const { id, ...updates } = json
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const validatedUpdates = updateUserSchema.parse(updates)
    const updatedUser = await updateUserProfile(id, validatedUpdates)

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}