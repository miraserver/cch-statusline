# CCH Statusline

Monitor your **Claude Code Hub** statistics directly in Claude Code's statusline.

## ✨ New in v1.2.4

- 🎨 **Multi-line statusline support** - properly displays two lines in Claude Code
- ✨ **Emoji indicators** - added ⏱️ (5h), 📅 (weekly), 📆 (monthly) on limits line for better clarity
- 🤖 **Smarter model detection** - shows the actual model being used (prioritizes expensive models like Sonnet)
- 🔧 **Fixed multi-line rendering** - second line now displays correctly in Claude Code statusline

## Features

- 📊 Real-time statistics monitoring per API key
- 💰 Cost tracking with daily quota visualization
- 🤖 Model and provider tracking
- 🎨 Multiple output formats (statusline, detailed, JSON)
- 👀 Watch mode for continuous monitoring
- 🚨 Smart warnings when approaching limits (75% yellow, 90% red)
- ⚡ Built-in caching (7s TTL) to reduce API load
- 🔑 Auto-detection from Claude Code environment
- 🪟 Full Windows support (PowerShell, Batch, Node.js)
- 🎯 Zero-config integration with Claude Code CLI

## Quick Start

### Using npx (Recommended)

No installation needed! Run directly:

```bash
npx cch-statusline -k sk-your-api-key
```

### Installation

```bash
npm install -g cch-statusline
```

Then run:

```bash
cch-statusline -k sk-your-api-key
```

## Usage

### Basic Usage

```bash
# Show statusline format (default)
npx cch-statusline -k sk-your-api-key -u https://your-cch-instance.com

# Output: 💰 $15.58/100 | 📊 554 req | 🤖 sonnet-4 | ⚡ Provider Name
```

### Detailed Statistics (Enhanced with Progress Bars)

```bash
npx cch-statusline -k sk-your-api-key -f detailed
```

Output with color-coded progress bars:
```
📊 Claude Code Hub Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Today:
   Cost:     $15.1778
   Daily:    ██░░░░░░░░░░░░░ 15% ($15.18 / $100)
   Requests: 544
   Model:    claude-sonnet-4-5-20250929
   Provider: CRS Claude PRO

🤖 Models:
   claude-sonnet-4-5-20250929: 291 calls $14.9919
   claude-haiku-4-5-20251001: 253 calls $0.1859

💵 Limits:
   5-Hour:  $0.0000 (no limit)
   Weekly:  $0.0000 (no limit)
   Monthly: $0.0000 (no limit)

🔥 Sessions: 0 (no limit)
```

**Smart Warnings** (automatically shown when approaching limits):
```
⚠️  Warning: Weekly limit at 78%
⚠️  Critical: Monthly limit at 92%!
```

### JSON Output

```bash
npx cch-statusline -k sk-your-api-key -f json
```

### Watch Mode

Continuously monitor statistics (refresh every 30 seconds by default):

```bash
# Default 30 seconds
npx cch-statusline -k sk-your-api-key -w

# Custom interval (60 seconds)
npx cch-statusline -k sk-your-api-key -w 60
```

### Custom URL

If your CCH instance is not at the default URL:

```bash
npx cch-statusline -u https://your-domain.com -k sk-your-api-key
```

## Environment Variables

You can set environment variables instead of passing command-line arguments:

```bash
# .env file
CCH_URL=https://your-cch-instance.com
CCH_API_KEY=sk-your-api-key-here
```

Then run:

```bash
npx cch-statusline
```

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--url <url>` | `-u` | CCH API URL | `https://your-cch-instance.com` |
| `--key <key>` | `-k` | API Key (required) | - |
| `--format <format>` | `-f` | Output format: `statusline`, `detailed`, `json` | `statusline` |
| `--watch [interval]` | `-w` | Watch mode (refresh every N seconds) | `false` |
| `--version` | `-V` | Show version | - |
| `--help` | `-h` | Show help | - |

## 🔗 Claude Code CLI Integration

**Zero-config integration!** Automatically uses Claude Code's existing credentials.

### Quick Setup (30 seconds)

**Step 1:** Copy the integration script

