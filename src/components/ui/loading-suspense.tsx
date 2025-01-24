import { ReloadIcon } from '@radix-ui/react-icons';
import { Suspense } from 'react';

export function LoadingSuspense({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense
      fallback={
        <div className={'item-center flex justify-center'}>
          <ReloadIcon className={'animate-rotate size-6'} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
