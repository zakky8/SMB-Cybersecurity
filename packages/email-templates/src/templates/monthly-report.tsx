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

interface MonthlyReportProps {
  organizationName: string;
  month: string;
  year: number;
  totalThreatsDetected: number;
  totalThreatsResolved: number;
  avgResolutionTime: number;
  complianceScore: number;
  securityScore: number;
  employeeTrainingRate: number;
  mfaEnrollmentRate: number;
  reportUrl: string;
}

export const MonthlyReportEmail: React.FC<MonthlyReportProps> = ({
  organizationName,
  month,
  year,
  totalThreatsDetected,
  totalThreatsResolved,
  avgResolutionTime,
  complianceScore,
  securityScore,
  employeeTrainingRate,
  mfaEnrollmentRate,
  reportUrl,
}) => (
  <Html>
    <Head />
    <Preview>Monthly security report for {organizationName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Section style={{ paddingBottom: '20px' }}>
              <Text style={heading}>Monthly Security Report</Text>
              <Text style={subheading}>{month} {year}</Text>
              <Hr style={hr} />
            </Section>
          </Row>

          <Row>
            <Text style={paragraph}>
              Thank you for using ShieldDesk. Here's a comprehensive summary of {organizationName}'s security posture for {month} {year}.
            </Text>
          </Row>

          <Row>
            <Section style={metricsGrid}>
              <Row style={{ marginBottom: '12px' }}>
                <Section style={{ ...metricBox, marginRight: '12px' }}>
                  <Text style={metricValue}>{totalThreatsDetected}</Text>
                  <Text style={metricLabel}>Threats Detected</Text>
                </Section>
                <Section style={metricBox}>
                  <Text style={metricValue}>{totalThreatsResolved}</Text>
                  <Text style={metricLabel}>Threats Resolved</Text>
                </Section>
              </Row>
              <Row style={{ marginBottom: '12px' }}>
                <Section style={{ ...metricBox, marginRight: '12px' }}>
                  <Text style={metricValue}>{avgResolutionTime}h</Text>
                  <Text style={metricLabel}>Avg Resolution Time</Text>
                </Section>
                <Section style={metricBox}>
                  <Text style={metricValue}>{complianceScore}%</Text>
                  <Text style={metricLabel}>Compliance Score</Text>
                </Section>
              </Row>
            </Section>
          </Row>

          <Row>
            <Section style={summarySection}>
              <Text style={{ ...paragraph, margin: '0 0 12px 0', fontWeight: 'bold', fontSize: '18px' }}>
                Key Performance Indicators
              </Text>
              <Row style={{ marginBottom: '10px' }}>
                <Section style={{ width: '60%', paddingRight: '12px' }}>
                  <Text style={{ ...paragraph, margin: '0' }}>Security Score</Text>
                </Section>
                <Section style={{ width: '40%', textAlign: 'right' as const }}>
                  <Text style={{ ...paragraph, margin: '0', fontWeight: 'bold' }}>{securityScore}/100</Text>
                </Section>
              </Row>
              <Row style={{ marginBottom: '10px' }}>
                <Section style={{ width: '60%', paddingRight: '12px' }}>
                  <Text style={{ ...paragraph, margin: '0' }}>Employee Training Rate</Text>
                </Section>
                <Section style={{ width: '40%', textAlign: 'right' as const }}>
                  <Text style={{ ...paragraph, margin: '0', fontWeight: 'bold' }}>{employeeTrainingRate}%</Text>
                </Section>
              </Row>
              <Row>
                <Section style={{ width: '60%', paddingRight: '12px' }}>
                  <Text style={{ ...paragraph, margin: '0' }}>MFA Enrollment Rate</Text>
                </Section>
                <Section style={{ width: '40%', textAlign: 'right' as const }}>
                  <Text style={{ ...paragraph, margin: '0', fontWeight: 'bold' }}>{mfaEnrollmentRate}%</Text>
                </Section>
              </Row>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Section style={{ textAlign: 'center' as const }}>
              <Button style={button} href={reportUrl}>
                Download Full Report
              </Button>
            </Section>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={footer}>
              This is an automated monthly report from ShieldDesk. Do not reply to this email. To manage your notification preferences, visit your account settings.
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
};

const metricsGrid = {
  marginTop: '20px',
  marginBottom: '20px',
};

const metricBox = {
  backgroundColor: '#f0f4ff',
  borderRadius: '4px',
  padding: '16px',
  textAlign: 'center' as const,
  flex: 1,
};

const metricValue = {
  color: '#5469d4',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  margin: '0 0 8px 0',
};

const metricLabel = {
  color: '#525f7f',
  fontSize: '13px',
  margin: '0',
};

const summarySection = {
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

export default MonthlyReportEmail;
