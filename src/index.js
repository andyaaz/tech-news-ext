// Function to show toast message
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Function to format relative time
function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

// Function to handle setting homepage
async function handleSetHomepage() {
  const button = document.getElementById('setHomepage');

  // Show confirmation dialog
  const confirmed = confirm('Would you like to set Tech News Feed as your new tab page? You can change this later in your browser settings.');
  
  if (!confirmed) {
    showToast('New tab page setting cancelled');
    return;
  }

  try {
    // Send message to background script to enable new tab override
    const response = await chrome.runtime.sendMessage({ action: 'setAsNewTab' });
    
    if (response.success) {
      button.classList.add('active');
      showToast('Set as new tab page successfully!');
      
      // Create a new tab to demonstrate the change
      chrome.tabs.create({ url: 'chrome://newtab' });
    } else {
      throw new Error('Failed to set new tab page');
    }
  } catch (error) {
    console.error('Error setting new tab page:', error);
    showToast('Failed to set as new tab page');
  }
}

// Main function to load news
async function loadNews() {
  const newsList = document.getElementById('newsList');
  const errorDiv = document.getElementById('error');

  try {
    // Fetch news from Hacker News API
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = await response.json();
    
    // Get top 20 stories
    const topStories = storyIds.slice(0, 20);
    
    // Clear loading message
    newsList.innerHTML = '';
    
    // Fetch details for each story
    const storyPromises = topStories.map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        .then(response => response.json())
    );
    
    const stories = await Promise.all(storyPromises);
    
    // Display stories with metadata
    stories.forEach(story => {
      if (story && story.url) {
        const li = document.createElement('li');
        li.className = 'news-item';
        
        const a = document.createElement('a');
        a.href = story.url;
        a.target = '_blank';
        a.textContent = story.title;
        
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = `${story.score} points • ${getRelativeTime(story.time)} • by ${story.by}`;
        
        a.addEventListener('click', (e) => {
          e.preventDefault();
          chrome.tabs.create({ url: story.url });
        });
        
        li.appendChild(a);
        li.appendChild(meta);
        newsList.appendChild(li);
      }
    });
    
    if (newsList.children.length === 0) {
      throw new Error('No stories found');
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    errorDiv.style.display = 'block';
    newsList.innerHTML = '';
  }
}

// Initialize the extension
document.addEventListener('DOMContentLoaded', async () => {
  // Set up homepage button
  const setHomepageButton = document.getElementById('setHomepage');
  setHomepageButton.addEventListener('click', handleSetHomepage);

  // Check if already set as homepage
  const { isHomepage } = await chrome.storage.sync.get('isHomepage');
  if (isHomepage) {
    setHomepageButton.classList.add('active');
  }

  // Load news
  loadNews();
});

