const STORAGE = {
    STORIES: 'stories',
    USERS: 'users',
    SESSION_USER: 'loggedInUser'
};


function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE.SESSION_USER)) || null;
}

function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE.USERS)) || [];
}

function getStories() {
    return JSON.parse(localStorage.getItem(STORAGE.STORIES)) || [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
}

function saveStories(stories) {
    localStorage.setItem(STORAGE.STORIES, JSON.stringify(stories));
}

function signupUser(username, password) {
    const users = getUsers();
    if (users.some(u => u.username === username)) {
        alert('Username already taken!');
        return;
    }
    users.push({ username, password, likedStories: [] });
    saveUsers(users);
    alert('Signup successful! Please log in.');
    window.location.href = 'login.html';
}

function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        alert('Invalid credentials.');
        return;
    }
    localStorage.setItem(STORAGE.SESSION_USER, JSON.stringify(username));
    window.location.href = 'index.html';
}

function logoutUser() {
    localStorage.removeItem(STORAGE.SESSION_USER);
    window.location.href = 'index.html';
}

function addStory(title, body, genre) {
    const user = getCurrentUser();
    if (!user) {
        alert('You need to log in to post stories.');
        return;
    }
    const stories = getStories();
    stories.push({
        id: Date.now(),
        title,
        body,
        genre,
        author: user,
        likes: 0,
        comments: []
    });
    saveStories(stories);
    window.location.href = 'index.html';
}

function addComment(storyId, text) {
    const user = getCurrentUser();
    if (!user) {
        alert('Log in to comment.');
        return;
    }
    const stories = getStories();
    const story = stories.find(s => s.id === storyId);
    story.comments.push({ author: user, text });
    saveStories(stories);
}


function getStoryById(storyId) {
    const stories = getStories();
    return stories.find(story => story.id === storyId);
}


function renderStories(genreFilter = '') {
    const stories = getStories();
    const container = document.getElementById('story-list');
    container.innerHTML += `
    <div class="story-card" data-story-id="${story.id}">
        <h2><a href="story.html?id=${story.id}">${story.title}</a></h2>
        <p>Genre: ${story.genre} | Author: <a href="profile.html?author=${story.author}">${story.author}</a></p>
        <p class="likes-count">Likes: ${story.likes}</p>
        <button onclick="likeStory(${story.id})">👍 Like</button>
    </div>`;

    const filteredStories = genreFilter
        ? stories.filter(story => story.genre === genreFilter)
        : stories;

    if (filteredStories.length === 0) {
        container.innerHTML = `<p>No stories found for this genre.</p>`;
        return;
    }

    filteredStories.forEach(story => {
        container.innerHTML += `
            <div class="story-card" data-story-id="${story.id}">
                <h2><a href="story.html?id=${story.id}">${story.title}</a></h2>
                <p>Genre: ${story.genre} | Author: <a href="profile.html?author=${story.author}">${story.author}</a></p>
                <p class="likes-count">Likes: ${story.likes}</p>
                <button onclick="likeStory(${story.id})">👍 Like</button>
            </div>`;
    });
}

function startBackgroundMusic() {
    const audio = document.getElementById('bg-music');
    audio.play().catch(err => console.warn('Autoplay blocked:', err));
}

function filterStories() {
    const selectedGenre = document.getElementById('genre-filter').value;
    renderStories(selectedGenre);
}

function renderStories(genreFilter = '') {
    const stories = getStories();
    const container = document.getElementById('story-list');
    container.innerHTML = '';

    const filteredStories = genreFilter
        ? stories.filter(story => story.genre === genreFilter)
        : stories;

    if (filteredStories.length === 0) {
        container.innerHTML = `<p>No stories found for this genre.</p>`;
        return;
    }

    filteredStories.forEach(story => {
        container.innerHTML += `
            <div class="story-card" data-story-id="${story.id}">
                <h2><a href="story.html?id=${story.id}">${story.title}</a></h2>
                <p>Genre: ${story.genre} | Author: <a href="profile.html?author=${story.author}">${story.author}</a></p>
                <p class="likes-count">Likes: ${story.likes}</p>
                <button onclick="likeStory(${story.id})">👍 Like</button>
            </div>`;
    });
}

function renderStoryPage() {
    const params = new URLSearchParams(window.location.search);
    const storyId = parseInt(params.get('id'));

    const story = getStoryById(storyId);
    if (!story) {
        document.body.innerHTML = '<h1>Story not found.</h1>';
        return;
    }

    document.getElementById('story-likes').innerText = `Likes: ${story.likes}`;

    function likeCurrentStory() {
        const params = new URLSearchParams(window.location.search);
        const storyId = parseInt(params.get('id'));
        likeStory(storyId);
    }

    document.getElementById('story-title').innerText = story.title;
    document.getElementById('story-body').innerText = story.body;
    document.getElementById('story-meta').innerText = `Genre: ${story.genre} | Author: ${story.author} | Likes: ${story.likes}`;

    const commentsContainer = document.getElementById('comments');
    story.comments.forEach(comment => {
        commentsContainer.innerHTML += `<p><strong>${comment.author}</strong>: ${comment.text}</p>`;
    });
}

function submitComment(event) {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const storyId = parseInt(params.get('id'));
    const commentText = document.getElementById('comment').value;
    addComment(storyId, commentText);
    window.location.reload();
}

function renderUserProfile() {
    const params = new URLSearchParams(window.location.search);
    const author = params.get('author');

    const stories = getStories().filter(story => story.author === author);
    const container = document.getElementById('profile-stories');

    document.getElementById('profile-header').innerText = `${author}'s Stories`;

    stories.forEach(story => {
        container.innerHTML += `
            <div class="story-card">
                <h2><a href="story.html?id=${story.id}">${story.title}</a></h2>
                <p>Genre: ${story.genre} | Likes: ${story.likes}</p>
            </div>`;
    });
}

function likeStory(storyId) {
    const user = getCurrentUser();
    if (!user) {
        alert('You need to log in to like stories.');
        window.location.href = 'login.html';
        return;
    }

    const users = getUsers();
    const userData = users.find(u => u.username === user);

    if (!userData) {
        alert('User not found.');
        return;
    }

    if (userData.likedStories && userData.likedStories.includes(storyId)) {
        alert('You have already liked this story.');
        return;
    }

    const stories = getStories();
    const story = stories.find(s => s.id === storyId);

    if (!story) {
        alert('Story not found.');
        return;
    }

    story.likes += 1;
    saveStories(stories);

    if (!userData.likedStories) {
        userData.likedStories = [];
    }
    userData.likedStories.push(storyId);
    saveUsers(users);

    // Update like count immediately (without full page reload)
    const likeCountElement = document.querySelector(`.story-card[data-story-id="${storyId}"] .likes-count`);
    if (likeCountElement) {
        likeCountElement.innerText = `Likes: ${story.likes}`;
    }

    alert('Liked!');
}
