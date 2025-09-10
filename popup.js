document.addEventListener('DOMContentLoaded', () => {
  const activateBtn = document.getElementById('activateBtn');

  activateBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const supportedDomains = [
        'https://gemini.google.com/',
        'https://chatgpt.com/',
        'https://copilot.microsoft.com/',
        "https://www.deepseek.com/",
        "https://chat.deepseek.com/",
        "https://www.blackbox.ai/",
        "https://grok.x.ai/",
        "https://claude.ai/",
        "https://www.anthropic.com/"
      ];
      if (tabs.length === 0 || !supportedDomains.some(domain => tabs[0].url.startsWith(domain))) {
        alert('Please navigate to a supported chat platform (Gemini, ChatGPT, Copilot, Deepseek, Grok, Blackbox, Claude) to use this extension.');
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: createInPagePopup
      });

      window.close();
    });
  });
});

function createInPagePopup() {
  if (document.getElementById('transcriber-popup')) {
    return;
  }

  const popup = document.createElement('div');
  popup.id = 'transcriber-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.width = '240px';
  popup.style.padding = '24px';
  popup.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
  popup.style.border = 'none';
  popup.style.borderRadius = '20px';
  popup.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
  popup.style.zIndex = '9999';
  popup.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  popup.style.cursor = 'move';
  popup.style.backdropFilter = 'blur(20px) saturate(1.8)';
  popup.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';


  const bgPattern = document.createElement('div');
  bgPattern.style.position = 'absolute';
  bgPattern.style.top = '0';
  bgPattern.style.left = '0';
  bgPattern.style.width = '100%';
  bgPattern.style.height = '100%';
  bgPattern.style.borderRadius = '20px';
  bgPattern.style.background = 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)';
  bgPattern.style.pointerEvents = 'none';
  popup.appendChild(bgPattern);


  const title = document.createElement('h3');
  title.textContent = 'EchoMind';
  title.style.margin = '0 0 24px';
  title.style.fontSize = '18px';
  title.style.fontWeight = '700';
  title.style.textAlign = 'center';
  title.style.color = '#1a1a1a';
  title.style.cursor = 'move';
  title.style.letterSpacing = '0.8px';
  title.style.position = 'relative';
  title.style.zIndex = '2';
  title.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  title.style.backgroundClip = 'text';
  title.style.webkitBackgroundClip = 'text';
  title.style.webkitTextFillColor = 'transparent';
  title.style.textShadow = '0 2px 4px rgba(0,0,0,0.1)';
  popup.appendChild(title);


  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.marginBottom = '24px';
  buttonContainer.style.position = 'relative';
  buttonContainer.style.zIndex = '2';
  popup.appendChild(buttonContainer);


  const pulseContainer = document.createElement('div');
  pulseContainer.style.position = 'absolute';
  pulseContainer.style.width = '90px';
  pulseContainer.style.height = '90px';
  pulseContainer.style.borderRadius = '50%';
  pulseContainer.style.top = '50%';
  pulseContainer.style.left = '50%';
  pulseContainer.style.transform = 'translate(-50%, -50%)';
  pulseContainer.style.pointerEvents = 'none';
  buttonContainer.appendChild(pulseContainer);


  for (let i = 0; i < 3; i++) {
    const pulseRing = document.createElement('div');
    pulseRing.className = 'pulse-ring';
    pulseRing.style.position = 'absolute';
    pulseRing.style.width = '100%';
    pulseRing.style.height = '100%';
    pulseRing.style.borderRadius = '50%';
    pulseRing.style.border = '2px solid rgba(76, 175, 80, 0.3)';
    pulseRing.style.animationDelay = `${i * 0.4}s`;
    pulseContainer.appendChild(pulseRing);
  }


  const micBtn = document.createElement('button');
  micBtn.style.width = '80px';
  micBtn.style.height = '80px';
  micBtn.style.border = 'none';
  micBtn.style.borderRadius = '50%';
  micBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 30%, #66BB6A 100%)';
  micBtn.style.cursor = 'pointer';
  micBtn.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  micBtn.style.boxShadow = '0 8px 32px rgba(76, 175, 80, 0.3), 0 4px 16px rgba(76, 175, 80, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.1)';
  micBtn.style.position = 'relative';
  micBtn.style.overflow = 'hidden';
  micBtn.style.display = 'flex';
  micBtn.style.alignItems = 'center';
  micBtn.style.justifyContent = 'center';
  micBtn.style.zIndex = '10';
  

  micBtn.style.backgroundImage = 'radial-gradient(ellipse at 25% 25%, rgba(255,255,255,0.5) 0%, transparent 50%), linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)';


  const glowBorder = document.createElement('div');
  glowBorder.style.position = 'absolute';
  glowBorder.style.top = '-3px';
  glowBorder.style.left = '-3px';
  glowBorder.style.width = 'calc(100% + 6px)';
  glowBorder.style.height = 'calc(100% + 6px)';
  glowBorder.style.borderRadius = '50%';
  glowBorder.style.background = 'conic-gradient(from 0deg, transparent, #4CAF50, transparent, #45a049, transparent)';
  glowBorder.style.opacity = '0';
  glowBorder.style.transition = 'opacity 0.3s ease';
  glowBorder.style.animation = 'spin 3s linear infinite';
  micBtn.appendChild(glowBorder);


  const innerButton = document.createElement('div');
  innerButton.style.position = 'absolute';
  innerButton.style.top = '3px';
  innerButton.style.left = '3px';
  innerButton.style.width = 'calc(100% - 6px)';
  innerButton.style.height = 'calc(100% - 6px)';
  innerButton.style.borderRadius = '50%';
  innerButton.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 30%, #66BB6A 100%)';
  innerButton.style.backgroundImage = 'radial-gradient(ellipse at 25% 25%, rgba(255,255,255,0.5) 0%, transparent 50%)';
  micBtn.appendChild(innerButton);
  

  const particlesContainer = document.createElement('div');
  particlesContainer.style.position = 'absolute';
  particlesContainer.style.width = '100%';
  particlesContainer.style.height = '100%';
  particlesContainer.style.borderRadius = '50%';
  particlesContainer.style.overflow = 'hidden';
  particlesContainer.style.pointerEvents = 'none';
  micBtn.appendChild(particlesContainer);


  if (!document.getElementById('enhanced-animations')) {
    const style = document.createElement('style');
    style.id = 'enhanced-animations';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.8;
        }
        100% {
          transform: scale(1.8);
          opacity: 0;
        }
      }
      
      .pulse-ring {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-10px) rotate(120deg); }
        66% { transform: translateY(5px) rotate(240deg); }
      }
      
      @keyframes recordingPulse {
        0%, 100% { 
          box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4),
                      0 8px 32px rgba(244, 67, 54, 0.3),
                      inset 0 2px 4px rgba(255, 255, 255, 0.3);
        }
        50% { 
          box-shadow: 0 0 0 20px rgba(244, 67, 54, 0),
                      0 8px 32px rgba(244, 67, 54, 0.3),
                      inset 0 2px 4px rgba(255, 255, 255, 0.3);
        }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%) rotate(45deg); }
        100% { transform: translateX(200%) rotate(45deg); }
      }
      
      .shimmer-effect {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%);
        animation: shimmer 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }


  const micIcon = document.createElement('div');
  micIcon.innerHTML = `
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); position: relative; z-index: 5;">
      <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2Z" fill="white" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
      <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H7V12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12V10H19Z" fill="white" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
      <path d="M12 19V22H5V20H19V22H12Z" fill="white" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
      <circle cx="12" cy="8" r="1.5" fill="rgba(255,255,255,0.8)"/>
    </svg>
  `;
  micIcon.style.position = 'relative';
  micIcon.style.zIndex = '20';
  micIcon.style.transition = 'all 0.3s ease';
  micBtn.appendChild(micIcon);

  buttonContainer.appendChild(micBtn);


  const bottomBtnContainer = document.createElement('div');
  bottomBtnContainer.style.display = 'flex';
  bottomBtnContainer.style.justifyContent = 'center';
  bottomBtnContainer.style.gap = '16px';
  bottomBtnContainer.style.position = 'relative';
  bottomBtnContainer.style.zIndex = '2';
  popup.appendChild(bottomBtnContainer);


  const executeBtn = document.createElement('button');
  executeBtn.textContent = 'Prompt';
  executeBtn.style.padding = '12px 24px';
  executeBtn.style.fontSize = '14px';
  executeBtn.style.fontWeight = '600';
  executeBtn.style.border = 'none';
  executeBtn.style.borderRadius = '12px';
  executeBtn.style.background = 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)';
  executeBtn.style.color = 'white';
  executeBtn.style.cursor = 'pointer';
  executeBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  executeBtn.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
  executeBtn.style.position = 'relative';
  executeBtn.style.overflow = 'hidden';
  bottomBtnContainer.appendChild(executeBtn);


  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.padding = '12px 24px';
  closeBtn.style.fontSize = '14px';
  closeBtn.style.fontWeight = '600';
  closeBtn.style.border = '1px solid rgba(0, 0, 0, 0.1)';
  closeBtn.style.borderRadius = '12px';
  closeBtn.style.backgroundColor = 'rgba(248, 250, 252, 0.8)';
  closeBtn.style.color = '#64748b';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.transition = 'all 0.3s ease';
  closeBtn.style.backdropFilter = 'blur(10px)';
  bottomBtnContainer.appendChild(closeBtn);


  micBtn.addEventListener('mouseenter', () => {
    micBtn.style.transform = 'scale(1.1) translateY(-2px)';
    micBtn.style.boxShadow = '0 12px 40px rgba(76, 175, 80, 0.4), 0 8px 24px rgba(76, 175, 80, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.4)';
    glowBorder.style.opacity = '1';
    

    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer-effect';
    shimmer.style.borderRadius = '50%';
    micBtn.appendChild(shimmer);
    
    setTimeout(() => shimmer.remove(), 2000);
  });

  micBtn.addEventListener('mouseleave', () => {
    if (!isRecording) {
      micBtn.style.transform = 'scale(1) translateY(0)';
      micBtn.style.boxShadow = '0 8px 32px rgba(76, 175, 80, 0.3), 0 4px 16px rgba(76, 175, 80, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3)';
      glowBorder.style.opacity = '0';
    }
  });

  executeBtn.addEventListener('mouseenter', () => {
    executeBtn.style.transform = 'translateY(-2px) scale(1.02)';
    executeBtn.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
  });

  executeBtn.addEventListener('mouseleave', () => {
    executeBtn.style.transform = 'translateY(0) scale(1)';
    executeBtn.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
  });

  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.backgroundColor = 'rgba(241, 245, 249, 0.9)';
    closeBtn.style.borderColor = 'rgba(0, 0, 0, 0.2)';
    closeBtn.style.transform = 'translateY(-1px)';
  });

  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.backgroundColor = 'rgba(248, 250, 252, 0.8)';
    closeBtn.style.borderColor = 'rgba(0, 0, 0, 0.1)';
    closeBtn.style.transform = 'translateY(0)';
  });


  function createEnhancedRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '15';
    

    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 800);
  }

  // Add drag functionality
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  title.addEventListener('mousedown', (e) => {
    isDragging = true;
    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;
    popup.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      popup.style.left = currentX + 'px';
      popup.style.top = currentY + 'px';
      popup.style.transform = 'none';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      popup.style.cursor = 'move';
    }
  });

  // Initialize position for dragging
  const rect = popup.getBoundingClientRect();
  currentX = rect.left;
  currentY = rect.top;


  let isRecording = false;

  micBtn.addEventListener('click', (e) => {
    createEnhancedRipple(e);
    
    chrome.runtime.sendMessage({ action: 'toggleRecording' }, (response) => {
      if (response.status === 'toggled') {
        isRecording = !isRecording;
        if (isRecording) {
          // Recording started 
          micIcon.innerHTML = `
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); position: relative; z-index: 5;">
              <rect x="8" y="8" width="8" height="8" rx="2" fill="white" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
              <circle cx="12" cy="12" r="1" fill="rgba(255,255,255,0.9)"/>
            </svg>
          `;
          
          micBtn.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 30%, #ef5350 100%)';
          micBtn.style.animation = 'recordingPulse 1.5s ease-in-out infinite';
          glowBorder.style.background = 'conic-gradient(from 0deg, transparent, #f44336, transparent, #d32f2f, transparent)';
          

          const pulseRings = pulseContainer.querySelectorAll('.pulse-ring');
          pulseRings.forEach(ring => {
            ring.style.borderColor = 'rgba(244, 67, 54, 0.4)';
          });
          
          innerButton.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 30%, #ef5350 100%)';
          
          console.log('Recording started');
        } else {
          // Recording stopped 
          micIcon.innerHTML = `
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); position: relative; z-index: 5;">
              <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2Z" fill="white" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
              <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H7V12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12V10H19Z" fill="white" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
              <path d="M12 19V22H5V20H19V22H12Z" fill="white" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
              <circle cx="12" cy="8" r="1.5" fill="rgba(255,255,255,0.8)"/>
            </svg>
          `;
          
          micBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 30%, #66BB6A 100%)';
          micBtn.style.animation = 'none';
          glowBorder.style.background = 'conic-gradient(from 0deg, transparent, #4CAF50, transparent, #45a049, transparent)';
          

          const pulseRings = pulseContainer.querySelectorAll('.pulse-ring');
          pulseRings.forEach(ring => {
            ring.style.borderColor = 'rgba(76, 175, 80, 0.3)';
          });
          
          innerButton.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 30%, #66BB6A 100%)';
          
          console.log('Recording stopped');
        }
      } else if (response.status === 'error') {
        alert(response.message || 'Failed to toggle recording. Ensure you are on a supported platform.');
      }
    });
  });


  executeBtn.addEventListener('click', () => {
    const promptPath = chrome.runtime.getURL('prompt.txt');
    
    fetch(promptPath)
      .then(response => response.text())
      .then(promptText => {
        chrome.runtime.sendMessage({ action: 'insertPrompt', prompt: promptText });
        executeBtn.disabled = true;
        executeBtn.style.opacity = '0.5';
        executeBtn.style.cursor = 'not-allowed';
        executeBtn.style.background = 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)';
        executeBtn.style.boxShadow = 'none';
        executeBtn.style.transform = 'none';
        executeBtn.textContent = 'Used';
      })
      .catch(error => {
        console.error("❌ Error reading prompt.txt:", error);
      });
  });

  closeBtn.addEventListener('click', () => {
    if (isRecording) {
      chrome.runtime.sendMessage({ action: 'toggleRecording' }, (response) => {
        if (response.status === 'toggled') {
          isRecording = false;
          console.log('Recording stopped on close');
        }
        popup.remove();
      });
    } else {
      popup.remove();
    }
  });

  document.body.appendChild(popup);
}
