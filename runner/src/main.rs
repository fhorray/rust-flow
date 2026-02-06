use clap::{Parser, Subcommand};
use colored::*;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use walkdir::WalkDir;

#[derive(Parser)]
#[command(name = "learning")]
#[command(about = "Rust Learning Runner", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Run a specific exercise by name (CLI mode)
    Run { name: String },
    /// Test a specific exercise (CLI mode)
    Test { name: String },
}

fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Some(Commands::Run { name }) => {
            run_exercise_cli(name);
        }
        Some(Commands::Test { name }) => {
            test_exercise_cli(name);
        }
        None => {
            println!("Please specify a command: run <name> or test <name>");
        }
    }
}

// --- Helper Functions ---

fn get_search_dirs() -> Vec<PathBuf> {
    vec![
        PathBuf::from("src/exercises"),
        PathBuf::from("src/exercises/practice"),
    ]
}

fn find_exercise(name: &str) -> Option<PathBuf> {
    for dir in get_search_dirs() {
        for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();

            // Check for file match: name.rs
            if path.is_file() && path.extension().and_then(|e| e.to_str()) == Some("rs") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    if stem == name {
                        return Some(path.to_path_buf());
                    }
                }
            }

            // Check for directory match: name/exercise.rs
            if path.is_dir() {
                if let Some(dir_name) = path.file_name().and_then(|n| n.to_str()) {
                    if dir_name == name {
                        let exercise_path = path.join("exercise.rs");
                        if exercise_path.exists() {
                            return Some(exercise_path);
                        }
                    }
                }
            }
        }
    }
    None
}

fn run_exercise_cli(name: &str) {
    let path = match find_exercise(name) {
        Some(p) => p,
        None => {
            println!("{} Exercise '{}' not found!", "❌".red(), name);
            return;
        }
    };

    println!("{} Running {}...", "🚀".cyan(), name);
    let temp_output = if cfg!(target_os = "windows") {
        "temp_exercise.exe"
    } else {
        "temp_exercise"
    };

    let status = Command::new("rustc")
        .arg(&path)
        .arg("-o")
        .arg(temp_output)
        .status();

    match status {
        Ok(s) if s.success() => {
            println!("{} Compilation successful!", "✅".green());
            let _ = Command::new(format!("./{}", temp_output)).status();
            let _ = fs::remove_file(temp_output);
            if cfg!(target_os = "windows") {
                let _ = fs::remove_file(format!("{}.pdb", temp_output.replace(".exe", "")));
            }
        }
        _ => println!("{} Compilation failed.", "❌".red()),
    }
}

fn test_exercise_cli(name: &str) {
    let path = match find_exercise(name) {
        Some(p) => p,
        None => {
            println!("{} Exercise '{}' not found!", "❌".red(), name);
            return;
        }
    };
    println!("{} Testing {}...", "🧪".cyan(), name);
    let temp_output = if cfg!(target_os = "windows") {
        "temp_test.exe"
    } else {
        "temp_test"
    };

    let status = Command::new("rustc")
        .arg("--test")
        .arg(&path)
        .arg("-o")
        .arg(temp_output)
        .status();

    match status {
        Ok(s) if s.success() => {
            println!("{} Test compilation successful!", "✅".green());
            let _ = Command::new(format!("./{}", temp_output)).status();
            let _ = fs::remove_file(temp_output);
            if cfg!(target_os = "windows") {
                let _ = fs::remove_file(format!("{}.pdb", temp_output.replace(".exe", "")));
            }
        }
        _ => println!("{} Test compilation failed.", "❌".red()),
    }
}
