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

interface SimulationClickedProps {
  organizationName: string;
  employeeName: string;
  employeeEmail: string;
  campaignName: string;
  clickedAt: string;
  trainingUrl: string;
  dashboardUrl: string;
}

export const SimulationClickedEmail: React.FC<SimulationClickedProps> = ({
  organizationName,
  employeeName,
  employeeEmail,
  campaignName,
  clickedAt,
  trainingUrl,
  dashboardUrl,
}) => (
  <Html>
    <Head />
    <Preview>Phishing simulation clicked by {employeeName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Section style={{ paddingBottom: '20px' }}>
              <Text style={heading}>Phishing Simulation Result</Text>
              <Hr style={hr} />
            </Section>
          </Row>

          <Row>
            <Text style={paragraph}>
              An employee has clicked on a phishing simulation link. This is an opportunity to provide immediate training.
            </Text>
          </Row>

          <Row>
            <Section style={alertBox}>
              <Text style={{ ...paragraph, margin: '0 0 10px 0', fontWeight: 'bold' }}>
                Simulation Details:
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Organization:</strong> {organizationName}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Employee:</strong> {employeeName} ({employeeEmail})
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Campaign:</strong> {campaignName}
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0' }}>
                <strong>Clicked At:</strong> {clickedAt}
              </Text>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Section style={{ textAlign: 'center' as const }}>
              <Button style={button} href={trainingUrl}>
                Assign Training Module
              </Button>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Section style={{ textAlign: 'center' as const }}>
              <Button style={secondaryButton} href={dashboardUrl}>
                View Full Results
              </Button>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Text style={infoBox}>
              <strong>Did you know?</strong> Employees who complete security training after a phishing simulation are 90% less likely to fall for similar attacks in the future.
            </Text>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={footer}>
              This is an automated notification from ShieldDesk. Do not reply to this email.
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
  backgroundColor: '#fff9e6',
  borderRadius: '4px',
  padding: '16px',
  marginTop: '20px',
  marginBottom: '20px',
  borderLeft: '4px solid #fbc02d',
};

const infoBox = {
  backgroundColor: '#e3f2fd',
  borderRadius: '4px',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#1565c0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#ff6f00',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const secondaryButton = {
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

export default SimulationClickedEmail;
