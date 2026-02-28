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

interface TrialExpiringProps {
  organizationName: string;
  daysRemaining: number;
  trialEndDate: string;
  upgradeUrl: string;
  contactUrl: string;
}

export const TrialExpiringEmail: React.FC<TrialExpiringProps> = ({
  organizationName,
  daysRemaining,
  trialEndDate,
  upgradeUrl,
  contactUrl,
}) => (
  <Html>
    <Head />
    <Preview>Your ShieldDesk trial is expiring soon</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Section style={{ paddingBottom: '20px' }}>
              <Text style={heading}>Your Trial is Expiring Soon</Text>
              <Hr style={hr} />
            </Section>
          </Row>

          <Row>
            <Text style={paragraph}>
              Hi {organizationName},
            </Text>
          </Row>

          <Row>
            <Text style={paragraph}>
              Your ShieldDesk trial period is ending in <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong> ({trialEndDate}). Upgrade to a paid plan to continue enjoying advanced security features.
            </Text>
          </Row>

          <Row>
            <Section style={highlightBox}>
              <Text style={{ ...paragraph, margin: '0 0 12px 0', fontWeight: 'bold', fontSize: '18px' }}>
                What You'll Lose After Trial Ends
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0', paddingLeft: '16px' }}>
                • Advanced threat detection and response
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0', paddingLeft: '16px' }}>
                • Phishing simulation campaigns
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0', paddingLeft: '16px' }}>
                • Security training modules
              </Text>
              <Text style={{ ...paragraph, margin: '0 0 8px 0', paddingLeft: '16px' }}>
                • Real-time threat monitoring
              </Text>
              <Text style={{ ...paragraph, margin: '0', paddingLeft: '16px' }}>
                • Compliance reporting and audits
              </Text>
            </Section>
          </Row>

          <Row>
            <Section style={plansSection}>
              <Text style={{ ...paragraph, margin: '0 0 12px 0', fontWeight: 'bold', fontSize: '18px' }}>
                Choose Your Plan
              </Text>
              <Row style={{ marginBottom: '12px' }}>
                <Section style={{ ...planBox, marginRight: '12px' }}>
                  <Text style={planName}>Pro</Text>
                  <Text style={planPrice}>$299/mo</Text>
                  <Text style={planFeature}>Up to 250 users</Text>
                  <Text style={planFeature}>All core features</Text>
                </Section>
                <Section style={planBox}>
                  <Text style={planName}>Enterprise</Text>
                  <Text style={planPrice}>Custom</Text>
                  <Text style={planFeature}>Unlimited users</Text>
                  <Text style={planFeature}>Premium support</Text>
                </Section>
              </Row>
            </Section>
          </Row>

          <Row style={{ marginTop: '20px' }}>
            <Section style={{ textAlign: 'center' as const }}>
              <Button style={primaryButton} href={upgradeUrl}>
                Upgrade Now
              </Button>
            </Section>
          </Row>

          <Row style={{ marginTop: '12px' }}>
            <Section style={{ textAlign: 'center' as const }}>
              <Button style={secondaryButton} href={contactUrl}>
                Talk to Sales
              </Button>
            </Section>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={footer}>
              Questions? Contact our sales team at sales@shielddesk.io or visit our pricing page. This is an automated message from ShieldDesk.
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

const highlightBox = {
  backgroundColor: '#fff3e0',
  borderRadius: '4px',
  padding: '16px',
  marginTop: '20px',
  marginBottom: '20px',
  borderLeft: '4px solid #ff6f00',
};

const plansSection = {
  backgroundColor: '#f9f9f9',
  borderRadius: '4px',
  padding: '16px',
  marginTop: '20px',
  marginBottom: '20px',
};

const planBox = {
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  padding: '12px',
  border: '1px solid #e0e0e0',
  textAlign: 'center' as const,
  flex: 1,
};

const planName = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  margin: '0 0 4px 0',
};

const planPrice = {
  color: '#5469d4',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  margin: '0 0 8px 0',
};

const planFeature = {
  color: '#525f7f',
  fontSize: '13px',
  margin: '0 0 4px 0',
};

const primaryButton = {
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

const secondaryButton = {
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  color: '#5469d4',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  border: '2px solid #5469d4',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  marginTop: '20px',
};

export default TrialExpiringEmail;
