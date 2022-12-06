chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
  if (message.name === 'startScreenshot') {
    (async () => {
      let tabs = await chrome.tabs.query({ currentWindow: true, active: true });
      let tab = tabs[0];
      let dataUrl = await chrome.tabs.captureVisibleTab();
      chrome.tabs.sendMessage((tab.id as number),
        {
          name: "screenshotUrl",
          dataUrl,
          websiteUrl: tab.url,
        },
        (response) => { })
    })();
  }
});