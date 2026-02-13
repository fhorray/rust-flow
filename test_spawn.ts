import { spawn } from "node:child_process"; spawn("sleep", ["5"], { stdio: "inherit" });
