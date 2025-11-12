#!/usr/bin/env node

/**
 * Claude Code Statusline Integration for CCH (Auto-detect)
 *
 * This script automatically uses Claude Code's existing environment variables:
 * - ANTHROPIC_AUTH_TOKEN (your CCH API key)
 * - ANTHROPIC_BASE_URL (your CCH endpoint)
 *
 * No configuration needed! Just point to this script.
 *
 * Usage in .claude/settings.json:
 *   {
 *     "statusLine": {
 *       "type": "command",
 *       "command": "~/.claude/statusline.cjs",
 *       "padding": 0
 *     }
 *   }
 *
 * Windows:
 *   {
 *     "statusLine": {
 *       "type": "command",
 *       "command": "node \"%USERPROFILE%\\.claude\\statusline.cjs\"",
 *       "padding": 0
 *     }
 *   }
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Read stdin (Claude Code passes JSON, we need to consume it)
process.stdin.resume();
process.stdin.on('data', () => {}); // Consume stdin
process.stdin.on('end', main);

function main() {
  // Use Claude Code's existing environment variables
  const apiKey = process.env.ANTHROPIC_AUTH_TOKEN;
  const cchUrl = process.env.ANTHROPIC_BASE_URL;

  // Check if API key is configured
  if (!apiKey) {
    console.log('CCH: API key not configured');
    process.exit(1);
  }

  // Check if CCH URL is configured
  if (!cchUrl) {
    console.log('CCH: CCH URL not configured');
    process.exit(1);
  }

  // Find cch-statusline CLI
  // Priority: 1) Local installation 2) Global installation 3) npx
  let cliCommand = null;

  // Try local installation (adjacent to this script or in node_modules)
  const localCli = path.join(__dirname, '..', 'dist', 'cli.js');
  if (fs.existsSync(localCli)) {
    cliCommand = `node "${localCli}"`;
  } else {
    // Try npx (will install if not found)
    cliCommand = 'npx --yes cch-statusline';
  }

  // Execute cch-statusline
  try {
    const output = execSync(
      `${cliCommand} -u "${cchUrl}" -k "${apiKey}"`,
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
        shell: true
      }
    );

    // Output all lines (full status information)
    // Split by newline and output each line separately for Claude Code multi-line support
    const lines = output.trim().split('\n');
    lines.forEach(line => {
      if (line.trim().length > 0) {
        console.log(line);
      }
    });
  } catch (error) {
    console.log('CCH: Error');
    process.exit(1);
  }
}

// Handle stdin end event
if (process.stdin.isTTY) {
  // If running in TTY (for testing), call main immediately
  main();
}
