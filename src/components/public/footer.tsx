import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { getCurrentUser } from "@/lib/auth/utils";
import { ChatToggle } from "../chat/chat-toggle";

export async function PublicFooter() {
  const t = await getTranslations('home')
  const user = await getCurrentUser();

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
        {!user && <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8">
          <ChatToggle />
        </div> }
      </footer>
  )
}