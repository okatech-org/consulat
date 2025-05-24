'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  adaptTableSearchParams,
  createLimitHandler,
  createPageHandler,
  createSortHandler,
  createTableParamNavigator,
  handleTableParamChange,
  TableParamOption,
} from '@/lib/utils';
import { FilterOption } from '../data-table/data-table-toolbar';

/**
 * Custom hook for managing table params and navigation
 * @returns Functions and values for table parameter management
 */
export function useTableParams() {
  const router = useRouter();
  const pathname = usePathname();
  const queryParams = useSearchParams();

  // Format query parameters into a more usable structure
  const formattedParams = useMemo(
    () => adaptTableSearchParams(queryParams),
    [queryParams],
  );

  // Create a function to navigate with updated URL parameters
  const navigateWithParams = useCallback(
    (params: URLSearchParams) => {
      const navigate = createTableParamNavigator(pathname, router);
      navigate(params);
    },
    [pathname, router],
  );

  // Handle parameter changes (sorting, filtering, pagination)
  const handleParamsChange = useCallback(
    (option: TableParamOption) => {
      handleTableParamChange(queryParams, option, navigateWithParams);
    },
    [queryParams, navigateWithParams],
  );

  // Create specialized handlers for common table operations
  const handleSortChange = useMemo(
    () => createSortHandler(handleParamsChange),
    [handleParamsChange],
  );

  const handlePageChange = useMemo(
    () => createPageHandler(handleParamsChange),
    [handleParamsChange],
  );

  const handleLimitChange = useMemo(
    () => createLimitHandler(handleParamsChange),
    [handleParamsChange],
  );

  return {
    formattedParams,
    handleParamsChange,
    handleSortChange,
    handlePageChange,
    handleLimitChange,
    queryParams,
  };
}

/**
 * Custom hook for handling table data loading
 * @param fetchData Function to fetch data with the given parameters
 * @returns Loading state and function to load data
 */
export function useTableData<T, P = Record<string, unknown>>(
  fetchData: (params: P) => Promise<T>,
) {
  const { formattedParams } = useTableParams();

  const loadData = useCallback(
    async (setIsLoading: (loading: boolean) => void, setResults: (data: T) => void) => {
      setIsLoading(true);
      try {
        const data = await fetchData(formattedParams as unknown as P);
        setResults(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchData, formattedParams],
  );

  return {
    loadData,
    params: formattedParams,
  };
}

export type QueryParams = {
  [key: string]: unknown;
};

export type Pagination = {
  page: number;
  limit: number;
};

export type Sorting<TData> = {
  field: keyof TData;
  order: 'asc' | 'desc';
};

export function useTableSearchParams<TData>(filters: FilterOption<TData>[]) {
  const searchParams = useSearchParams();
  const [pagination, setPagination] = useState<Pagination>({
    page: Number(searchParams.get('pageIndex')) || 1,
    limit: Number(searchParams.get('pageSize')) || 10,
  });
  const [sorting, setSorting] = useState<Sorting<TData>>({
    field: searchParams.get('sort') as keyof TData,
    order: searchParams.get('order') as 'asc' | 'desc',
  });
  const [params, setParams] = useState<QueryParams>(
    getParamsFromFilters(filters, searchParams, pagination, sorting),
  );

  function handleParamsChange(option: Record<string, unknown>) {
    setParams((prev) => ({ ...prev, ...option }));
    updateUrlParamsWithoutReload(option);
  }

  function updateUrlParamsWithoutReload(option: Record<string, unknown>) {
    const currentParams = new URLSearchParams(searchParams.toString());
    Object.entries(option).forEach(([key, value]) => {
      currentParams.set(key, value as string);
    });

    const newUrl = `?${currentParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  function handlePaginationChange(newPagination: Partial<Pagination>) {
    const updatedPagination = { ...pagination, ...newPagination };
    setPagination(updatedPagination);
    handleParamsChange(updatedPagination);
  }

  function handleSortingChange(newSorting: Partial<Sorting<TData>>) {
    const updatedSorting = { ...sorting, ...newSorting };
    setSorting(updatedSorting);
    handleParamsChange(updatedSorting);
  }

  return {
    params,
    pagination,
    sorting,
    handleParamsChange,
    handlePaginationChange,
    handleSortingChange,
  };
}

function getParamsFromFilters<TData>(
  filters: FilterOption<TData>[],
  searchParams: URLSearchParams,
  pagination: Pagination,
  sorting: Sorting<TData>,
) {
  const params: QueryParams = {
    ...pagination,
    ...sorting,
  };

  for (const filter of filters) {
    const value = searchParams.get(filter.property);

    if (value) {
      if (filter.type === 'checkbox') {
        params[filter.property] = value.split(',');
      } else {
        params[filter.property] = value;
      }
    } else {
      params[filter.property] = filter.type === 'checkbox' ? [] : undefined;
    }
  }

  return params;
}
