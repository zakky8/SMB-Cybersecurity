import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface ThreatDetectedProps {
  organizationName: string;
  employeeEmail: string;
  deviceName: string;
  threatType: string;
  threatName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  detectedAt: string;
  actionTaken: string;
  dashboardUrl: string;
}

const baseUrl = process.env.REACT_EMAIL_BASE_URL || 'https://app.shielddesk.io';

export const ThreatDetectedEmail: React.FC<ThreatDetectedProps> = ({
  organizationName,
  employeeEmail,
  deviceName,
  threatType,
  threatName,
  severity,
  detectedAt,
  actionTaken,
  dashboardUrl,
}) => (
  <Html>
    <Head />
    <Preview>Threat detected on {deviceName} at {detectedAt}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Section style={{ paddingBottom: '20px' }}>
              <Text style={heading}>Threat Detection Alert</Text>
              <Hr style={hr} />
            </Section>
          </Row>

          <Row>
            <Text style={paragraph}>
              A {severity} severity threat has been detected on a device in your organization.
            </Text>
          </Row>

          <Row>
            <Section style={alertBox(severity)}>
              <Text style={{ ...paragraph, margin: '0 0 10px 0', fontWeight: 'bold' }}>
                Threat Details:
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Organization:</strong> {organizationName}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Employee:</strong> {employeeEmail}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Device:</strong> {deviceName}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Threat Type:</strong> {threatType}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Threat Name:</strong> {threatName}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Severity:</strong> {severity.toUpperCase()}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Detected At:</strong> {detectedAt}
              </Text>
              <Text style={{ ...paragraph, margin: '0' }}>
                <strong>Action Taken:</strong> {actionTaken}
              </Text>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Section style={{ textAlign: 'center' as const }}>
              <Button style={button} href={dashboardUrl}>
                View in Dashboard
              </Button>
            </Section>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={footer}>
              This is an automated security alert from ShieldDesk. Please do not reply to this email.
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

const alertBox = (severity: string) => ({
  backgroundColor: getSeverityColor(severity),
  borderRadius: '4px',
  padding: '16px',
  marginTop: '20px',
  marginBottom: '20px',
});

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return '#ffe0e0';
    case 'high':
      return '#fff4e0';
    case 'medium':
      return '#fff9e0';
    default:
      return '#f0f4ff';
  }
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

export default ThreatDetectedEmail;
