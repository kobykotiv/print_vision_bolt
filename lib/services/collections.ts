import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export type Collection = Database['public']['Tables']['collections']['Row']
export type NewCollection = Database['public']['Tables']['collections']['Insert']
export type UpdateCollection = Database['public']['Tables']['collections']['Update']

export async function getCollections(storeId?: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  let query = supabase.from('collections').select(`
    *,
    store:stores(id, name)
  `)

  if (storeId) {
    query = query.eq('store_id', storeId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getCollection(id: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      store:stores(id, name),
      templates:templates(
        id,
        variants
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createCollection(collection: NewCollection) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('collections')
    .insert(collection)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateCollection(id: string, collection: UpdateCollection) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('collections')
    .update(collection)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteCollection(id: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}