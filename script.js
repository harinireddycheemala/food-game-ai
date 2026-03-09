const gameBoard = document.getElementById('game-board');
const moveDisplay = document.getElementById('move-count');
const timeDisplay = document.getElementById('timer');
const messageDisplay = document.getElementById('message');

// Data
const icons = ['🍕', '🍔', '🍣', '🌮', '🍝', '🍦', '🌶️', '🥗'];
let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let matches = 0;
let timerInterval;
let seconds = 0;

// 1. Initialize Game (Shuffling Algorithm)
function startGame() {
    // Reset state
    moves = 0;
    matches = 0;
    seconds = 0;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    updateStats();
    clearInterval(timerInterval);
    startTimer();
    messageDisplay.textContent = "";

    // Create Deck & Shuffle (Randomization Logic)
    const deck = [...icons, ...icons];
    cards = shuffle(deck);

    // Render Board
    gameBoard.innerHTML = '';
    cards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon;
        card.dataset.index = index;
        card.innerText = '❓';
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

// 2. Shuffling Algorithm (Fisher-Yates)
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// 3. Game Logic
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');
    this.innerText = this.dataset.icon;

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    updateStats();
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matches++;
    resetBoard();
    
    if (matches === icons.length) {
        endGame();
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        firstCard.innerText = '❓';
        secondCard.innerText = '❓';
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// 4. Timer
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timeDisplay.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    messageDisplay.textContent = `🎉 You Won in ${moves} moves!`;
}

function updateStats() {
    moveDisplay.textContent = moves;
}

// 5. AI FEATURE: Pattern Recognition Helper
function aiHint() {
    // Simple AI: Looks for two un-matched cards that have the same icon in the DOM
    const allCards = document.querySelectorAll('.card');
    const flippedCards = Array.from(document.querySelectorAll('.flipped'));
    const matchedCards = Array.from(document.querySelectorAll('.matched'));
    const hiddenCards = Array.from(allCards).filter(c => !flippedCards.includes(c) && !matchedCards.includes(c));
    
    if (hiddenCards.length === 0) return;

    // Brute-force scan to find a pair (Simulated AI Perception)
    for (let i = 0; i < hiddenCards.length; i++) {
        for (let j = i + 1; j < hiddenCards.length; j++) {
            if (hiddenCards[i].dataset.icon === hiddenCards[j].dataset.icon) {
                // AI Found a Match!
                hiddenCards[i].style.background = '#fcd34d'; // Highlight
                hiddenCards[j].style.background = '#fcd34d';
                setTimeout(() => {
                    hiddenCards[i].style.background = ''; // Remove highlight
                    hiddenCards[j].style.background = '';
                }, 1000);
                messageDisplay.textContent = "🤖 AI Hint: Highlighted a potential match!";
                return;
            }
        }
    }
    messageDisplay.textContent = "🤖 AI Hint: No immediate matches found, keep looking!";
}

startGame();
