import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import * as handlebars from "handlebars";

const sesClient = new SESClient({ region: process.env.AWS_REGION || "us-east-1" });
const fromEmail = process.env.SES_FROM_EMAIL || "noreply@shielddesk.io";

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

const templates = {
  employeeInvite: handlebars.compile(`
    <h2>Welcome to ShieldDesk</h2>
    <p>Hi {{firstName}},</p>
    <p>You've been invited to join {{organizationName}} on ShieldDesk, a comprehensive cybersecurity platform for SMBs.</p>
    <p><a href="{{inviteLink}}">Accept Invitation</a></p>
    <p>This link expires in 7 days.</p>
  `),

  threatAlert: handlebars.compile(`
    <h2>Security Alert: Threat Detected</h2>
    <p>A threat has been detected on {{deviceName}}:</p>
    <ul>
      <li><strong>Threat:</strong> {{threatName}}</li>
      <li><strong>Severity:</strong> {{severity}}</li>
      <li><strong>Detected:</strong> {{detectedAt}}</li>
    </ul>
    <p><a href="{{dashboardLink}}">View Details</a></p>
  `),

  breachAlert: handlebars.compile(`
    <h2>Data Breach Alert</h2>
    <p>Your organization may have been affected by the {{breachName}} breach.</p>
    <p><strong>Affected Date:</strong> {{breachDate}}</p>
    <p>Please take immediate action to secure affected accounts.</p>
    <p><a href="{{dashboardLink}}">View Affected Employees</a></p>
  `),

  phishingSimulation: handlebars.compile(`
    <p>Hi {{firstName}},</p>
    <p>This is a security awareness test. Please be cautious of suspicious emails.</p>
    <p><a href="{{simulationLink}}">Click here to proceed</a></p>
    <p>If you believe this is a phishing attempt, please report it.</p>
  `),

  trainingReminder: handlebars.compile(`
    <h2>Security Training Reminder</h2>
    <p>Hi {{firstName}},</p>
    <p>You have pending security training modules to complete:</p>
    <ul>
      {{#each modules}}
      <li>{{this.title}} ({{this.duration}} minutes)</li>
      {{/each}}
    </ul>
    <p><a href="{{trainingLink}}">Start Training</a></p>
  `),

  weeklyReport: handlebars.compile(`
    <h2>Weekly Security Report</h2>
    <p>Hi {{adminName}},</p>
    <p>Here's your organization's security summary for the week:</p>
    <ul>
      <li><strong>Security Score:</strong> {{securityScore}}/100</li>
      <li><strong>Threats Detected:</strong> {{threatsCount}}</li>
      <li><strong>Devices Scanned:</strong> {{devicesScanned}}</li>
      <li><strong>Training Completion:</strong> {{trainingCompletion}}%</li>
    </ul>
    <p><a href="{{reportLink}}">View Full Report</a></p>
  `),

  passwordBreach: handlebars.compile(`
    <h2>Account Security Alert</h2>
    <p>Hi {{firstName}},</p>
    <p>Your password was found in a public data breach. Please change your password immediately.</p>
    <p><a href="{{resetLink}}">Reset Password</a></p>
  `),

  mfaReminder: handlebars.compile(`
    <h2>Enable Multi-Factor Authentication</h2>
    <p>Hi {{firstName}},</p>
    <p>To improve security, please enable MFA on your account.</p>
    <p><a href="{{mfaLink}}">Enable MFA</a></p>
  `),

  offboarding: handlebars.compile(`
    <h2>Employee Offboarding Initiated</h2>
    <p>The offboarding process for {{employeeName}} has been initiated.</p>
    <p>Their access will be revoked shortly.</p>
  `),
};

export async function sendEmail(
  to: string,
  template: keyof typeof templates,
  data: Record<string, any>
): Promise<void> {
  const templateFn = templates[template];
  if (!templateFn) {
    throw new Error(`Template ${template} not found`);
  }

  const html = templateFn(data);
  const subject = getSubject(template, data);

  const params: SendEmailCommandInput = {
    Source: fromEmail,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

function getSubject(template: keyof typeof templates, data: Record<string, any>): string {
  const subjects: Record<keyof typeof templates, string> = {
    employeeInvite: "You're invited to ShieldDesk",
    threatAlert: `Security Alert: ${data.threatName || "Threat"} Detected`,
    breachAlert: `Data Breach Alert: ${data.breachName || "Breach"}`,
    phishingSimulation: "Security Awareness Test",
    trainingReminder: "Complete Your Security Training",
    weeklyReport: "Your Weekly Security Report",
    passwordBreach: "Account Security Alert",
    mfaReminder: "Enable Multi-Factor Authentication",
    offboarding: "Employee Offboarding Initiated",
  };

  return subjects[template] || "ShieldDesk Notification";
}

export async function sendBulkEmail(
  recipients: string[],
  template: keyof typeof templates,
  dataArray: Record<string, any>[]
): Promise<void> {
  const promises = recipients.map((to, index) =>
    sendEmail(to, template, dataArray[index] || {})
  );
  await Promise.allSettled(promises);
}

export default { sendEmail, sendBulkEmail };
