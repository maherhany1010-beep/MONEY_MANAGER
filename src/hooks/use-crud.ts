/**
 * @fileoverview Generic CRUD Hook for Supabase Operations
 *
 * Hook قابل لإعادة الاستخدام للعمليات CRUD مع Supabase.
 * يدعم التحميل التلقائي، الاشتراكات في الوقت الحقيقي، وتحويل البيانات.
 *
 * A reusable hook for CRUD operations with Supabase.
 * Supports auto-loading, real-time subscriptions, and data transformation.
 *
 * @module hooks/use-crud
 * @author Money Manager Team
 * @version 1.0.0
 *
 * @example
 * // استخدام بسيط - Basic usage
 * const { items, loading, create, update, remove } = useCrud<BankAccount>({
 *   tableName: 'bank_accounts',
 *   userId: user?.id,
 *   enableRealtime: true,
 * })
 *
 * @example
 * // استخدام مع محولات مخصصة - With custom transformers
 * const { items, create } = useCrud<CreditCard>({
 *   tableName: 'credit_cards',
 *   userId: user?.id,
 *   transformFromDB: transformCreditCard,
 *   transformToDB: transformCreditCardToDB,
 *   orderBy: { column: 'created_at', ascending: false },
 * })
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { transformToCamelCase, transformToSnakeCase } from '@/lib/data-transformers'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📋 Types
// ===================================

/**
 * خيارات إعداد الـ CRUD Hook
 * Configuration options for the CRUD hook
 *
 * @template T - نوع الكيان / Entity type
 */
export interface CrudOptions<T> {
  /**
   * اسم الجدول في Supabase
   * Table name in Supabase database
   * @example 'bank_accounts', 'credit_cards', 'prepaid_cards'
   */
  tableName: string

  /**
   * معرف المستخدم - يُستخدم لفلترة البيانات وإضافة user_id تلقائياً
   * User ID - used for filtering data and auto-adding user_id
   */
  userId?: string

  /**
   * تفعيل الاشتراكات في الوقت الحقيقي
   * Enable real-time subscriptions for live updates
   * @default false
   */
  enableRealtime?: boolean

  /**
   * دالة تحويل البيانات من صيغة قاعدة البيانات (snake_case) إلى صيغة الواجهة (camelCase)
   * Transform function from database format to frontend format
   */
  transformFromDB?: (data: Record<string, unknown>) => T

  /**
   * دالة تحويل البيانات من صيغة الواجهة (camelCase) إلى صيغة قاعدة البيانات (snake_case)
   * Transform function from frontend format to database format
   */
  transformToDB?: (data: Partial<T>) => Record<string, unknown>

  /**
   * إعدادات الترتيب الافتراضي
   * Default ordering configuration
   * @default { column: 'created_at', ascending: false }
   */
  orderBy?: { column: string; ascending?: boolean }

  /**
   * فلاتر إضافية تُطبق على جميع الاستعلامات
   * Additional filters applied to all queries
   * @example { status: 'active' }
   */
  filters?: Record<string, unknown>

  /**
   * تحميل البيانات تلقائياً عند تهيئة الـ hook
   * Automatically load data when hook initializes
   * @default true
   */
  autoLoad?: boolean
}

/**
 * حالة الـ CRUD hook
 * State returned by the CRUD hook
 * @template T - نوع الكيان / Entity type
 */
export interface CrudState<T> {
  /** قائمة العناصر المحملة / List of loaded items */
  items: T[]
  /** حالة التحميل / Loading state */
  isLoading: boolean
  /** رسالة الخطأ إن وجدت / Error message if any */
  error: string | null
}

/**
 * العمليات المتاحة من الـ CRUD hook
 * Actions available from the CRUD hook
 * @template T - نوع الكيان / Entity type
 */
export interface CrudActions<T> {
  /**
   * جلب جميع العناصر من قاعدة البيانات
   * Fetch all items from database
   * @returns وعد بمصفوفة العناصر
   */
  fetchAll: () => Promise<T[]>

  /**
   * جلب عنصر واحد بمعرفه
   * Fetch single item by ID
   * @param id - معرف العنصر
   */
  fetchOne: (id: string) => Promise<T | null>

  /**
   * إنشاء عنصر جديد في قاعدة البيانات
   * Create new item in database
   * @param data - بيانات العنصر الجديد
   * @throws {Error} في حالة فشل الإنشاء
   */
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T | null>

  /**
   * تحديث عنصر موجود
   * Update existing item
   * @param id - معرف العنصر
   * @param data - البيانات المُحدّثة
   * @throws {Error} في حالة فشل التحديث
   */
  update: (id: string, data: Partial<T>) => Promise<T | null>

  /**
   * حذف عنصر
   * Delete an item
   * @param id - معرف العنصر المراد حذفه
   * @throws {Error} في حالة فشل الحذف
   */
  remove: (id: string) => Promise<boolean>

  /**
   * تحديث قائمة العناصر في الحالة المحلية
   * Update items list in local state
   * @param items - القائمة الجديدة أو دالة تحديث
   */
  setItems: (items: T[] | ((prev: T[]) => T[])) => void

  /**
   * تحديث عنصر واحد في الحالة المحلية
   * Update single item in local state
   * @param id - معرف العنصر
   * @param data - البيانات الجزئية للتحديث
   */
  updateLocal: (id: string, data: Partial<T>) => void

  /**
   * إعادة تحميل البيانات من قاعدة البيانات
   * Refresh data from database
   */
  refresh: () => Promise<void>
}

/**
 * النوع الكامل المُرجع من useCrud
 * Full return type from useCrud hook
 * @template T - نوع الكيان
 */
export type UseCrudReturn<T> = CrudState<T> & CrudActions<T>

// ===================================
// 🪝 Hook
// ===================================

/**
 * Generic CRUD Hook for Supabase Operations
 *
 * Hook عام للعمليات CRUD مع Supabase. يوفر جميع العمليات الأساسية
 * (إنشاء، قراءة، تحديث، حذف) مع دعم للتحديثات في الوقت الحقيقي.
 *
 * @template T - نوع الكيان الذي يجب أن يحتوي على خاصية id
 * @param options - خيارات الإعداد
 * @returns حالة وعمليات CRUD
 *
 * @example
 * ```tsx
 * const { items, isLoading, create, update, remove } = useCrud<BankAccount>({
 *   tableName: 'bank_accounts',
 *   userId: user?.id,
 *   enableRealtime: true,
 * })
 *
 * // إنشاء حساب جديد
 * await create({ accountName: 'حسابي', bankName: 'البنك الأهلي', balance: 1000 })
 *
 * // تحديث حساب
 * await update(accountId, { balance: 2000 })
 *
 * // حذف حساب
 * await remove(accountId)
 * ```
 */
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

