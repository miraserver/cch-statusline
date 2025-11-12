import type { StatsOutput } from './types.js';
import chalk from 'chalk';

/**
 * Create a progress bar
 */
function createProgressBar(current: number, limit: number, width: number = 10): string {
  const percentage = Math.min(100, (current / limit) * 100);
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  let color = chalk.green;
  if (percentage >= 90) color = chalk.red;
  else if (percentage >= 75) color = chalk.yellow;

  return color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

/**
 * Format statistics for statusline display (Variant 3: with daily quota, provider, and model)
 */
export function formatForStatusline(stats: StatsOutput): string {
  const parts: string[] = [];

  // Today's cost with daily quota
  if (stats.dailyQuota !== null && stats.dailyQuota > 0) {
    parts.push(`💰 $${stats.todayCost.toFixed(2)}/${stats.dailyQuota}`);
  } else {
    parts.push(`💰 $${stats.todayCost.toFixed(2)}`);
  }

  // Today's requests
  parts.push(`📊 ${stats.todayRequests} req`);

  // Last used model (short name) - try to get from modelStats if lastUsedModel is null
  let modelName = stats.lastUsedModel;
  if (!modelName && stats.modelStats && stats.modelStats.length > 0) {
    // Find the most recently used model (assuming modelStats is ordered by most recent)
    modelName = stats.modelStats[0].model;
  }

  if (modelName) {
    const modelShort = modelName.split('-').slice(1, 4).join('-'); // e.g., "sonnet-4-5"
    parts.push(`🤖 ${modelShort}`);
  }

  // Last provider
  if (stats.lastProviderName) {
    parts.push(`⚡ ${stats.lastProviderName}`);
  }

  // Return array of lines for multi-line output
  // Claude Code supports multiple console.log() calls for multi-line statusline
  const lines: string[] = [];

  // First line: main status
  lines.push(parts.join(' | '));

  // Second line: limits with emojis
  const limitParts: string[] = [];

  if (stats.limit5h !== null && stats.limit5h > 0) {
    if (stats.cost5h > 0) {
      limitParts.push(`⏱️ 5h: $${stats.cost5h.toFixed(2)}/$${stats.limit5h}`);
    } else {
      limitParts.push(`⏱️ 5h: /$${stats.limit5h}`);
    }
  }
  if (stats.limitWeekly !== null && stats.limitWeekly > 0) {
    if (stats.costWeekly > 0) {
      limitParts.push(`📅 Weekly: $${stats.costWeekly.toFixed(2)}/$${stats.limitWeekly}`);
    } else {
      limitParts.push(`📅 Weekly: /$${stats.limitWeekly}`);
    }
  }
  if (stats.limitMonthly !== null && stats.limitMonthly > 0) {
    if (stats.costMonthly > 0) {
      limitParts.push(`📆 Monthly: $${stats.costMonthly.toFixed(2)}/$${stats.limitMonthly}`);
    } else {
      limitParts.push(`📆 Monthly: /$${stats.limitMonthly}`);
    }
  }

  if (limitParts.length > 0) {
    lines.push(limitParts.join(' | '));
  }

  return lines.join('\n');
}

/**
 * Format statistics for detailed console output with progress bars
 */
export function formatDetailed(stats: StatsOutput): string {
  const lines: string[] = [];

  lines.push(chalk.bold.cyan('📊 Claude Code Hub Statistics'));
  lines.push(chalk.gray('━'.repeat(60)));
  lines.push('');

  lines.push(chalk.bold('📅 Today:'));
  lines.push(`   ${chalk.gray('Cost:    ')} ${chalk.green('$' + stats.todayCost.toFixed(4))}`);

  // Show daily quota if available
  if (stats.dailyQuota !== null && stats.dailyQuota > 0) {
    const pctDaily = Math.round((stats.todayCost / stats.dailyQuota) * 100);
    const bar = createProgressBar(stats.todayCost, stats.dailyQuota, 15);
    lines.push(`   ${chalk.gray('Daily:   ')} ${bar} ${pctDaily}% ${chalk.gray(`($${stats.todayCost.toFixed(2)} / $${stats.dailyQuota})`)}`);
  }

  lines.push(`   ${chalk.gray('Requests:')} ${chalk.cyan(stats.todayRequests.toString())}`);

  // Show last used model and provider
  if (stats.lastUsedModel) {
    lines.push(`   ${chalk.gray('Model:   ')} ${chalk.magenta(stats.lastUsedModel)}`);
  }
  if (stats.lastProviderName) {
    lines.push(`   ${chalk.gray('Provider:')} ${chalk.yellow(stats.lastProviderName)}`);
  }

  // Show model breakdown
  if (stats.modelStats && stats.modelStats.length > 0) {
    lines.push('');
    lines.push(chalk.bold('🤖 Models:'));
    stats.modelStats.forEach(model => {
      lines.push(`   ${chalk.gray(model.model + ':')} ${chalk.cyan(model.callCount + ' calls')} ${chalk.green('$' + model.totalCost.toFixed(4))}`);
    });
  }

  lines.push('');

  lines.push(chalk.bold('💵 Limits:'));

  // 5-hour limit
  if (stats.limit5h !== null && stats.limit5h > 0) {
    const pct5h = Math.round((stats.cost5h / stats.limit5h) * 100);
    const bar = createProgressBar(stats.cost5h, stats.limit5h, 15);
    lines.push(`   ${chalk.gray('5-Hour: ')} ${bar} ${pct5h}% ${chalk.gray(`($${stats.cost5h.toFixed(4)} / $${stats.limit5h.toFixed(2)})`)}`);
  } else {
    lines.push(`   ${chalk.gray('5-Hour: ')} ${chalk.green('$' + stats.cost5h.toFixed(4))} ${chalk.gray('(no limit)')}`);
  }

  // Weekly limit
  if (stats.limitWeekly !== null && stats.limitWeekly > 0) {
    const pctWeekly = Math.round((stats.costWeekly / stats.limitWeekly) * 100);
    const bar = createProgressBar(stats.costWeekly, stats.limitWeekly, 15);
    lines.push(`   ${chalk.gray('Weekly: ')} ${bar} ${pctWeekly}% ${chalk.gray(`($${stats.costWeekly.toFixed(4)} / $${stats.limitWeekly.toFixed(2)})`)}`);
  } else {
    lines.push(`   ${chalk.gray('Weekly: ')} ${chalk.green('$' + stats.costWeekly.toFixed(4))} ${chalk.gray('(no limit)')}`);
  }

  // Monthly limit
  if (stats.limitMonthly !== null && stats.limitMonthly > 0) {
    const pctMonthly = Math.round((stats.costMonthly / stats.limitMonthly) * 100);
    const bar = createProgressBar(stats.costMonthly, stats.limitMonthly, 15);
    lines.push(`   ${chalk.gray('Monthly:')} ${bar} ${pctMonthly}% ${chalk.gray(`($${stats.costMonthly.toFixed(4)} / $${stats.limitMonthly.toFixed(2)})`)}`);
  } else {
    lines.push(`   ${chalk.gray('Monthly:')} ${chalk.green('$' + stats.costMonthly.toFixed(4))} ${chalk.gray('(no limit)')}`);
  }

  lines.push('');

  // Concurrent sessions
  if (stats.limitConcurrentSessions > 0) {
    const pctSessions = Math.round((stats.concurrentSessions / stats.limitConcurrentSessions) * 100);
    const bar = createProgressBar(stats.concurrentSessions, stats.limitConcurrentSessions, 15);
    lines.push(`${chalk.bold('🔥 Sessions:')} ${bar} ${pctSessions}% ${chalk.gray(`(${stats.concurrentSessions} / ${stats.limitConcurrentSessions})`)}`);
  } else {
    lines.push(`${chalk.bold('🔥 Sessions:')} ${chalk.cyan(stats.concurrentSessions.toString())} ${chalk.gray('(no limit)')}`);
  }

  return lines.join('\n');
}

/**
 * Check for warnings and return warning messages
 */
export function checkWarnings(stats: StatsOutput): string[] {
  const warnings: string[] = [];

  // Check 5-hour limit
  if (stats.limit5h !== null && stats.limit5h > 0) {
    const pct5h = (stats.cost5h / stats.limit5h) * 100;
    if (pct5h >= 90) {
      warnings.push(chalk.red(`⚠️  Critical: 5-hour limit at ${pct5h.toFixed(0)}%!`));
    } else if (pct5h >= 75) {
      warnings.push(chalk.yellow(`⚠️  Warning: 5-hour limit at ${pct5h.toFixed(0)}%`));
    }
  }

  // Check weekly limit
  if (stats.limitWeekly !== null && stats.limitWeekly > 0) {
    const pctWeekly = (stats.costWeekly / stats.limitWeekly) * 100;
    if (pctWeekly >= 90) {
      warnings.push(chalk.red(`⚠️  Critical: Weekly limit at ${pctWeekly.toFixed(0)}%!`));
    } else if (pctWeekly >= 75) {
      warnings.push(chalk.yellow(`⚠️  Warning: Weekly limit at ${pctWeekly.toFixed(0)}%`));
    }
  }

  // Check monthly limit
  if (stats.limitMonthly !== null && stats.limitMonthly > 0) {
    const pctMonthly = (stats.costMonthly / stats.limitMonthly) * 100;
    if (pctMonthly >= 90) {
      warnings.push(chalk.red(`⚠️  Critical: Monthly limit at ${pctMonthly.toFixed(0)}%!`));
    } else if (pctMonthly >= 75) {
      warnings.push(chalk.yellow(`⚠️  Warning: Monthly limit at ${pctMonthly.toFixed(0)}%`));
    }
  }

  // Check concurrent sessions
  if (stats.limitConcurrentSessions > 0) {
    const pctSessions = (stats.concurrentSessions / stats.limitConcurrentSessions) * 100;
    if (pctSessions >= 90) {
      warnings.push(chalk.red(`⚠️  Critical: Session limit at ${pctSessions.toFixed(0)}%!`));
    } else if (pctSessions >= 75) {
      warnings.push(chalk.yellow(`⚠️  Warning: Session limit at ${pctSessions.toFixed(0)}%`));
    }
  }

  return warnings;
}

/**
 * Format statistics as JSON
 */
export function formatJson(stats: StatsOutput): string {
  return JSON.stringify(stats, null, 2);
}
