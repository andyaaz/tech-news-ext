document.addEventListener('DOMContentLoaded', async () => {
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
    
    // Filter for tech-related stories and display them
    stories.forEach(story => {
      if (story && story.url) {
        const li = document.createElement('li');
        li.className = 'news-item';
        
        const a = document.createElement('a');
        a.href = story.url;
        a.target = '_blank';
        a.textContent = story.title;
        
        a.addEventListener('click', (e) => {
          e.preventDefault();
          chrome.tabs.create({ url: story.url });
        });
        
        li.appendChild(a);
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
});
