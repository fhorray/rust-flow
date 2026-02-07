# Quizzes

Quizzes are interactive multiple-choice questions that can be embedded in a course. They reside in their own directory (like an exercise) or alongside exercise code.

## Structure

A quiz is defined in a `quiz.json` file.

```json
{
  "title": "Check Your Understanding",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Which keyword defines a constant in JavaScript?",
      "options": [
        { "id": "a", "text": "var", "isCorrect": false },
        { "id": "b", "text": "let", "isCorrect": false },
        { 
          "id": "c", 
          "text": "const", 
          "isCorrect": true,
          "explanation": "Correct! 'const' is used for variables that should not be reassigned."
        }
      ]
    }
  ]
}
```

## Usage

1.  Create a directory for the quiz (e.g., `content/module1/quiz1`).
2.  Place `quiz.json` in that directory.
3.  Add the quiz to the module's `info.toml`:

```toml
[exercises]
...
quiz1 = "Module 1 Quiz"
```

The key `quiz1` must match the directory name.

## Features
- **Explanations**: You can provide an `explanation` field for the correct answer (or any answer) to give feedback when the user selects it.
- **Scoring**: The platform automatically calculates the score and provides feedback.
