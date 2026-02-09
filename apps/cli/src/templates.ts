export const MODULE_INFO_TOML = `[module]
title = "{{title}}"

[exercises]
# Add exercises here
`;

export const EXERCISE_README = `# {{title}}

## Task

TODO: Describe the exercise.

## Hints

- Hint 1
- Hint 2
`;

export const EXERCISE_STARTER = `Change me!

1. Rename this file to the correct extension (e.g. exercise.py, exercise.rs)
2. Add your starter code here.
`;

export const QUIZ_TEMPLATE = `[
  {
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Explanation of the correct answer."
  }
]`;

// Dummy templates for tests
export const TEMPLATES = {
    python: {
        courseJson: {
            id: "{{id}}",
            name: "{{name}}",
            runner: {
                command: "python3 runner.py",
                args: [],
                cwd: "."
            },
            content: {
                root: ".",
                exercises: "content"
            },
            setup: {
                guide: "SETUP.md",
                checks: []
            }
        },
        setupMd: "# Setup\n\nRun `pip install -r requirements.txt`",
        introReadme: "# Intro",
        introFilename: "intro.py",
        introCode: "print('Hello')"
    }
};

export const RUNNER_README = "# Runner";