Windows (PowerShell):
```powershell
mkdir -Force $env:USERPROFILE\.claude
copy cch-statusline\examples\statusline.cjs $env:USERPROFILE\.claude\statusline.cjs
```

Linux/macOS:
```bash
mkdir -p ~/.claude
cp cch-statusline/examples/statusline.cjs ~/.claude/statusline.cjs
chmod +x ~/.claude/statusline.cjs
```

**Step 2:** Configure Claude Code

Add to `.claude/settings.json`:

Windows:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"%USERPROFILE%\\.claude\\statusline.cjs\"",
    "padding": 0
  }
}
```

Linux/macOS:
```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.cjs",
    "padding": 0
  }
}
```

**Step 3:** Restart Claude Code

Done! Your statusline will show:
```
💰 $15.58/100 | 📊 554 req | 🤖 sonnet-4 | ⚡ CRS Claude PRO
```

That's it! The script automatically uses `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` from Claude Code's environment.

### Legacy Setup (Environment Variables)

If you prefer manual configuration:

Linux/macOS:
```bash
export CCH_API_KEY="sk-your-api-key-here"
export CCH_URL="https://your-cch-instance.com"

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export CCH_API_KEY="sk-your-api-key-here"' >> ~/.bashrc
```

Windows (PowerShell):
```powershell
[System.Environment]::SetEnvironmentVariable('CCH_API_KEY', 'sk-your-api-key-here', 'User')
[System.Environment]::SetEnvironmentVariable('CCH_URL', 'https://your-cch-instance.com', 'User')

# Restart terminal after setting
```

**2. Copy script:**

Linux/macOS:
```bash
mkdir -p ~/.claude
cp examples/claude-statusline.cjs ~/.claude/statusline.cjs
chmod +x ~/.claude/statusline.cjs
```

Windows:
```powershell
mkdir -Force $env:USERPROFILE\.claude
copy examples\claude-statusline.cjs $env:USERPROFILE\.claude\statusline.cjs
```

**3. Update `.claude/settings.json`:**

Linux/macOS:
```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.cjs",
    "padding": 0
  }
}
```

Windows:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"%USERPROFILE%\\.claude\\statusline.cjs\"",
    "padding": 0
  }
}
```

**4. Restart Claude Code CLI**

Expected output in statusline:
```
💰 $1.33 | 📊 57 req | ⚡ $0.00
```

## ⏱️ Performance & Caching

**Built-in 7-second cache** reduces API load:
- ✅ Maximum ~8-9 API calls per minute
- ✅ ~2,880 calls per 8-hour workday
- ✅ Automatic cache management
- ✅ Fresh data without excessive polling

## What's New in v1.1.0

- ✨ **Auto keyId detection** - Automatically extracts keyId from API response
- 🎨 **Enhanced visualization** - Color-coded progress bars for limits
- 🚨 **Smart warnings** - Automatic alerts at 75% (yellow) and 90% (red)
- ⚡ **Built-in caching** - 7-second cache TTL to reduce API load
- 🪟 **Windows support** - Full PowerShell/Batch/Node.js integration
- 📊 **Improved detailed view** - Better formatting with chalk colors

## Requirements

- Node.js >= 18.0.0
- A Claude Code Hub API key with `canLoginWebUi` enabled

## API Key Setup

1. Log in to your Claude Code Hub admin panel
2. Go to **Settings → Keys**
3. Create or edit a key
4. **Enable "Can Login Web UI"** checkbox
5. Copy the API key (e.g., `sk-your-api-key-here`)

## Troubleshooting

### "Login failed: 401"

- Ensure your API key is correct
- Verify that `canLoginWebUi` is enabled for the key

### "Failed to fetch overview: 403"

- Your key may not have permission to access statistics
- Check if the key is active and not expired

### "Connection refused"

- Verify the CCH URL is correct
- Check if your CCH instance is running

## Development

```bash
# Clone the repository
git clone <repo-url>
cd cch-statusline

# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/cli.js -k sk-your-api-key

# Watch mode during development
npm run dev
```

## License

MIT

## Contributing

Issues and pull requests are welcome!

## Author

Created for Claude Code Hub users who want real-time statistics monitoring.
