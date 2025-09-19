'use client'

import { NavUser } from "../ui/nav-user";
import { Button } from "../ui/button";
import Link from "next/link";
import { ROUTES } from "@/schemas/routes";
import { ThemeToggleSingle } from "../layouts/theme-toggle-single";
import { useTranslations } from "next-intl";
import { useCurrentUser } from '@/hooks/use-current-user';

export function HeaderLinks() {
  const { user } = useCurrentUser();
  const t = useTranslations('home')

  return <>
  {!user && <ThemeToggleSingle />}
  {user ? <NavUser /> : (
            <Button 
              variant="default" 
              size="mobile"
              weight="medium"
              asChild
            >
              <Link prefetch href={ROUTES.auth.login}>
                {t('nav.login')}
              </Link>
            </Button>
          )}
  </>
}