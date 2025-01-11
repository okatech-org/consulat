import { LoadingSuspense } from '@/components/ui/loading-suspense'
import { LoginForm } from '@/app/auth/_utils/login-form'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ROUTES } from '@/schemas/routes'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export default async function LoginPage() {
  const t = await getTranslations('auth.login')
  const currentYear = new Date().getFullYear()

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <Link
        href={ROUTES.base}
        className={
          buttonVariants({ variant: 'ghost' }) +
          ' absolute left-4 top-4 md:left-8 md:top-8'
        }
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back_home')}
      </Link>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="mb-4 flex justify-center lg:hidden">
              <Image
                src="/images/logo_consulat_ga_512.jpeg"
                alt="Consulat Logo"
                width={128}
                height={128}
                priority
                className={"rounded"}
              />
            </div>
          </div>

          <LoadingSuspense>
            <LoginForm />
          </LoadingSuspense>

          <p className="px-8 text-center text-sm text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>

          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href={ROUTES.privacy_policy}
              className="hover:text-primary underline underline-offset-4"
            >
              {t('footer.privacy_policy')}
            </Link>
            {' · '}
            <Link
              href={ROUTES.terms}
              className="hover:text-primary underline underline-offset-4"
            >
              {t('footer.terms')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}