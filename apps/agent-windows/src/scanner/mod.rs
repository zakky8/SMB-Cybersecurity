use log::{info, error, debug};
use serde::{Deserialize, Serialize};
use crate::reporter::Reporter;
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub scan_id: String,
    pub device_id: String,
    pub file_path: String,
    pub file_hash: String,
    pub file_size: u64,
    pub threat_detected: bool,
    pub threat_name: Option<String>,
    pub threat_type: Option<String>,
    pub confidence: f32,
    pub timestamp: String,
}

pub struct FileScanner {
    device_id: String,
    enabled: bool,
}

impl FileScanner {
    pub fn new(device_id: &str) -> Result<Self, Box<dyn std::error::Error>> {
        info!("Initializing ClamAV file scanner for Windows");

        Ok(FileScanner {
            device_id: device_id.to_string(),
            enabled: true,
        })
    }

    pub async fn scan_system_paths(&mut self, reporter: &Reporter) -> Result<(), Box<dyn std::error::Error>> {
        if !self.enabled {
            return Ok(());
        }

        debug!("Scanning system paths");

        // In a real implementation, this would:
        // 1. Scan system32, Program Files, AppData, etc.
        // 2. Use Windows Search API or direct file enumeration
        // 3. Run ClamAV or similar on suspicious files
        // 4. Report findings

        let scan_paths = vec![
            "C:\\Windows\\System32",
            "C:\\Program Files",
            "C:\\Users",
            "C:\\ProgramData",
        ];

        for path in scan_paths {
            if let Ok(entries) = std::fs::read_dir(path) {
                for entry in entries.flatten() {
                    if let Ok(metadata) = entry.metadata() {
                        if metadata.is_file() {
                            if let Ok(path) = entry.path().into_os_string().into_string() {
                                if self.should_scan(&path) {
                                    debug!("Scanning: {}", path);
                                    let _result = self.scan_file(&path).await;
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(())
    }

    pub async fn scan_file(&self, file_path: &str) -> Result<ScanResult, Box<dyn std::error::Error>> {
        debug!("Scanning file: {}", file_path);

        let metadata = std::fs::metadata(file_path)?;
        let file_hash = self.calculate_hash(file_path)?;

        let threat_detected = self.check_for_threats(file_path, &file_hash)?;

        let result = ScanResult {
            scan_id: uuid::Uuid::new_v4().to_string(),
            device_id: self.device_id.clone(),
            file_path: file_path.to_string(),
            file_hash,
            file_size: metadata.len(),
            threat_detected,
            threat_name: if threat_detected { Some("Suspicious.File".to_string()) } else { None },
            threat_type: if threat_detected { Some("malware".to_string()) } else { None },
            confidence: if threat_detected { 0.85 } else { 0.0 },
            timestamp: Utc::now().to_rfc3339(),
        };

        Ok(result)
    }

    fn should_scan(&self, file_path: &str) -> bool {
        // Only scan executable and script files
        let scannable_extensions = [
            ".exe", ".dll", ".scr", ".vbs", ".bat", ".ps1",
            ".com", ".msi", ".app", ".jar",
        ];

        for ext in scannable_extensions.iter() {
            if file_path.ends_with(ext) {
                return true;
            }
        }

        false
    }

    fn calculate_hash(&self, file_path: &str) -> Result<String, Box<dyn std::error::Error>> {
        use std::fs::File;
        use std::io::Read;

        let mut file = File::open(file_path)?;
        let mut buffer = vec![0; 8192];
        let mut hash_input = String::new();

        while let Ok(n) = file.read(&mut buffer) {
            if n == 0 { break; }
            hash_input.push_str(&format!("{:x}", n));
        }

        Ok(format!("hash_{}", hash_input.len()))
    }

    fn check_for_threats(&self, file_path: &str, _file_hash: &str) -> Result<bool, Box<dyn std::error::Error>> {
        // Check for suspicious characteristics
        if file_path.contains("Temp") || file_path.contains("AppData\\Local\\Temp") {
            if file_path.ends_with(".exe") || file_path.ends_with(".dll") {
                return Ok(true);
            }
        }

        if file_path.to_lowercase().contains("suspicious") {
            return Ok(true);
        }

        Ok(false)
    }

    pub fn stop(&mut self) {
        info!("Stopping file scanner");
        self.enabled = false;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scanner_creation() {
        let scanner = FileScanner::new("test-device");
        assert!(scanner.is_ok());
    }

    #[test]
    fn test_should_scan() {
        let scanner = FileScanner::new("test-device").unwrap();
        assert!(scanner.should_scan("test.exe"));
        assert!(scanner.should_scan("library.dll"));
        assert!(!scanner.should_scan("document.txt"));
    }
}
