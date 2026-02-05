use clap::{Parser, Subcommand};
use colored::*;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use walkdir::WalkDir;

mod ai;
mod config;
mod generator;
mod state;
mod tui;

#[derive(Parser)]
#[command(name = "learning")]
#[command(about = "Rust Learning Runner", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Start the interactive TUI (default)
    Tui,
    /// Run a specific exercise by name (CLI mode)
    Run { name: String },
    /// Test a specific exercise (CLI mode)
    Test { name: String },
    /// List all available exercises
    List,
    /// Connect exercises to the library (for IDE support)
    Sync,
    /// Generate a new exercise using AI
    Generate {
        /// The topic or description of the exercise
        #[arg(short, long)]
        topic: String,
    },
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
        Some(Commands::List) => {
            list_exercises();
        }
        Some(Commands::Sync) => {
            sync_exercises();
        }
        Some(Commands::Generate { topic }) => {
            generate_exercise_cli(topic);
        }
        Some(Commands::Tui) | None => {
            if let Err(e) = tui::run_tui() {
                println!("Error running TUI: {}", e);
            }
        }
    }
}

// --- Old CLI Functions (Preserved for compatibility) ---

fn get_search_dirs() -> Vec<PathBuf> {
    vec![
        PathBuf::from("src/exercises"),
        PathBuf::from("src/practice"),
    ]
}

fn find_exercise(name: &str) -> Option<PathBuf> {
    for dir in get_search_dirs() {
        for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("rs") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    if stem == name {
                        return Some(path.to_path_buf());
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
    let temp_output = if cfg!(target_os = "windows") { "temp_exercise.exe" } else { "temp_exercise" };

    let status = Command::new("rustc").arg(&path).arg("-o").arg(temp_output).status();

    match status {
        Ok(s) if s.success() => {
            println!("{} Compilation successful!", "✅".green());
            let _ = Command::new(format!("./{}", temp_output)).status();
            let _ = fs::remove_file(temp_output);
            if cfg!(target_os = "windows") { let _ = fs::remove_file(format!("{}.pdb", temp_output.replace(".exe", ""))); }
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
    let temp_output = if cfg!(target_os = "windows") { "temp_test.exe" } else { "temp_test" };

    let status = Command::new("rustc").arg("--test").arg(&path).arg("-o").arg(temp_output).status();

    match status {
        Ok(s) if s.success() => {
            println!("{} Test compilation successful!", "✅".green());
            let _ = Command::new(format!("./{}", temp_output)).status();
            let _ = fs::remove_file(temp_output);
             if cfg!(target_os = "windows") { let _ = fs::remove_file(format!("{}.pdb", temp_output.replace(".exe", ""))); }
        }
        _ => println!("{} Test compilation failed.", "❌".red()),
    }
}

fn list_exercises() {
    println!("{}", "Available Exercises:".bold().underline());
    for dir in get_search_dirs() {
        for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("rs") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    println!("- {}", stem);
                }
            }
        }
    }
}

fn sync_exercises() {
    println!("{}", "Synchronizing exercises for IDE support...".cyan());
    let exercises_dir = PathBuf::from("src/exercises");
    if !exercises_dir.exists() { return; }

    let mut modules: Vec<(String, String)> = Vec::new();
    for entry in fs::read_dir(&exercises_dir).unwrap().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_dir() {
            if let Some(dir_name) = path.file_name().and_then(|n| n.to_str()) {
                if dir_name.starts_with('.') { continue; }
                let mod_name = if let Some(idx) = dir_name.find('_') {
                    if dir_name[..idx].chars().all(char::is_numeric) { &dir_name[idx + 1..] } else { dir_name }
                } else { dir_name };
                modules.push((mod_name.to_string(), dir_name.to_string()));
                update_module_mod_rs(&path);
            }
        }
    }
    modules.sort();

    let root_mod_path = exercises_dir.join("mod.rs");
    let mut content = String::from("// Auto-generated by `cargo run -- sync`. Do not edit manually.\n\n");
    for (mod_name, dir_name) in &modules {
        if mod_name != dir_name {
            content.push_str(&format!("#[path = \"{}/mod.rs\"]\n", dir_name));
        }
        content.push_str(&format!("pub mod {};\n\n", mod_name));
    }
    let _ = fs::write(&root_mod_path, content);
    println!("{}", "Sync complete!".bold().green());
}

fn update_module_mod_rs(dir_path: &PathBuf) {
    let mut exercises = Vec::new();
    for entry in fs::read_dir(dir_path).unwrap().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() && path.extension().and_then(|e| e.to_str()) == Some("rs") {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                if stem != "mod" { exercises.push(stem.to_string()); }
            }
        }
    }
    exercises.sort();
    let mod_rs_path = dir_path.join("mod.rs");
    let mut content = String::from("// Auto-generated by `cargo run -- sync`\n\n");
    for ex in exercises { content.push_str(&format!("pub mod {};\n", ex)); }
    let _ = fs::write(&mod_rs_path, content);
}

fn generate_exercise_cli(topic: &str) {
    let config = match config::AppConfig::load() {
        Ok(c) => c,
        Err(e) => {
            println!("{} Failed to load config: {}", "❌".red(), e);
            return;
        }
    };

    if config.active_provider.is_none() {
        println!("{} No active AI provider selected. Please configure it in the TUI or update config.json.", "❌".red());
        return;
    }

    let generator = generator::ExerciseGenerator::new(config);
    match generator.generate_exercise(topic) {
        Ok(path) => println!("{} Exercise generated at: {}", "✅".green(), path.display()),
        Err(e) => println!("{} Generation failed: {}", "❌".red(), e),
    }
}
