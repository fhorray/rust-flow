export const MODULE_INFO_TOML = `[module]
title = "{{title}}"

[exercises]
# Add exercises here below in order
# exercise_folder_name = "Exercise Display Name"
`;

export const EXERCISE_README = `# {{title}}

## Task

TODO: Describe what the student needs to do.

## Hints

- Hint 1: What should they look for?
- Hint 2: A bit more detail.
`;

export const EXERCISE_STARTER = `Change me! 

1. Rename this file to the correct extension (e.g. exercise.py, exercise.rs)
2. Add your starter code here.
`;

export const QUIZ_TEMPLATE = `[
  {
    "question": "What is the result of 2 + 2?",
    "options": ["3", "4", "5", "22"],
    "answer": 1,
    "explanation": "Basic math: 2 + 2 equals 4."
  }
]`;
