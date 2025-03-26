import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ROUTES } from "@/schemas/routes"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/actions/user"
import { ThemeToggleSingle } from "../layouts/theme-toggle-single"
import Image from 'next/image';
import { SessionUser } from "@/types";
import { NavUser } from "../layouts/nav-user"

const logo = process.env.NEXT_PUBLIC_ORG_LOGO || 'https://rbvj2i3urx.ufs.sh/f/H4jCIhEWEyOixzCMME2vW7azBeUDjZtRNGPui5wFQks2OdfA';
const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Consulat.ga';


export async function PublicHeader() {
  const t = await getTranslations('home')
  const user = await getCurrentUser();
  const isAuth = !!user;


  return (
    <header className="fixed top-0 z-50 border-b border-neutral-200 bg-white/80 py-4 backdrop-blur-md dark:border-neutral-800 dark:bg-black/80 w-full">
      <div className="container mx-auto flex items-center justify-between max-w-screen-xl px-4 sm:px-6 lg:px-8">
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
          <ThemeToggleSingle />
          {/* <LanguageSwitcherSingle /> */}

          {isAuth ? <NavUser showFeedback={false} user={user as SessionUser} /> : (<Button variant="default" asChild>
            <Link prefetch href={ROUTES.auth.login + '?callbackUrl=' + ROUTES.user.base}>
              {t('nav.login')}
            </Link>
          </Button>)}
        </div>
      </div>
    </header>
  )
}