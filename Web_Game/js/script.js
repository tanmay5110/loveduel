// script.js
document.addEventListener("DOMContentLoaded", () => {
    const clickSound = document.getElementById("clickSound");
    const startGameButton = document.getElementById("startGame");

   // Get the audio element
const bgMusic = document.getElementById('bgMusic');
let bgMusicStarted = false;

// Function to start background music
const startBgMusic = () => {
    if (!bgMusicStarted) {
        bgMusic.play().catch(err => console.error("Background music autoplay error:", err));
        bgMusicStarted = true;
        localStorage.setItem('bgMusicPlaying', 'true'); // Store the state in local storage
    }
};

// Check local storage on page load
window.onload = () => {
    if (localStorage.getItem('bgMusicPlaying') === 'true') {
        bgMusic.play().catch(err => console.error("Background music autoplay error:", err));
        bgMusicStarted = true;
    }
};

// Add event listener for user interaction
document.addEventListener("click", startBgMusic, { once: true });

    if (startGameButton) {
        startGameButton.addEventListener("click", () => {
            if (clickSound) {
                clickSound.play().catch(err => console.error("Click sound playback error:", err));
            }

            const player1Name = document.getElementById("player1Name").value.trim();
            const player1Gender = document.getElementById("player1Gender").value.toLowerCase();
            const player2Name = document.getElementById("player2Name").value.trim();
            const player2Gender = document.getElementById("player2Gender").value.toLowerCase();

            // Validate gender inputs
            if (!['male', 'female'].includes(player1Gender) || !['male', 'female'].includes(player2Gender)) {
                alert("Invalid gender selection! Please choose 'male' or 'female'.");
                return;
            }

            if (player1Name && player2Name) {
                // Save game state to localStorage for access on the next page
                const gameState = {
                    player1: { name: player1Name, gender: player1Gender },
                    player2: { name: player2Name, gender: player2Gender },
                    currentPlayer: 1  // Player 1 starts the game
                };

                localStorage.setItem("gameState", JSON.stringify(gameState));
                console.log("Stored game state:", gameState); // Debug log
                window.location.href = "difficulty.html";
            } else {
                alert("Please enter names for both players!");
            }
        });
    }
});
