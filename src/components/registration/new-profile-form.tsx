'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { PhoneInput } from '@/components/ui/phone-input';
import { CountrySelect } from '@/components/ui/country-select';
import { getCountryCode, type CountryCode } from '@/lib/autocomplete-datas';
import CardContainer from '../layouts/card-container';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  CountryCodeSchema,
  DateSchema,
  EmailSchema,
  NameSchema,
  PhoneValueSchema,
} from '@/schemas/inputs';
import { z } from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Country } from '@prisma/client';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import Image from 'next/image';
import { sendOTP, isUserExists } from '@/actions/auth';
import { ErrorMessageKey, tryCatch } from '@/lib/utils';
import { ErrorCard } from '../ui/error-card';
import { toast } from '@/hooks/use-toast';
import { signIn } from 'next-auth/react';
import { validateOTP } from '@/lib/user/otp';
import { createUserWithProfile } from '@/actions/profile';

export function NewProfileForm({
  availableCountries,
}: {
  availableCountries: Country[];
}) {
  const t = useTranslations('inputs');
  const tAuth = useTranslations('auth.login');
  const tErrors = useTranslations('messages.errors');
  const router = useRouter();
  const [showOTP, setShowOTP] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<ErrorMessageKey | null>(null);

  const CreateProfileSchema = z
    .object({
      firstName: NameSchema,
      lastName: NameSchema,
      residenceCountyCode: CountryCodeSchema,
      email: EmailSchema.optional(),
      phone: PhoneValueSchema,
      emailVerified: DateSchema.optional(),
      phoneVerified: DateSchema.optional(),
      type: z.enum(['EMAIL', 'PHONE']),
      otp: z.string().length(6, { message: 'messages.errors.otp_length' }).optional(),
    })
    .superRefine(async (data, ctx) => {
      if (showOTP && !data.otp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.otp_required',
          path: ['otp'],
        });
      }

      if (data.email) {
        const isUserWithEmail = await isUserExists(undefined, data.email);
        if (isUserWithEmail) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'messages.errors.user_email_already_exists',
            path: ['email'],
          });
        }
      }

      if (data.phone) {
        const isUserWithPhone = await isUserExists(undefined, undefined, data.phone);
        if (isUserWithPhone) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'messages.errors.user_phone_already_exists',
            path: ['phone.number'],
          });
        }
      }
    });

  type CreateProfileInput = z.infer<typeof CreateProfileSchema>;

  const form = useForm<CreateProfileInput>({
    resolver: zodResolver(CreateProfileSchema),
    defaultValues: {
      type: 'PHONE',
      phone: {
        countryCode: '+33',
      },
      residenceCountyCode: availableCountries?.[0]?.code as CountryCode,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: CreateProfileInput) => {
    setIsLoading(true);
    const identifier =
      data.type === 'EMAIL'
        ? data.email
        : (`${data.phone?.countryCode}${data.phone?.number}` as string);

    if (!showOTP) {
      // Envoyer l'OTP
      const { error: sendOTPError, data: sendOTPData } = await tryCatch(
        sendOTP(identifier ?? '', data.type),
      );

      if (sendOTPError) {
        setError(sendOTPError.message);
      }

      if (sendOTPData) {
        setShowOTP(true);
        toast({
          title: tAuth('messages.otp_sent'),
          variant: 'success',
        });
      }

      setIsLoading(false);

      return;
    }

    if (data.otp) {
      const { error: validatedOTPError } = await tryCatch(
        validateOTP({ identifier: identifier ?? '', otp: data.otp, type: data.type }),
      );

      if (validatedOTPError) {
        setError(validatedOTPError.message);
      }

      if (data.type === 'EMAIL') {
        form.setValue('emailVerified', new Date());
      }

      if (data.type === 'PHONE') {
        form.setValue('phoneVerified', new Date());
      }
    }

    const newProfile = await tryCatch(createUserWithProfile(data));

    if (newProfile.error) {
      setError(newProfile.error.message);
    }

    const { error: loginWithOTPError } = await tryCatch(
      signIn('credentials', {
        identifier,
        type: data.type,
        otp: data.otp,
        redirect: false,
      }),
    );

    if (loginWithOTPError) {
      setError(loginWithOTPError.message);
    }

    setIsLoading(false);
    router.refresh();
  };

  return (
    <div className="flex min-h-full pt-[60px] w-full flex-col items-center justify-center bg-muted p-6 gap-6">
      <div></div>
      <CardContainer
        className={'overflow-hidden'}
        contentClass="grid min-h-[500px] p-0 md:grid-cols-2 max-w-5xl mx-auto"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-grow flex-col ">
              <h1 className="text-xl font-bold">{t('newProfile.title')}</h1>
              <p className="text-balance text-muted-foreground">
                {t('newProfile.description')}
              </p>
            </div>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('firstName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder={t('firstName.placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lastName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder={t('lastName.placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="residenceCountyCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('country.label')}</FormLabel>
                  <FormControl>
                    <CountrySelect
                      type="single"
                      selected={field.value as CountryCode}
                      onChange={(value) => field.onChange(value)}
                      options={availableCountries?.map(
                        (item) => item.code as CountryCode,
                      )}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email.label')}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder={t('email.placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>{t('phone.label')}</FormLabel>
              <PhoneInput
                parentForm={form}
                fieldName="phone"
                options={availableCountries?.map((item) => item.code as CountryCode)}
                defaultCountry={getCountryCode(
                  form.watch('residenceCountyCode') as CountryCode,
                )}
              />
            </FormItem>

            {showOTP && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('otp.label')}</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus={true}
                        {...field}
                        placeholder={t('otp.placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                onClick={() => {
                  form.setValue('type', 'PHONE');
                }}
              >
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {showOTP
                  ? t('newProfile.buttons.verify')
                  : t('newProfile.buttons.get_code')}
              </Button>
              <Button
                variant="link"
                className="w-full"
                disabled={isLoading}
                onClick={() => {
                  form.setValue('type', 'EMAIL');
                }}
              >
                {t('newProfile.buttons.use_email')}
              </Button>
              {error && <ErrorCard description={tErrors(error)} />}
            </div>
          </form>
        </Form>
        <div className="relative w-full h-full hidden bg-muted md:block">
          <Image
            src="https://utfs.io/f/yMD4lMLsSKvz349tIYw9oyDVxmdLHiTXuO0SKbeYqQUlPghR"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            width={800}
            height={800}
          />
        </div>
      </CardContainer>

      <Link
        prefetch={true}
        href={ROUTES.user.profile}
        className={buttonVariants({ variant: 'link', className: 'w-full underline' })}
      >
        {t('newProfile.buttons.already_have_account')}
      </Link>
    </div>
  );
}
