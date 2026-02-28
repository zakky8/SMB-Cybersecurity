use log::{info, error, debug};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DNSQuery {
    pub query_id: String,
    pub domain: String,
    pub record_type: String,
    pub timestamp: String,
    pub source_ip: String,
    pub result: DNSResult,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DNSResult {
    Allowed,
    Blocked,
    Suspicious,
}

pub struct DNSFilter {
    device_id: String,
    blocklist: HashSet<String>,
    enabled: bool,
    doh_provider: String,
}

impl DNSFilter {
    pub fn new(device_id: &str) -> Result<Self, Box<dyn std::error::Error>> {
        info!("Initializing DNS filter with DoH");

        Ok(DNSFilter {
            device_id: device_id.to_string(),
            blocklist: HashSet::new(),
            enabled: true,
            doh_provider: "https://dns.google/dns-query".to_string(),
        })
    }

    pub async fn update_blocklist(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        debug!("Updating DNS blocklist");

        // Common phishing and malware domains
        let blocklist = vec![
            "malwaresite.com",
            "phishingdomain.net",
            "suspicious-download.xyz",
            "trojan-c2.ru",
        ];

        self.blocklist = blocklist.iter().map(|s| s.to_string()).collect();

        debug!("Blocklist updated with {} domains", self.blocklist.len());

        Ok(())
    }

    pub fn is_blocked(&self, domain: &str) -> bool {
        // Direct match
        if self.blocklist.contains(domain) {
            return true;
        }

        // Subdomain check
        let parts: Vec<&str> = domain.split('.').collect();
        if parts.len() > 1 {
            let base_domain = parts[parts.len() - 2..].join(".");
            if self.blocklist.contains(&base_domain) {
                return true;
            }
        }

        false
    }

    pub fn is_suspicious(&self, domain: &str) -> bool {
        // Check for suspicious patterns
        if domain.contains("--") || domain.contains(".xn--") {
            return true; // Potential IDN homograph attack
        }

        if domain.len() > 63 {
            return true; // Suspiciously long domain
        }

        // Check for high entropy (random looking) domains
        let entropy = self.calculate_entropy(domain);
        if entropy > 4.5 {
            return true;
        }

        false
    }

    fn calculate_entropy(&self, s: &str) -> f64 {
        use std::collections::HashMap;

        let mut char_count: HashMap<char, usize> = HashMap::new();
        for c in s.chars() {
            *char_count.entry(c).or_insert(0) += 1;
        }

        let len = s.len() as f64;
        let mut entropy = 0.0;

        for count in char_count.values() {
            let p = *count as f64 / len;
            entropy -= p * p.log2();
        }

        entropy
    }

    pub async fn filter_query(&self, query: &DNSQuery) -> DNSResult {
        if self.is_blocked(&query.domain) {
            return DNSResult::Blocked;
        }

        if self.is_suspicious(&query.domain) {
            return DNSResult::Suspicious;
        }

        DNSResult::Allowed
    }

    pub fn stop(&mut self) {
        info!("Stopping DNS filter");
        self.enabled = false;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dns_filter_creation() {
        let filter = DNSFilter::new("test-device").unwrap();
        assert_eq!(filter.device_id, "test-device");
        assert!(filter.enabled);
    }

    #[test]
    fn test_entropy_calculation() {
        let filter = DNSFilter::new("test-device").unwrap();
        let entropy1 = filter.calculate_entropy("example");
        let entropy2 = filter.calculate_entropy("xyzabc");
        
        assert!(entropy1 < entropy2);
    }
}
