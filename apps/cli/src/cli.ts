#!/usr/bin/env bun
import { Command } from "commander";
import { login, logout } from "./commands/auth";
import { setConfig, listConfig } from "./commands/config";
import { init, createCourse, validate, pack, dev, start, testExercise, publish } from "./commands/course";
import { save, sync, reset } from "./commands/sync";

const program = new Command();

program
  .name("progy")
  .description("The interactive CLI and learning platform for Progy courses.")
  .version("0.15.0");

// --- Auth ---
program
  .command("login")
  .description("Login to your Progy account")
  .action(login);

program
  .command("logout")
  .description("Log out of your Progy account")
  .action(logout);

// --- Config ---
const config = program.command("config").description("Manage Progy configuration");

config
  .command("set")
  .description("Set a configuration value (e.g., config set ai.provider openai)")
  .argument("<path>", "Config path (e.g., ai.provider)")
  .argument("<value>", "Value to set")
  .action(setConfig);

config
  .command("list")
  .description("List all configuration values")
  .action(listConfig);

// --- Course Lifecycle (Instructor) ---
program
  .command("create")
  .description("Create a new course from a template")
  .argument("<name>", "Course directory name")
  .option("-t, --template <type>", "Template type (rust, python, typescript, go)", "python")
  .action((name, options) => createCourse({ name, course: options.template }));

program
  .command("dev")
  .description("Test course locally as GUEST (no progress saved)")
  .action(dev);

program
  .command("validate")
  .description("Validate a course's structure and configuration")
  .argument("[path]", "Path to course directory", ".")
  .action(validate);

program
  .command("pack")
  .description("Pack a course into a .progy file for distribution")
  .option("-o, --out <filename>", "Output filename")
  .action(pack);

program
  .command("test")
  .description("Run a specific exercise and show output (instructor use)")
  .argument("<path>", "Exercise path (e.g., content/01_intro/01_hello)")
  .action(testExercise);

program
  .command("publish")
  .description("Publish course to Progy registry (coming soon)")
  .action(publish);

// --- Scaffolding (Instructor) ---
const add = program.command("add").description("Scaffold course content");

add.command("module")
  .description("Add a new module")
  .argument("<name>", "Module name")
  .option("-t, --title <title>", "Module title")
  .action(async (name, options) => {
    const { addModule } = await import("./commands/scaffold");
    await addModule(name, options);
  });

add.command("exercise")
  .description("Add a new exercise to a module")
  .argument("<module>", "Module shortcut (e.g., 1)")
  .argument("<name>", "Exercise name")
  .action(async (mod, name) => {
    const { addExercise } = await import("./commands/scaffold");
    await addExercise(mod, name);
  });

add.command("quiz")
  .description("Add a quiz template to an exercise")
  .argument("<path>", "Exercise shortcut (e.g., 1/1)")
  .action(async (path) => {
    const { addQuiz } = await import("./commands/scaffold");
    await addQuiz(path);
  });

// --- Student Commands ---
program
  .command("start", { isDefault: true })
  .description("Start learning a course")
  .option("--offline", "Run in offline mode (no cloud sync)")
  .argument("[file]", "Specific .progy file to open")
  .action(start);

// --- Deprecated/Legacy (kept for backwards compatibility) ---
program
  .command("init")
  .description("[Deprecated] Use 'progy start' instead")
  .option("-c, --course <id>", "Course ID")
  .option("--offline", "Force offline mode")
  .action(init);

program
  .command("save")
  .description("[Deprecated] Progress is auto-saved. Use UI instead.")
  .option("-m, --message <message>", "Commit message", "update progress")
  .action(save);

program
  .command("sync")
  .description("[Deprecated] Use UI sync instead.")
  .action(sync);

program
  .command("reset")
  .description("Reset a specific file to its original state")
  .argument("<path>", "Path to the file")
  .action(reset);

program.parse();
