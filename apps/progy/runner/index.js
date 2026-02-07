const { spawn } = require("child_process");
const { resolve, join } = require("path");

const args = process.argv.slice(2);
const command = args[0];
const targetDir = args[1];

if (command !== "test" || !targetDir) {
    console.error("Usage: node runner/index.js test <dir>");
    process.exit(1);
}

const absDir = resolve(targetDir);
const mainFile = join(absDir, "index.js");

const srp = {
    success: false,
    summary: "",
    diagnostics: [],
    tests: [],
    raw: ""
};

const proc = spawn("node", [mainFile], { cwd: absDir });
let output = "";

proc.stdout.on("data", d => output += d.toString());
proc.stderr.on("data", d => output += d.toString());

proc.on("close", (code) => {
    srp.success = code === 0;
    srp.raw = output;
    srp.summary = srp.success ? "Execution Successful" : "Execution Failed";
    
    srp.tests.push({
        name: "Main Execution",
        status: srp.success ? "pass" : "fail",
        message: output
    });

    console.log("__SRP_BEGIN__");
    console.log(JSON.stringify(srp, null, 2));
    console.log("__SRP_END__");
});
