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

interface WeeklyDigestProps {
  organizationName: string;
  weekStart: string;
  weekEnd: string;
  threatsDetected: number;
  threatsResolved: number;
  newDevices: number;
  trainingCompleted: number;
  securityScore: number;
  topThreatType: string;
  dashboardUrl: string;
}

export const WeeklyDigestEmail: React.FC<WeeklyDigestProps> = ({
  organizationName,
  weekStart,
  weekEnd,
  threatsDetected,
  threatsResolved,
  newDevices,
  trainingCompleted,
  securityScore,
  topThreatType,
  dashboardUrl,
}) => (
  <Html>
    <Head />
    <Preview>Weekly security digest for {organizationName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Section style={{ paddingBottom: '20px' }}>
              <Text style={heading}>Weekly Security Digest</Text>
              <Text style={subheading}>
                {weekStart} - {weekEnd}
              </Text>
              <Hr style={hr} />
            </Section>
          </Row>

          <Row>
            <Text style={paragraph}>
              Here's a summary of security events and activities for {organizationName} this week.
            </Text>
          </Row>

          <Row>
            <Section style={{ marginTop: '20px', marginBottom: '20px' }}>
              <Row style={{ marginBottom: '12px' }}>
                <Section style={{ ...statBox, marginRight: '12px' }}>
                  <Text style={statNumber}>{threatsDetected}</Text>
                  <Text style={statLabel}>Threats Detected</Text>
                </Section>
                <Section style={statBox}>
                  <Text style={statNumber}>{threatsResolved}</Text>
                  <Text style={statLabel}>Threats Resolved</Text>
                </Section>
              </Row>
              <Row style={{ marginBottom: '12px' }}>
                <Section style={{ ...statBox, marginRight: '12px' }}>
                  <Text style={statNumber}>{newDevices}</Text>
                  <Text style={statLabel}>New Devices</Text>
                </Section>
                <Section style={statBox}>
                  <Text style={statNumber}>{trainingCompleted}</Text>
                  <Text style={statLabel}>Trainings Completed</Text>
                </Section>
              </Row>
            </Section>
          </Row>

          <Row>
            <Section style={summaryBox}>
              <Text style={{ ...paragraph, margin: '0 0 10px 0', fontWeight: 'bold' }}>
                Key Metrics:
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Security Score:</strong> {securityScore}/100
              </Text>
              <Text style={{ ...paragraph, margin: '0' }}>
                <strong>Most Common Threat:</strong> {topThreatType}
              </Text>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Section style={{ textAlign: 'center' as const }}>
              <Button style={button} href={dashboardUrl}>
                View Detailed Report
              </Button>
            </Section>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={footer}>
              This is an automated weekly digest from ShieldDesk. Do not reply to this email.
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
  margin: '0 0 5px 0',
};

const subheading = {
  color: '#898989',
  fontSize: '14px',
  margin: '0',
  fontStyle: 'italic' as const,
};

const statBox = {
  backgroundColor: '#f0f4ff',
  borderRadius: '4px',
  padding: '16px',
  textAlign: 'center' as const,
  flex: 1,
};

const statNumber = {
  color: '#5469d4',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  margin: '0 0 8px 0',
};

const statLabel = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0',
};

const summaryBox = {
  backgroundColor: '#f9f9f9',
  borderRadius: '4px',
  padding: '16px',
  marginTop: '20px',
  marginBottom: '20px',
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

export default WeeklyDigestEmail;
