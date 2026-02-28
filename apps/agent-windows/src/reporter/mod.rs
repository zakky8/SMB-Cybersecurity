use log::{info, error, debug};
use serde::{Deserialize, Serialize};
use crate::config::AgentConfig;
use reqwest::Client;
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatReport {
    pub report_id: String,
    pub device_id: String,
    pub threat_type: String,
    pub threat_name: String,
    pub severity: String,
    pub file_path: Option<String>,
    pub process_id: Option<u32>,
    pub process_name: Option<String>,
    pub timestamp: String,
    pub action_taken: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheck {
    pub device_id: String,
    pub status: String,
    pub agent_version: String,
    pub os_version: String,
    pub timestamp: String,
}

pub struct Reporter {
    client: Client,
    api_url: String,
    api_token: String,
    organization_id: String,
}

impl Reporter {
    pub fn new(config: &AgentConfig) -> Result<Self, Box<dyn std::error::Error>> {
        info!("Initializing reporter");

        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.threat_report_timeout as u64))
            .build()?;

        Ok(Reporter {
            client,
            api_url: config.api_url.clone(),
            api_token: config.api_token.clone(),
            organization_id: config.organization_id.clone(),
        })
    }

    pub async fn report_threat(
        &self,
        device_id: &str,
        threat_name: &str,
        threat_type: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        debug!("Reporting threat: {}", threat_name);

        let threat = ThreatReport {
            report_id: uuid::Uuid::new_v4().to_string(),
            device_id: device_id.to_string(),
            threat_type: threat_type.to_string(),
            threat_name: threat_name.to_string(),
            severity: "high".to_string(),
            file_path: None,
            process_id: None,
            process_name: None,
            timestamp: Utc::now().to_rfc3339(),
            action_taken: "quarantined".to_string(),
        };

        self.send_threat_report(&threat).await
    }

    async fn send_threat_report(&self, threat: &ThreatReport) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/api/v1/threats", self.api_url);

        let response = self.client
            .post(&url)
            .bearer_auth(&self.api_token)
            .header("X-Organization-Id", &self.organization_id)
            .json(threat)
            .send()
            .await?;

        if response.status().is_success() {
            debug!("Threat report sent successfully");
            Ok(())
        } else {
            error!("Failed to send threat report: {}", response.status());
            Err(format!("HTTP {}", response.status()).into())
        }
    }

    pub async fn send_health_check(&self, device_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        debug!("Sending health check");

        let health_check = HealthCheck {
            device_id: device_id.to_string(),
            status: "online".to_string(),
            agent_version: "1.0.0".to_string(),
            os_version: Self::get_os_version(),
            timestamp: Utc::now().to_rfc3339(),
        };

        let url = format!("{}/api/v1/devices/{}/health", self.api_url, device_id);

        let response = self.client
            .post(&url)
            .bearer_auth(&self.api_token)
            .header("X-Organization-Id", &self.organization_id)
            .json(&health_check)
            .send()
            .await?;

        if response.status().is_success() {
            debug!("Health check sent successfully");
            Ok(())
        } else {
            error!("Failed to send health check: {}", response.status());
            Err(format!("HTTP {}", response.status()).into())
        }
    }

    pub async fn send_event(&self, device_id: &str, event_type: &str, event_data: &serde_json::Value) -> Result<(), Box<dyn std::error::Error>> {
        debug!("Sending event: {}", event_type);

        let url = format!("{}/api/v1/devices/{}/events", self.api_url, device_id);

        let payload = serde_json::json!({
            "event_type": event_type,
            "data": event_data,
            "timestamp": Utc::now().to_rfc3339(),
        });

        let response = self.client
            .post(&url)
            .bearer_auth(&self.api_token)
            .header("X-Organization-Id", &self.organization_id)
            .json(&payload)
            .send()
            .await?;

        if response.status().is_success() {
            debug!("Event sent successfully");
            Ok(())
        } else {
            error!("Failed to send event: {}", response.status());
            Err(format!("HTTP {}", response.status()).into())
        }
    }

    fn get_os_version() -> String {
        #[cfg(target_os = "windows")]
        {
            "Windows 10 or later".to_string()
        }

        #[cfg(not(target_os = "windows"))]
        {
            "unknown".to_string()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reporter_creation() {
        let config = AgentConfig {
            api_url: "https://api.test.com".to_string(),
            api_token: "test_token".to_string(),
            organization_id: "org_123".to_string(),
            ..Default::default()
        };

        let reporter = Reporter::new(&config);
        assert!(reporter.is_ok());
    }
}
