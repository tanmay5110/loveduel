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

    updatePlayerDisplay();

    function updatePlayerDisplay() {
        const displayElement = document.getElementById('currentPlayerDisplay');
        if (displayElement) {
            displayElement.innerText = `Current Turn: ${currentPlayer.name} (${currentPlayer === player1 ? 'X' : 'O'})`;
            displayElement.style.color = currentPlayer === player1 ? '#ff4444' : '#4444ff';
        }
    }

    function handleClick(cellId) {
        if (gameOver || gameBoard[cellId] !== '') return;

        const symbol = currentPlayer === player1 ? 'X' : 'O';
        gameBoard[cellId] = symbol;
        const cell = document.getElementById(`cell${cellId}`);
        cell.setAttribute('data-symbol', symbol);

        if (checkWinner()) {
            gameOver = true;
            const loser = currentPlayer === player1 ? player2 : player1;
            
            setTimeout(() => {
                alert(`${currentPlayer.name} Wins! ${loser.name} will be punished!`);
                gameState.currentPlayer = currentPlayer === player1 ? 2 : 1;
                localStorage.setItem("gameState", JSON.stringify(gameState));
                window.location.href = 'punishment.html';
            }, 1500); // Delay to show winning animation
        } else if (!gameBoard.includes('')) {
            gameOver = true;
            setTimeout(() => {
                alert("It's a Draw! Both players are safe!");
                restartGame();
            }, 500);
        } else {
            currentPlayer = currentPlayer === player1 ? player2 : player1;
            updatePlayerDisplay();
        }
    }

    function drawWinningLine(combo) {
        const cells = combo.map(i => document.getElementById(`cell${i}`));
        const start = cells[0].getBoundingClientRect();
        const end = cells[2].getBoundingClientRect();
        const board = document.getElementById('gameBoard');
        const boardRect = board.getBoundingClientRect();
        
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("id", "winLine");
        svg.style.position = "absolute";
        svg.style.width = "100%";
        svg.style.height = "100%";
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.classList.add("win-line");
        
        const x1 = start.left - boardRect.left + start.width / 2;
        const y1 = start.top - boardRect.top + start.height / 2;
        const x2 = end.left - boardRect.left + end.width / 2;
        const y2 = end.top - boardRect.top + end.height / 2;
        
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        
        svg.appendChild(line);
        board.appendChild(svg);
        
        combo.forEach(index => {
            document.getElementById(`cell${index}`).classList.add('winning-cell');
        });
    }

    function checkWinner() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (let combo of winningCombinations) {
            if (gameBoard[combo[0]] && 
                gameBoard[combo[0]] === gameBoard[combo[1]] && 
                gameBoard[combo[0]] === gameBoard[combo[2]]) {
                drawWinningLine(combo);
                return true;
            }
        }
        return false;
    }

    function restartGame() {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        gameOver = false;
        currentPlayer = player1;
        document.querySelectorAll('.cell').forEach(cell => {
            cell.removeAttribute('data-symbol');
            cell.classList.remove('winning-cell');
        });
        const existingLine = document.getElementById('winLine');
        if (existingLine) existingLine.remove();
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
