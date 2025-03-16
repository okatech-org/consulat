import { Text, Section, Heading, render } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface OTPEmailProps {
  otp: string;
  content: {
    subject: string;
    title: string;
    intro: string;
    outro: string;
    warning: string;
  };
}

export const OTPEmail = ({ otp, content }: OTPEmailProps) => (
  <EmailLayout title={content.subject} previewText={content.intro}>
    <Heading className="text-center text-xl font-semibold mb-20">
      {content.subject}
    </Heading>

    <Text className="mb-20">{content.intro}</Text>

    <Section className="text-center my-20">
      <Text className="text-3xl font-bold tracking-widest text-primary">{otp}</Text>
    </Section>

    <Text className="mb-20">{content.outro}</Text>

    <Section className="bg-red-100 rounded p-4 text-center">
      <Text className="text-red-600 text-sm">{content.warning}</Text>
    </Section>
  </EmailLayout>
);

export const OTPEmailToHtml = (props: OTPEmailProps) => render(<OTPEmail {...props} />);
