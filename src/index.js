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

// Store stories globally for sorting
let currentStories = [];

// Function to sort stories
function sortStories(stories, sortBy) {
  return [...stories].sort((a, b) => {
    const [field, order] = sortBy.split('_');
    const multiplier = order === 'asc' ? 1 : -1;
    
    if (field === 'time') {
      return (a.time - b.time) * multiplier;
    } else if (field === 'score') {
      return (a.score - b.score) * multiplier;
    }
    return 0;
  });
}

// Function to display stories
function displayStories(stories) {
  const newsList = document.getElementById('newsList');
  newsList.innerHTML = '';

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
}

// Main function to load news
async function loadNews() {
  const newsList = document.getElementById('newsList');
  const errorDiv = document.getElementById('error');
  const sortSelect = document.getElementById('sortBy');

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
    
    currentStories = await Promise.all(storyPromises);
    
    // Filter out stories without URLs
    currentStories = currentStories.filter(story => story && story.url);
    
    // Initial sort by current selection
    const sortedStories = sortStories(currentStories, sortSelect.value);
    displayStories(sortedStories);
    
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

  // Set up sort dropdown
  const sortSelect = document.getElementById('sortBy');
  sortSelect.addEventListener('change', () => {
    if (currentStories.length > 0) {
      const sortedStories = sortStories(currentStories, sortSelect.value);
      displayStories(sortedStories);
    }
  });

  // Check if already set as homepage
  const { isNewTabPage } = await chrome.storage.sync.get('isNewTabPage');
  if (isNewTabPage) {
    setHomepageButton.classList.add('active');
  }

  // Load news
  loadNews();
});

