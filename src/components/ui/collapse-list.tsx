'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Fragment } from 'react';

interface CollapseListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  maxVisibleItems?: number;
}

export function CollapseList<T>({
  items,
  renderItem,
  maxVisibleItems = 2,
}: CollapseListProps<T>) {
  if (!items?.length) return '-';

  const visibleItems = items.slice(0, maxVisibleItems);
  const remainingCount = items.length - maxVisibleItems;

  return (
    <div className="flex items-center">
      {visibleItems.map((item, index) => (
        <Badge className="mr-1" key={`${item}-${index}`} variant="secondary">
          {renderItem(item)}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Tooltip delayDuration={100}>
          <TooltipTrigger className="ml-1 rounded-full bg-muted aspect-square size-7 p-1 cursor-default text-sm text-muted-foreground">
            +{remainingCount}
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="start"
            className="max-w-[200px] bg-muted p-3"
          >
            <div className="flex flex-wrap gap-1">
              {items.slice(maxVisibleItems).map((item, index) => (
                <Fragment key={`${item}-${index}`}>{renderItem(item)}</Fragment>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
