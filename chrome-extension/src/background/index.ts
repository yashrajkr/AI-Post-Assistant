/**
 * Background service worker.
 * Runs in background — handles context menus + message routing.
 *
 * NOTE: Service workers go to SLEEP after 30s of inactivity.
 * Don't store state in module-level variables. Use chrome.storage.
 */

// ---- Context menu setup (runs on install) ----

chrome.runtime.onInstalled.addListener(() => {
  // Context menu: when user selects text
  chrome.contextMenus.create({
    id: 'generate-from-text',
    title: '✨ Generate posts from "%s"',
    contexts: ['selection'],
  });

  // Context menu: when user right-clicks an image
  chrome.contextMenus.create({
    id: 'analyze-image',
    title: '🔍 Analyze image with AI',
    contexts: ['image'],
  });

  // Context menu: when user right-clicks a link
  chrome.contextMenus.create({
    id: 'generate-from-link',
    title: '✨ Generate posts from this link',
    contexts: ['link'],
  });

  console.log('[AI Post Assistant] Extension installed. Context menus registered.');
});

// ---- Context menu click handler ----

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'generate-from-text' && info.selectionText) {
    // Open popup with pre-filled text
    // Note: chrome.action.openPopup() requires user gesture, so we send a message
    // and the popup will pick it up when it opens.
    await chrome.storage.session.set({ prefillText: info.selectionText });
    chrome.action.openPopup?.().catch(() => {
      // If popup can't open programmatically, show a notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'AI Post Assistant',
        message: 'Click the extension icon to generate posts from your selected text.',
      });
    });
  }

  if (info.menuItemId === 'analyze-image' && info.srcUrl) {
    // Fetch the image, convert to base64, send to popup
    try {
      const response = await fetch(info.srcUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await chrome.storage.session.set({ prefillImage: base64 });
        chrome.action.openPopup?.().catch(() => {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-128.png',
            title: 'AI Post Assistant',
            message: 'Click the extension icon to analyze your image.',
          });
        });
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('[AI Post Assistant] Failed to fetch image:', err);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'AI Post Assistant',
        message: 'Could not load that image. Try a different one.',
      });
    }
  }

  if (info.menuItemId === 'generate-from-link' && info.linkUrl) {
    // For links, we'll just use the URL as the content
    await chrome.storage.session.set({ prefillText: info.linkUrl });
    chrome.action.openPopup?.().catch(() => {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'AI Post Assistant',
        message: 'Click the extension icon to generate posts from this link.',
      });
    });
  }
});

// ---- Forward prefill data to popup when it opens ----

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'POPUP_OPENED') {
    // Popup is asking for any prefill data
    chrome.storage.session.get(['prefillText', 'prefillImage']).then((data) => {
      sendResponse(data);
      // Clear the session storage after forwarding
      chrome.storage.session.remove(['prefillText', 'prefillImage']);
    });
    return true; // keep channel open for async response
  }
});

// ---- Keyboard shortcut handler ----

chrome.commands?.onCommand.addListener(async (command) => {
  if (command === '_execute_action') {
    // Get active tab's selected text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      try {
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection()?.toString() || '',
        });
        if (result) {
          await chrome.storage.session.set({ prefillText: result });
        }
      } catch (err) {
        // Can't access tab (e.g., chrome:// pages) — ignore
      }
    }
  }
});

// Keep service worker alive (optional)
// Chrome kills service workers after 30s. This is fine — they wake up on events.
// Don't try to keep it alive with setInterval — that's a Chrome policy violation.
