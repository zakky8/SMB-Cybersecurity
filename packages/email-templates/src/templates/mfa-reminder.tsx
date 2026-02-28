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

interface MfaReminderProps {
  organizationName: string;
  employeeName: string;
  mfaMethod: 'totp' | 'sms' | 'email';
  setupUrl: string;
}

export const MfaReminderEmail: React.FC<MfaReminderProps> = ({
  organizationName,
  employeeName,
  mfaMethod,
  setupUrl,
}) => (
  <Html>
    <Head />
    <Preview>Multi-factor authentication required for {organizationName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Section style={{ paddingBottom: '20px' }}>
              <Text style={heading}>Enable Multi-Factor Authentication</Text>
              <Hr style={hr} />
            </Section>
          </Row>

          <Row>
            <Text style={paragraph}>
              Hi {employeeName},
            </Text>
          </Row>

          <Row>
            <Text style={paragraph}>
              Your organization {organizationName} requires multi-factor authentication (MFA) for enhanced security. Please enable it on your account as soon as possible.
            </Text>
          </Row>

          <Row>
            <Section style={infoBox}>
              <Text style={{ ...paragraph, margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '18px' }}>
                Why MFA Matters
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                Multi-factor authentication adds an extra layer of security by requiring a second form of verification, even if your password is compromised.
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                Common methods include:
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 4px 0', paddingLeft: '16px' }}>
                • Time-based one-time passwords (TOTP)
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 4px 0', paddingLeft: '16px' }}>
                • SMS text messages
              </Text>
              <Text style={{ ...paragraph, margin: '0', paddingLeft: '16px' }}>
                • Email verification
              </Text>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Section style={{ textAlign: 'center' as const }}>
              <Button style={button} href={setupUrl}>
                Set Up MFA Now
              </Button>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Text style={warningBox}>
              <strong>Important:</strong> MFA setup is required for your account. Please complete this within 7 days to maintain full access to your organization's resources.
            </Text>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={footer}>
              If you have any questions or need assistance, contact your IT administrator.
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

const infoBox = {
  backgroundColor: '#e3f2fd',
  borderRadius: '4px',
  padding: '16px',
  marginTop: '20px',
  marginBottom: '20px',
  borderLeft: '4px solid #1976d2',
};

const warningBox = {
  backgroundColor: '#fff3e0',
  borderRadius: '4px',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#e65100',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#1976d2',
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

export default MfaReminderEmail;
