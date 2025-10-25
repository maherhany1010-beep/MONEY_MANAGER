import { useState, useCallback, useMemo } from 'react'

export interface BulkSelectionState<T> {
  selectedItems: Set<string>
  isSelected: (id: string) => boolean
  isAllSelected: boolean
  isSomeSelected: boolean
  selectedCount: number
  toggleItem: (id: string) => void
  toggleAll: () => void
  selectItems: (ids: string[]) => void
  deselectItems: (ids: string[]) => void
  clearSelection: () => void
  getSelectedData: () => T[]
}

/**
 * Hook for managing bulk selection
 */
export function useBulkSelection<T extends { id: string }>(
  items: T[]
): BulkSelectionState<T> {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const itemIds = useMemo(() => items.map(item => item.id), [items])

  const isSelected = useCallback(
    (id: string) => selectedItems.has(id),
    [selectedItems]
  )

  const isAllSelected = useMemo(
    () => itemIds.length > 0 && itemIds.every(id => selectedItems.has(id)),
    [itemIds, selectedItems]
  )

  const isSomeSelected = useMemo(
    () => itemIds.some(id => selectedItems.has(id)) && !isAllSelected,
    [itemIds, selectedItems, isAllSelected]
  )

  const selectedCount = selectedItems.size

  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(itemIds))
    }
  }, [isAllSelected, itemIds])

  const selectItems = useCallback((ids: string[]) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      return next
    })
  }, [])

  const deselectItems = useCallback((ids: string[]) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.delete(id))
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const getSelectedData = useCallback(() => {
    return items.filter(item => selectedItems.has(item.id))
  }, [items, selectedItems])

  return {
    selectedItems,
    isSelected,
    isAllSelected,
    isSomeSelected,
    selectedCount,
    toggleItem,
    toggleAll,
    selectItems,
    deselectItems,
    clearSelection,
    getSelectedData,
  }
}

/**
 * Hook for managing bulk actions with undo/redo
 */
export function useBulkSelectionWithHistory<T extends { id: string }>(
  items: T[]
) {
  const selection = useBulkSelection(items)
  const [history, setHistory] = useState<Set<string>[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const saveToHistory = useCallback((state: Set<string>) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(new Set(state))
      return newHistory
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      const previousState = history[historyIndex - 1]
      selection.selectItems(Array.from(previousState))
    }
  }, [historyIndex, history, selection])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      const nextState = history[historyIndex + 1]
      selection.selectItems(Array.from(nextState))
    }
  }, [historyIndex, history, selection])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return {
    ...selection,
    undo,
    redo,
    canUndo,
    canRedo,
    saveToHistory,
  }
}

/**
 * Hook for managing bulk actions with filters
 */
export function useBulkSelectionWithFilters<T extends { id: string }>(
  items: T[],
  filters: Record<string, (item: T) => boolean> = {}
) {
  const selection = useBulkSelection(items)

  const selectByFilter = useCallback(
    (filterName: string) => {
      const filter = filters[filterName]
      if (filter) {
        const ids = items.filter(filter).map(item => item.id)
        selection.selectItems(ids)
      }
    },
    [items, filters, selection]
  )

  const deselectByFilter = useCallback(
    (filterName: string) => {
      const filter = filters[filterName]
      if (filter) {
        const ids = items.filter(filter).map(item => item.id)
        selection.deselectItems(ids)
      }
    },
    [items, filters, selection]
  )

  return {
    ...selection,
    selectByFilter,
    deselectByFilter,
  }
}

