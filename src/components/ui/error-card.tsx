'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'

type CardProps = React.ComponentProps<typeof Card>

export function ErrorCard({ className, ...props }: CardProps) {
  const router = useRouter()

  return (
    <Card className={cn('w-[380px] mx-auto', className)} {...props}>
      <CardHeader>
        <CardTitle className={'mb-2'}>
          {"Oups, quelque chose s'est mal passé"}
        </CardTitle>
        <CardDescription>
          {"Nous n'avons pas pu vous connecter. Veuillez réessayer."}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          onClick={() => {
            router.push(ROUTES.login)
          }}
        >
          <Icons.Back />
          <span>Retour à la connexion</span>
        </Button>
      </CardFooter>
    </Card>
  )
}