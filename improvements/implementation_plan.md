# Scaffolding Commands Implementation Plan

## 🎯 Goal

Add CLI commands for instructors to quickly scaffold course content (modules, exercises) without manually creating files and folders.

---

## 📋 Proposed Commands (with Shorthand Support)

Commands will support "short paths" (e.g., `1` for module 01, `1/2` for module 01 / exercise 02).

### `progy add module <name>`

Creates a new module. Auto-numbers the folder (e.g., `03_name`).

```bash
$ progy add module basics
✅ Created: content/03_basics/
```

### `progy add exercise <mod_short> <name>`

Creates a new exercise inside a module. `<mod_short>` can be the number (e.g., `1`).

```bash
$ progy add exercise 1 hello_world
✅ Created: content/01_intro/02_hello_world/
```

### `progy add quiz <path_short>`

Adds a quiz.json to an exercise.

```bash
$ progy add quiz 1/2
✅ Created: content/01_intro/02_hello/quiz.json
```

---

## 🛡️ Folder Naming Validation

As requested, the CLI will now **enforce** the `XX_name` convention for all content folders.

### Validation Logic (`CourseLoader.ts`)

The loader should throw an error if it finds any module or exercise directory that doesn't start with two digits followed by an underscore.

```typescript
function validateFolderName(name: string, path: string) {
  if (!/^\d{2}_/.test(name)) {
    throw new Error(
      `Invalid folder name: "${name}" at ${path}. Content folders must start with two digits followed by an underscore (e.g., 01_intro).`,
    );
  }
}
```

