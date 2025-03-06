'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginSchema, type LoginInput } from '@/schemas/user';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { sendOTP } from '@/actions/auth';
import { toast } from '@/hooks/use-toast';
import { PhoneInput, type PhoneValue } from '@/components/ui/phone-input';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorCard } from '@/components/ui/error-card';

export function LoginForm() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showOTP, setShowOTP] = React.useState(false);
  const [method, setMethod] = React.useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: '',
      type: 'EMAIL',
      otp: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);

      if (!showOTP) {
        // Envoyer l'OTP
        const result = await sendOTP(data.identifier, data.type);
        if (result.error) {
          setError(result.error);
          return;
        }
        setShowOTP(true);
        toast({
          title: t('messages.otp_sent'),
          variant: 'success',
        });
        return;
      }

      // Connexion avec l'OTP
      const signInResult = await signIn('credentials', {
        identifier: data.identifier,
        type: data.type,
        otp: data.otp,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(signInResult.error);
        return;
      }

      // Redirection après connexion réussie
      const callbackUrl = searchParams.get('callbackUrl');
      // eslint-disable-next-line
      router.push(callbackUrl || ('/dashboard' as any));
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: t('messages.something_went_wrong'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer le changement de méthode
  const handleMethodChange = (value: string) => {
    setMethod(value as 'EMAIL' | 'PHONE');
    setShowOTP(false);
    form.reset({
      identifier: '',
      type: value as 'EMAIL' | 'PHONE',
      otp: '',
    });
  };

  // Gérer le changement de téléphone
  const handlePhoneChange = (phone: PhoneValue) => {
    const fullNumber = phone.countryCode + phone.number;
    form.setValue('identifier', fullNumber);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={'flex flex-col gap-6'}>
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="grid min-h-[500px] p-0 md:grid-cols-2">
              <div className="flex flex-col gap-8 p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-grow flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">{t('welcome')}</h1>
                    <p className="text-balance text-muted-foreground">
                      {t('description')}
                    </p>
                  </div>
                  <div className="space-y-4">
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
                              <TradFormMessage />
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
                              <TradFormMessage />
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
                            <TradFormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {showOTP ? t('buttons.verify') : t('buttons.get_code')}
                  </Button>
                </div>
                {error && <ErrorCard description={error} />}
              </div>
              <div className="relative hidden bg-muted md:block">
                <Image
                  src="https://utfs.io/f/yMD4lMLsSKvz349tIYw9oyDVxmdLHiTXuO0SKbeYqQUlPghR"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                  width={800}
                  height={800}
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            {t('agreement')} <a href="#">{t('terms')}</a> {t('and')}{' '}
            <a href="#">{t('privacy')}</a>.
          </div>
        </div>
      </form>
    </Form>
  );
}
