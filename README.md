# Tech News Feed Extension

A modern Edge browser extension that shows the top 20 tech news articles in a clean, dark-themed interface. Opens in a new tab and can optionally be set as your new tab page.

## Features

- Beautiful dark theme interface
- Top 20 tech news articles from Hacker News
- Opens in a new tab when clicking the extension icon
- Optional new tab page setting with confirmation
- Shows points, post time, and author
- No login required
- Minimal data storage (just new tab preference)
- Responsive grid layout

## Installation

1. Open Edge browser and navigate to `edge://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `tech-news-extension` folder

## Usage

1. Click the extension icon to open Tech News Feed in a new tab
2. Browse through the latest tech news
3. Click any article to open it in a new tab
4. Optionally, click "Set as New Tab Page" to see Tech News Feed every time you open a new tab

## Development and Debugging

1. Make changes to the source files (`popup.html`, `popup.js`, or `manifest.json`)
2. Go to `edge://extensions/`
3. Find your extension and click the refresh icon 🔄 to reload it
4. To view console logs and debug:
   - Right-click the extension icon
   - Click "Inspect popup"
   - This opens DevTools where you can:
     - View console logs
     - Set breakpoints in the Sources tab
     - Inspect elements
     - Monitor network requests
5. If you make changes to `manifest.json`, you'll need to reload the extension completely:
   - Go to `edge://extensions/`
   - Toggle the extension off and on, or
   - Click "Remove" and load it again using "Load unpacked"

## Note

You'll need to add extension icons (16x16, 48x48, and 128x128 pixels) in the `src` folder named:
- icon16.png
- icon48.png
- icon128.png
