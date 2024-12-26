document.addEventListener("DOMContentLoaded", () => {
    // Get existing game state
    const gameState = JSON.parse(localStorage.getItem("gameState"));
    if (!gameState || !gameState.player1 || !gameState.player2 || !gameState.difficulty) {
        alert("Game setup incomplete!");
        window.location.href = "index.html";
        return;
    }

    const startButton = document.getElementById("startButton");
    const signalLight = document.getElementById("signalLight");
    const message = document.getElementById("message");
    const clickButton = document.getElementById("clickButton");
    const playerIndicator = document.getElementById("playerIndicator");
    const player1Score = document.getElementById("player1Score");
    const player2Score = document.getElementById("player2Score");
    const player1Time = document.getElementById("player1Time");
    const player2Time = document.getElementById("player2Time");

    // Update UI with player names
    player1Score.querySelector('h3').textContent = gameState.player1.name;
    player2Score.querySelector('h3').textContent = gameState.player2.name;
    playerIndicator.textContent = `${gameState.player1.name}'s Turn`;

    let startTime = null;
    let endTime = null;
    let player1ReactionTime = null;
    let player2ReactionTime = null;
    let currentPlayer = 1;
    let isTestActive = false;
    let hasLightTurnedGreen = false;
    let timerTimeout = null;

    startButton.addEventListener("click", startTest);
    clickButton.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyPress);

    function startTest() {
        // Reset all states at the start of each test
        isTestActive = true;
        hasLightTurnedGreen = false;
        startTime = null;
        endTime = null;
        
        message.textContent = "Get Ready...";
        startButton.style.display = "none";
        clickButton.style.display = "block";
        signalLight.className = "signal-light red";
        signalLight.classList.add("waiting");

        // Clear any existing timeout
        if (timerTimeout) {
            clearTimeout(timerTimeout);
        }

        const delay = Math.floor(Math.random() * 3000) + 2000;
        timerTimeout = setTimeout(() => {
            if (!isTestActive) return;
            hasLightTurnedGreen = true;
            signalLight.className = "signal-light green";
            signalLight.classList.remove("waiting");
            message.textContent = "Click Now!";
            startTime = Date.now();
        }, delay);
    }

    function handleClick() {
        // Return if test isn't active
        if (!isTestActive) return;

        if (!hasLightTurnedGreen) {
            // Clicked too early
            isTestActive = false;
            if (timerTimeout) {
                clearTimeout(timerTimeout);
            }
            signalLight.className = "signal-light red";
            message.textContent = "Too early! Try again.";
            clickButton.style.display = "none";
            startButton.style.display = "block";
            startButton.textContent = `Try Again (${currentPlayer === 1 ? gameState.player1.name : gameState.player2.name})`;
            return;
        }
        
        endTime = Date.now();
        isTestActive = false;
        const reactionTime = endTime - startTime;

        if (currentPlayer === 1) {
            player1ReactionTime = reactionTime;
            player1Time.textContent = `${reactionTime} ms`;
            player1Score.classList.remove("active");
            player2Score.classList.add("active");
            currentPlayer = 2;
            playerIndicator.textContent = `${gameState.player2.name}'s Turn`;
            resetForNextPlayer();
        } else {
            player2ReactionTime = reactionTime;
            player2Time.textContent = `${reactionTime} ms`;
            determineWinner();
        }

        signalLight.className = "signal-light red";
        clickButton.style.display = "none";
    }

    function resetForNextPlayer() {
        startButton.style.display = "block";
        startButton.textContent = `Start ${gameState.player2.name}'s Turn`;
        message.textContent = `Ready for ${gameState.player2.name}`;
        hasLightTurnedGreen = false;
    }

    function determineWinner() {
        // Validate both players have valid reaction times
        if (player1ReactionTime === null || player2ReactionTime === null) {
            message.textContent = "Error: Invalid reaction times. Please start over.";
            window.location.reload();
            return;
        }

        const loser = player1ReactionTime > player2ReactionTime ? 1 : 2;
        const winner = loser === 1 ? 2 : 1;
        
        const winnerName = loser === 1 ? gameState.player2.name : gameState.player1.name;
        const loserName = loser === 1 ? gameState.player1.name : gameState.player2.name;
        
        message.textContent = `${winnerName} Wins! ${loserName} must face the punishment!`;
        
        // Update the existing game state with reaction times
        gameState.player1.reactionTime = player1ReactionTime;
        gameState.player2.reactionTime = player2ReactionTime;
        gameState.currentPlayer = loser; // Set the loser as current player for punishment
        gameState.winner = winner;
        gameState.loser = loser;
        
        // Store the updated game state
        localStorage.setItem("gameState", JSON.stringify(gameState));
        
        setTimeout(() => {
            window.location.href = "punishment.html";
        }, 2000);
    }

    function handleKeyPress(event) {
        if (event.code === "Space" && isTestActive) {
            handleClick();
        }
    }
});
