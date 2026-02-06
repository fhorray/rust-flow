# Progy

**Progy** is a modern, interactive code learning platform designed to make mastering new languages engaging and effective. It combines a powerful CLI companion with a beautiful web dashboard to provide a seamless "local-first, cloud-synced" learning experience.

![Progy Banner](https://placehold.co/1200x400/0f0f11/ce412b?text=Progy+Platform)

## ✨ Features

- **Interactive CLI**: Learn directly in your terminal with the `progy` CLI. It manages your efficient workflow.
- **Web Dashboard**: Track your progress, view rich lesson details (Markdown, Videos), and manage your courses in a sleek, modern interface.
- **IDE Integration**: Open exercises directly in your favorite editor (**VS Code**, **Cursor**, **Zed**, **Vim**) with a single click. intelligent file detection ensures you open the right file.
- **Progress Sync**: Never lose your streak. Your progress is synced automatically between your local machine (`progress.json`) and the cloud.
- **Gamification**: Earn XP, maintain daily streaks, and collect badges as you conquer concepts.
- **Smart Feedback**: Get instant, helpful feedback on your code. The runner analyzes your output to provide specific hints.
- **Integrated Quizzes**: Validate your knowledge with multiple-choice questions before moving to coding challenges.

## 🚀 Getting Started

### Prerequisites

- **[Bun](https://bun.sh/)** (v1.0.0 or higher) - Required for the runtime.
- **[Rust](https://www.rust-lang.org/)** (Recommended) - If you plan to take the Rust course.

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/yourusername/progy.git
    cd progy
    ```

2.  **Install dependencies**:

    ```bash
    bun install
    ```

3.  **Start the development environment**:
    ```bash
    bun run dev
    ```
    This will start both the Next.js frontend (on port 3000) and the Hono backend (on port 3001).

## 🛠️ Usage

### Starting the CLI

To interact with the course content and run exercises, use the CLI:

```bash
# Run locally
bun run progy
```

### Initializing a Course

To start a new course or resume an existing one in your current directory:

```bash
# Initialize and start the course runner
bunx progy init

# Or specify a course template if starting fresh (e.g. rust, go)
bunx progy init --course rust
```

### Creating a New Course

If you want to create a brand new course structure from scratch:

```bash
bunx progy create-course --name my-awesome-course --course rust
cd my-awesome-course
bunx progy init
```

### Authorization

Authenticate with GitHub to enable cloud synchronization and advanced features:

```bash
bunx progy login
```

This will open a browser window to authorize your device.

### Studying

1.  Navigate to the `dashboard` at `http://localhost:3000`.
2.  Pick an exercise.
3.  Click **"Open in Editor"** to launch your IDE.
4.  Solve the problem in `src/exercises/...`.
5.  Run tests:
    ```bash
    bun run progy test
    ```
    or use the **"Run"** button in the dashboard.

## 🏗️ Architecture

Progy is built as a modern monorepo:

- **Frontend (`apps/prog`)**:
  - Built with **Next.js 14** (App Router) and **React**.
  - Styled with **Tailwind CSS** and **Shadcn UI**.
  - State management via **Nanostores**.
- **Backend (`apps/backend`)**:
  - Powered by **Hono** for high-performance API handling.
  - Designed for **Cloudflare Workers**.
  - **Better Auth** for secure authentication.
- **Data Persistence**:
  - **Local**: JSON-based storage for offline capability (`.prog/progress.json`).
  - **Cloud**: **Cloudflare D1** (SQLite at the edge) for sync.
- **CLI**:
  - Node.js/Bun-based CLI for local interactions and file system management.

## 🧩 Course Creation

Want to build your own course? Check out our [Course Creator Guide](./COURSE_CREATOR_GUIDE.md) to learn how to structure modules, write lessons, and configure runners.

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
