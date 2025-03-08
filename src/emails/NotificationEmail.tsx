import { EmailLayout } from './components/EmailLayout';
import {
  Text,
  Section,
  Heading,
  Container,
  Button,
  render,
} from '@react-email/components';
import * as React from 'react';

interface NotificationEmailProps {
  notificationTitle: string;
  notificationMessage: string;
  actionUrl?: string;
  actionLabel?: string;
  organizationLogo?: string;
  content: {
    subject: string;
    greeting: string;
    outro: string;
    signature: string;
  };
}

export const NotificationEmail = async ({
  notificationTitle,
  notificationMessage,
  actionUrl,
  actionLabel,
  organizationLogo,
  content,
}: NotificationEmailProps) => {
  return (
    <EmailLayout
      title={content.subject}
      previewText={notificationTitle}
      logo={organizationLogo}
    >
      <Container>
        <Heading className="text-center text-xl font-semibold mb-20">
          {content.greeting}
        </Heading>

        <Section className="mb-20">
          <Text className="font-semibold mb-10">{notificationTitle}</Text>
          <Text>{notificationMessage}</Text>
        </Section>

        {actionUrl && actionLabel && (
          <Section className="text-center mb-20">
            <Button
              href={actionUrl}
              className="bg-primary text-white rounded-lg py-3 px-6 inline-block"
            >
              {actionLabel}
            </Button>
          </Section>
        )}

        <Text className="mb-20">{content.outro}</Text>
        <Text>{content.signature}</Text>
      </Container>
    </EmailLayout>
  );
};

export const NotificationEmailToHtml = (props: NotificationEmailProps) =>
  render(<NotificationEmail {...props} />);
