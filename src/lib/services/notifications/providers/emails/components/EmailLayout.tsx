import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Link,
  Tailwind,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { env } from '@/env';
import { getLocale, getTranslations } from 'next-intl/server';

interface EmailLayoutProps {
  title: string;
  previewText: string;
  children: React.ReactNode;
  logo?: string;
  appName?: string;
}

const organizationLogo = env.NEXT_PUBLIC_ORG_LOGO;
const publicAppName = env.NEXT_PUBLIC_APP_NAME;
const publicUrl = env.NEXT_PUBLIC_URL;

export const EmailLayout = async ({
  title,
  previewText,
  children,
  logo = organizationLogo,
  appName = publicAppName,
}: EmailLayoutProps) => {
  const t = await getTranslations('emails.common');
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <Html lang={locale}>
      <Head>
        <title>{title}</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: '#1d4ed8',
                offwhite: '#fafbfb',
              },
              spacing: {
                20: '20px',
                40: '40px',
              },
            },
          },
        }}
      >
        <Body className="bg-offwhite font-sans text-gray-800">
          <Container className="bg-white mx-auto my-20 p-40 rounded-lg shadow-md max-w-[600px]">
            {logo && (
              <Section className="text-center mb-20">
                <Img src={logo} width="120" alt={appName} className="mx-auto" />
              </Section>
            )}
            {children}
            <Section className="text-center mt-20 text-xs text-gray-400">
              <Text>{t('footer.copyright', { year, appName })}</Text>
              <Link href={publicUrl} className="underline">
                {t('footer.cta')}
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
