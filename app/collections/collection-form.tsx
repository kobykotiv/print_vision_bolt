'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Collection } from '@/lib/services/collections'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CollectionFormProps {
  collection?: Collection
}

export default function CollectionForm({ collection }: CollectionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: collection?.name || '',
      description: (collection?.settings as any)?.description || '',
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)

    try {
      // If editing existing collection
      if (collection) {
        const response = await fetch(`/api/collections/${collection.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            settings: {
              description: data.description,
            },
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update collection')
        }
      }
      // If creating new collection
      else {
        const response = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            store_id: '00000000-0000-0000-0000-000000000000', // TODO: Replace with actual store selection
            settings: {
              description: data.description,
            },
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create collection')
        }
      }

      router.push('/collections')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Collection name" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                A name for your collection to help you organize your designs
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional description for your collection"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Add more details about what this collection is for
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? collection
              ? 'Updating...'
              : 'Creating...'
            : collection
              ? 'Update Collection'
              : 'Create Collection'}
        </Button>
      </form>
    </Form>
  )
}