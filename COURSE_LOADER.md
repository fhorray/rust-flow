# 📦 Course Loader & Validation Specification

This document details the planned enhancements for the `progy init` command, focusing on dynamic course loading from remote repositories (official and custom) and strict validation.

## 1. Command Interface

The interface remains consistent but expands the capabilities of the `--course` (or `-c`) flag.

```bash
# Official Alias
progy init --course rust

# Custom Repository URL
progy init --course https://github.com/user/my-python-course.git

# Specific Branch/Tag (Optional Future Scope)
progy init --course https://github.com/user/course.git#v1.0
```

---

## 2. Resolution Logic

The CLI will resolve the `course` argument in the following priority order:

### **A. Official Alias Lookup**
If the argument matches a known key in the internal registry (or a fetched `registry.json`), it maps to the official repository.

*   `rust` -> `https://github.com/fhorray/rust-flow.git`
*   `go` -> `https://github.com/fhorray/go-flow.git`
*   `cloudflare` -> `https://github.com/fhorray/cloudflare-flow.git`

### **B. Direct URL**
If the argument starts with `http://`, `https://`, or `git@`, it is treated as a direct Git repository URL.

### **C. Local Path (Fallback)**
If the argument matches a local directory path, it attempts to load from there (useful for course creators testing locally).

---

## 3. Execution Flow

1.  **Resolve Source**: Determine the Git URL based on the logic above.
2.  **Clone to Temp**: Clone the repository to a temporary directory (e.g., `~/.progy/tmp/<hash>`).
    *   *Optimization*: Use `--depth 1` for speed.
3.  **Validate**: Run the [Validation Phase](#4-validation-phase) on the temporary directory.
4.  **Install**:
    *   If validation passes, copy the verified content to the user's current working directory.
    *   If validation fails, abort with a detailed error report and clean up the temp directory.

---

## 4. Validation Phase

Before a course is installed, `progy` must ensure it is structurally sound.

### **A. Structure Check**
The following files **MUST** exist:
- `course.json` (The manifest)
- `content/` (The directory containing lessons)

### **B. Schema Validation (`course.json`)**
The `course.json` file must be valid JSON and adhere to a strict schema (using Zod):
```typescript
interface CourseConfig {
  id: string;          // e.g., "rust-101"
  name: string;        // e.g., "Rust Fundamentals"
  runner: {
    command: string;   // e.g., "cargo"
    args: string[];    // e.g., ["test", "{{exercise}}"]
  };
  content: {
    exercises: string; // e.g., "content"
  };
}
```

### **C. Content Integrity**
- **Scan**: Iterate through `content/`.
- **Requirement**: Every exercise folder must have at least one code file (language detection based on `runner` is hard, so check for *any* file) and preferably a `README.md`.
- **Uniqueness**: Ensure no duplicate exercise IDs (if defined in a manifest).

---

## 5. Error Handling & UX

### **Scenario: Invalid Repo URL**
```text
❌ Error: Failed to clone repository.
   URL: https://github.com/invalid/url
   Details: Repository not found or private.
```

### **Scenario: Malformed `course.json`**
```text
❌ Error: Invalid Course Configuration.
   File: course.json
   Issues:
   - 'runner.command' is missing.
   - 'id' must be a string.
```

### **Scenario: Empty Content**
```text
❌ Error: Course validation failed.
   Reason: 'content/exercises' directory is empty or does not exist.
```

---

## 6. Caching Strategy (Future)

To avoid re-cloning large repos:
1.  Check `~/.progy/cache/<repo-hash>`.
2.  If exists, run `git pull` to update.
3.  Copy from cache.
