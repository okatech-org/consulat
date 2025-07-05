'use client';

import * as React from 'react';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ModeToggleProps = { trigger?: React.ReactNode };
export function ModeToggle({ trigger }: Readonly<ModeToggleProps>) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ? (
          <>{trigger}</>
        ) : (
          <Button
            variant="ghost"
            leftIcon={
              <>
                <SunIcon className="inline-block size-[1.2rem] dark:hidden" />
                <MoonIcon className="hidden size-[1.2rem] dark:inline-block" />
              </>
            }
          >
            <span className={'font-normal'}>Toggle theme</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={'hidden dark:block'}
          onClick={() => setTheme('light')}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          className={'block dark:hidden'}
          onClick={() => setTheme('dark')}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
