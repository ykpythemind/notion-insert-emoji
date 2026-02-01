// Popup script for Notion Insert Icon

document.addEventListener('DOMContentLoaded', () => {
  const emojiInput = document.getElementById('emoji');
  const saveButton = document.getElementById('save');
  const status = document.getElementById('status');

  // Load saved emoji name
  chrome.storage.sync.get(['emojiName'], (result) => {
    emojiInput.value = result.emojiName || "";
  });

  // Save emoji name
  saveButton.addEventListener('click', () => {
    const emojiName = emojiInput.value.trim() || "";
    chrome.storage.sync.set({ emojiName }, () => {
      // Send message to all Notion tabs
      chrome.tabs.query({ url: ['https://www.notion.so/*', 'https://notion.so/*'] }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { type: 'updateEmoji', emojiName });
        });
      });

      status.style.display = 'block';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    });
  });

  // Save on Enter key
  emojiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveButton.click();
    }
  });
});
