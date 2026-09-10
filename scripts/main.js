const HOVER_DELAY = 200;
const isTouch = window.matchMedia('(hover: none)').matches;

let authors = {};
let games = [];

const grid = document.getElementById('gameGrid');
const loading = document.getElementById('loading');
const overlay = document.getElementById('overlay');
const overlayTitle = overlay.querySelector('.overlay-title');
const overlayList = overlay.querySelector('.overlay-list');
const overlayClose = overlay.querySelector('.overlay-close');

async function loadData() {
    try {
        const res = await fetch('data/games.json');
        if (!res.ok) throw new Error('Failed to load games.json');
        const data = await res.json();
        authors = data.authors || {};
        games = data.games || [];
    } catch (err) {
        console.error(err);
        alert('Не удалось загрузить список игр');
        games = [];
    }
}

function getGameAuthors(game) {
    const set = new Set();
    game.releases.forEach(r => set.add(r.author));
    return [...set];
}

function openUrl(url) {
    if (!url || url === '#') {
        alert('Ссылка недоступна');
        return;
    }
    window.open(url, '_blank');
}

function openOverlay(game) {
    overlayTitle.textContent = game.title;
    overlayList.innerHTML = '';

    game.releases.forEach(release => {
        const meta = authors[release.author] || {};
        const btn = document.createElement('button');
        btn.className = 'overlay-item';
        btn.style.setProperty('--author-color', meta.color || '#ffd700');
        btn.innerHTML = `
            <span class="overlay-emoji">${meta.emoji || '🎮'}</span>
            <span class="overlay-author">${release.author}</span>
        `;
        btn.addEventListener('click', () => {
            openUrl(release.url);
            closeOverlay();
        });
        overlayList.appendChild(btn);
    });

    overlay.classList.remove('hidden');
}

function closeOverlay() {
    overlay.classList.add('hidden');
}

function createCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';

    const gameAuthors = getGameAuthors(game);
    const isMulti = gameAuthors.length > 1;

    let backHTML = '';
    if (isMulti) {
        backHTML = `<span class="back-text">Выбрать версию</span>`;
    } else {
        const a = gameAuthors[0];
        const meta = authors[a] || {};
        backHTML = `
            <span class="back-emoji">${meta.emoji || '🎮'}</span>
            <span class="back-text" style="color:${meta.color || '#ffd700'}">Релиз от ${a}</span>
        `;
    }

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
                <span class="card-icon">${game.icon || '🎮'}</span>
                <span class="card-title">${game.title}</span>
            </div>
            <div class="card-back">${backHTML}</div>
        </div>
    `;

    if (!isTouch) {
        let timer = null;
        card.addEventListener('mouseenter', () => {
            timer = setTimeout(() => card.classList.add('flipped'), HOVER_DELAY);
        });
        card.addEventListener('mouseleave', () => {
            clearTimeout(timer);
            card.classList.remove('flipped');
        });
    }

    card.addEventListener('click', () => {
        if (isTouch) {
            if (isMulti) openOverlay(game);
            else openUrl(game.releases[0].url);
        } else {
            if (!card.classList.contains('flipped')) return;
            if (isMulti) openOverlay(game);
            else openUrl(game.releases[0].url);
        }
    });

    return card;
}

function renderGames() {
    loading.style.display = 'none';
    grid.innerHTML = '';
    games.forEach((game, i) => {
        const card = createCard(game);
        card.style.animationDelay = `${0.03 * (i + 1)}s`;
        grid.appendChild(card);
    });
}

overlayClose.addEventListener('click', closeOverlay);
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay();
});

async function init() {
    await loadData();
    if (!games.length) {
        loading.innerHTML = '❌ Не удалось загрузить игры';
        return;
    }
    renderGames();
    console.log(`🎮 Загружено игр: ${games.length}`);
}

init();