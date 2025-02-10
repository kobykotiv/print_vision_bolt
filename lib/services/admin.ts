import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export type AdminLog = Database['public']['Tables']['admin_logs']['Row']
export type SystemMetric = Database['public']['Tables']['system_metrics']['Row']
export type RateLimit = Database['public']['Tables']['rate_limits']['Row']

interface AdminMetrics {
  totalUsers: number
  activeSubscriptions: number
  dailyActiveUsers: number
  averageResponseTime: number
}

export async function getAdminLogs(
  page = 1,
  limit = 10,
  filters?: {
    action?: string
    targetType?: string
    startDate?: string
    endDate?: string
  }
) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from('admin_logs')
    .select(`
      *,
      admin:profiles!admin_id(email)
    `)
    .order('created_at', { ascending: false })

  if (filters?.action) {
    query = query.eq('action', filters.action)
  }

  if (filters?.targetType) {
    query = query.eq('target_type', filters.targetType)
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1)
    .select('*', { count: 'exact' })

  if (error) {
    throw error
  }

  return {
    logs: data,
    total: count || 0,
    page,
    limit,
  }
}

export async function getSystemMetrics(timeRange: '1h' | '24h' | '7d' | '30d'): Promise<AdminMetrics> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const timeRanges = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days',
    '30d': '30 days',
  }

  const { data: metrics, error } = await supabase
    .from('system_metrics')
    .select('*')
    .gte('created_at', `now() - interval '${timeRanges[timeRange]}'`)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  // Calculate aggregated metrics
  const totalUsers = metrics.find(m => m.metric_type === 'total_users')?.value || 0
  const activeSubscriptions = metrics.find(m => m.metric_type === 'active_subscriptions')?.value || 0
  const dailyActiveUsers = metrics.find(m => m.metric_type === 'daily_active_users')?.value || 0
  const averageResponseTime = metrics.find(m => m.metric_type === 'average_response_time')?.value || 0

  return {
    totalUsers,
    activeSubscriptions,
    dailyActiveUsers,
    averageResponseTime,
  }
}

export async function getRateLimits() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('rate_limits')
    .select('*')
    .order('resource', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

export async function updateRateLimit(id: string, updates: Partial<RateLimit>) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('rate_limits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getUsersWithProfile(
  page = 1,
  limit = 10,
  filters?: {
    role?: string
    subscription_tier?: string
    search?: string
  }
) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from('profiles')
    .select(`
      *,
      subscription_limits(*)
    `)

  if (filters?.role) {
    query = query.eq('role', filters.role)
  }

  if (filters?.subscription_tier) {
    query = query.eq('subscription_tier', filters.subscription_tier)
  }

  if (filters?.search) {
    query = query.ilike('email', `%${filters.search}%`)
  }

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1)
    .select('*', { count: 'exact' })

  if (error) {
    throw error
  }

  return {
    users: data,
    total: count || 0,
    page,
    limit,
  }
}

export async function updateUserProfile(
  userId: string,
  updates: {
    role?: string
    subscription_tier?: string
    subscription_status?: string
  }
) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}