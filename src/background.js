// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('src/index.html')
  });
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setAsNewTab') {
    // Enable the new tab override
    chrome.storage.sync.set({ isNewTabPage: true }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async response
  }
});

