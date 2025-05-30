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

export type Pagination = {
  page: number;
  limit: number;
};

export type Sorting<T> = {
  field: keyof T;
  order: 'asc' | 'desc';
};

export function useTableSearchParams<T, V>(
  adaptSearchParams: (searchParams: URLSearchParams) => V,
) {
  const searchParams = useSearchParams();
  const [pagination, setPagination] = useState<Pagination>({
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
  });
  const [sorting, setSorting] = useState<Sorting<T>>({
    field: searchParams.get('sort') as keyof T,
    order: searchParams.get('order') as 'asc' | 'desc',
  });
  const [params, setParams] = useState<V>(adaptSearchParams(searchParams));

  function handleParamsChange(key: keyof V, value: V[keyof V]) {
    const newParams = { ...params };

    // On retire la clé si la valeur est vide (string vide ou tableau vide)
    if (
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete newParams[key];
      updateUrlParamsWithoutReload(key, undefined);
    } else {
      newParams[key] = value;
      updateUrlParamsWithoutReload(key, value);
    }

    setParams(newParams);
  }

  function updateUrlParamsWithoutReload(
    key: keyof V | 'page' | 'limit' | 'sort' | 'order',
    value: V[keyof V] | number | 'asc' | 'desc' | undefined | keyof T,
  ) {
    const currentParams = new URLSearchParams(searchParams.toString());

    // On retire la clé si la valeur est vide
    if (
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      currentParams.delete(key as string);
    } else {
      // Pour les tableaux, on join avec une virgule
      if (Array.isArray(value)) {
        currentParams.set(key as string, value.join(','));
      } else {
        currentParams.set(key as string, value as string);
      }
    }

    const newUrl = `?${currentParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  function handlePaginationChange(newPagination: Partial<Pagination>) {
    const updatedPagination = { ...pagination, ...newPagination };
    setPagination(updatedPagination);
    updateUrlParamsWithoutReload('page', updatedPagination.page);
    updateUrlParamsWithoutReload('limit', updatedPagination.limit);
  }

  function handleSortingChange(newSorting: Partial<Sorting<T>>) {
    const updatedSorting = { ...sorting, ...newSorting };
    setSorting(updatedSorting);
    updateUrlParamsWithoutReload('sort', updatedSorting.field);
    updateUrlParamsWithoutReload('order', updatedSorting.order);
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
