#!/usr/bin/env bun
import { Command } from "commander";
import { login } from "./commands/auth";
import { setConfig, listConfig } from "./commands/config";
import { init, createCourse, validate, pack, dev, start } from "./commands/course";
import { save, sync, reset } from "./commands/sync";

const program = new Command();

program
  .name("progy")
  .description("The interactive CLI and learning platform for Progy courses.")
  .version("0.14.0");

// --- Auth ---
program
  .command("login")
  .description("Login to your Progy account")
  .action(login);

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

// --- Course Lifecycle ---
program
  .command("init")
  .description("Initialize a course in the current directory")
  .option("-c, --course <id>", "Course ID (e.g. rust)")
  .option("--offline", "Force offline mode")
  .action(init);

program
  .command("create-course")
  .description("Create a new course boilerplate")
  .requiredOption("-n, --name <name>", "Name of the course")
  .requiredOption("-c, --course <type>", "Type/Language (e.g. rust, go)")
  .action(createCourse);

program
  .command("validate")
  .description("Validate a course's structure and configuration")
  .argument("[path]", "Path to course directory", ".")
  .action(validate);

program
  .command("pack")
  .description("Pack a course into a .progy file")
  .option("-o, --out <filename>", "Output filename")
  .action(pack);

program
  .command("dev")
  .description("Start the Progy server in development mode for instructions")
  .option("--offline", "Run in offline mode")
  .action(dev);

// --- Progress & Sync ---
program
  .command("save")
  .description("Save your progress to the cloud (Git push)")
  .option("-m, --message <message>", "Commit message", "update progress")
  .action(save);

program
  .command("sync")
  .description("Sync your progress and get official updates (Git pull + Layering)")
  .action(sync);

program
  .command("reset")
  .description("Reset a specific file to its original state")
  .argument("<path>", "Path to the file (e.g., content/intro/hello.rs)")
  .action(reset);

// --- Default Execution ---
program
  .command("start", { isDefault: true })
  .description("Start the Progy server (opens local .progy file)")
  .option("--offline", "Run in offline mode")
  .argument("[file]", "Specific .progy file to open")
  .action(start);

program.parse();
