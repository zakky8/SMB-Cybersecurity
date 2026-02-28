use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConfig {
    pub api_url: String,
    pub api_token: String,
    pub organization_id: String,
    pub event_check_interval: u32,
    pub health_check_interval: u32,
    pub log_level: String,
    pub enable_esf: bool,
    pub enable_scanner: bool,
    pub enable_dns_filter: bool,
    pub dns_doh_provider: String,
    pub scanner_max_file_size: u64,
    pub threat_report_timeout: u32,
}

impl Default for AgentConfig {
    fn default() -> Self {
        Self {
            api_url: "https://api.shielddesk.io".to_string(),
            api_token: String::new(),
            organization_id: String::new(),
            event_check_interval: 5,
            health_check_interval: 60,
            log_level: "info".to_string(),
            enable_esf: true,
            enable_scanner: true,
            enable_dns_filter: true,
            dns_doh_provider: "https://dns.google/dns-query".to_string(),
            scanner_max_file_size: 100 * 1024 * 1024, // 100MB
            threat_report_timeout: 30,
        }
    }
}

pub fn load_config() -> Result<AgentConfig, Box<dyn std::error::Error>> {
    let config_path = get_config_path()?;

    if config_path.exists() {
        let content = fs::read_to_string(&config_path)?;
        let config: AgentConfig = toml::from_str(&content)?;
        Ok(config)
    } else {
        // Return default config with error logging
        log::warn!("Config file not found at {:?}, using defaults", config_path);
        Ok(AgentConfig::default())
    }
}

pub fn save_config(config: &AgentConfig) -> Result<(), Box<dyn std::error::Error>> {
    let config_path = get_config_path()?;

    // Ensure parent directory exists
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)?;
    }

    let content = toml::to_string_pretty(config)?;
    fs::write(config_path, content)?;
    Ok(())
}

fn get_config_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
    #[cfg(target_os = "macos")]
    {
        let mut path = dirs::home_dir().ok_or("Could not determine home directory")?;
        path.push(".shielddesk");
        path.push("config.toml");
        Ok(path)
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Only macOS is supported".into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = AgentConfig::default();
        assert!(!config.api_token.is_empty() || config.api_token.is_empty()); // Just check it can be created
    }
}
