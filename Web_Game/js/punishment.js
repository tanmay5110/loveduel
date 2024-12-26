// punishment.js
import { easyChallengesToysi } from './easy.js';
import { mediumChallenges } from './medium.js';
import { hardChallenges } from './hard.js';

// Comprehensive configuration object
const CONFIG = {
    STORAGE_KEY: 'gameState',
    DEFAULT_REDIRECT: 'index.html',
    GAME_REDIRECT: 'game.html',
    IMAGES: {
        AVATARS_PATH: 'assets/avatars/',
        EXERCISES_PATH: 'exercises',
        ACTIVITIES_PATH: 'assets/images/'
    },
    SOUNDS: {
        TICK: 'assets/sounds/tick.mp3',
        COMPLETE: 'assets/sounds/complete.mp3',
        BUTTON: 'assets/sounds/button.mp3',
        BACKGROUND_MUSIC: [
            'assets/music/bgm1.mp3',
            'assets/music/bgm2.mp3',
            'assets/music/bgm3.mp3'
        ]
    },
    ANIMATION: {
        CONFETTI_DURATION: 5000,
        CONFETTI_COUNT: 100
    }
};

// Combine all challenges
const challenges = {
    easy: easyChallengesToysi,
    medium: mediumChallenges,
    hard: hardChallenges
};

// Enhanced Sound Manager Class
class SoundManager {
    constructor() {
        this.sounds = {
            tick: new Audio(CONFIG.SOUNDS.TICK),
            complete: new Audio(CONFIG.SOUNDS.COMPLETE),
            button: new Audio(CONFIG.SOUNDS.BUTTON)
        };
        this.backgroundMusic = null;
        this.isMuted = false;
        this.initialize();
    }

    initialize() {
        // Initialize sound effects
        Object.values(this.sounds).forEach(sound => {
            sound.load();
            sound.volume = 0.5;
        });

        // Initialize background music
        this.initializeBackgroundMusic();
        this.addSoundToggle();
    }

    initializeBackgroundMusic() {
        const randomMusicPath = CONFIG.SOUNDS.BACKGROUND_MUSIC[
            Math.floor(Math.random() * CONFIG.SOUNDS.BACKGROUND_MUSIC.length)
        ];
        this.backgroundMusic = new Audio(randomMusicPath);
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3;

        // Handle audio context autoplay restrictions
        document.addEventListener('click', () => {
            if (!this.isMuted && this.backgroundMusic.paused) {
                this.startBackgroundMusic();
            }
        }, { once: true });
    }

    addSoundToggle() {
        const soundToggle = document.createElement('div');
        soundToggle.className = 'sound-wave';
        soundToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sound-icon">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path class="sound-wave" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
        `;
        soundToggle.addEventListener('click', () => this.toggleMute());
        document.body.appendChild(soundToggle);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const soundToggle = document.querySelector('.sound-wave');
        soundToggle.classList.toggle('muted', this.isMuted);
        
        if (this.isMuted) {
            this.backgroundMusic?.pause();
        } else {
            this.startBackgroundMusic();
        }
        
        Object.values(this.sounds).forEach(sound => {
            sound.muted = this.isMuted;
        });
    }

    play(soundName) {
        if (!this.isMuted && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(err => {
                console.log(`Audio play failed for ${soundName}:`, err);
            });
        }
    }

    startBackgroundMusic() {
        if (!this.isMuted && this.backgroundMusic) {
            this.backgroundMusic.play().catch(err => {
                console.log('Background music play failed:', err);
            });
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
}

// Enhanced Confetti Manager Class
class ConfettiManager {
    constructor() {
        this.container = null;
        this.colors = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
            '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'
        ];
        this.initialize();
    }

    initialize() {
        this.container = document.createElement('div');
        this.container.className = 'confetti-container';
        document.body.appendChild(this.container);
    }

    createConfetti() {
        for (let i = 0; i < CONFIG.ANIMATION.CONFETTI_COUNT; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`;
            this.container.appendChild(confetti);
        }
    }

    celebrate() {
        this.container.style.display = 'block';
        this.createConfetti();
        setTimeout(() => {
            this.container.style.display = 'none';
            this.container.innerHTML = '';
        }, CONFIG.ANIMATION.CONFETTI_DURATION);
    }
}

// Main Game Class
class PunishmentGame {
    constructor() {
        this.currentCountdown = null;
        this.gameState = null;
        this.currentPunishment = null;
        this.soundManager = new SoundManager();
        this.confettiManager = new ConfettiManager();
        this.isTimerStarted = false;
    }

    init() {
        try {
            this.loadGameState();
            this.startPunishment();
            this.setupEventListeners();
            // Background music will start on first user interaction
        } catch (error) {
            console.error('Initialization error:', error);
            this.handleError('Failed to initialize game');
        }
    }

    loadGameState() {
        const savedState = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (!savedState) {
            throw new Error('Game state not found');
        }
        this.gameState = JSON.parse(savedState);
        this.validateGameState();
    }

    validateGameState() {
        const required = ['currentPlayer', 'difficulty', 'player1', 'player2'];
        const missing = required.filter(prop => !this.gameState[prop]);
        if (missing.length > 0) {
            throw new Error(`Missing required game state properties: ${missing.join(', ')}`);
        }
    }

    getRandomPunishment(gender, difficulty) {
        const options = challenges[difficulty.toLowerCase()]?.[gender.toLowerCase()];
        if (!options || options.length === 0) {
            throw new Error('Invalid gender or difficulty level');
        }
        return options[Math.floor(Math.random() * options.length)];
    }

