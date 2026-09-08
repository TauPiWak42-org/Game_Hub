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
const contextMenu = document.getElementById('contextMenu');
const menuList = document.getElementById('menuList');

let games = [];
let currentGame = null;

// === ОТРИСОВКА КАРТОЧЕК ===
function renderGames() {
    // Скрываем загрузку, показываем сетку
    loading.style.display = 'none';
    grid.style.display = 'grid';
    
    grid.innerHTML = '';
    
    games.forEach((game, index) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.id = game.id;
        card.style.animationDelay = `${0.05 * (index + 1)}s`;
        
        const releaseCount = game.releases.length;
        const releaseText = releaseCount === 1 ? '1 релиз' : `${releaseCount} релиза`;
        
        card.innerHTML = `
            <span class="icon">${game.icon || '🎮'}</span>
            <div class="title">${game.title}</div>
            <span class="badge">${releaseText}</span>
            <span class="release-count">▼ Кликните для выбора</span>
        `;
        
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            showMenu(e, game);
        });
        
        grid.appendChild(card);
    });
}

// === ПОКАЗ МЕНЮ ===
function showMenu(event, game) {
    currentGame = game;
    
    // Очищаем меню
    menuList.innerHTML = '';
    
    // Добавляем заголовок
    const header = document.createElement('li');
    header.className = 'menu-header';
    header.textContent = game.title;
    menuList.appendChild(header);
    
    // Добавляем разделитель
    const divider = document.createElement('li');
    divider.className = 'menu-divider';
    divider.style.padding = '0';
    divider.style.height = '1px';
    divider.style.background = '#2a2a2a';
    divider.style.margin = '4px 12px';
    menuList.appendChild(divider);
    
    // Добавляем пункты релизов
    game.releases.forEach((release) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${release.author === 'Kozel' ? '🐺' : '🐉'} ${release.author}</span>
            <span class="author-tag">${release.author === 'Kozel' ? 'KZ' : 'TPW'}</span>
        `;
        
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            launchGame(release.url);
            hideMenu();
        });
        
        menuList.appendChild(li);
    });
    
    // Позиционируем меню
    positionMenu(event);
    
    // Показываем меню
    contextMenu.classList.remove('hidden');
    requestAnimationFrame(() => {
        contextMenu.classList.add('visible');
    });
}

// === ПОЗИЦИОНИРОВАНИЕ МЕНЮ ===
function positionMenu(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 240;
    const menuHeight = 200;
    
    let x = rect.left;
    let y = rect.bottom + 10;
    
    // Проверяем, не выходит ли меню за правый край
    if (x + menuWidth > window.innerWidth - 10) {
        x = window.innerWidth - menuWidth - 10;
    }
    
    // Проверяем, не выходит ли меню за нижний край
    if (y + menuHeight > window.innerHeight - 10) {
        y = rect.top - menuHeight - 10;
    }
    
    // Проверяем, не выходит ли меню за левый край
    if (x < 10) {
        x = 10;
    }
    
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
}

// === ЗАПУСК ИГРЫ ===
function launchGame(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    } else {
        alert('Ссылка на игру пока не добавлена');
    }
}

// === СКРЫТИЕ МЕНЮ ===
function hideMenu() {
    contextMenu.classList.remove('visible');
    setTimeout(() => {
        contextMenu.classList.add('hidden');
    }, 200);
}

// === ЗАКРЫТИЕ МЕНЮ ПРИ КЛИКЕ ВНЕ ===
document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) {
        const isCard = e.target.closest('.game-card');
        if (!isCard) {
            hideMenu();
        }
    }
});

// === ЗАКРЫТИЕ МЕНЮ ПРИ ESC ===
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideMenu();
    }
});

// === ОБРАБОТКА РЕСАЙЗА ===
window.addEventListener('resize', () => {
    if (contextMenu.classList.contains('visible')) {
        hideMenu();
    }
});

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
