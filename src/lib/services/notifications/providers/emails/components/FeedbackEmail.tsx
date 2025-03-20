import { Text, Section, Heading, Container, Hr, render } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface FeedbackEmailProps {
  feedbackData: {
    subject: string;
    message: string;
    category: string;
    rating?: number;
    email?: string;
    userId?: string;
    createdAt: Date;
  };
  content: {
    subject: string;
    greeting: string;
    title: string;
    intro: string;
    category_label: string;
    subject_label: string;
    message_label: string;
    rating_label: string;
    user_info_label: string;
    user_email_label: string;
    user_id_label: string;
    date_label: string;
    outro: string;
    signature: string;
  };
}

export const FeedbackEmail = ({ feedbackData, content }: FeedbackEmailProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'medium',
    }).format(date);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'bug':
        return 'Bug / Problème technique';
      case 'feature':
        return 'Nouvelle fonctionnalité';
      case 'improvement':
        return 'Amélioration';
      case 'other':
        return 'Autre';
      default:
        return category;
    }
  };

  return (
    <EmailLayout title={content.title} previewText={feedbackData.subject}>
      <Container>
        <Heading className="text-center text-xl font-semibold mb-4">
          {content.greeting}
        </Heading>

        <Text className="mb-4">{content.intro}</Text>

        <Section className="border border-border rounded-md p-4 mb-4 bg-gray-50">
          <Text className="font-semibold mb-2">{content.category_label}</Text>
          <Text className="mb-4">{getCategoryLabel(feedbackData.category)}</Text>

          <Text className="font-semibold mb-2">{content.subject_label}</Text>
          <Text className="mb-4">{feedbackData.subject}</Text>

          <Text className="font-semibold mb-2">{content.message_label}</Text>
          <Text className="mb-4 whitespace-pre-wrap">{feedbackData.message}</Text>

          {feedbackData.rating && (
            <>
              <Text className="font-semibold mb-2">{content.rating_label}</Text>
              <Text className="mb-4">{feedbackData.rating}/5</Text>
            </>
          )}
        </Section>

        <Hr className="my-4" />

        <Section className="mb-4">
          <Text className="font-semibold mb-2">{content.user_info_label}</Text>

          {feedbackData.email && (
            <>
              <Text className="mb-2">
                <strong>{content.user_email_label}:</strong> {feedbackData.email}
              </Text>
            </>
          )}

          {feedbackData.userId && (
            <Text className="mb-2">
              <strong>{content.user_id_label}:</strong> {feedbackData.userId}
            </Text>
          )}

          <Text className="mb-2">
            <strong>{content.date_label}:</strong> {formatDate(feedbackData.createdAt)}
          </Text>
        </Section>

        <Text className="mb-4">{content.outro}</Text>
        <Text>{content.signature}</Text>
      </Container>
    </EmailLayout>
  );
};

export const FeedbackEmailToHtml = async (props: FeedbackEmailProps) => {
  return render(<FeedbackEmail {...props} />, { pretty: true });
};
