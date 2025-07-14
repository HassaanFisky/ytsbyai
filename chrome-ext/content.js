// Content script for YouTube video detection and button injection

let currentVideoId = null;
let summarizeButton = null;

// Function to extract video ID from URL
function getVideoId() {
  const url = window.location.href;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

// Function to create summarize button
function createSummarizeButton() {
  if (summarizeButton) {
    summarizeButton.remove();
  }

  summarizeButton = document.createElement('button');
  summarizeButton.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.2s ease;
      font-family: 'YouTube Sans', 'Roboto', sans-serif;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)'" 
       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      Summarize with AI
    </div>
  `;

  summarizeButton.addEventListener('click', handleSummarizeClick);
  
  return summarizeButton;
}

// Function to handle summarize button click
async function handleSummarizeClick() {
  if (!currentVideoId) return;

  try {
    // Show loading state
    summarizeButton.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: not-allowed;
        opacity: 0.8;
        font-family: 'YouTube Sans', 'Roboto', sans-serif;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
          <path d="M12 4v2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Summarizing...
      </div>
    `;

    // Send message to background script
    const response = await chrome.runtime.sendMessage({
      action: 'summarize',
      videoId: currentVideoId,
      videoUrl: window.location.href
    });

    if (response.success) {
      // Open summary in new tab
      window.open(response.summaryUrl, '_blank');
    } else {
      throw new Error(response.error || 'Failed to summarize video');
    }

  } catch (error) {
    console.error('Summarize error:', error);
    showError('Failed to summarize video. Please try again.');
  } finally {
    // Restore button
    const button = createSummarizeButton();
    if (summarizeButton.parentNode) {
      summarizeButton.parentNode.replaceChild(button, summarizeButton);
    }
    summarizeButton = button;
  }
}

// Function to show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: 'YouTube Sans', 'Roboto', sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    ">
      ${message}
    </div>
  `;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Function to inject button into YouTube interface
function injectButton() {
  // Look for the subscribe button area
  const subscribeButton = document.querySelector('#subscribe-button');
  const actionButtons = document.querySelector('#actions-inner');
  const belowMenu = document.querySelector('#below');
  
  let targetContainer = null;
  
  if (subscribeButton && subscribeButton.parentNode) {
    targetContainer = subscribeButton.parentNode;
  } else if (actionButtons) {
    targetContainer = actionButtons;
  } else if (belowMenu) {
    targetContainer = belowMenu;
  }
  
  if (targetContainer && !targetContainer.querySelector('.ytsbyai-summarize-btn')) {
    const button = createSummarizeButton();
    button.className = 'ytsbyai-summarize-btn';
    button.style.marginTop = '8px';
    targetContainer.appendChild(button);
    summarizeButton = button;
  }
}

// Function to remove button
function removeButton() {
  if (summarizeButton) {
    summarizeButton.remove();
    summarizeButton = null;
  }
}

// Main observer function
function observePage() {
  const videoId = getVideoId();
  
  if (videoId !== currentVideoId) {
    currentVideoId = videoId;
    
    if (videoId) {
      // Video page - inject button
      setTimeout(injectButton, 1000); // Wait for YouTube to load
    } else {
      // Not a video page - remove button
      removeButton();
    }
  }
}

// Start observing
const observer = new MutationObserver(observePage);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial check
observePage();

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style); 