    startPunishment() {
        const currentPlayer = this.gameState[`player${this.gameState.currentPlayer}`];
        this.currentPunishment = this.getRandomPunishment(
            currentPlayer.gender,
            this.gameState.difficulty
        );

        this.updateUI(currentPlayer);
        this.setupTimer();
    }

    updateUI(currentPlayer) {
        this.updatePlayerInfo(currentPlayer);
        this.updatePunishmentDisplay();
    }

    updatePlayerInfo(player) {
        const playerInfo = document.getElementById('playerInfo');
        if (!playerInfo) return;

        const giphyEmbed = player.gender.toLowerCase() === 'male' 
            ? '<iframe src="https://giphy.com/embed/dzQ3eSI5SpeHsJ06rW" width="120" height="120" frameBorder="0" class="giphy-embed"></iframe>'
            : '<iframe src="https://giphy.com/embed/JsETE2464QtDPz5CWR" width="120" height="120" frameBorder="0" class="giphy-embed"></iframe>';

        playerInfo.innerHTML = `
            <div class="player-card animate__animated animate__fadeIn">
                <div class="avatar-container">
                    ${giphyEmbed}
                </div>
                <h2>${this.sanitizeHTML(player.name)}</h2>
                <span class="player-badge ${this.gameState.difficulty.toLowerCase()}">
                    ${this.gameState.difficulty}
                </span>
            </div>
        `;
    }

    updatePunishmentDisplay() {
        const punishmentDisplay = document.getElementById('punishmentDisplay');
        if (!punishmentDisplay) return;

        const imageHTML = this.currentPunishment.image ? 
            `<img src="${this.currentPunishment.image}" alt="challenge" class="punishment-icon">` : 
            '';

        punishmentDisplay.innerHTML = `
            <div class="punishment-card animate__animated animate__fadeIn">
                ${imageHTML}
                <h3>${this.sanitizeHTML(this.currentPunishment.task)}</h3>
                <p class="description">${this.sanitizeHTML(this.currentPunishment.description)}</p>
            </div>
        `;
    }

    setupTimer() {
        const timerDisplay = document.getElementById('timerDisplay');
        if (!timerDisplay) return;

        if (this.currentPunishment.time > 0) {
            timerDisplay.style.display = 'block';
            this.updateTimerDisplay(timerDisplay, this.currentPunishment.time);
            
            // Add click event listener to the timer circle
            const timerCircle = timerDisplay.querySelector('.timer-circle');
            if (timerCircle) {
                timerCircle.addEventListener('click', () => {
                    if (!this.isTimerStarted) {
                        this.startTimerCountdown(this.currentPunishment.time);
                        this.isTimerStarted = true;
                    }
                });
            }
        } else {
            timerDisplay.style.display = 'none';
        }
    }

    startTimerCountdown(duration) {
        let timeRemaining = duration;
        const timerDisplay = document.getElementById('timerDisplay');
        
        // Clear any existing countdown
        if (this.currentCountdown) {
            clearInterval(this.currentCountdown);
        }

        this.currentCountdown = setInterval(() => {
            this.soundManager.play('tick');
            timeRemaining--;
            
            if (timeRemaining >= 0) {
                this.updateTimerDisplay(timerDisplay, timeRemaining);
            } else {
                this.handleTimerComplete(timerDisplay);
            }
        }, 1000);
    }

    updateTimerDisplay(timerDisplay, timeRemaining) {
        timerDisplay.innerHTML = `
            <div class="timer-container">
                <div class="timer-circle">
                    <span>${timeRemaining}</span>
                </div>
                <p>seconds remaining</p>
                ${!this.isTimerStarted ? '<p class="timer-instruction">Click timer to start</p>' : ''}
            </div>
        `;
    }

    handleTimerComplete(timerDisplay) {
        clearInterval(this.currentCountdown);
        this.soundManager.play('complete');
        this.confettiManager.celebrate();
        
        timerDisplay.innerHTML = `
            <div class="timer-container">
                <div class="timer-circle completed">
                    <span>Done!</span>
                </div>
                <p>Challenge Complete!</p>
            </div>
        `;
    }

    completePunishment() {
        if (this.currentCountdown) {
            clearInterval(this.currentCountdown);
        }

        try {
            // Switch to the next player
            this.gameState.currentPlayer = this.gameState.currentPlayer === 1 ? 2 : 1;
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.gameState));

            // Stop background music
            this.soundManager.stopBackgroundMusic();

            // Get the previous page URL from the referrer
            const previousPage = document.referrer || CONFIG.GAME_REDIRECT;
            window.location.href = previousPage;
        } catch (error) {
            console.error('Error saving game state:', error);
            this.handleError('Failed to save game progress');
        }
    }

    setupEventListeners() {
        document.getElementById('completePunishmentBtn')?.addEventListener('click', () => {
            this.soundManager.play('button');
            this.completePunishment();
        });

        document.getElementById('changeMiniGameBtn')?.addEventListener('click', () => {
            this.soundManager.play('button');
            window.location.href = "selection.html";
        });

        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.soundManager.stopBackgroundMusic();
            } else {
                this.soundManager.startBackgroundMusic();
            }
        });
    }

    handleError(message) {
        alert(message);
        window.location.href = CONFIG.DEFAULT_REDIRECT;
    }

    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new PunishmentGame();
    game.init();
});
