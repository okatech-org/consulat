import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Img,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  title: string;
  previewText: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ title, previewText, children }: EmailLayoutProps) => (
  <Html lang="fr">
    <Head>
      <title>{title}</title>
    </Head>
    <Body
      style={{
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#222222',
      }}
    >
      <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <Section style={{ textAlign: 'center', paddingBottom: '20px' }}>
          <Img src="https://consulat.ga/logo.png" width="120" alt="Consulat.ga" />
        </Section>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
          {previewText}
        </Text>
        <Hr style={{ borderColor: '#eaeaea', margin: '20px 0' }} />
        {children}
        <Hr style={{ borderColor: '#eaeaea', margin: '20px 0' }} />
        <Text style={{ fontSize: '12px', color: '#888888', textAlign: 'center' }}>
          © {new Date().getFullYear()} Consulat.ga. Tous droits réservés.
        </Text>
      </Container>
    </Body>
  </Html>
);
