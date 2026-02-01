// Firebase + Firestore integration (modular SDK imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getDocs, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config provided
const firebaseConfig = {
  apiKey: "AIzaSyAvX-6NBYUO346wZl18EUd92cXlbeomFH4",
  authDomain: "microblog-ccc47.firebaseapp.com",
  projectId: "microblog-ccc47",
  storageBucket: "microblog-ccc47.firebasestorage.app",
  messagingSenderId: "451419454326",
  appId: "1:451419454326:web:462568812bbea2c6219857",
  measurementId: "G-E50L3Q2CZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable IndexedDB persistence for offline caching (reduces reads on reload)
enableIndexedDbPersistence(db).then(() => {
    console.log('Firestore persistence enabled');
}).catch((err) => {
    // failed-precondition = multiple tabs open, unimplemented = browser not supported
    console.warn('Could not enable persistence:', err && err.code ? err.code : err);
});

const wall = document.getElementById("wall");

function renderPost(data) {
    const box = document.createElement('div');
    box.className = 'post';

    // header bar containing username and timestamp
    const header = document.createElement('div');
    header.className = 'post-header';

    const uname = document.createElement('div');
    uname.className = 'post-username';
    uname.textContent = data.username || '';

    header.appendChild(uname);

    // timestamp (right aligned)
    const tsDate = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null);
    const ts = document.createElement('div');
    ts.className = 'post-timestamp';
    ts.textContent = formatTimestamp(tsDate);
    if (tsDate) ts.title = tsDate.toLocaleString();

    header.appendChild(ts);
    box.appendChild(header);

    const content = document.createElement('div');
    content.className = 'post-content';
    content.textContent = data.text || '';

    const count = document.createElement('div');
    count.className = 'char-count';
    count.textContent = (data.text ? data.text.length : 0) + '/280';

    box.appendChild(content);
    box.appendChild(count);

    wall.appendChild(box);
}

// Helper: formats Date -> short relative like '5m' or fallback to date string
function formatTimestamp(date) {
    if (!date) return '';
    const diff = Date.now() - date.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return sec + 's';
    const min = Math.floor(sec / 60);
    if (min < 60) return min + 'm';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + 'h';
    const day = Math.floor(hr / 24);
    if (day < 7) return day + 'd';
    return date.toLocaleDateString();
}

// Real-time listener for posts collection
const postsCol = collection(db, 'posts');
const q = query(postsCol, orderBy('createdAt', 'desc'), limit(200));

// Try a cache-first load so repeat visits can render instantly from IndexedDB
(async () => {
    try {
        const cached = await getDocs(q, { source: 'cache' });
        if (!cached.empty) {
            wall.innerHTML = '';
            cached.forEach(doc => renderPost(doc.data()));
        }
    } catch (err) {
        // cache miss or persistence not available
        console.info('Cache load skipped:', err && err.code ? err.code : err);
    }
})();

onSnapshot(q, (snapshot) => {
    wall.innerHTML = '';
    if (snapshot.empty) {
        const empty = document.createElement('div');
        empty.className = 'no-posts';
        empty.textContent = 'No posts yet — be the first to post!';
        wall.appendChild(empty);
        return;
    }
    snapshot.forEach(doc => {
        renderPost(doc.data());
    });
}, (err) => {
    console.error('Firestore error', err);
    wall.innerHTML = '';
    const errEl = document.createElement('div');
    errEl.className = 'no-posts';
    errEl.textContent = 'Could not load posts. Check console for details.';
    wall.appendChild(errEl);
});

// --- New post modal wiring ---
const newPostBtn = document.getElementById('new-post');
const modal = document.getElementById('new-post-modal');
const modalClose = document.querySelector('.modal-close');
const cancelBtn = document.querySelector('.btn-cancel');
const form = document.getElementById('new-post-form');
const usernameInput = document.getElementById('post-username');
const textInput = document.getElementById('post-text');
const postCharCount = document.getElementById('post-char-count');

// About modal elements
const aboutBtn = document.getElementById('about-btn');
const aboutModal = document.getElementById('about-modal');
const aboutModalClose = aboutModal ? aboutModal.querySelector('.modal-close') : null;

newPostBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// close when clicking outside content
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// --- About modal wiring ---
if (aboutBtn && aboutModal) {
    aboutBtn.addEventListener('click', () => {
        aboutModal.classList.remove('hidden');
        aboutModal.setAttribute('aria-hidden', 'false');
        // focus the close button for accessibility
        if (aboutModalClose) aboutModalClose.focus();
    });

    // close via the modal close button
    if (aboutModalClose) aboutModalClose.addEventListener('click', () => {
        aboutModal.classList.add('hidden');
        aboutModal.setAttribute('aria-hidden', 'true');
        aboutBtn.focus();
    });

    // close when clicking outside content
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.add('hidden');
            aboutModal.setAttribute('aria-hidden', 'true');
            aboutBtn.focus();
        }
    });
}

// update char count inside modal
textInput.addEventListener('input', () => {
    postCharCount.textContent = textInput.value.length;
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const text = textInput.value.trim();
    if (!username || !text) {
        // fallback to inline check (no native browser message)
        alert('Please enter a username and text.');
        return;
    }

    // save username for convenience
    try {
        localStorage.setItem('username', username);
    } catch (err) {
        console.warn('Could not save username to localStorage', err);
    }

    try {
        await addDoc(postsCol, {
            username,
            text,
            createdAt: serverTimestamp()
        });
    } catch (err) {
        console.error('Failed to create post in Firestore', err);
        alert('Could not save post. See console for details.');
    }

    closeModal();
    form.reset();
});

function openModal() {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    // Prefill username from localStorage (if available)
    const saved = localStorage.getItem('username') || '';
    usernameInput.value = saved;
    postCharCount.textContent = textInput.value.length || 0;
    // Focus text if username already known, otherwise focus username
    if (saved) {
        textInput.focus();
    } else {
        usernameInput.focus();
    }
}

function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    newPostBtn.focus();
}
