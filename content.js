let emojiName = "";

// Load saved emoji name from storage
chrome.storage.sync.get(['emojiName'], (result) => {
  if (result.emojiName) {
    emojiName = result.emojiName;
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateEmoji') {
    emojiName = message.emojiName || "";
  }
});

document.addEventListener('keydown', (e) => {
  // Check for Ctrl+I (or Cmd+I on Mac)
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    e.stopPropagation();
    insertEmoji();
  }
}, true); // Use capture phase to intercept before Notion

function insertEmoji() {
  const activeElement = document.activeElement;

  // Check if we're in an editable area
  if (!activeElement || !isEditable(activeElement)) {
    return;
  }

  // Check if emoji name is set
  if (!emojiName || emojiName.trim() === '') {
    showNotification('アイコン名を設定してください（拡張機能のアイコンをクリック）');
    return;
  }

  // Insert text at cursor position using execCommand for contenteditable
  // 非推奨だがundo/redo させるためにこっちのほうが有利
  document.execCommand('insertText', false, ':' + emojiName);

  // Wait a bit for Notion to show the emoji picker, then press Enter
  setTimeout(() => {
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true
    });
    activeElement.dispatchEvent(enterEvent);
  }, 100);
}

function showNotification(message) {
  // Remove existing notification if any
  const existing = document.getElementById('notion-insert-icon-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'notion-insert-icon-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #37352f;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function isEditable(element) {
  // Check for contenteditable
  if (element.isContentEditable) {
    return true;
  }

  // Check for input/textarea
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') {
    return !element.readOnly && !element.disabled;
  }

  // Check parent elements (Notion uses nested contenteditable)
  let parent = element.parentElement;
  while (parent) {
    if (parent.isContentEditable) {
      return true;
    }
    parent = parent.parentElement;
  }

  return false;
}
