const gameBoard = document.getElementById('game-board');
const moveDisplay = document.getElementById('move-count');
const timeDisplay = document.getElementById('timer');
const messageDisplay = document.getElementById('message');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const pairSelector = document.getElementById('pair-selector');

// Available Data
const allIcons = ['🍕', '🍔', '🍣', '🌮', '🍝', '🍦', '🌶️', '🥗'];

// State
let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let matches = 0;
let timerInterval;
let seconds = 0;

// 1. Start Game
function startGame() {
    console.log("Start clicked"); // Debug log
    const pairsCount = parseInt(pairSelector.value);
    
    // Switch Screens
    startScreen.style.display = 'none';
    gameContainer.style.display = 'block';

    // Generate Deck
    const selectedIcons = allIcons.slice(0, pairsCount);
    const deck = [...selectedIcons, ...selectedIcons]; 
    cards = shuffle(deck);
    
    // Reset Stats
    moves = 0;
    matches = 0;
    seconds = 0;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    updateStats();
    
    // Render
    renderBoard(cards);
    startTimer();
}

// 2. Render Board (Fixed Logic)
function renderBoard(deck) {
    gameBoard.innerHTML = ''; // Clear previous board
    
    // Calculate columns safely
    let cols = 4;
    if (deck.length > 12) {
        cols = 6;
    }

    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    deck.forEach((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon;
        card.dataset.index = index;
        card.innerText = '❓';
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function resetGame() {
    gameContainer.style.display = 'none';
    startScreen.style.display = 'block';
    clearInterval(timerInterval);
    messageDisplay.textContent = "";
}

// 3. Shuffling Algorithm
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// 4. Game Logic
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
    resetBoardLogic();
    
    if (matches === cards.length / 2) {
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
        resetBoardLogic();
    }, 1000);
}

function resetBoardLogic() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// 5. Timer & Stats
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timeDisplay.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, 1000);
}

function updateStats() {
    moveDisplay.textContent = moves;
}

function endGame() {
    clearInterval(timerInterval);
    messageDisplay.textContent = `🎉 You Won in ${moves} moves!`;
}

// 6. AI Hint
function aiHint() {
    const allCards = document.querySelectorAll('.card');
    const flippedCards = Array.from(document.querySelectorAll('.flipped'));
    const matchedCards = Array.from(document.querySelectorAll('.matched'));
    const hiddenCards = Array.from(allCards).filter(c => !flippedCards.includes(c) && !matchedCards.includes(c));
    
    if (hiddenCards.length === 0) return;

    for (let i = 0; i < hiddenCards.length; i++) {
        for (let j = i + 1; j < hiddenCards.length; j++) {
            if (hiddenCards[i].dataset.icon === hiddenCards[j].dataset.icon) {
                hiddenCards[i].style.background = '#fcd34d';
                hiddenCards[j].style.background = '#fcd34d';
                setTimeout(() => {
                    hiddenCards[i].style.background = '';
                    hiddenCards[j].style.background = '';
                }, 1000);
                messageDisplay.textContent = "🤖 AI Hint: Highlighted a potential match!";
                return;
            }
        }
    }
    messageDisplay.textContent = "🤖 AI Hint: No immediate matches found, keep looking!";
}
