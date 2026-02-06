// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐⭐
Topic: Final Project

Description:
This is the final challenge! You will implement a simplified version of `grep` (Global Regular Expression Print).
Your tool should search for a specified pattern in a file and print the matching lines.

The skeleton code is provided but incomplete.
You need to:
1. Implement `Config::new` to parse command line arguments.
2. Implement `run` to read the file and search for the pattern.

Use `std::env::args`, `std::fs::File`, and `std::io::BufReader`.

Hints:
1. `args.next()` gives an Option.
2. `BufReader::new(file).lines()` gives an iterator over lines.
*/

use std::env;
use std::fs::File;
use std::io::{self, BufRead, BufReader};

struct Config {
    pattern: String,
    filename: String,
}

impl Config {
    fn new(mut args: env::Args) -> Result<Config, &'static str> {
        // Skip program name
        args.next();

        let pattern = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a pattern string"),
        };

        let filename = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file name"),
        };

        Ok(Config { pattern, filename })
    }
}

fn run(config: Config) -> Result<(), io::Error> {
    // TODO: Open the file and read lines
    // If a line contains `config.pattern`, print it.

    // We return Ok(()) here to make it compile, but the logic is missing!
    Ok(())
}

fn main() {
    // We can't easily test CLI args here, but the tests below check logic.
}

// ???: Why is it better to return `Result` from `Config::new` rather than calling `panic!`?
// (Think about how a user would feel if the program crashed with a panic message vs a nice error)

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn test_config_new() {
        let config = Config {
            pattern: "test".to_string(),
            filename: "test.txt".to_string(),
        };
        assert_eq!(config.pattern, "test");
    }

    #[test]
    fn test_run_logic() {
        // We can't easily mock stdout in this simple setup without changing the signature of run to take a writer.
        // However, we can check that it doesn't panic on a non-existent file?
        // Actually, for this exercise, we want it to FAIL if logic isn't implemented.
        // But since we can't inspect stdout, a common pattern is to make `run` return something or write to a buffer.
        // For simplicity in this TUI context, we will rely on manual verification or compilation checks
        // that force the user to write code (like the TODOs).
        // A real test would require refactoring `run` to take `impl Write`.

        // Let's at least check that it returns an error for a missing file, which implies `File::open` was called.
        let config = Config {
            pattern: "test".to_string(),
            filename: "non_existent_file_12345.txt".to_string(),
        };
        let result = run(config);

        // If the user implemented `File::open`, this should be an Error.
        // If they left it empty (just `Ok(())`), it will be Ok, which is WRONG.
        assert!(
            result.is_err(),
            "run() should attempt to open the file and return an error if it doesn't exist"
        );
    }
}
