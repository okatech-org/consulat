'use client';

import { useCallback, useMemo } from 'react';
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
