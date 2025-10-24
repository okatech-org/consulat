'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getValuable } from '@/lib/utils';

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
    field:
      (searchParams.get('sort')?.split('-')[0] as keyof T) || ('createdAt' as keyof T),
    order: (searchParams.get('sort')?.split('-')[1] as 'asc' | 'desc') || 'desc',
  });
  const [params, setParams] = useState<V>(adaptSearchParams(searchParams));

  function handleParamsChange<K extends keyof V>(key: K, value: V[K]) {
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

    const cleanedParams = getValuable(
      newParams as unknown as Record<string, unknown>,
    ) as V;
    setParams(cleanedParams);
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

  function handlePaginationChange(key: 'page' | 'limit', value: number) {
    const updatedPagination = { ...pagination, [key]: value };
    setPagination(updatedPagination);
    updateUrlParamsWithoutReload(key, value);
  }

  function handleSortingChange(newSorting: Partial<Sorting<T>>) {
    const updatedSorting = { ...sorting, ...newSorting };
    setSorting(updatedSorting);
    updateUrlParamsWithoutReload(
      'sort',
      `${String(updatedSorting.field)}-${updatedSorting.order}` as keyof T,
    );
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
