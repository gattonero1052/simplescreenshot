chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
  if (message.name === 'startScreenshot') {
    (async () => {
      let tabs = await chrome.tabs.query({ currentWindow:true, active: true });
      console.assert(tabs.length === 1,'Get multiple tabs activated.');
      let tab = tabs[0];
      let dataUrl = await chrome.tabs.captureVisibleTab();
      // chrome.runtime.sendMessage({ name: "screenshotUrl", dataUrl })
      chrome.tabs.sendMessage((tab.id as number),
        { 
          name: "screenshotUrl",
          dataUrl,
          websiteUrl: tab.url,
         },
        (response) => {})
    })();
  }
});