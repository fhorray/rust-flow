/**
 * Progy Premium Logger
 * Provides consistent, high-fidelity terminal output with branding colors.
 */

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underscore: "\x1b[4m",

  // Brand colors (Rust/Orange)
  brand: "\x1b[38;5;208m",
  brandLight: "\x1b[38;5;214m",

  // Neutral colors
  zinc: "\x1b[38;5;244m",
  gray: "\x1b[90m",

  // Semantic colors
  success: "\x1b[32m",
  info: "\x1b[34m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  security: "\x1b[41m\x1b[37m",
};

export const logger = {
  /**
   * Main Progy branding log
   */
  brand(message: string) {
    console.log(`${colors.brand}${colors.bright}PROGY${colors.reset} ${colors.zinc}${message}${colors.reset}`);
  },

  info(message: string, prefix = "INFO") {
    console.log(`${colors.gray}[${prefix}]${colors.reset} ${message}`);
  },

  success(message: string) {
    console.log(`${colors.success}✔${colors.reset} ${message}`);
  },

  warn(message: string) {
    console.log(`${colors.warn}⚠${colors.reset} ${message}`);
  },

  error(message: string, detail?: string) {
    console.error(`${colors.error}✖ ${message}${colors.reset}`);
    if (detail) console.error(`${colors.gray}  └─ ${detail}${colors.reset}`);
  },

  security(message: string) {
    console.log(`${colors.security} SECURITY ${colors.reset} ${message}`);
  },

  /**
   * Renders the premium Progy Startup Banner
   */
  banner(version: string, env: string, mode: string) {
    const isOffline = mode.toLowerCase() === 'offline';
    const envColor = env === 'instructor' ? colors.brand : colors.success;

    // Fixed width box design (50 chars inside)
    const boxWidth = 50;
    const title = `P R O G Y  |  Interactive Learning v${version}`;
    const padding = Math.max(0, (boxWidth - title.length) / 2);
    const leftPad = " ".repeat(Math.floor(padding));
    const rightPad = " ".repeat(Math.ceil(padding));

    const topBorder = "─".repeat(boxWidth + 2);

    console.log(`\n${colors.brand}${colors.bright}  ┌${topBorder}┐`);
    console.log(`  │ ${leftPad}${colors.reset}${colors.bright}${title}${colors.reset}${colors.brand}${rightPad} │`);
    console.log(`  └${topBorder}┘${colors.reset}\n`);

    console.log(`  ${colors.zinc}➜${colors.reset}  ${colors.bright}Environment:${colors.reset}  ${envColor}${env.toUpperCase()}${colors.reset}`);
    console.log(`  ${colors.zinc}➜${colors.reset}  ${colors.bright}Access Mode:${colors.reset}  ${isOffline ? colors.warn : colors.success}${mode.toUpperCase()}${colors.reset}`);
    console.log(`  ${colors.zinc}➜${colors.reset}  ${colors.bright}Local Host: ${colors.reset}  ${colors.info}${colors.underscore}http://localhost:3001${colors.reset}`);
    console.log("");
  },

  /**
   * Grouped information log for startup
   */
  startupInfo(label: string, value: string) {
    console.log(`  ${colors.zinc}•${colors.reset} ${label.padEnd(12)} ${colors.zinc}${value}${colors.reset}`);
  },

  divider() {
    console.log(`${colors.gray}${"─".repeat(process.stdout.columns || 40)}${colors.reset}`);
  }
};
