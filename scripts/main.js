// === ЗАГРУЗКА ДАННЫХ ИЗ JSON ===
async function loadGames() {
    try {
        const response = await fetch('data/games.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить games.json');
        }
        const data = await response.json();
        return data.games || [];
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        alert('Не удалось загрузить список игр. Проверьте файл data/games.json');
        return [];
    }
}

// === ЭЛЕМЕНТЫ ===
const grid = document.getElementById('gameGrid');
const loading = document.getElementById('loading');

let games = [];

// === ОТРИСОВКА КАРТОЧЕК (СПИСОК) ===
function renderGames() {
    // Скрываем загрузку, показываем сетку
    loading.style.display = 'none';
    grid.style.display = 'flex';
    
    grid.innerHTML = '';
    
    games.forEach((game, index) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.id = game.id;
        card.style.animationDelay = `${0.03 * (index + 1)}s`;
        
        // Собираем HTML для релизов
        let releasesHTML = '';
        
        if (game.releases.length === 0) {
            releasesHTML = '<span class="no-release">Нет релизов</span>';
        } else {
            // Сортируем релизы: сначала Kozel, потом TauPiWak
            const sortedReleases = [...game.releases].sort((a, b) => {
                if (a.author === 'Kozel') return -1;
                if (b.author === 'Kozel') return 1;
                return 0;
            });
            
            sortedReleases.forEach(release => {
                const authorClass = release.author === 'Kozel' ? 'kozel' : 'tau';
                const emoji = release.author === 'Kozel' ? '🐺' : '🐉';
                releasesHTML += `
                    <button class="release-btn ${authorClass}" data-url="${release.url}">
                        <span class="author-label">${emoji}</span>
                        ${release.author}
                    </button>
                `;
            });
        }
        
        // УБРАЛИ БЕЙДЖ "2 РЕЛИЗА"
        card.innerHTML = `
            <div class="left-section">
                <span class="icon">${game.icon || '🎮'}</span>
                <span class="title">${game.title}</span>
            </div>
            <div class="releases-section">
                ${releasesHTML}
            </div>
        `;
        
        // Обработчики только для кнопок релизов
        const releaseBtns = card.querySelectorAll('.release-btn');
        releaseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = btn.dataset.url;
                launchGame(url);
            });
        });
        
        grid.appendChild(card);
    });
}

// === ЗАПУСК ИГРЫ ===
function launchGame(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    } else {
        alert('Ссылка на игру пока не добавлена');
    }
}

// === ИНИЦИАЛИЗАЦИЯ ===
async function init() {
    games = await loadGames();
    
    if (games.length === 0) {
        loading.innerHTML = '❌ Не удалось загрузить игры. Проверьте консоль.';
        return;
    }
    
    renderGames();
    console.log('🎮 Game Hub загружен!');
    console.log(`📦 Загружено игр: ${games.length}`);
    games.forEach(g => {
        console.log(`  - ${g.title}: ${g.releases.length} релиз(а)`);
    });
}

// Запускаем приложение
init();
