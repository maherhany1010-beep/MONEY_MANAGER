'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { transformToCamelCase, transformToSnakeCase } from '@/lib/data-transformers'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📋 Types
// ===================================

export interface CrudOptions<T> {
  /** اسم الجدول في Supabase */
  tableName: string
  /** معرف المستخدم */
  userId?: string
  /** تفعيل real-time subscriptions */
  enableRealtime?: boolean
  /** دالة تحويل من snake_case إلى camelCase */
  transformFromDB?: (data: Record<string, unknown>) => T
  /** دالة تحويل من camelCase إلى snake_case */
  transformToDB?: (data: Partial<T>) => Record<string, unknown>
  /** الترتيب الافتراضي */
  orderBy?: { column: string; ascending?: boolean }
  /** الفلاتر الإضافية */
  filters?: Record<string, unknown>
  /** تحميل البيانات تلقائياً عند التهيئة */
  autoLoad?: boolean
}

export interface CrudState<T> {
  items: T[]
  isLoading: boolean
  error: string | null
}

export interface CrudActions<T> {
  /** جلب جميع العناصر */
  fetchAll: () => Promise<T[]>
  /** جلب عنصر واحد */
  fetchOne: (id: string) => Promise<T | null>
  /** إنشاء عنصر جديد */
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T | null>
  /** تحديث عنصر */
  update: (id: string, data: Partial<T>) => Promise<T | null>
  /** حذف عنصر */
  remove: (id: string) => Promise<boolean>
  /** تحديث الـ state المحلي */
  setItems: (items: T[] | ((prev: T[]) => T[])) => void
  /** تحديث عنصر في الـ state المحلي */
  updateLocal: (id: string, data: Partial<T>) => void
  /** إعادة تحميل البيانات */
  refresh: () => Promise<void>
}

export type UseCrudReturn<T> = CrudState<T> & CrudActions<T>

// ===================================
// 🪝 Hook
// ===================================

export function useCrud<T extends { id: string }>(
  options: CrudOptions<T>
): UseCrudReturn<T> {
  const {
    tableName,
    userId,
    enableRealtime = false,
    transformFromDB = transformToCamelCase as (data: Record<string, unknown>) => T,
    transformToDB = transformToSnakeCase,
    orderBy = { column: 'created_at', ascending: false },
    filters = {},
    autoLoad = true,
  } = options

  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabaseRef = useRef(createClientComponentClient())
  const channelRef = useRef<RealtimeChannel | null>(null)

  // جلب جميع العناصر
  const fetchAll = useCallback(async (): Promise<T[]> => {
    if (!userId) return []

    setIsLoading(true)
    setError(null)

    try {
      let query = supabaseRef.current
        .from(tableName)
        .select('*')
        .eq('user_id', userId)

      // تطبيق الفلاتر
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      // تطبيق الترتيب
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      const transformedData = (data || []).map((item) =>
        transformFromDB(item as Record<string, unknown>)
      )

      setItems(transformedData)
      return transformedData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(message)
      console.error(`[useCrud] Error fetching ${tableName}:`, err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [tableName, userId, filters, orderBy, transformFromDB])

  // جلب عنصر واحد
  const fetchOne = useCallback(
    async (id: string): Promise<T | null> => {
      try {
        const { data, error: fetchError } = await supabaseRef.current
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw new Error(fetchError.message)
        return data ? transformFromDB(data as Record<string, unknown>) : null
      } catch (err) {
        console.error(`[useCrud] Error fetching ${tableName} by id:`, err)
        return null
      }
    },
    [tableName, transformFromDB]
  )

  // إنشاء عنصر جديد
  const create = useCallback(
    async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T | null> => {
      if (!userId) return null

      try {
        const dbData = {
          ...transformToDB(data as Partial<T>),
          user_id: userId,
        }

        const { data: created, error: createError } = await supabaseRef.current
          .from(tableName)
          .insert(dbData)
          .select()
          .single()

        if (createError) throw new Error(createError.message)

        const transformed = transformFromDB(created as Record<string, unknown>)
        setItems((prev) => [transformed, ...prev])
        return transformed
      } catch (err) {
        console.error(`[useCrud] Error creating ${tableName}:`, err)
        throw err
      }
    },
    [tableName, userId, transformFromDB, transformToDB]
  )

  // تحديث عنصر
  const update = useCallback(
    async (id: string, data: Partial<T>): Promise<T | null> => {
      try {
        const dbData = transformToDB(data)

        const { data: updated, error: updateError } = await supabaseRef.current
          .from(tableName)
          .update(dbData)
          .eq('id', id)
          .select()
          .single()

        if (updateError) throw new Error(updateError.message)

        const transformed = transformFromDB(updated as Record<string, unknown>)
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...transformed } : item))
        )
        return transformed
      } catch (err) {
        console.error(`[useCrud] Error updating ${tableName}:`, err)
        throw err
      }
    },
    [tableName, transformFromDB, transformToDB]
  )

  // حذف عنصر
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabaseRef.current
          .from(tableName)
          .delete()
          .eq('id', id)

        if (deleteError) throw new Error(deleteError.message)

        setItems((prev) => prev.filter((item) => item.id !== id))
        return true
      } catch (err) {
        console.error(`[useCrud] Error deleting ${tableName}:`, err)
        throw err
      }
    },
    [tableName]
  )

  // تحديث عنصر في الـ state المحلي فقط
  const updateLocal = useCallback((id: string, data: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    )
  }, [])

  // إعادة تحميل البيانات
  const refresh = useCallback(async () => {
    await fetchAll()
  }, [fetchAll])

  // إعداد real-time subscription
  useEffect(() => {
    if (!enableRealtime || !userId) return

    const channel = supabaseRef.current
      .channel(`${tableName}_changes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          if (eventType === 'INSERT' && newRecord) {
            const transformed = transformFromDB(newRecord as Record<string, unknown>)
            setItems((prev) => {
              // تجنب التكرار إذا كان العنصر موجوداً
              if (prev.some((item) => item.id === transformed.id)) return prev
              return [transformed, ...prev]
            })
          } else if (eventType === 'UPDATE' && newRecord) {
            const transformed = transformFromDB(newRecord as Record<string, unknown>)
            setItems((prev) =>
              prev.map((item) => (item.id === transformed.id ? transformed : item))
            )
          } else if (eventType === 'DELETE' && oldRecord) {
            setItems((prev) => prev.filter((item) => item.id !== (oldRecord as { id: string }).id))
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabaseRef.current.removeChannel(channelRef.current)
      }
    }
  }, [enableRealtime, userId, tableName, transformFromDB])

  // تحميل البيانات تلقائياً
  useEffect(() => {
    if (autoLoad && userId) {
      fetchAll()
    }
  }, [autoLoad, userId, fetchAll])

  return {
    // State
    items,
    isLoading,
    error,
    // Actions
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    setItems,
    updateLocal,
    refresh,
  }
}

