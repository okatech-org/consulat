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
        size="icon"
        type={'button'}
        onClick={() => setTheme('light')}
        leftIcon={<SunIcon className={'w-6'} />}
      />
      <Button
        className={'aspect-square size-8 rounded-full p-1 hover:bg-muted dark:bg-muted'}
        variant={'ghost'}
        size="icon"
        type={'button'}
        onClick={() => setTheme('dark')}
        leftIcon={<MoonIcon className={'w-6 dark:text-white'} />}
      />
    </div>
  );
}
