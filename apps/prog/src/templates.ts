export interface CourseTemplate {
  courseJson: Object;
  setupMd: string;
  introReadme: string;
  introCode: string; // The content of the main entry file (e.g. main.rs, main.go)
  introFilename: string; // e.g., main.rs
}

export const TEMPLATES: Record<string, CourseTemplate> = {
  rust: {
    courseJson: {
      id: "{{id}}",
      name: "{{name}}",
      runner: {
        command: "cargo",
        args: ["test", "--quiet", "--manifest-path", "./content/{{id}}/Cargo.toml"],
        cwd: "."
      },
      content: {
        root: ".",
        exercises: "content"
      },
      setup: {
        checks: [
          {
            name: "Rust Compiler",
            type: "command",
            command: "rustc --version"
          },
          {
            name: "Cargo Package Manager",
            type: "command",
            command: "cargo --version"
          }
        ],
        guide: "SETUP.md"
      }
    },
    setupMd: `# 🦀 Rust Setup Guide

To run the exercises in this course, you need to have **Rust** installed on your system.

## 🛠️ Installation Steps

### 1. Install Rust via Rustup
Go to [rust-lang.org/tools/install](https://www.rust-lang.org/tools/install) and follow the instructions.

### 2. Verify Installation
Open a terminal and run:
\`\`\`bash
rustc --version
cargo --version
\`\`\`
`,
    introReadme: `# Hello Rust

This is your first exercise.

## Goal
Make the code compile and print "Hello".
`,
    introCode: `fn main() {
    println!("Hello, world!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_hello() {
        assert!(true);
    }
}
`,
    introFilename: "main.rs"
  },
  go: {
    courseJson: {
      id: "{{id}}",
      name: "{{name}}",
      runner: {
        command: "go",
        args: ["run", "./runner/main.go", "test", "{{id}}"],
        cwd: "."
      },
      content: {
        root: ".",
        exercises: "content"
      },
      setup: {
        checks: [
          {
            name: "Go Compiler",
            type: "command",
            command: "go version"
          }
        ],
        guide: "SETUP.md"
      }
    },
    setupMd: `# 🐹 Go Setup Guide

To run the exercises in this course, you need to have **Go** installed on your system.

## 🛠️ Installation Steps

### 1. Install Go
Go to [go.dev/dl/](https://go.dev/dl/) and download the installer.

### 2. Verify Installation
Open a terminal and run:
\`\`\`bash
go version
\`\`\`
`,
    introReadme: `# Hello Go

This is your first exercise.

## Goal
Make the code pass the test.
`,
    introCode: `package main

import "fmt"

func Greeting() string {
	return "Hello World"
}

func main() {
	fmt.Println(Greeting())
}
`,
    introFilename: "main.go"
  }
};
