use crate::ai::{get_ai_backend, AiBackend};
use crate::config::AppConfig;
use anyhow::{anyhow, Context, Result};
use chrono::Local;
use colored::*;
use regex::Regex;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

pub struct ExerciseGenerator {
    config: AppConfig,
}

impl ExerciseGenerator {
    pub fn new(config: AppConfig) -> Self {
        Self { config }
    }

    pub fn generate_exercise(&self, topic: &str) -> Result<PathBuf> {
        let backend = get_ai_backend(&self.config)?;

        println!("{}", format!("Generating exercise for topic: '{}'...", topic).cyan());

        // Retry loop (simple 1 retry for now if compilation fails)
        let mut attempts = 0;
        let max_attempts = 3;
        let mut current_error: Option<String> = None;

        while attempts < max_attempts {
            attempts += 1;
            println!("{}", format!("Attempt {}/{}...", attempts, max_attempts).yellow());

            let system_prompt = "You are an expert Rust tutor. Create a Rust exercise file.
The file MUST be a self-contained Rust file that compiles.
It MUST include at least one `#[test]` function to verify the solution.
The user's task is usually to fix a function or implement logic so the test passes.
However, since this is a generated exercise, please provide a working solution or a scaffolding that is easy to understand.
Ideally, provide a function that needs implementation but make the test fail initially (or pass if it's a demo).
Actually, to ensure no hallucinations, provide a COMPLETE WORKING example with passing tests, and I (the system) will present it to the user to study or modify.
Wrap the code strictly in ```rust ... ``` markdown block. Do not include other text outside the block if possible.";

            let user_prompt = if let Some(err) = &current_error {
                format!("The previous code you generated failed to compile with this error:\n{}\n\nPlease fix it and regenerate the exercise about {}.", err, topic)
            } else {
                format!("Create a Rust exercise about '{}'.", topic)
            };

            let response = backend.generate(&user_prompt, system_prompt)?;
            let code = self.extract_code(&response).context("Failed to extract Rust code from AI response")?;

            // Try to compile
            match self.verify_code(&code) {
                Ok(_) => {
                    // Save to practice folder
                    let timestamp = Local::now().format("%Y%m%d_%H%M%S");
                    let sanitized_topic = topic.replace(" ", "_").to_lowercase();
                    let filename = format!("practice_{}_{}.rs", sanitized_topic, timestamp);
                    let path = PathBuf::from("src/practice").join(filename);

                    fs::write(&path, code).context("Failed to save exercise file")?;
                    println!("{}", "Exercise generated and verified successfully!".green());
                    return Ok(path);
                }
                Err(e) => {
                    println!("{}", format!("Verification failed: {}", e).red());
                    current_error = Some(e.to_string());
                }
            }
        }

        Err(anyhow!("Failed to generate a valid exercise after {} attempts.", max_attempts))
    }

    fn extract_code(&self, text: &str) -> Option<String> {
        let re = Regex::new(r"```rust\n?([\s\S]*?)```").unwrap();
        if let Some(captures) = re.captures(text) {
            return Some(captures.get(1)?.as_str().to_string());
        }
        // Fallback: if no blocks, maybe the whole text is code?
        // But the prompt specifically asks for blocks.
        // Let's try to just find the first `fn main` or `#[test]` and assume it's code if no blocks found?
        // For now, strict adherence to blocks is safer.
        None
    }

    fn verify_code(&self, code: &str) -> Result<()> {
        let temp_file = "temp_gen_verify.rs";
        let temp_bin = if cfg!(target_os = "windows") { "temp_gen_verify.exe" } else { "temp_gen_verify" };

        fs::write(temp_file, code).context("Failed to write temp file for verification")?;

        // Try to compile as test
        let output = Command::new("rustc")
            .arg("--test")
            .arg(temp_file)
            .arg("-o")
            .arg(temp_bin)
            .output()
            .context("Failed to execute rustc")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let _ = fs::remove_file(temp_file);
            return Err(anyhow!("Compilation failed:\n{}", stderr));
        }

        // Run the binary (tests)
        let run_output = Command::new(format!("./{}", temp_bin))
            .output();

        // Cleanup
        let _ = fs::remove_file(temp_file);
        let _ = fs::remove_file(temp_bin);
         if cfg!(target_os = "windows") {
             let _ = fs::remove_file(format!("{}.pdb", temp_bin.replace(".exe", "")));
         }

        match run_output {
            Ok(out) => {
                if !out.status.success() {
                    let stderr = String::from_utf8_lossy(&out.stderr);
                    let stdout = String::from_utf8_lossy(&out.stdout);
                    return Err(anyhow!("Tests failed:\n{}\n{}", stdout, stderr));
                }
            }
            Err(e) => return Err(anyhow!("Failed to run compiled test: {}", e)),
        }

        Ok(())
    }

    pub fn generate_explanation(&self, code: &str, error: Option<&str>) -> Result<String> {
        let backend = get_ai_backend(&self.config)?;
        let system_prompt = "You are a helpful Rust tutor. Explain the code or the error clearly. Use Markdown.";
        let prompt = if let Some(err) = error {
            format!("Here is my Rust code:\n```rust\n{}\n```\n\nIt failed with this error:\n{}\n\nExplain why it failed and how to fix it.", code, err)
        } else {
            format!("Explain this Rust code:\n```rust\n{}\n```", code)
        };
        backend.generate(&prompt, system_prompt)
    }

    pub fn generate_review(&self, code: &str) -> Result<String> {
        let backend = get_ai_backend(&self.config)?;
        let system_prompt = "You are a senior Rust engineer. Review the following code for idiomatic usage, performance, and best practices. Use Markdown.";
        let prompt = format!("Review this Rust code:\n```rust\n{}\n```", code);
        backend.generate(&prompt, system_prompt)
    }
}
