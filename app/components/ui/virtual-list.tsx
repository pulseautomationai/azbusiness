import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { cn } from '~/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  estimatedItemSize?: number;
  buffer?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onScroll,
  estimatedItemSize = 50,
  buffer = 10
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Calculate item positions and heights
  const itemPositions = useRef<number[]>([]);
  const itemHeights = useRef<number[]>([]);

  // Initialize or update item positions
  useEffect(() => {
    let currentPosition = 0;
    itemPositions.current = [];
    itemHeights.current = [];

    for (let i = 0; i < items.length; i++) {
      itemPositions.current[i] = currentPosition;
      const height = typeof itemHeight === 'function' 
        ? itemHeight(i, items[i]) 
        : itemHeight;
      itemHeights.current[i] = height;
      currentPosition += height;
    }
  }, [items, itemHeight]);

  // Calculate total height
  const totalHeight = itemPositions.current.length > 0
    ? itemPositions.current[itemPositions.current.length - 1] + 
      (itemHeights.current[itemHeights.current.length - 1] || estimatedItemSize)
    : 0;

  // Binary search to find start index
  const findStartIndex = useCallback((scrollTop: number) => {
    let low = 0;
    let high = itemPositions.current.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const position = itemPositions.current[mid];

      if (position === scrollTop) {
        return mid;
      } else if (position < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return Math.max(0, high);
  }, []);

  // Calculate visible range
  const getVisibleRange = useCallback(() => {
    if (!itemPositions.current.length) {
      return { startIndex: 0, endIndex: 0, visibleItems: [] };
    }

    const startIndex = Math.max(0, findStartIndex(scrollTop) - overscan);
    
    let endIndex = startIndex;
    let currentHeight = 0;
    
    for (let i = startIndex; i < items.length && currentHeight < containerHeight + buffer; i++) {
      currentHeight += itemHeights.current[i] || estimatedItemSize;
      endIndex = i;
    }
    
    endIndex = Math.min(items.length - 1, endIndex + overscan);

    const visibleItems = items.slice(startIndex, endIndex + 1);

    return { startIndex, endIndex, visibleItems };
  }, [scrollTop, items, containerHeight, overscan, findStartIndex, buffer, estimatedItemSize]);

  const { startIndex, endIndex, visibleItems } = getVisibleRange();

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);
    onScroll?.(newScrollTop);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout to detect scroll end
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [onScroll]);

  // Calculate offset for positioning
  const offsetY = startIndex > 0 ? itemPositions.current[startIndex] : 0;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, relativeIndex) => {
            const absoluteIndex = startIndex + relativeIndex;
            const itemStyle: React.CSSProperties = {
              height: itemHeights.current[absoluteIndex] || estimatedItemSize,
              width: '100%',
            };

            return (
              <div key={absoluteIndex} style={itemStyle}>
                {renderItem(item, absoluteIndex, itemStyle)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      {isScrolling && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
          {startIndex + 1}-{endIndex + 1} of {items.length}
        </div>
      )}
    </div>
  );
}

interface InfiniteListProps<T> extends Omit<VirtualListProps<T>, 'items'> {
  items: T[];
  hasNextPage: boolean;
  isLoading: boolean;
  loadMore: () => void;
  loadingComponent?: ReactNode;
  endMessage?: ReactNode;
  threshold?: number;
}

export function InfiniteList<T>({
  items,
  hasNextPage,
  isLoading,
  loadMore,
  loadingComponent,
  endMessage,
  threshold = 5,
  ...virtualListProps
}: InfiniteListProps<T>) {
  const [needsMore, setNeedsMore] = useState(false);

  // Check if we need to load more items
  const checkForMore = useCallback((scrollTop: number) => {
    const { startIndex, endIndex } = (() => {
      const itemHeight = virtualListProps.itemHeight;
      const containerHeight = virtualListProps.containerHeight;
      const estimatedItemSize = virtualListProps.estimatedItemSize || 50;
      
      const startIdx = Math.floor(scrollTop / (typeof itemHeight === 'number' ? itemHeight : estimatedItemSize));
      const visibleCount = Math.ceil(containerHeight / (typeof itemHeight === 'number' ? itemHeight : estimatedItemSize));
      
      return {
        startIndex: Math.max(0, startIdx),
        endIndex: Math.min(items.length - 1, startIdx + visibleCount)
      };
    })();

    const remainingItems = items.length - endIndex;
    
    if (remainingItems <= threshold && hasNextPage && !isLoading && !needsMore) {
      setNeedsMore(true);
      loadMore();
    }
  }, [items.length, hasNextPage, isLoading, loadMore, needsMore, threshold, virtualListProps.containerHeight, virtualListProps.itemHeight, virtualListProps.estimatedItemSize]);

  // Reset needsMore when loading completes
  useEffect(() => {
    if (!isLoading) {
      setNeedsMore(false);
    }
  }, [isLoading]);

  const handleScroll = useCallback((scrollTop: number) => {
    virtualListProps.onScroll?.(scrollTop);
    checkForMore(scrollTop);
  }, [virtualListProps.onScroll, checkForMore]);

  // Render item with loading/end states
  const renderItemWithStates = useCallback((item: T, index: number, style: React.CSSProperties) => {
    return virtualListProps.renderItem(item, index, style);
  }, [virtualListProps.renderItem]);

  return (
    <div className="relative">
      <VirtualList
        {...virtualListProps}
        items={items}
        renderItem={renderItemWithStates}
        onScroll={handleScroll}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          {loadingComponent || (
            <div className="bg-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* End message */}
      {!hasNextPage && !isLoading && items.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">
          {endMessage || 'No more items to load'}
        </div>
      )}
    </div>
  );
}