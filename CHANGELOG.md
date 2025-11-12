# Changelog

All notable changes to this project will be documented in this file.

## [1.2.4] - 2025-01-10

### Added
- 🎨 **Multi-line statusline support** - properly displays two lines in Claude Code
- ✨ **Emoji indicators on limits line** - added ⏱️ (5h), 📅 (weekly), 📆 (monthly) for better visual clarity

### Changed
- **Output method**: Split output into multiple `console.log()` calls for proper multi-line rendering in Claude Code
- **Model selection logic**: Now shows model with highest cost instead of most frequent (prioritizes Sonnet over Haiku)

### Fixed
- Multi-line statusline now displays correctly in Claude Code (was only showing first line)
- Model display now correctly identifies the actual model being used (was stuck on Haiku)
- Fallback to `modelStats` when `lastUsedModel` is null

## [1.2.0] - 2025-01-09

### Added
- ✨ **Two-line statusline display** - second line always shows configured limits
- 📊 **Limit display format** - shows maximum limits as `/$X` format (e.g., `/$100`, `/$1000`)
- 🎯 **Smart limit formatting** - automatically switches to `$current/$limit` when usage data available via Redis
- 🤖 **Enhanced model display** - fixed model version parsing to show `haiku-4-5` instead of `haiku-4`
- 💵 **Limit thresholds support** - displays 5-hour, weekly, and monthly limits without Redis requirement
- 📝 **Zero-config setup** - renamed `claude-statusline-auto.cjs` to `statusline.cjs` for direct use

### Changed
- **Model parsing**: Updated from `slice(1, 3)` to `slice(1, 4)` for complete model version display
- **Second line behavior**: Always shows limits (not just warnings), removed abbreviations (W, M, 5h → full names)
- **Cache TTL**: Reduced from 10 seconds to 7 seconds for faster updates
- **Configuration**: Removed fallback URL requirement, both env vars now mandatory
- **Documentation**: Combined multiple READMEs into single comprehensive guide

### Fixed
- Model version display now correctly shows full version numbers
- Second line always visible regardless of limit usage
- Cleaned up example files and removed real API keys/URLs from documentation

### Performance
- Faster cache updates (7s TTL instead of 10s)
- Optimized limit display logic for better readability

## [1.1.0] - 2025-01-09

### Added
- ✨ **Auto keyId detection** from API login response (no more hardcoded -1)
- 🎨 **Color-coded progress bars** in detailed view (green/yellow/red based on usage)
- 🚨 **Smart warnings system** - automatic alerts when approaching limits
  - Yellow warning at 75% usage
  - Red critical alert at 90% usage
- ⚡ **Built-in caching** with configurable TTL (default 10 seconds)
  - Reduces API load significantly
  - Customizable via `cacheTTL` parameter
- 🪟 **Windows Integration Guide** (`WINDOWS_INTEGRATION.md`)
  - PowerShell script examples
  - Batch file templates
  - Environment variable configuration
  - Recommended polling intervals
- 📊 **Enhanced detailed view** with chalk color formatting
- 📝 **Comprehensive documentation** for Windows users

### Changed
- Improved `formatDetailed()` output with visual progress bars
- Updated README with new features and Windows instructions
- Enhanced error messages and logging

### Fixed
- KeyId now properly extracted from API response (was always -1)
- Progress bars correctly handle edge cases (0%, 100%+)

### Performance
- Cache reduces API calls by ~90% in typical usage
- Optimal polling interval recommendation: 60-120 seconds

## [1.0.0] - 2025-01-08

### Initial Release
- Basic statistics monitoring
- Three output formats (statusline, detailed, JSON)
- Watch mode support
- Environment variable configuration
- Cross-platform support (Linux, macOS, Windows)
