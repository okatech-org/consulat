import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ROUTES } from "@/schemas/routes"
import { buttonVariants } from "@/components/ui/button"
import { getCurrentUser } from "@/actions/user"
import { UserNav } from "../layouts/user-nav"
import { ThemeToggleSingle } from "../layouts/theme-toggle-single"
//import { LanguageSwitcherSingle } from "../layouts/language-switcher-single"
import Image from 'next/image';


export async function PublicHeader() {
  const t = await getTranslations('home')
  const user = await getCurrentUser();
  const isAuth = !!user;


  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 py-4 backdrop-blur-md dark:border-neutral-800 dark:bg-black/80 w-full">
      <div className="container mx-auto flex items-center justify-between max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.base} className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <Image
                    src={
                      'https://qld7pfnhxe.ufs.sh/f/yMD4lMLsSKvzwdOb0ZwnOheKr38gCfXvmVc2EZ5iGaYk9uQB'
                    }
                    width={60}
                    height={60}
                    alt="Consulat.ga"
                    className="relative h-8 w-8 rounded-md transition-transform duration-500 group-hover:scale-105"
                  />
          </div>
          <span className="bg-gradient-to-r hidden sm:block from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
          {t('consulat')}
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          <ThemeToggleSingle />
          {/* <LanguageSwitcherSingle /> */}

          {isAuth ? <UserNav user={user} /> : ( <Link prefetch href={ROUTES.auth.login} className={buttonVariants({ 
            variant: 'default', 
            className: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800' 
          })}>
            {t('nav.login')}
          </Link>)}
          
         
        </div>
      </div>
    </header>
  )
}