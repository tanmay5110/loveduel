// reaction_test.js
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startButton");
    const signalLight = document.getElementById("signalLight");
    const message = document.getElementById("message");
    const clickButton = document.getElementById("clickButton");
    const playerIndicator = document.getElementById("playerIndicator");
    const player1Score = document.getElementById("player1Score");
    const player2Score = document.getElementById("player2Score");
    const player1Time = document.getElementById("player1Time");
    const player2Time = document.getElementById("player2Time");

    let startTime, endTime;
    let player1ReactionTime = null;
    let player2ReactionTime = null;
    let currentPlayer = 1;
    let isTestActive = false;

    startButton.addEventListener("click", startTest);
    clickButton.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyPress);

    function startTest() {
        isTestActive = true;
        message.textContent = "Get Ready...";
        startButton.style.display = "none";
        clickButton.style.display = "none";
        signalLight.className = "signal-light red";
        
        signalLight.classList.add("waiting");

        const delay = Math.floor(Math.random() * 3000) + 2000;
        setTimeout(() => {
            if (!isTestActive) return;
            signalLight.className = "signal-light green";
            signalLight.classList.remove("waiting");
            message.textContent = "Click Now!";
            clickButton.style.display = "block";
            startTime = Date.now();
        }, delay);
    }

    function handleClick() {
        if (!startTime || !isTestActive) return;
        isTestActive = false;
        
        endTime = Date.now();
        const reactionTime = endTime - startTime;

        if (currentPlayer === 1) {
            player1ReactionTime = reactionTime;
            player1Time.textContent = `${reactionTime} ms`;
            player1Score.classList.remove("active");
            player2Score.classList.add("active");
            currentPlayer = 2;
            playerIndicator.textContent = "Player 2's Turn";
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
        startButton.textContent = "Start Player 2's Turn";
        message.textContent = "Ready for Player 2";
    }

    function determineWinner() {
        const winner = player1ReactionTime < player2ReactionTime ? 1 : 2;
        const loser = winner === 1 ? 2 : 1;
        
        message.textContent = `Player ${winner} Wins! Player ${loser} must face the punishment!`;
        localStorage.setItem("loser", `player${loser}`);
        
        setTimeout(() => {
            window.location.href = "punishment.html";
        }, 2000);
    }

    function handleKeyPress(event) {
        if (event.code === "Space" && startTime && isTestActive) {
            handleClick();
        }
    }
});