document.addEventListener("DOMContentLoaded", () => {
    // Get game state from localStorage
    const gameState = JSON.parse(localStorage.getItem("gameState"));
    if (!gameState) {
        alert("Game state is missing!");
        window.location.href = "index.html";
        return;
    }

    // Initialize players from gameState
    const player1 = gameState.player1;
    const player2 = gameState.player2;
    let currentPlayer = gameState.currentPlayer === 1 ? player1 : player2;
    
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let gameOver = false;

    // Update display to show current player
    updatePlayerDisplay();

    function updatePlayerDisplay() {
        const displayElement = document.getElementById('currentPlayerDisplay');
        if (displayElement) {
            displayElement.innerText = `Current Turn: ${currentPlayer.name} (${currentPlayer === player1 ? 'X' : 'O'})`;
        }
    }

    function handleClick(cellId) {
        if (gameOver || gameBoard[cellId] !== '') return;

        // Update the game board
        const symbol = currentPlayer === player1 ? 'X' : 'O';
        gameBoard[cellId] = symbol;
        document.getElementById(`cell${cellId}`).innerText = symbol;

        if (checkWinner()) {
            gameOver = true;
            // The current player is the winner, so the other player gets punished
            const loser = currentPlayer === player1 ? player2 : player1;
            alert(`${currentPlayer.name} Wins! ${loser.name} will be punished!`);
            
            // Update game state with loser's information for punishment
            gameState.currentPlayer = currentPlayer === player1 ? 2 : 1; // Set to loser's number
            localStorage.setItem("gameState", JSON.stringify(gameState));
            
            // Navigate to punishment page
            window.location.href = 'punishment.html';
        } else if (!gameBoard.includes('')) {
            gameOver = true;
            alert("It's a Draw! Both players are safe!");
            // In case of draw, restart the game
            restartGame();
        } else {
            // Switch turns
            currentPlayer = currentPlayer === player1 ? player2 : player1;
            updatePlayerDisplay();
        }
    }

    function checkWinner() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        return winningCombinations.some(([a, b, c]) => 
            gameBoard[a] && 
            gameBoard[a] === gameBoard[b] && 
            gameBoard[a] === gameBoard[c]
        );
    }

    function restartGame() {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        gameOver = false;
        currentPlayer = player1;
        document.querySelectorAll('.cell').forEach(cell => cell.innerText = '');
        updatePlayerDisplay();
    }

    // Add click event listeners to all cells
    document.querySelectorAll('.cell').forEach((cell, index) => {
        cell.addEventListener('click', () => handleClick(index));
    });

    // Add restart button listener
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
});