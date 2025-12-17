"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

export function PublicFooter() {
  const t = useTranslations('home')

  return (
    <footer className="bg-muted px-4 py-3 sm:bg-transparent md:py-4">
        <div className="flex items-center justify-center gap-4">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            {t('footer.designed_by')}{' '}
            <Link
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Okatech
            </Link>
          </p>
        </div>
      </footer>
  )
}