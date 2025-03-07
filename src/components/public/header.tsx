import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ROUTES } from "@/schemas/routes"
import { buttonVariants } from "../ui/button"
import LanguageSwitcher from "../ui/LanguageSwitcher"
import { Session } from "next-auth"
import { UserNav } from "../layouts/user-nav"

export async function PublicHeader({ session }: { session: Session | null }) {
  const t = await getTranslations('home');
  const isAuth = !!session;

  return (
    <header className="fixed top-4 z-40 w-full md:top-6">
      <div className="container flex w-full items-center justify-between gap-4">
        <span className="text-md font-bold uppercase sm:text-base">
          <Link href={ROUTES.base}>
            <span>{t('consulat')}</span>
          </Link>
        </span>

        <div className="flex w-max gap-3">
          <LanguageSwitcher />
          {!isAuth && <Link
            href={ROUTES.auth.login}
            className={buttonVariants({ variant: 'default' })}
          >
           <span>{t('nav.login')}</span>
          </Link>}
          {isAuth && <UserNav user={session?.user} />}
        </div>
      </div>
    </header>
  )
}