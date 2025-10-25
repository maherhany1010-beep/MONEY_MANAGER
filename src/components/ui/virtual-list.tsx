'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className,
  onScroll,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = items.length * itemHeight

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }, [onScroll])

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: startIndex * itemHeight,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Auto-height Virtual List (items can have different heights)
 */
interface AutoVirtualListProps<T> {
  items: T[]
  estimatedItemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
}

export function AutoVirtualList<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className,
  onScroll,
}: AutoVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [itemHeights, setItemHeights] = useState<number[]>([])
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Measure item heights
  useEffect(() => {
    const heights: number[] = []
    itemRefs.current.forEach((element, index) => {
      heights[index] = element.getBoundingClientRect().height
    })
    setItemHeights(heights)
  }, [items])

  // Calculate positions
  const getItemOffset = (index: number): number => {
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += itemHeights[i] || estimatedItemHeight
    }
    return offset
  }

  const totalHeight = items.reduce((sum, _, index) => {
    return sum + (itemHeights[index] || estimatedItemHeight)
  }, 0)

  // Find visible range
  let startIndex = 0
  let currentOffset = 0
  while (currentOffset < scrollTop && startIndex < items.length) {
    currentOffset += itemHeights[startIndex] || estimatedItemHeight
    startIndex++
  }
  startIndex = Math.max(0, startIndex - overscan)

  let endIndex = startIndex
  currentOffset = getItemOffset(startIndex)
  while (currentOffset < scrollTop + containerHeight && endIndex < items.length) {
    currentOffset += itemHeights[endIndex] || estimatedItemHeight
    endIndex++
  }
  endIndex = Math.min(items.length, endIndex + overscan)

  const visibleItems = items.slice(startIndex, endIndex)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }, [onScroll])

  const setItemRef = useCallback((index: number, element: HTMLDivElement | null) => {
    if (element) {
      itemRefs.current.set(index, element)
    } else {
      itemRefs.current.delete(index)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: getItemOffset(startIndex),
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index
            return (
              <div
                key={actualIndex}
                ref={(el) => setItemRef(actualIndex, el)}
              >
                {renderItem(item, actualIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Grid Virtual List (for grid layouts)
 */
interface VirtualGridProps<T> {
  items: T[]
  itemHeight: number
  itemWidth: number
  columns: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  gap?: number
  overscan?: number
  className?: string
}

export function VirtualGrid<T>({
  items,
  itemHeight,
  itemWidth,
  columns,
  containerHeight,
  renderItem,
  gap = 16,
  overscan = 1,
  className,
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const rowHeight = itemHeight + gap
  const totalRows = Math.ceil(items.length / columns)
  const totalHeight = totalRows * rowHeight

  // Calculate visible range
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endRow = Math.min(
    totalRows,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  )

  const startIndex = startRow * columns
  const endIndex = Math.min(items.length, endRow * columns)

  const visibleItems = items.slice(startIndex, endIndex)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: startRow * rowHeight,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, ${itemWidth}px)`,
            gap: `${gap}px`,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

