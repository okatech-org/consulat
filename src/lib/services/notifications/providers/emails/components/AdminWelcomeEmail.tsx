import {
  Text,
  Button,
  Section,
  Heading,
  Link,
  Row,
  Column,
  Container,
  render,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface AdminWelcomeEmailProps {
  dashboardUrl: string;
  organizationLogo: string;
  content: {
    subject: string;
    greeting: string;
    intro: string;
    instructions: string[];
    buttonLabel: string;
    outro: string;
    signature: string;
    links?: { label: string; url: string }[];
  };
}

export const AdminWelcomeEmail = async ({
  dashboardUrl,
  organizationLogo,
  content,
}: AdminWelcomeEmailProps) => {
  return (
    <EmailLayout
      title={content.subject}
      previewText={content.intro}
      logo={organizationLogo}
    >
      <Container>
        <Heading className="text-center text-xl font-semibold mb-20">
          {content.greeting}
        </Heading>

        <Text className="mb-20">{content.intro}</Text>

        <Section className="mb-20">
          <ul className="list-disc pl-5">
            {content.instructions.map((instruction, idx) => (
              <li key={idx} className="mb-2">
                {instruction}
              </li>
            ))}
          </ul>
        </Section>

        <Section className="text-center mb-20">
          <Button
            href={dashboardUrl}
            className="bg-primary text-white rounded-lg py-3 px-6 inline-block"
          >
            {content.buttonLabel}
          </Button>
        </Section>

        <Text className="mb-20">{content.outro}</Text>
        <Text>{content.signature}</Text>

        {content.links && (
          <Section className="mt-20">
            <Row>
              {content.links.map((link) => (
                <Column key={link.url} className="text-center">
                  <Link href={link.url} className="underline font-semibold">
                    {link.label}
                  </Link>
                </Column>
              ))}
            </Row>
          </Section>
        )}
      </Container>
    </EmailLayout>
  );
};

export const AdminWelcomeEmailToHtml = (props: AdminWelcomeEmailProps) => {
  const emailHtml = render(<AdminWelcomeEmail {...props} />);
  return emailHtml;
};
