import { EmailLayout } from './components/EmailLayout';
import { Text, Button, Section, render } from '@react-email/components';
import * as React from 'react';

interface AdminWelcomeEmailProps {
  adminName: string;
  organizationName: string;
  dashboardUrl: string;
  t: {
    subject: string;
    greeting: string;
    intro: string;
    instructions: string;
    buttonLabel: string;
    outro: string;
    signature: string;
  };
}

export const AdminWelcomeEmail = ({
  adminName,
  organizationName,
  dashboardUrl,
  t,
}: AdminWelcomeEmailProps) => (
  <EmailLayout title={t.subject} previewText={t.intro}>
    <Section>
      <Text>{t.greeting.replace('{adminName}', adminName)}</Text>
      <Text>{t.intro.replace('{organizationName}', organizationName)}</Text>
      <Text>{t.instructions}</Text>
      <Button
        href={dashboardUrl}
        style={{
          backgroundColor: '#1d4ed8',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
          display: 'inline-block',
          marginTop: '20px',
        }}
      >
        {t.buttonLabel}
      </Button>
      <Text style={{ marginTop: '20px' }}>{t.outro}</Text>
      <Text>{t.signature.replace('{appName}', 'Consulat.ga')}</Text>
    </Section>
  </EmailLayout>
);

export const AdminWelcomeEmailToHtml = (props: AdminWelcomeEmailProps) => {
  const emailHtml = render(<AdminWelcomeEmail {...props} />);
  return emailHtml;
};