This check will be integrated into the recursive folder discovery within [CourseLoader](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/core/loader.ts#42-139).

---

## 🔍 Path Resolution Logic

To support `1/2` shorthand, the CLI will:

1.  Scan the `content/` directory.
2.  Match the first part (`1`) to a folder starting with `01_`.
3.  Inside that folder, match the second part (`2`) to a folder starting with `02_`.

```typescript
async function resolveShortPath(shortPath: string): Promise<string> {
  const parts = shortPath.split('/'); // ["1", "2"]
  let currentDir = join(PROG_CWD, 'content');

  for (const part of parts) {
    const num = part.padStart(2, '0'); // "01", "02"
    const entries = await readdir(currentDir);
    const folder = entries.find((e) => e.startsWith(`${num}_`));
    if (!folder)
      throw new Error(
        `Could not find folder starting with ${num}_ in ${currentDir}`,
      );
    currentDir = join(currentDir, folder);
  }
  return currentDir;
}
```

---

## 🔧 Implementation Details

### 1. Command Structure ([cli.ts](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/cli.ts))

```typescript
const add = program.command('add').description('Scaffold course content');

add
  .command('module')
  .argument('<name>', 'Module name')
  .option('-t, --title <title>', 'Module title')
  .action(addModule);

add
  .command('exercise')
  .argument('<module>', 'Module folder (e.g., 01_intro)')
  .argument('<name>', 'Exercise name')
  .action(addExercise);

add.command('quiz').argument('<path>', 'Exercise path').action(addQuiz);
```

### 2. File Templates (New file: [templates/scaffolds.ts](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/templates/scaffolds.ts))

```typescript
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
```

### 3. Auto-Numbering Logic

```typescript
async function getNextNumber(parentDir: string): Promise<string> {
  const entries = await readdir(parentDir);
  const numbered = entries.filter((e) => /^\d{2}_/.test(e));
  const max = numbered.reduce(
    (m, e) => Math.max(m, parseInt(e.slice(0, 2))),
    0,
  );
  return String(max + 1).padStart(2, '0');
}
```

### 4. Extension Detection

Detect exercise file extension from [course.json](file:///c:/Users/francyelton.nobre/Desktop/prog/courses/sql-example/course.json) runner command:

```typescript
function getExerciseExtension(config: CourseConfig): string {
  const cmd = config.runner.command || '';
  if (cmd.includes('python')) return 'py';
  if (cmd.includes('rustc') || cmd.includes('cargo')) return 'rs';
  if (cmd.includes('tsx') || cmd.includes('ts-node')) return 'ts';
  if (cmd.includes('sql') || cmd.includes('psql')) return 'sql';
  return 'txt';
}
```

---

## 📊 Command Summary

| Command                     | Creates                | Files                     |
| --------------------------- | ---------------------- | ------------------------- |
| `add module <name>`         | `content/XX_name/`     | [info.toml](file:///c:/Users/francyelton.nobre/Desktop/prog/courses/docker-example/exercises/info.toml), [README.md](file:///c:/Users/francyelton.nobre/Desktop/prog/README.md)  |
| `add exercise <mod> <name>` | `content/mod/XX_name/` | `exercise.*`, [README.md](file:///c:/Users/francyelton.nobre/Desktop/prog/README.md) |
| `add quiz <path>`           | In exercise folder     | [quiz.json](file:///c:/Users/francyelton.nobre/Desktop/prog/courses/sql-example/content/01_select/quiz.json)               |

---

---

## 🏛️ Official Repository Resolution Refactor

Courses are moving from a single monorepo (`fhorray/progy-courses`) to individual repositories under the `progy-dev` organization.

### Changes Required

#### 1. Backend: Official State Detection ([apps/progy/src/backend/endpoints/config.ts](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/backend/endpoints/config.ts))

Update [checkOfficial](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/backend/endpoints/config.ts#5-20) to look for the new organization.

```diff
- if (currentConfig?.repo?.includes("fhorray/progy-courses")) return true;
+ if (currentConfig?.repo?.includes("github.com/progy-dev/")) return true;
```

#### 2. CLI: Course Resolution Logic ([apps/progy/src/core/loader.ts](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/core/loader.ts))

Update [resolveSource](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/core/loader.ts#43-74) to handle the new structure. If a course alias is used (e.g., `progy start python`), and it's not in the registry, it should fallback to the `progy-dev` organization.

```typescript
// New Logic for resolveSource
const OFICIAL_ORG = 'https://github.com/progy-dev';

// ... inside resolveSource
if (course) {
  return { url: course.repo, branch: course.branch, path: course.path };
}

// Fallback to official org
return { url: `${OFICIAL_ORG}/${courseInput}.git` };
```

#### 3. CLI: Alias to Container Flow ([apps/progy/src/commands/course.ts](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/commands/course.ts))

The [start](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/commands/course.ts#237-266) command will now support downloading and packaging official courses:

```bash
$ progy start rust
# 1. Resolves 'rust' to progy-dev/rust repo
# 2. Clones to temp dir
# 3. Validates course structure (must have XX_ folders)
# 4. Packs into 'rust.progy' in current directory
# 5. Starts server from 'rust.progy'
```

Update [start](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/commands/course.ts#237-266) logic:
- If the argument [file](file:///c:/Users/francyelton.nobre/Desktop/prog/courses/docker-example/Dockerfile) does not exist and does not end with `.progy`, treat it as an alias.
- Implement the "Clone -> Pack -> Run" pipeline.

#### 4. Backend: Repository Recognition

Update [checkOfficial](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/backend/endpoints/config.ts#5-20) in [apps/progy/src/backend/endpoints/config.ts](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/backend/endpoints/config.ts) to look for `progy-dev/` in the repo URL.

---

## 🧪 Testing Strategy

A new test will be added to [tests/cli.test.ts](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/tests/cli.test.ts) to verify the "Alias to Container" flow:

1.  **Mock Repo Resolution**: Ensure it resolves to a test repo.
2.  **Execution**: Run `progy start test-course` in a clean temp directory.
3.  **Verification**: 
    - Check if `test-course.progy` was created.
    - Verify repo cloning happened.

---

## ⏱️ Implementation Order (Phase 2)

1. Update [apps/progy/src/backend/endpoints/config.ts](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/backend/endpoints/config.ts)
2. Update [apps/progy/src/core/loader.ts](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/core/loader.ts) to use new repo pattern
3. Update [apps/progy/src/core/sync.ts](file:///c:/Users/francyelton.nobre/Desktop/prog/apps/progy/src/core/sync.ts) if it has hardcoded layering paths
4. Add tests for official repo resolution
