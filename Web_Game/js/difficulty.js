// difficulty.js
function selectDifficulty(difficulty) {
  // Get existing game state
  const gameState = JSON.parse(localStorage.getItem("gameState"));
  
  if (!gameState) {
      alert("Player information is missing!");
      window.location.href = "index.html";
      return;
  }
  
  // Add difficulty to game state
  gameState.difficulty = difficulty;
  localStorage.setItem("gameState", JSON.stringify(gameState));
  
  window.location.href = "selection.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const gameState = JSON.parse(localStorage.getItem("gameState"));

  if (gameState && gameState.player1 && gameState.player2) {
      document.getElementById("player1Display").innerText = 
          `${gameState.player1.name} (${gameState.player1.gender})`;
      document.getElementById("player2Display").innerText = 
          `${gameState.player2.name} (${gameState.player2.gender})`;
  } else {
      alert("Player information is missing!");
      window.location.href = "index.html";
  }
});
