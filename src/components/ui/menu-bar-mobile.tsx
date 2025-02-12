'use client';

import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import { Settings, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/types/navigation';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';
import { ScrollArea } from './scroll-area';
import { ChatToggle } from '../chat/chat-toggle';

interface MenuBarMobileProps {
  quickMenu: NavItem[];
  extendedMenu: NavItem[];
  title?: string;
  description?: string;
}

export function MenuBarMobile({
  quickMenu,
  extendedMenu,
  title,
  description,
}: MenuBarMobileProps) {
  const path = usePathname();
  const t = useTranslations('common');
  const t_nav = useTranslations('navigation');
  // Get the first 2 items for quick access
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 block sm:hidden">
      <nav className="border-t bg-background px-1 py-2">
        <div className="flex items-center justify-between">
          {/* Quick access items on the left */}
          <div className="flex items-center gap-2">
            {quickMenu.map((item) => {
              const isActive = path === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-sm transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.icon}
                  <span className="text-[10px] font-medium">{item.title}</span>
                </Link>
              );
            })}
          </div>

          {/* Chatbot button in the middle */}
          <div className="absolute size-16 left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 rounded-full border-2 bg-background p-2">
            <ChatToggle />
            <span className="sr-only">Assistant</span>
          </div>

          {/* Menu button and additional items on the right */}
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.settings}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-sm transition-colors',
                path === ROUTES.settings
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Settings className="size-5" />
              <span className="text-[10px] font-medium">{t('nav.settings')}</span>
            </Link>

            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-sm"
                >
                  <Menu className="size-5" />
                  <span className="text-[10px] font-medium">{t_nav('menu')}</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="py-4">
                  <DrawerTitle className="text-lg">{title || t_nav('menu')}</DrawerTitle>
                  <DrawerDescription className="text-sm">
                    {description || t_nav('my_space')}
                  </DrawerDescription>
                </DrawerHeader>
                <ScrollArea className="h-auto px-2">
                  <div className="grid gap-1 py-2">
                    {extendedMenu.map((item) => (
                      <DrawerClose key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                            path === item.href
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted',
                          )}
                        >
                          {item.icon}
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </DrawerClose>
                    ))}
                  </div>
                </ScrollArea>
                <DrawerFooter className="py-4">
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full">
                      {t('actions.close')}
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </nav>
    </div>
  );
}
