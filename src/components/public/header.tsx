import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ROUTES } from "@/schemas/routes"
import LangSwitcher from "@/components/ui/LangSwitcher"

export async function PublicHeader() {
  const t = await getTranslations('home')

  return (
    <header className="fixed top-4 z-40 w-full md:top-6">
      <div className="container flex w-full items-center justify-between gap-4">
        <span className="text-md font-bold uppercase sm:text-base">
          <Link href={ROUTES.base}>
            <span>{t('consulat')}</span>
          </Link>
        </span>

        <div className="flex w-max gap-3">
          <LangSwitcher />
          {/**<Link
            href={ROUTES.profile}
            className={buttonVariants({ variant: 'default' }) + ' !rounded-full max-[480px]:!px-2'}
          >
            {isAuth ? (
              <span>{t('nav.profile')}</span>
            ) : (
              <span>{t('nav.login')}</span>
            )}
          </Link>*/}
        </div>
      </div>
    </header>
  )
}