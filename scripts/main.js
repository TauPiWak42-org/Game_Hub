async function loadGames() {
    try {
        const res = await fetch('data/games.json');
        if (!res.ok) throw new Error('Failed to load games.json');
        const data = await res.json();
        return data.games || [];
    } catch (err) {
        console.error(err);
        alert('Failed to load games list. Check data/games.json');
        return [];
    }
}

const grid = document.getElementById('gameGrid');
const loading = document.getElementById('loading');
let games = [];

function renderGames() {
    loading.style.display = 'none';
    grid.style.display = 'flex';
    grid.innerHTML = '';

    games.forEach((game, i) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.style.animationDelay = `${0.03 * (i + 1)}s`;

        const sorted = [...game.releases].sort((a, b) => {
            if (a.author === 'Kozel') return -1;
            if (b.author === 'Kozel') return 1;
            return 0;
        });

        let releasesHTML = '';
        if (!sorted.length) {
            releasesHTML = '<span class="no-release">No releases</span>';
        } else {
            sorted.forEach(r => {
                const cls = r.author === 'Kozel' ? 'kozel' : 'tau';
                const emoji = r.author === 'Kozel' ? '🐺' : '🐉';
                releasesHTML += `
                    <button class="release-btn ${cls}" data-url="${r.url}">
                        <span class="author-label">${emoji}</span>
                        ${r.author}
                    </button>
                `;
            });
        }

        card.innerHTML = `
            <div class="left-section">
                <span class="icon">${game.icon || '🎮'}</span>
                <span class="title">${game.title}</span>
            </div>
            <div class="releases-section">${releasesHTML}</div>
        `;

        card.querySelectorAll('.release-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                launchGame(btn.dataset.url);
            });
        });

        grid.appendChild(card);
    });
}

function launchGame(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    } else {
        alert('Link not available');
    }
}

async function init() {
    games = await loadGames();
    if (!games.length) {
        loading.innerHTML = '❌ Failed to load games. Check console.';
        return;
    }
    renderGames();
    console.log(`🎮 Loaded ${games.length} games`);
}

init();
