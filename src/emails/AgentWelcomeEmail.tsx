import { EmailLayout } from './components/EmailLayout';
import {
  Text,
  Button,
  Section,
  Heading,
  Container,
  render,
} from '@react-email/components';
import * as React from 'react';

interface AgentWelcomeEmailProps {
  loginUrl: string;
  organizationLogo?: string;
  content: {
    subject: string;
    greeting: string;
    intro: string;
    instructions: string[];
    buttonLabel: string;
    outro: string;
    signature: string;
  };
}

export const AgentWelcomeEmail = async ({
  loginUrl,
  organizationLogo,
  content,
}: AgentWelcomeEmailProps) => {
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
            href={loginUrl}
            className="bg-primary text-white rounded-lg py-3 px-6 inline-block"
          >
            {content.buttonLabel}
          </Button>
        </Section>

        <Text className="mb-20">{content.outro}</Text>
        <Text>{content.signature}</Text>
      </Container>
    </EmailLayout>
  );
};

export const AgentWelcomeEmailToHtml = (props: AgentWelcomeEmailProps) =>
  render(<AgentWelcomeEmail {...props} />);
