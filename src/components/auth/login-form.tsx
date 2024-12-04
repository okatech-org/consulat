'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TradFormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { signIn } from 'next-auth/react'
import { Icons } from '@/components/ui/icons'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sendOTP } from '@/actions/auth'
import { ROUTES } from '@/schemas/routes'
import { LoginInput, LoginSchema } from '@/schemas/user'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { PhoneInput } from '@/components/ui/phone-input'

interface LoginFormProps {
  successCallback?: () => void
  customTitle?: string
  customSubTitle?: string
}

export function LoginForm({
                            customTitle,
                            customSubTitle
                          }: LoginFormProps) {
  const t = useTranslations('auth.login')
  const t_callback = useTranslations('common.callbacks')
  const [isOTPSent, setIsOTPSent] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: '',
      type: 'PHONE',
      otp: '',
    },
    mode: 'onSubmit',
  })

  const callbackUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null

  const loginType = form.watch('type')

  const onSubmit = async (values: LoginInput) => {
    try {
      setIsLoading(true)
      setError(undefined)
      setSuccess(undefined)

      if (!isOTPSent) {
        const result = await sendOTP(values.identifier, values.type)
        if (result && result.error) {
          setError(result.error)
          return
        }
        if (result && result.success) {
          setSuccess(t('messages.otp_sent'))
          setIsOTPSent(true)
          return
        }
        return
      }

      const signInResult = await signIn('credentials', {
        identifier: values.identifier,
        type: values.type,
        otp: values.otp,
        redirect: true,
        redirectTo: callbackUrl || ROUTES.dashboard,
      })

      if (signInResult?.error) {
        setError(t('messages.otp_invalid'))
        return
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(t('messages.something_went_wrong'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = React.useCallback((value: string) => {
    form.reset({
      identifier: '',
      type: value as 'EMAIL' | 'PHONE',
      otp: '',
    })
    setError(undefined)
    setSuccess(undefined)
    setIsOTPSent(false)
  }, [form])

  return (
    <Card className="mx-auto shadow-card flex flex-col justify-center space-y-6 w-full">
      <CardHeader>
        <CardTitle>{customTitle || t('welcome')}</CardTitle>
        <CardDescription>{customSubTitle || t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs
              defaultValue="PHONE"
              value={loginType}
              onValueChange={handleTabChange}
            >
              <TabsList className="grid w-full mb-2 grid-cols-2">
                <TabsTrigger value="PHONE">{t('tabs.phone')}</TabsTrigger>
                <TabsTrigger value="EMAIL">{t('tabs.email')}</TabsTrigger>
              </TabsList>

              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="identifier">
                      {t(`inputs.${loginType.toLowerCase()}.label`)}
                    </FormLabel>
                    <FormControl>
                      <>
                        {
                          loginType === 'PHONE' && (
                            <div className="flex w-full gap-2">
                              <PhoneInput
                                {...field}
                                id="identifier"
                                type="tel"
                                placeholder={t(`inputs.phone.placeholder-local`)}
                                autoComplete="tel"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                aria-describedby="identifier-description"
                              />
                            </div>
                          )
                        }
                        {
                          loginType === 'EMAIL' && (
                            <Input
                              {...field}
                              id="identifier"
                              type="email"
                              placeholder={t(`inputs.email.placeholder`)}
                              autoComplete="email"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                              aria-describedby="identifier-description"
                            />
                          )
                        }
                      </>
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              {isOTPSent && (
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="otp">{t('inputs.otp.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="otp"
                          placeholder={t('inputs.otp.placeholder')}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          autoComplete="one-time-code"
                          aria-describedby="otp-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </Tabs>

            {error && (
              <div
                className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div
                className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-500"
                role="alert"
              >
                <CheckCircle className="h-4 w-4" />
                <p>{success}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              aria-busy={isLoading}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.Spinner
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  {t('buttons.loading')}
                </>
              ) : isOTPSent ? (
                t('buttons.verify')
              ) : (
                t('buttons.get_code')
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {callbackUrl && (
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground">
            {t_callback('label')}
            <span className={"font-bold"}>
              {t_callback(`${callbackUrl}`)}
            </span>
          </p>
        </CardFooter>
      )}
    </Card>
  )
}