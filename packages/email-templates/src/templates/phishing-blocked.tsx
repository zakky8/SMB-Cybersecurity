import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface PhishingBlockedProps {
  organizationName: string;
  employeeEmail: string;
  senderEmail: string;
  subject: string;
  blockedAt: string;
  reason: string;
  dashboardUrl: string;
}

const baseUrl = process.env.REACT_EMAIL_BASE_URL || 'https://app.shielddesk.io';

export const PhishingBlockedEmail: React.FC<PhishingBlockedProps> = ({
  organizationName,
  employeeEmail,
  senderEmail,
  subject,
  blockedAt,
  reason,
  dashboardUrl,
}) => (
  <Html>
    <Head />
    <Preview>Phishing email blocked for {employeeEmail}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Section style={{ paddingBottom: '20px' }}>
              <Text style={heading}>Phishing Email Blocked</Text>
              <Hr style={hr} />
            </Section>
          </Row>

          <Row>
            <Text style={paragraph}>
              A phishing email has been detected and blocked before reaching your mailbox.
            </Text>
          </Row>

          <Row>
            <Section style={alertBox}>
              <Text style={{ ...paragraph, margin: '0 0 10px 0', fontWeight: 'bold' }}>
                Email Details:
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Organization:</strong> {organizationName}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Recipient:</strong> {employeeEmail}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Sender:</strong> {senderEmail}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Subject:</strong> {subject}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Blocked At:</strong> {blockedAt}
              </Text>
              <Text style={{ ...paragraph, margin: '0' }}>
                <strong>Reason:</strong> {reason}
              </Text>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Section style={{ textAlign: 'center' as const }}>
              <Button style={button} href={dashboardUrl}>
                View Security Dashboard
              </Button>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Text style={infoBox}>
              <strong>Did not block a legitimate email?</strong> You can report false positives in your security dashboard to help us improve our detection.
            </Text>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={footer}>
              This is an automated security notification from ShieldDesk. Do not reply to this email.
            </Text>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f4f4f4',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '1.5',
  textAlign: 'left' as const,
};

const heading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0 0 10px 0',
};

const alertBox = {
  backgroundColor: '#e8f5e9',
  borderRadius: '4px',
  padding: '16px',
  marginTop: '20px',
  marginBottom: '20px',
  borderLeft: '4px solid #4caf50',
};

const infoBox = {
  backgroundColor: '#f0f4ff',
  borderRadius: '4px',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#525f7f',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  marginTop: '20px',
};

export default PhishingBlockedEmail;
