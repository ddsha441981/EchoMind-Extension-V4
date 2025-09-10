console.log("✅ content.js loaded");

let lastInjectedTranscript = null; 

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("📨 Message received in content script:", msg);

  if (msg.action === 'startAudioCapture') {
    
    sendResponse({ status: 'started' });
    return true;
  } else if (msg.action === 'stopAudioCapture') {
    sendResponse({ status: 'stopped' });
    return true;
  } else if (msg.action === 'injectTranscript') {
    if (msg.transcript !== lastInjectedTranscript) {
      insertTranscript(msg.transcript);
      lastInjectedTranscript = msg.transcript;
      sendResponse({ status: 'injected' });
    } else {
      console.log("📝 Skipped duplicate transcript:", msg.transcript);
      sendResponse({ status: 'skipped' });
    }
    return true;
  } else if (msg.action === 'transcript') {
    
    if (msg.text !== lastInjectedTranscript) {
      insertTranscript(msg.text);
      lastInjectedTranscript = msg.text;
      sendResponse({ status: 'transcript inserted' });
    } else {
      console.log("📝 Skipped duplicate transcript:", msg.text);
      sendResponse({ status: 'skipped' });
    }
    return true;
  }

  return false;
});

function insertTranscript(text) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    console.log("📝 Empty transcript, skipping injection");
    return;
  }

 
  const currentUrl = window.location.href;
  let promptBox = null;
  let useInnerText = false;

  if (currentUrl.startsWith('https://gemini.google.com/')) {
   
    promptBox = document.querySelector('div.ql-editor[contenteditable="true"]');
    useInnerText = true;
  } else if (currentUrl.startsWith('https://chatgpt.com/')) {
   
    promptBox = document.querySelector('div#prompt-textarea[contenteditable="true"]');
    useInnerText = true;
  } else if (currentUrl.startsWith('https://copilot.microsoft.com/')) {
    
    promptBox = document.querySelector('textarea#userInput');
    useInnerText = false;
  } else if (currentUrl.startsWith('https://www.deepseek.com/') || currentUrl.startsWith('https://chat.deepseek.com/')) {
   
    promptBox = document.querySelector('textarea#chat-input');
    useInnerText = false;
  } else if (currentUrl.startsWith('https://www.blackbox.ai/')) {
   
    promptBox = document.querySelector('textarea#chat-input-box');
    useInnerText = false;
  } else if (currentUrl.startsWith('https://grok.x.ai/')) {
    
    promptBox = document.querySelector('textarea[aria-label="Ask Grok anything"]');
    useInnerText = false;
  } else if (currentUrl.startsWith('https://claude.ai/') || currentUrl.startsWith('https://www.anthropic.com/')) {
    
    promptBox = document.querySelector('div.ProseMirror[contenteditable="true"]');
    useInnerText = true;
  }

  if (promptBox) {
    if (useInnerText) {
     
      let currentText = promptBox.innerText.trim();
      if (currentText) {
        promptBox.innerText = currentText + ' ' + trimmedText;
      } else {
        promptBox.innerText = trimmedText;
      }
      const inputEvent = new Event('input', { bubbles: true });
      promptBox.dispatchEvent(inputEvent);
    } else {
      
      let currentText = promptBox.value.trim();
      if (currentText) {
        promptBox.value = currentText + ' ' + trimmedText;
      } else {
        promptBox.value = trimmedText;
      }
      const inputEvent = new Event('input', { bubbles: true });
      promptBox.dispatchEvent(inputEvent);
    }
    console.log("📝 Transcript injected:", trimmedText);
  } else {
    console.warn("⚠️ Could not find input field for transcript injection on this platform");
  }
}

