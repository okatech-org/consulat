import Link from "next/link"
import { getTranslations } from "next-intl/server"

export async function PublicFooter() {
  const t = await getTranslations('home')

  return (
    <footer className="bg-muted px-4 py-3 sm:bg-transparent md:py-4">
      <div className="container flex items-center justify-center gap-4">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
          {t('footer.designed_by')}{' '}
          <Link
            href="https://presteo.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Presteo
          </Link>
          .
        </p>
      </div>
    </footer>
  )
}