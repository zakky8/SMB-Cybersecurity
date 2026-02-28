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

interface BreachAlertProps {
  organizationName: string;
  alertType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  detectedAt: string;
  affectedDevicesCount: number;
  affectedEmployeesCount: number;
  dashboardUrl: string;
}

export const BreachAlertEmail: React.FC<BreachAlertProps> = ({
  organizationName,
  alertType,
  severity,
  title,
  description,
  detectedAt,
  affectedDevicesCount,
  affectedEmployeesCount,
  dashboardUrl,
}) => (
  <Html>
    <Head />
    <Preview>Security breach alert for {organizationName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Section style={{ paddingBottom: '20px' }}>
              <Text style={heading}>Security Breach Alert</Text>
              <Hr style={hr} />
            </Section>
          </Row>

          <Row>
            <Text style={paragraph}>
              A critical security breach has been detected in your organization. Immediate action is required.
            </Text>
          </Row>

          <Row>
            <Section style={alertBox(severity)}>
              <Text style={{ ...paragraph, margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '18px' }}>
                {title}
              </Text>
              <Hr style={{ ...hr, margin: '10px 0' }} />
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Organization:</strong> {organizationName}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Alert Type:</strong> {alertType}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Severity:</strong> <span style={{ color: getSeverityTextColor(severity), fontWeight: 'bold' }}>{severity.toUpperCase()}</span>
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Detected At:</strong> {detectedAt}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Affected Devices:</strong> {affectedDevicesCount}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Affected Employees:</strong> {affectedEmployeesCount}
              </Text>
              <Hr style={{ ...hr, margin: '10px 0' }} />
              <Text style={{ ...paragraph, margin: '0' }}>
                {description}
              </Text>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Text style={warningBox}>
              <strong>Action Required:</strong> Please access your security dashboard immediately to review the full details and take necessary remediation actions.
            </Text>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Section style={{ textAlign: 'center' as const }}>
              <Button style={button} href={dashboardUrl}>
                Review Breach Details
              </Button>
            </Section>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={footer}>
              This is a critical automated security alert from ShieldDesk. Your immediate attention is required.
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
  color: '#d32f2f',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0 0 10px 0',
};

const alertBox = (severity: string) => ({
  backgroundColor: '#fff3e0',
  borderRadius: '4px',
  padding: '20px',
  marginTop: '20px',
  marginBottom: '20px',
  borderLeft: '4px solid #d32f2f',
});

const getSeverityTextColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return '#d32f2f';
    case 'high':
      return '#f57c00';
    case 'medium':
      return '#fbc02d';
    default:
      return '#1976d2';
  }
};

const warningBox = {
  backgroundColor: '#ffe0e0',
  borderRadius: '4px',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#d32f2f',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#d32f2f',
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

export default BreachAlertEmail;
