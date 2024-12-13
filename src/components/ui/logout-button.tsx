'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { logUserOut } from '@/actions/auth'
import * as React from 'react'
import { LogOutIcon } from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Icons } from './icons'

type LogoutButtonProps = {
  customClass?: string
}

export function LogoutButton({ customClass }: Readonly<LogoutButtonProps>) {
  const t = useTranslations('auth.actions')
  const user = useCurrentUser()
  const [isPending, startTransition] = React.useTransition()

  if (!user) {
    return null
  }

  return (
    <Button
      onClick={() => {
        startTransition(async () => {
          await logUserOut().then(() => {
            window.location.reload()
          })
        })
      }}
      type={'button'}
      variant={'ghost'}
      className={'w-max gap-2 ' + customClass}
      disabled={isPending}
    >
      {isPending ? (
        <Icons.Spinner className="mr-2 size-4 animate-spin" />
      ) : (
        <LogOutIcon className={'size-4'} />
      )}
      <span>{t('logout')}</span>
    </Button>
  )
}