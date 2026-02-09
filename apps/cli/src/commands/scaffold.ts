import { join, resolve } from "node:path";
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { CourseLoader, type CourseConfig } from "../core/loader";
import {
  MODULE_INFO_TOML,
  EXERCISE_README,
  EXERCISE_STARTER,
  QUIZ_TEMPLATE
} from "../templates/scaffolds";

const PROG_CWD = process.env.PROG_CWD || process.cwd();

async function getNextNumber(parentDir: string): Promise<string> {
  try {
    const entries = await readdir(parentDir);
    const numbered = entries.filter(e => /^\d{2}_/.test(e));
    const max = numbered.reduce((m, e) => Math.max(m, parseInt(e.slice(0, 2))), 0);
    return String(max + 1).padStart(2, "0");
  } catch {
    return "01";
  }
}

async function resolveShortPath(shortPath: string): Promise<string> {
  const parts = shortPath.split("/"); // ["1", "2"]
  let currentDir = join(PROG_CWD, "content");

  for (const part of parts) {
    const num = part.padStart(2, "0"); // "01", "02"
    const entries = await readdir(currentDir);
    const folder = entries.find(e => e.startsWith(`${num}_`));
    if (!folder) throw new Error(`Could not find folder starting with ${num}_ in ${currentDir}`);
    currentDir = join(currentDir, folder);
  }
  return currentDir;
}

function getExerciseExtension(config: CourseConfig): string {
  const cmd = config.runner.command || '';
  if (cmd.includes('python')) return 'py';
  if (cmd.includes('rustc') || cmd.includes('cargo')) return 'rs';
  if (cmd.includes('tsx') || cmd.includes('ts-node')) return 'ts';
  if (cmd.includes('sql') || cmd.includes('psql')) return 'sql';
  return 'txt';
}


export async function addModule(name: string, options: { title?: string }) {
  const contentDir = join(PROG_CWD, "content");
  await mkdir(contentDir, { recursive: true });

  const num = await getNextNumber(contentDir);
  const folderName = `${num}_${name.toLowerCase().replace(/\s+/g, "_")}`;
  const modulePath = join(contentDir, folderName);

  await mkdir(modulePath, { recursive: true });

  const title = options.title || name.charAt(0).toUpperCase() + name.slice(1);
  await writeFile(join(modulePath, "info.toml"), MODULE_INFO_TOML.replace("{{title}}", title));
  await writeFile(join(modulePath, "README.md"), `# ${title}\n\nModule introduction goes here.`);

  console.log(`✅ Created module: ${folderName}`);
}

export async function addExercise(modShort: string, name: string) {
  try {
    const config = await CourseLoader.validateCourse(PROG_CWD);
    const modulePath = await resolveShortPath(modShort);

    const num = await getNextNumber(modulePath);
    const folderName = `${num}_${name.toLowerCase().replace(/\s+/g, "_")}`;
    const exercisePath = join(modulePath, folderName);
    const extension = getExerciseExtension(config);

    await mkdir(exercisePath, { recursive: true });

    const title = name.charAt(0).toUpperCase() + name.slice(1);

    await writeFile(join(exercisePath, `exercise.${extension}`), EXERCISE_STARTER);
    await writeFile(join(exercisePath, "README.md"), EXERCISE_README.replace("{{title}}", title));

    console.log(`✅ Created exercise: ${folderName} in ${modShort}`);
  } catch (e: any) {
    console.error(`❌ Error: ${e.message}`);
    process.exit(1);
  }
}

export async function addQuiz(pathShort: string) {
  try {
    const exercisePath = await resolveShortPath(pathShort);
    const quizPath = join(exercisePath, "quiz.json");

    await writeFile(quizPath, QUIZ_TEMPLATE);
    console.log(`✅ Added quiz to: ${pathShort}`);
  } catch (e: any) {
    console.error(`❌ Error: ${e.message}`);
    process.exit(1);
  }
}
