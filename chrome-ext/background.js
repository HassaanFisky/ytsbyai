// Background script for Chrome extension

// Configuration
const API_BASE_URL = 'https://your-backend-url.onrender.com/api/v1';

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    handleSummarize(request, sendResponse);
    return true; // Keep message channel open for async response
  }
});

// Handle summarize request
async function handleSummarize(request, sendResponse) {
  try {
    // Get trial token first
    const trialResponse = await fetch(`${API_BASE_URL}/trial-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!trialResponse.ok) {
      throw new Error('Failed to get trial token');
    }

    const trialData = await trialResponse.json();
    
    // Create summary request
    const summaryResponse = await fetch(`${API_BASE_URL}/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${trialData.trial_token}`
      },
      body: JSON.stringify({
        youtube_url: request.videoUrl,
        tone: 'professional',
        max_length: 500
      })
    });

    if (!summaryResponse.ok) {
      throw new Error('Failed to create summary');
    }

    const summaryData = await summaryResponse.json();
    
    // Create summary URL
    const summaryUrl = `https://ytsbyai.vercel.app/summary?video_id=${request.videoId}&summary=${encodeURIComponent(JSON.stringify(summaryData))}`;
    
    sendResponse({
      success: true,
      summaryUrl: summaryUrl,
      summary: summaryData
    });

  } catch (error) {
    console.error('Summarize error:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open welcome page
    chrome.tabs.create({
      url: 'https://ytsbyai.vercel.app/welcome'
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('youtube.com/watch')) {
    // Extract video ID and open summary page
    const videoId = extractVideoId(tab.url);
    if (videoId) {
      chrome.tabs.create({
        url: `https://ytsbyai.vercel.app/summary?video_id=${videoId}`
      });
    }
  } else {
    // Open main page
    chrome.tabs.create({
      url: 'https://ytsbyai.vercel.app'
    });
  }
});

// Helper function to extract video ID
function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
} 