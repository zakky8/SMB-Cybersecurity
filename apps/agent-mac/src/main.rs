mod config;
mod esf;
mod scanner;
mod dns;
mod reporter;

use log::{info, error, debug};
use std::time::Duration;
use tokio::time::interval;
use uuid::Uuid;

#[tokio::main]
async fn main() {
    env_logger::init();

    info!("ShieldDesk Agent starting on macOS");

    // Load configuration
    let config = match config::load_config() {
        Ok(cfg) => {
            info!("Configuration loaded successfully");
            cfg
        }
        Err(e) => {
            error!("Failed to load configuration: {}", e);
            std::process::exit(1);
        }
    };

    // Initialize reporter
    let reporter = match reporter::Reporter::new(&config) {
        Ok(rep) => {
            info!("Reporter initialized");
            rep
        }
        Err(e) => {
            error!("Failed to initialize reporter: {}", e);
            std::process::exit(1);
        }
    };

    // Start daemon loop
    info!("Starting agent daemon loop");
    run_daemon_loop(&config, &reporter).await;
}

async fn run_daemon_loop(config: &config::AgentConfig, reporter: &reporter::Reporter) {
    let device_id = Uuid::new_v4().to_string();
    info!("Agent device ID: {}", device_id);

    // Initialize modules
    let mut esf_monitor = match esf::ESFMonitor::new(&device_id) {
        Ok(monitor) => {
            info!("ESF monitor initialized");
            Some(monitor)
        }
        Err(e) => {
            error!("Failed to initialize ESF monitor: {}", e);
            None
        }
    };

    let mut file_scanner = match scanner::FileScanner::new(&device_id) {
        Ok(scanner) => {
            info!("File scanner initialized");
            Some(scanner)
        }
        Err(e) => {
            error!("Failed to initialize file scanner: {}", e);
            None
        }
    };

    let mut dns_filter = match dns::DNSFilter::new(&device_id) {
        Ok(filter) => {
            info!("DNS filter initialized");
            Some(filter)
        }
        Err(e) => {
            error!("Failed to initialize DNS filter: {}", e);
            None
        }
    };

    // Main event loop
    let mut event_interval = interval(Duration::from_secs(config.event_check_interval as u64));
    let mut health_check_interval = interval(Duration::from_secs(config.health_check_interval as u64));

    loop {
        tokio::select! {
            _ = event_interval.tick() => {
                // Check for monitored events
                if let Some(ref mut monitor) = esf_monitor {
                    if let Err(e) = monitor.process_events(reporter).await {
                        error!("Error processing ESF events: {}", e);
                    }
                }

                if let Some(ref mut scanner) = file_scanner {
                    if let Err(e) = scanner.scan_quarantine_directory(reporter).await {
                        error!("Error scanning quarantine: {}", e);
                    }
                }

                if let Some(ref mut filter) = dns_filter {
                    if let Err(e) = filter.update_blocklist().await {
                        error!("Error updating DNS blocklist: {}", e);
                    }
                }
            }
            _ = health_check_interval.tick() => {
                // Send health check to backend
                debug!("Sending health check");
                if let Err(e) = reporter.send_health_check(&device_id).await {
                    error!("Health check failed: {}", e);
                }
            }
        }
    }
}
