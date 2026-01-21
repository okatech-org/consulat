"use client"

import Link from "next/link"
import { ROUTES } from "@/schemas/routes"
import Image from 'next/image';
import { env } from "@/env"
import { Button } from "../ui/button";
import { NavUser } from "../ui/nav-user";
import { ThemeToggleSingle } from "../layouts/theme-toggle-single";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTranslations } from "next-intl";
import { Spinner } from "../ui/spinner";

const logo = env.NEXT_PUBLIC_ORG_LOGO || 'https://greedy-horse-339.convex.cloud/api/storage/78d28d02-9cd2-44a0-b6b1-4717a766d080';
const appName = env.NEXT_PUBLIC_APP_NAME || 'Consulat.ga';


export  function PublicHeader() {
  const t = useTranslations('home')
  const { user, loading } = useCurrentUser();

  return (
    <header className="fixed top-0 z-50 border-b border-neutral-200 bg-white/80 py-2 backdrop-blur-md dark:border-neutral-800 dark:bg-black/80 w-full">
      <div className="box-container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.base} className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-white">
          <Image
            src={
              logo
            }
            width={60}
            height={60}
            alt="Consulat.ga"
            priority
            className="relative h-8 w-8 rounded-md transition-transform duration-500 group-hover:scale-105"
          />
          </div>
          <span className="bg-gradient-to-r hidden sm:block from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
            {appName}
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {loading && <Spinner />}
          {!user && !loading && <ThemeToggleSingle />}
          {user && !loading && <NavUser />}
          {!user && !loading && <Button 
              variant="default" 
              size="default"
              asChild
            >
              <Link prefetch href={ROUTES.auth.login}>
                {t('nav.login')}
              </Link>
            </Button>
          }
        </div>
      </div>
    </header>
  )
}