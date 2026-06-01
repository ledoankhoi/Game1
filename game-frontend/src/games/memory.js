import { RewardManager } from '../game-shared/rewardManager.js';

const EMOJIS = ['🚀', '🌟', '💎', '🎯', '🧠', '🎨', '🧩', '🏆'];
const TOTAL_PAIRS = 8;
const TOTAL_CARDS = TOTAL_PAIRS * 2;

let cards = [];
let score = 0;
let matches = 0;
let moves = 0;
let secondsElapsed = 0;
let timerInterval = null;
let gameStarted = false;
let locked = false;
let firstCard = null;
let secondCard = null;

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
});

function initGame() {
    cards = [];
    score = 0;
    matches = 0;
    moves = 0;
    secondsElapsed = 0;
    gameStarted = false;
    locked = false;
    firstCard = null;
    secondCard = null;

    updateUI();
    clearInterval(timerInterval);
    document.getElementById('game-timer').innerText = '00:00';
    document.getElementById('move-log').innerHTML = '<div class="text-center text-sm text-slate-500 italic mt-4">Hãy lật thẻ để bắt đầu...</div>';

    buildDeck();
    shuffleArray(cards);
    renderGrid();
}

function buildDeck() {
    let id = 0;
    for (let i = 0; i < TOTAL_PAIRS; i++) {
        cards.push({ id: id++, emoji: EMOJIS[i], flipped: false, matched: false });
        cards.push({ id: id++, emoji: EMOJIS[i], flipped: false, matched: false });
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function renderGrid() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    cards.forEach((card, index) => {
        const el = document.createElement('div');
        el.className = 'memory-card';
        el.dataset.index = index;

        el.innerHTML = `
            <div class="card-face back"></div>
            <div class="card-face front">
                <span class="card-emoji">${card.emoji}</span>
            </div>
        `;

        el.addEventListener('click', () => onCardClick(index));
        grid.appendChild(el);
    });
}

function onCardClick(index) {
    if (locked) return;
    const card = cards[index];
    if (card.flipped || card.matched) return;

    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    card.flipped = true;
    const el = getCardElement(index);
    el.classList.add('flipped');

    if (!firstCard) {
        firstCard = { index, card };
        return;
    }

    secondCard = { index, card };
    moves++;
    locked = true;

    if (firstCard.card.emoji === secondCard.card.emoji) {
        handleMatch();
    } else {
        handleMismatch();
    }
}

function handleMatch() {
    const i1 = firstCard.index;
    const i2 = secondCard.index;

    cards[i1].matched = true;
    cards[i2].matched = true;

    const el1 = getCardElement(i1);
    const el2 = getCardElement(i2);
    el1.classList.add('matched', 'match-anim');
    el2.classList.add('matched', 'match-anim');

    matches++;
    score += 100;

    logMatch(firstCard.card.emoji);
    updateUI();

    resetSelection();

    if (matches === TOTAL_PAIRS) {
        setTimeout(triggerGameOver, 600);
    }
}

function handleMismatch() {
    const i1 = firstCard.index;
    const i2 = secondCard.index;

    const el1 = getCardElement(i1);
    const el2 = getCardElement(i2);

    logMismatch();

    setTimeout(() => {
        cards[i1].flipped = false;
        cards[i2].flipped = false;
        el1.classList.remove('flipped');
        el2.classList.remove('flipped');
        resetSelection();
    }, 800);
}

function resetSelection() {
    firstCard = null;
    secondCard = null;
    locked = false;
    updateUI();
}

function getCardElement(index) {
    return document.querySelector(`.memory-card[data-index="${index}"]`);
}

function logMatch(emoji) {
    const logEl = document.getElementById('move-log');
    if (logEl.children.length === 1 && logEl.children[0].tagName === 'DIV') {
        logEl.innerHTML = '';
    }
    const entry = document.createElement('div');
    entry.className = 'flex items-center justify-between p-2.5 rounded-lg bg-emerald-900/10 border border-emerald-900/30 mb-2';
    entry.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="font-black text-slate-500 w-6 text-right">${moves}.</span>
            <span class="text-sm">${emoji}</span>
            <span class="text-xs font-bold text-emerald-400">Ghép đôi thành công!</span>
        </div>
        <span class="text-xs font-black text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-800">+100</span>
    `;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

function logMismatch() {
    const logEl = document.getElementById('move-log');
    if (logEl.children.length === 1 && logEl.children[0].tagName === 'DIV') {
        logEl.innerHTML = '';
    }
    const entry = document.createElement('div');
    entry.className = 'flex items-center justify-between p-2.5 rounded-lg bg-red-900/10 border border-red-900/30 mb-2';
    entry.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="font-black text-slate-500 w-6 text-right">${moves}.</span>
            <span class="text-xs font-bold text-red-400">Không trùng khớp</span>
        </div>
        <span class="text-xs font-bold text-slate-500">+0</span>
    `;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

function updateUI() {
    document.getElementById('current-score').innerText = score;
    document.getElementById('pairs-matched').innerText = `${matches}/${TOTAL_PAIRS}`;
    document.getElementById('move-count').innerText = moves;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const s = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('game-timer').innerText = `${m}:${s}`;
    }, 1000);
}

async function triggerGameOver() {
    clearInterval(timerInterval);

    const finalScore = Math.max(0, score);

    if (typeof RewardManager !== 'undefined' && typeof RewardManager.submitScore === 'function') {
        const reward = await RewardManager.submitScore('memory', finalScore);
        if (reward) {
            document.getElementById('go-reward-container').classList.remove('hidden');
            document.getElementById('go-earned-coins').innerText = '+' + reward.coins;
            document.getElementById('go-earned-exp').innerText = '+' + reward.exp;
        }
    }

    const m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const s = (secondsElapsed % 60).toString().padStart(2, '0');
    document.getElementById('go-final-score').innerText = finalScore.toLocaleString();
    document.getElementById('go-time-display').innerText = `${m}:${s}`;

    const overlay = document.getElementById('memory-gameover-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            overlay.classList.add('show');
        }, 50);
    }
}

function setupEventListeners() {
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Xác nhận chơi lại từ đầu?')) initGame();
        });
    }
}
