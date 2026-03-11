/* --- NAVIGATION LOGIC --- */
function showGameSelector() {
    console.log("Opening Game Selector");
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-selector').style.display = 'block';
}

function launchMemoryGame() {
    console.log("Launching Memory Game");
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-selector').style.display = 'none';
    document.getElementById('memory-game').style.display = 'block';
    initMemoryGame(); 
}

function launchRecipeGame() {
    console.log("Launching Recipe Game");
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-selector').style.display = 'none';
    document.getElementById('recipe-game').style.display = 'block';
    initRecipeGame();
}

function goBack(targetId) {
    console.log("Going back to", targetId);
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(targetId).style.display = 'block';
}

/* --- SOUND --- */
let soundEnabled = false;
function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-status').textContent = soundEnabled ? "ON" : "OFF";
    console.log("Sound is now", soundEnabled ? "ON" : "OFF");
}

/* --- MEMORY GAME LOGIC --- */
const gameBoard = document.getElementById('game-board');
const moveDisplay = document.getElementById('move-count');
const timeDisplay = document.getElementById('timer');
const messageDisplay = document.getElementById('message');
const allIcons = ['🍕', '🍔', '🍣', '🌮', '🍝', '🍦', '🌶️', '🥗'];
let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let matches = 0;
let timerInterval;
let seconds = 0;

function initMemoryGame() {
    startMemoryGame(4);
}

function startMemoryGame(pairsCount = 4) {
    console.log("Starting Memory Game with", pairsCount, "pairs");
    const selectedIcons = allIcons.slice(0, pairsCount);
    const deck = [...selectedIcons, ...selectedIcons]; 
    cards = shuffle(deck);
    
    moves = 0;
    matches = 0;
    seconds = 0;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    updateStats();
    
    renderBoard(cards);
    clearInterval(timerInterval);
    startTimer();
    messageDisplay.textContent = "";
}

function renderBoard(deck) {
    gameBoard.innerHTML = '';
    let cols = 4;
    if (deck.length > 12) cols = 6;
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

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

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
    if (matches === cards.length / 2) endGame();
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

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timeDisplay.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, 1000);
}

function updateStats() { moveDisplay.textContent = moves; }
function endGame() {
    clearInterval(timerInterval);
    messageDisplay.textContent = `🎉 You Won in ${moves} moves!`;
}

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
}

/* --- RECIPE GAME LOGIC --- */
const ingredientsGrid = document.getElementById('ingredients-grid');
const recipeResult = document.getElementById('recipe-result');
const recipeName = document.getElementById('recipe-name');
const recipeDesc = document.getElementById('recipe-desc');

const ingredientsData = [
    { name: 'Eggs', emoji: '🥚' },
    { name: 'Cheese', emoji: '🧀' },
    { name: 'Tomato', emoji: '🍅' },
    { name: 'Bread', emoji: '🍞' },
    { name: 'Chicken', emoji: '🍗' },
    { name: 'Pasta', emoji: '🍝' },
    { name: 'Onion', emoji: '🧅' },
    { name: 'Rice', emoji: '🍚' },
    { name: 'Milk', emoji: '🥛' }
];

let selectedIngredients = [];

function initRecipeGame() {
    console.log("Initializing Recipe Game");
    selectedIngredients = [];
    renderIngredients();
    recipeResult.style.display = 'none';
}

function renderIngredients() {
    ingredientsGrid.innerHTML = '';
    ingredientsData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'ingredient-item';
        div.innerHTML = `${item.emoji}<br>${item.name}`;
        div.onclick = () => toggleIngredient(div, item.name);
        ingredientsGrid.appendChild(div);
    });
}

function toggleIngredient(element, name) {
    if (selectedIngredients.includes(name)) {
        selectedIngredients = selectedIngredients.filter(i => i !== name);
        element.classList.remove('selected');
    } else {
        if (selectedIngredients.length >= 3) {
            alert("Please select exactly 3 ingredients!");
            return;
        }
        selectedIngredients.push(name);
        element.classList.add('selected');
    }
}

function generateRecipe() {
    if (selectedIngredients.length !== 3) {
        alert("Please select exactly 3 ingredients!");
        return;
    }
    const s = selectedIngredients;
    let resultName = "";
    let resultDesc = "";

    if (s.includes('Eggs') && s.includes('Bread') && s.includes('Cheese')) {
        resultName = "Cheese Omelette Toast";
        resultDesc = "A classic breakfast with melted cheese on top.";
    } else if (s.includes('Chicken') && s.includes('Rice') && s.includes('Onion')) {
        resultName = "Chicken Biryani";
        resultDesc = "Aromatic spiced rice with tender chicken.";
    } else if (s.includes('Pasta') && s.includes('Tomato') && s.includes('Cheese')) {
        resultName = "Pasta Marinara";
        resultDesc = "Simple and delicious Italian pasta.";
    } else if (s.includes('Eggs') && s.includes('Milk') && s.includes('Cheese')) {
        resultName = "Scrambled Eggs";
        resultDesc = "Fluffy creamy eggs perfect for breakfast.";
    } else if (s.includes('Bread') && s.includes('Cheese') && s.includes('Tomato')) {
        resultName = "Pizza Toast";
        resultDesc = "Quick open-faced pizza toast.";
    } else {
        resultName = "Fusion Stir-Fry";
        resultDesc = "Mix " + s.join(", ") + " in a pan for a unique dish!";
    }

    recipeName.textContent = resultName;
    recipeDesc.textContent = resultDesc;
    recipeResult.style.display = 'block';
}

function resetRecipeGame() {
    initRecipeGame();
}
