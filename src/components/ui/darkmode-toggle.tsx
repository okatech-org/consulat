'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

export default function DarkModeToggle({
  direction = 'horizontal',
}: {
  direction?: 'horizontal' | 'vertical';
}) {
  const { setTheme } = useTheme();

  return (
    <div
      className={`toggle flex size-max ${direction === 'vertical' ? 'flex-col' : 'flex-row'}  gap-1 rounded-full bg-gray-100 p-1 dark:bg-gray-900 sm:flex-row`}
    >
      <Button
        className={
          'aspect-square size-8 rounded-full bg-input p-1 hover:bg-input dark:bg-transparent '
        }
        variant={'ghost'}
        type={'button'}
        onClick={() => setTheme('light')}
      >
        <SunIcon className={'w-6'} />
      </Button>
      <Button
        className={'aspect-square size-8 rounded-full p-1 hover:bg-muted dark:bg-muted'}
        variant={'ghost'}
        type={'button'}
        onClick={() => setTheme('dark')}
      >
        <MoonIcon className={'w-6 dark:text-white'} />
      </Button>
    </div>
  );
}
