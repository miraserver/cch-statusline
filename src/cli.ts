#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { CCHClient } from './client.js';
import { formatForStatusline, formatDetailed, formatJson, checkWarnings } from './formatter.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get package version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let version = '1.0.0';
try {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, '../package.json'), 'utf-8')
  );
  version = packageJson.version;
} catch {
  // Use default version if package.json not found
}

const program = new Command();

program
  .name('cch-statusline')
  .description('Monitor Claude Code Hub statistics for Claude Code statusline')
  .version(version);

program
  .option('-u, --url <url>', 'CCH API URL', process.env.CCH_URL)
  .option('-k, --key <key>', 'API Key', process.env.CCH_API_KEY)
  .option('-f, --format <format>', 'Output format: statusline, detailed, json', 'statusline')
  .option('-w, --watch [interval]', 'Watch mode (refresh every N seconds)', false)
  .action(async (options) => {
    const { url, key, format, watch } = options;

    // Validate required options
    if (!key) {
      console.error(chalk.red('❌ Error: API key is required'));
      console.error(chalk.yellow('Use -k or set CCH_API_KEY environment variable'));
      process.exit(1);
    }

    // Validate format
    const validFormats = ['statusline', 'detailed', 'json'];
    if (!validFormats.includes(format)) {
      console.error(chalk.red(`❌ Invalid format: ${format}`));
      console.error(chalk.yellow(`Valid formats: ${validFormats.join(', ')}`));
      process.exit(1);
    }

    const client = new CCHClient(url, key);

    // Function to fetch and display stats
    const displayStats = async () => {
      const spinner = format === 'statusline'
        ? null
        : ora('Fetching statistics...').start();

      try {
        // Login
        await client.login();
        if (spinner) {
          spinner.text = 'Fetching data...';
        }

        // Get stats
        const stats = await client.getStats();

        spinner?.succeed('Data fetched successfully');
        spinner?.stop();

        // Check for warnings
        const warnings = checkWarnings(stats);
        if (warnings.length > 0 && format !== 'json') {
          console.log('');
          warnings.forEach(warning => console.log(warning));
          console.log('');
        }

        // Format output
        let output: string;
        switch (format) {
          case 'statusline':
            output = formatForStatusline(stats);
            break;
          case 'detailed':
            output = formatDetailed(stats);
            break;
          case 'json':
            output = formatJson(stats);
            break;
          default:
            output = formatForStatusline(stats);
        }

        console.log(output);
      } catch (error) {
        spinner?.fail('Failed to fetch statistics');
        if (error instanceof Error) {
          console.error(chalk.red(`❌ ${error.message}`));
        } else {
          console.error(chalk.red('❌ Unknown error occurred'));
        }
        if (!watch) {
          process.exit(1);
        }
      }
    };

    // One-time fetch
    if (!watch) {
      await displayStats();
      return;
    }

    // Watch mode
    const interval = typeof watch === 'string' ? parseInt(watch, 10) : 30;

    if (isNaN(interval) || interval < 1) {
      console.error(chalk.red('❌ Invalid watch interval'));
      process.exit(1);
    }

    console.log(chalk.cyan(`👀 Watch mode enabled (refresh every ${interval}s)`));
    console.log(chalk.gray('Press Ctrl+C to exit\n'));

    // Initial fetch
    await displayStats();

    // Set up interval
    setInterval(async () => {
      console.log(chalk.gray('\n━'.repeat(25)));
      await displayStats();
    }, interval * 1000);
  });

program.parse();
