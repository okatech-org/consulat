'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoginSchema, type LoginInput } from '@/schemas/user'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { sendOTP } from '@/actions/auth'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { PhoneInput, type PhoneValue } from '@/components/ui/phone-input'

export function LoginForm() {
  const t = useTranslations('auth.login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showOTP, setShowOTP] = React.useState(false)
  const [method, setMethod] = React.useState<'EMAIL' | 'PHONE'>('EMAIL')

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: '',
      type: 'EMAIL',
      otp: '',
    },
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true)

      if (!showOTP) {
        // Envoyer l'OTP
        const result = await sendOTP(data.identifier, data.type)
        if (result.error) {
          throw new Error(result.error)
        }
        setShowOTP(true)
        toast({
          title: t('messages.otp_sent'),
          variant: 'success',
        })
        return
      }

      // Connexion avec l'OTP
      const signInResult = await signIn('credentials', {
        identifier: data.identifier,
        type: data.type,
        otp: data.otp,
        redirect: false,
      })

      if (signInResult?.error) {
        throw new Error(signInResult.error)
      }

      // Redirection après connexion réussie
      const callbackUrl = searchParams.get('callbackUrl')
      // eslint-disable-next-line
      router.push(callbackUrl || '/dashboard' as any)
      router.refresh()

    } catch (error) {
      console.error(error)
      toast({
        title: t('messages.something_went_wrong'),
        description: error instanceof Error ? error.message : t('messages.unknown_error'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer le changement de méthode
  const handleMethodChange = (value: string) => {
    setMethod(value as 'EMAIL' | 'PHONE')
    setShowOTP(false)
    form.reset({
      identifier: '',
      type: value as 'EMAIL' | 'PHONE',
      otp: '',
    })
  }

  // Gérer le changement de téléphone
  const handlePhoneChange = (phone: PhoneValue) => {
    const fullNumber = phone.countryCode + phone.number
    form.setValue('identifier', fullNumber)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('welcome')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Tabs
              defaultValue="EMAIL"
              value={method}
              onValueChange={handleMethodChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="EMAIL">{t('tabs.email')}</TabsTrigger>
                <TabsTrigger value="PHONE">{t('tabs.phone')}</TabsTrigger>
              </TabsList>

              <TabsContent value="EMAIL">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('inputs.email.label')}</FormLabel>
                      <FormControl>
                        <Input
                          autoFocus={true}
                          {...field}
                          type="email"
                          placeholder={t('inputs.email.placeholder')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="PHONE">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('inputs.phone.label')}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          autoFocus={true}
                          value={field.value as unknown as PhoneValue}
                          onChange={handlePhoneChange}
                          placeholder={t('inputs.phone.placeholder')}
                          disabled={isLoading}
                          error={!!form.formState.errors.identifier}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {showOTP && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inputs.otp.label')}</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus={true}
                        {...field}
                        placeholder={t('inputs.otp.placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {showOTP ? t('buttons.verify') : t('buttons.get_code')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}