'use client';

import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function AdvancedPagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className,
  size = 'sm',
  disabled = false,
}: AdvancedPaginationProps) {
  // Calculer les pages à afficher
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Ajuster si on est proche de la fin
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    
    // Ajouter la première page si nécessaire
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    // Ajouter les pages visibles
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Ajouter la dernière page si nécessaire
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  
  const buttonSizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const buttonSize = buttonSizes[size];

  if (totalPages <= 1) return null;

  return (
    <nav 
      className={cn('flex items-center gap-1', className)}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Première page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, 'px-2')}
          onClick={() => onPageChange(1)}
          disabled={disabled || currentPage === 1}
          aria-label="Première page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Page précédente */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, 'px-2')}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={disabled || currentPage === 1}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Numéros de pages */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <div
                key={`ellipsis-${index}`}
                className={cn(
                  'flex items-center justify-center',
                  buttonSize,
                  'text-muted-foreground'
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              variant={isCurrentPage ? "default" : "outline"}
              size="sm"
              className={cn(
                buttonSize,
                isCurrentPage && !disabled && [
                  'bg-primary text-primary-foreground',
                  'hover:bg-primary hover:text-primary-foreground',
                  'shadow-md'
                ],
                !isCurrentPage && [
                  'hover:bg-muted',
                  'transition-colors duration-200'
                ]
              )}
              onClick={() => onPageChange(pageNumber)}
              disabled={disabled}
              aria-label={`Page ${pageNumber}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      {/* Page suivante */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, 'px-2')}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={disabled || currentPage === totalPages}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Dernière page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          className={cn(buttonSize, 'px-2')}
          onClick={() => onPageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
          aria-label="Dernière page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}

// Composant d'informations de pagination
interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  currentItemsCount: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  currentItemsCount,
  className,
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + currentItemsCount - 1, totalItems);

  return (
    <div className={cn('text-sm text-muted-foreground', className)}>
      <span>
        Affichage de <span className="font-medium">{startItem}</span> à{' '}
        <span className="font-medium">{endItem}</span> sur{' '}
        <span className="font-medium">{totalItems.toLocaleString()}</span> résultats
      </span>
      {totalPages > 1 && (
        <span className="ml-2">
          (Page <span className="font-medium">{currentPage}</span> sur{' '}
          <span className="font-medium">{totalPages}</span>)
        </span>
      )}
    </div>
  );
}

// Hook pour calculer les informations de pagination
export function usePaginationInfo(
  currentPage: number,
  itemsPerPage: number,
  totalItems: number,
  currentItemsCount: number
) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + currentItemsCount - 1, totalItems);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    totalPages,
    startItem,
    endItem,
    hasNextPage,
    hasPrevPage,
  };
}
