const holes = document.querySelectorAll(".hole");
const scoreBoard = document.querySelector(".score");
const moles = document.querySelectorAll(".mole");
const button = document.querySelector("#start");
const timeDisplay = document.querySelector(".time-left");
let lastHole;
let timeUp = false;
let scores = [0, 0];
let currentPlayer = 0;
let playerNames = [];
let gameInProgress = false;
let timer;

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];

  if (hole === lastHole) {
    return randomHole(holes);
  }

  lastHole = hole;
  return hole;
}

function peep() {
  const time = randomTime(200, 1000);
  const hole = randomHole(holes);
  hole.classList.add("up");
  setTimeout(() => {
    hole.classList.remove("up");
    if (!timeUp && gameInProgress) peep();
  }, time);
}

function updateTimer(timeLeft) {
  timeDisplay.textContent = timeLeft;
}

function startGame() {
  if (gameInProgress) return;
  
  scoreBoard.textContent = 0;
  timeUp = false;
  gameInProgress = true;
  button.style.visibility = "hidden";
  
  document.querySelector("h1").textContent = `${playerNames[currentPlayer]}'s Turn!`;
  
  let timeLeft = 10;
  updateTimer(timeLeft);
  
  timer = setInterval(() => {
    timeLeft--;
    updateTimer(timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      endTurn();
    }
  }, 1000);
  
  peep();
}

function endTurn() {
  timeUp = true;
  gameInProgress = false;
  
  scores[currentPlayer] = parseInt(scoreBoard.textContent);
  
  if (currentPlayer === 0) {
    currentPlayer = 1;
    button.textContent = "Start Player 2";
    button.style.visibility = "visible";
  } else {
    button.style.visibility = "visible";
    button.textContent = "Game Over";
    determineLoser();
    button.disabled = true;
  }
}

function bonk(e) {
  if (!e.isTrusted || !gameInProgress) return;
  
  this.parentNode.classList.remove("up");
  scoreBoard.textContent = parseInt(scoreBoard.textContent) + 1;
  
  // Add visual feedback
  this.style.transform = "scale(0.9)";
  setTimeout(() => {
    this.style.transform = "scale(1)";
  }, 100);
}

function determineLoser() {
  const existingState = JSON.parse(localStorage.getItem("gameState"));
  
  const gameState = {
    ...existingState,
    player1: {
      ...existingState.player1,
      name: playerNames[0],
      score: scores[0]
    },
    player2: {
      ...existingState.player2,
      name: playerNames[1],
      score: scores[1]
    },
    currentPlayer: scores[0] <= scores[1] ? 1 : 2
  };

  localStorage.setItem("gameState", JSON.stringify(gameState));
  
  const loserIndex = scores[0] <= scores[1] ? 0 : 1;
  const loserName = playerNames[loserIndex];
  
  try {
    localStorage.setItem("gameState", JSON.stringify(gameState));
    alert(`Game Over!\nPlayer 1 (${playerNames[0]}): ${scores[0]}\nPlayer 2 (${playerNames[1]}): ${scores[1]}\n\n${loserName} lost and will face the punishment!`);
    setTimeout(() => {
      window.location.href = 'punishment.html';
    }, 100);
  } catch (error) {
    console.error("Error during game completion:", error);
    alert("Error saving game state. Please try again.");
  }
}

moles.forEach(mole => mole.addEventListener("click", bonk));
button.addEventListener("click", startGame);

window.onload = () => {
  const gameState = JSON.parse(localStorage.getItem("gameState"));
  if (!gameState || !gameState.player1 || !gameState.player2) {
    alert("Player information is missing!");
    window.location.href = "index.html";
  } else {
    playerNames = [gameState.player1.name, gameState.player2.name];
    button.textContent = "Start Player 1";
    document.querySelector("h1").textContent = `${playerNames[0]} vs ${playerNames[1]}`;
    
    currentPlayer = 0;
    scores = [0, 0];
    gameInProgress = false;
    timeUp = false;
    scoreBoard.textContent = "0";
    updateTimer(10);
  }
};