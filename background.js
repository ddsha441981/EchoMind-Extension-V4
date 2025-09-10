let ws = null;
let isRecording = false;
const transcriptCache = new Map(); 
const CACHE_DURATION = 5000; 

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("📨 Background received message:", msg);

  if (msg.action === 'toggleRecording') {
    if (!isRecording) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
       const supportedDomains = [
        'https://gemini.google.com/',
        'https://chatgpt.com/',
        'https://copilot.microsoft.com/',
        "https://www.deepseek.com/*", "https://chat.deepseek.com/*",
        "https://www.blackbox.ai/*",
        "https://grok.x.ai/*",
        "https://claude.ai/*", "https://www.anthropic.com/*"
      ];
        if (tabs.length === 0 || !supportedDomains.some(domain => tabs[0].url.startsWith(domain))) {
          sendResponse({ status: 'error', message: 'Active tab must be on a supported chat platform (Gemini, ChatGPT, Copilot, Deepseek, Grok, Blackbox, Claude)' });
          return;
        }
        startWebSocket();
        sendResponse({ status: 'toggled' });
      });
    } else {
      stopWebSocket();
      sendResponse({ status: 'toggled' });
    }
  } else if (msg.action === 'insertPrompt') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.warn("⚠️ No active tab found for prompt insertion.");
            sendResponse({ status: 'error', message: 'No active tab found.' });
            return;
        }

        const tabId = tabs[0].id;
        const promptToInsert = msg.prompt;

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: insertTextIntoActiveElement,
            args: [promptToInsert]
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("❌ Script injection failed for prompt insertion: ", chrome.runtime.lastError.message);
                sendResponse({ status: 'error', message: 'Failed to insert prompt into the tab.' });
            } else {
                console.log("✅ Prompt inserted successfully!");
                sendResponse({ status: 'success' });
            }
        });
    });
    return true; 
  }
  return true;
});

function startWebSocket() {
  ws = new WebSocket('ws://localhost:8081'); 

  ws.onopen = () => {
    console.log('✅ WebSocket opened');
    isRecording = true;
    ws.send('start'); 
    transcriptCache.clear(); 
    sendToActiveTab({ action: 'startAudioCapture' });
  };

  ws.onmessage = (event) => {
    const data = event.data;
    console.log("📥 Received from proxy:", data);
    if (data === 'status:stopped') {
      isRecording = false;
      transcriptCache.clear(); 
      sendToActiveTab({ action: 'stopAudioCapture' });
    } else {
      
      const now = Date.now();
      if (!transcriptCache.has(data)) {
        transcriptCache.set(data, now); 
        console.log("📥 Sending new transcript to content script:", data);
        sendToActiveTab({ action: 'injectTranscript', transcript: data });
      } else {
        console.log("📥 Skipped duplicate transcript:", data);
      }
      
      for (const [transcript, timestamp] of transcriptCache) {
        if (now - timestamp > CACHE_DURATION) {
          transcriptCache.delete(transcript);
        }
      }
    }
  };

  ws.onclose = () => {
    console.log('❌ WebSocket closed');
    isRecording = false;
    transcriptCache.clear(); 
    sendToActiveTab({ action: 'stopAudioCapture' });
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };
}

function stopWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send('stop'); 
    ws.close();
  }
}

function sendToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.warn("⚠️ No active tab found");
      return;
    }
    const tab = tabs[0];
    const supportedDomains = [
        'https://gemini.google.com/',
        'https://chatgpt.com/',
        'https://copilot.microsoft.com/',
        "https://www.deepseek.com/*", "https://chat.deepseek.com/*",
        "https://www.blackbox.ai/*",
        "https://grok.x.ai/*",
        "https://claude.ai/*", "https://www.anthropic.com/*"
    ];
    if (!tab.url || !supportedDomains.some(domain => tab.url.startsWith(domain))) {
      console.warn("⚠️ Active tab is not on a supported chat platform, cannot send message");
      return;
    }
    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("⚠️ Message failed:", chrome.runtime.lastError.message);
        return;
      }
      console.log("📨 Response from content:", response);
    });
  });
}

// Inject Prompt
function insertTextIntoActiveElement(text) {
  const activeElement = document.activeElement;

  if (activeElement && (activeElement.tagName === 'TEXTAREA' || (activeElement.tagName === 'INPUT' && activeElement.type === 'text'))) {
    activeElement.value += text;
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    activeElement.dispatchEvent(new Event('change', { bubbles: true })); 
  } else if (activeElement && activeElement.isContentEditable) {
   
    const selection = window.getSelection();
    if (selection) {
      const range = selection.getRangeAt(0);
      range.deleteContents(); 
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
     
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
     
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      activeElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else {
        console.warn("No active text input field found. Attempting to find a common chat input element.");

    const commonSelectors = [
      'textarea[placeholder*="message"]',
      'input[placeholder*="message"]',    
      'div[role="textbox"]',              
      'div[contenteditable="true"]',      
      '#prompt-textarea' ,                
      'textarea#userInput',
      'textarea#chat-input',
      'div#prompt-textarea[contenteditable="true"]'
    
    ];

    for (const selector of commonSelectors) {
      const inputElement = document.querySelector(selector);
      if (inputElement) {
        if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
          inputElement.value += text;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));
          break; 
        } else if (inputElement.isContentEditable) {
          inputElement.textContent += text;
         
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(inputElement);
          range.collapse(false); 
          sel.removeAllRanges();
          sel.addRange(range);
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));
          break; 
        }
      }
    }
  }
}

