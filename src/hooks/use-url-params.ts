import { useSearchParams } from 'next/navigation';

export type BaseUrlParams = {
  search?: string;
  page?: number;
  limit?: number;
  sort?: {
    direction: 'asc' | 'desc';
    field: string;
  };
};

export type UrlParams<T> = BaseUrlParams & {
  [key in keyof T]: unknown;
};

export function useUrlParams<T>({
  defaultParams,
  adaptParams,
}: {
  defaultParams: UrlParams<T>;
  adaptParams?: (urlParams: URLSearchParams) => UrlParams<T>;
}) {
  const searchParams = useSearchParams();
  const params = adaptParams
    ? adaptParams(searchParams)
    : (Object.fromEntries(searchParams.entries()) as UrlParams<T>);

  const handleParamChange = (param: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(param, value);
    router.push(`?${newParams.toString()}`);
  };

  return {
    ...defaultParams,
    ...params,
  };
}
