import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";

interface ReportData {
  organizationName: string;
  reportType: string;
  totalScore: number;
  mfaCompliance: number;
  deviceCompliance: number;
  trainingCompletion: number;
  simulationResults: number;
  breachRisk: number;
  threatCount: number;
  deviceCount: number;
}

export async function generatePDFReport(data: ReportData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${data.organizationName}_${data.reportType}_${timestamp}.pdf`;
      const filepath = path.join("/tmp", filename);

      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Title
      doc.fontSize(24).font("Helvetica-Bold").text("Security Report", 100, 100);
      doc.fontSize(12).font("Helvetica").text(data.organizationName, 100, 140);

      // Report metadata
      doc
        .fontSize(10)
        .text(`Report Type: ${data.reportType}`, 100, 170)
        .text(`Generated: ${new Date().toLocaleDateString()}`, 100, 190);

      // Security Score
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Security Score", 100, 240);
      doc
        .fontSize(14)
        .font("Helvetica")
        .text(`Overall Score: ${Math.round(data.totalScore)}/100`, 100, 270);

      // Compliance Metrics
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Compliance Metrics", 100, 320);

      const metrics = [
        { label: "MFA Compliance", value: data.mfaCompliance },
        { label: "Device Compliance", value: data.deviceCompliance },
        { label: "Training Completion", value: data.trainingCompletion },
        { label: "Simulation Pass Rate", value: data.simulationResults },
      ];

      let yPosition = 350;
      for (const metric of metrics) {
        doc
          .fontSize(11)
          .font("Helvetica")
          .text(
            `${metric.label}: ${Math.round(metric.value)}%`,
            120,
            yPosition
          );
        yPosition += 20;
      }

      // Threat Summary
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Threat Summary", 100, yPosition + 30);

      yPosition += 60;
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Total Threats Detected: ${data.threatCount}`, 120, yPosition)
        .text(`Devices Scanned: ${data.deviceCount}`, 120, yPosition + 20)
        .text(`Breach Risk Level: ${calculateRiskLevel(data.breachRisk)}`, 120, yPosition + 40);

      // Recommendations
      yPosition += 80;
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Recommendations", 100, yPosition);

      yPosition += 30;
      const recommendations = generateRecommendations(data);
      for (const rec of recommendations) {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`• ${rec}`, 120, yPosition, { width: 400 });
        yPosition += 20;
      }

      // Footer
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          `ShieldDesk Security Report - Confidential`,
          50,
          doc.page.height - 50,
          { align: "center" }
        );

      doc.end();

      stream.on("finish", () => {
        resolve(`/reports/${filename}`);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function calculateRiskLevel(
  breachRisk: number
): "Low" | "Medium" | "High" | "Critical" {
  if (breachRisk < 10) return "Low";
  if (breachRisk < 50) return "Medium";
  if (breachRisk < 100) return "High";
  return "Critical";
}

function generateRecommendations(data: ReportData): string[] {
  const recommendations: string[] = [];

  if (data.mfaCompliance < 80) {
    recommendations.push("Increase MFA adoption across the organization");
  }

  if (data.deviceCompliance < 75) {
    recommendations.push("Ensure all devices have disk encryption enabled");
  }

  if (data.trainingCompletion < 70) {
    recommendations.push(
      "Improve security awareness training completion rates"
    );
  }

  if (data.simulationResults < 50) {
    recommendations.push(
      "Provide additional phishing awareness training based on simulation results"
    );
  }

  if (data.threatCount > 10) {
    recommendations.push("Review and remediate detected threats immediately");
  }

  if (recommendations.length === 0) {
    recommendations.push("Continue current security practices and monitor regularly");
  }

  return recommendations;
}
