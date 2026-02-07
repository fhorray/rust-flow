use clap::{Parser, Subcommand};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    #[arg(long, default_value = "false")]
    json: bool,
}

#[derive(Subcommand)]
enum Commands {
    Test { path: String },
}

#[derive(Serialize)]
struct SRPOutput {
    success: bool,
    summary: String,
    diagnostics: Vec<SRPDiagnostic>,
    tests: Vec<SRPTest>,
    raw: String,
}

#[derive(Serialize)]
struct SRPDiagnostic {
    severity: String,
    message: String,
    file: Option<String>,
    line: Option<u64>,
    snippet: Option<String>,
}

#[derive(Serialize)]
#[allow(dead_code)]
struct SRPTest {
    name: String,
    status: String, // "pass", "fail"
    message: Option<String>,
}

// Cargo JSON strutures (partial)
#[derive(Deserialize)]
#[allow(dead_code)]
struct CargoMessage {
    reason: String,
    // ... other fields depend on reason
    message: Option<DiagnosticMessage>,
    target: Option<CargoTarget>,
    profile: Option<CargoProfile>,
    success: Option<bool>,  // for build-finished
    name: Option<String>,   // for test
    event: Option<String>,  // for test
    stdout: Option<String>, // for test
}

#[derive(Deserialize)]
#[allow(dead_code)]
struct DiagnosticMessage {
    message: String,
    level: String,
    spans: Vec<DiagnosticSpan>,
    rendered: Option<String>,
}

#[derive(Deserialize)]
struct DiagnosticSpan {
    file_name: String,
    line_start: u64,
    text: Vec<SpanText>,
}

#[derive(Deserialize)]
struct SpanText {
    text: String,
}

#[derive(Deserialize)]
#[allow(dead_code)]
struct CargoTarget {
    name: String,
}

#[derive(Deserialize)]
#[allow(dead_code)]
struct CargoProfile {
    test: bool,
}

fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Test { path } => {
            run_test(path);
        }
    }
}

fn run_test(path: &str) {
    let manifest_path = if path.ends_with("Cargo.toml") {
        path.to_string()
    } else {
        format!("{}/Cargo.toml", path)
    };

    if !Path::new(&manifest_path).exists() {
        eprintln!("Error: Cargo.toml not found at {}", manifest_path);
        std::process::exit(1);
    }

    // 1. Run cargo test with JSON output
    let output = Command::new("cargo")
        .args(&[
            "test",
            "--manifest-path",
            &manifest_path,
            "--message-format",
            "json",
            "--quiet",
        ])
        .output()
        .expect("Failed to execute cargo");

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    let mut srp = SRPOutput {
        success: output.status.success(),
        summary: String::new(),
        diagnostics: Vec::new(),
        tests: Vec::new(),
        raw: format!("{}", stdout), // We might want combined output
    };

    // 2. Parse JSON output line by line
    for line in stdout.lines() {
        if let Ok(msg) = serde_json::from_str::<CargoMessage>(line) {
            match msg.reason.as_str() {
                "compiler-message" => {
                    if let Some(diag) = msg.message {
                        // Skip warnings if strictly running? Or keep them?
                        // For now keep errors and warnings
                        let mut snippet = None;
                        let mut file = None;
                        let mut line_num = None;

                        if let Some(span) = diag.spans.first() {
                            file = Some(span.file_name.clone());
                            line_num = Some(span.line_start);
                            snippet = Some(
                                span.text
                                    .iter()
                                    .map(|t| t.text.clone())
                                    .collect::<Vec<_>>()
                                    .join("\n"),
                            );
                        }

                        srp.diagnostics.push(SRPDiagnostic {
                            severity: diag.level,
                            message: diag.message,
                            file,
                            line: line_num,
                            snippet,
                        });
                    }
                }
                "test" => {
                    // "event": "ok" / "failed", "name": "tests::test_name"
                    if let (Some(event), Some(name)) = (msg.event, msg.name) {
                        if event == "started" {
                            continue;
                        }

                        let status = if event == "ok" { "pass" } else { "fail" };
                        let message = msg.stdout; // Captured stdout of the test?

                        srp.tests.push(SRPTest {
                            name,
                            status: status.to_string(),
                            message,
                        });
                    }
                }
                "build-finished" => {
                    if let Some(success) = msg.success {
                        if !success {
                            srp.success = false;
                            if srp.summary.is_empty() {
                                srp.summary = "Build failed".to_string();
                            }
                        }
                    }
                }
                _ => {}
            }
        }
    }

    if srp.success {
        srp.summary = "All checks passed!".to_string();
    } else {
        srp.summary = if !stderr.trim().is_empty() {
            format!("Refused to compile. Raw error:\n{}", stderr)
        } else {
            "Refused to compile or tests failed (no error captured)".to_string()
        };
    }

    println!("__SRP_BEGIN__");
    let json_out = serde_json::to_string_pretty(&srp).unwrap();
    println!("{}", json_out);
    println!("__SRP_END__");
}
