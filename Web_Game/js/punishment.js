// punishment.js

// Separate configuration for easier maintenance
const CONFIG = {
    STORAGE_KEY: 'gameState',
    DEFAULT_REDIRECT: 'index.html',
    GAME_REDIRECT: 'tictactoe.html',
    IMAGES: {
        AVATARS_PATH: 'assets/avatars/',
        EXERCISES_PATH: 'exercises',
        ACTIVITIES_PATH: 'assets/images/'
    },
    SOUNDS: {
        TICK: 'assets/sounds/tick.mp3',
        COMPLETE: 'assets/sounds/complete.mp3',
        BUTTON: 'assets/sounds/button.mp3'
    }
};
// Punishments data structure with proper image paths and descriptions
const punishments = {
    male: {
        easy: [
            { 
                task: "Do 10 push-ups",
                description: "Keep your body straight and lower yourself until your chest nearly touches the ground",
                time: 45,
                image:'assets/images/dog.jpeg'
            },
            { 
                task: "Sing a song loudly",
                description: "Choose your favorite song and sing it with enthusiasm!",
                time: 30,
                image: `${CONFIG.IMAGES.ACTIVITIES_PATH}/sing.jpeg`
            }
        ],
        medium: [
            { 
                task: "Do 20 push-ups",
                description: "Maintain proper form throughout the exercise",
                time: 60,
                image: `${CONFIG.IMAGES.EXERCISES_PATH}/pushups.png`
            },
            { 
                task: "Recite a tongue twister 3 times",
                description: "Say 'She sells seashells by the seashore' three times fast",
                time: 45,
                image: `${CONFIG.IMAGES.ACTIVITIES_PATH}/tongue-twister.png`
            }
        ],
        hard: [
            { 
                task: "Do 30 push-ups",
                description: "Take short breaks if needed, but complete all repetitions",
                time: 90,
                image: `${CONFIG.IMAGES.EXERCISES_PATH}/pushups.png`
            },
            { 
                task: "Imitate 3 different animals",
                description: "Choose three different animals and imitate their sounds and movements",
                time: 60,
                image: `${CONFIG.IMAGES.ACTIVITIES_PATH}/animals.png`
            }
        ]
    },
    female: {
        easy: [
            { 
                task: "Do 10 squats",
                description: "Keep your back straight and feet shoulder-width apart",
                time: 45,
                image: `${CONFIG.IMAGES.EXERCISES_PATH}/squats.png`
            },
            { 
                task: "Clap a rhythm pattern",
                description: "Create and perform a unique rhythm pattern using claps",
                time: 30,
                image: `${CONFIG.IMAGES.ACTIVITIES_PATH}/clapping.png`
            }
        ],
        medium: [
            { 
                task: "Do 20 squats",
                description: "Maintain proper form and pace yourself",
                time: 60,
                image: `${CONFIG.IMAGES.EXERCISES_PATH}/squats.png`
            },
            { 
                task: "Sing while jumping",
                description: "Jump in place while singing your favorite chorus",
                time: 45,
                image: `${CONFIG.IMAGES.ACTIVITIES_PATH}/sing-jump.png`
            }
        ],
        hard: [
            { 
                task: "Do 30 squats",
                description: "Take short breaks if needed, but complete all repetitions",
                time: 90,
                image: `${CONFIG.IMAGES.EXERCISES_PATH}/squats.png`
            },
            { 
                task: "Imitate a celebrity",
                description: "Choose a famous celebrity and imitate their signature moves or catchphrases",
                time: 60,
                image: `${CONFIG.IMAGES.ACTIVITIES_PATH}/celebrity.png`
            }
        ]
    }
};

// Add SoundManager class
class SoundManager {
    constructor() {
        this.sounds = {
            tick: new Audio(CONFIG.SOUNDS.TICK),
            complete: new Audio(CONFIG.SOUNDS.COMPLETE),
            button: new Audio(CONFIG.SOUNDS.BUTTON)
        };
        this.isMuted = false;
        this.initialize();
    }

    initialize() {
        Object.values(this.sounds).forEach(sound => {
            sound.load();
            sound.volume = 0.5;
        });
        this.addSoundToggle();
    }

    addSoundToggle() {
        const soundToggle = document.createElement('div');
        soundToggle.className = 'sound-wave';
        soundToggle.addEventListener('click', () => this.toggleMute());
        document.body.appendChild(soundToggle);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        document.querySelector('.sound-wave').classList.toggle('muted', this.isMuted);
    }

    play(soundName) {
        if (!this.isMuted && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(err => console.log('Audio play failed:', err));
        }
    }
}


// Add ConfettiManager class
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
        for (let i = 0; i < 100; i++) {
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
        }, 5000);
    }
}


class PunishmentGame {
    constructor() {
        this.currentCountdown = null;
        this.gameState = null;
        this.currentPunishment = null;
        this.soundManager = new SoundManager();
        this.confettiManager = new ConfettiManager();
    }

    init() {
        try {
            this.loadGameState();
            this.startPunishment();
            this.setupEventListeners();
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
        const options = punishments[gender.toLowerCase()]?.[difficulty.toLowerCase()];
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
        this.startTimer();
    }

    updateUI(currentPlayer) {
        this.updatePlayerInfo(currentPlayer);
        this.updatePunishmentDisplay();
    }

    updatePlayerInfo(player) {
        const playerInfo = document.getElementById('playerInfo');
        if (!playerInfo) return;

        playerInfo.innerHTML = `
             <div class="player-card">
            <video 
                class="player-video" 
                autoplay 
                loop 
                muted
                style="width: 100px; height: 100px;">
                <source src="${CONFIG.IMAGES.AVATARS_PATH}/${player.gender.toLowerCase()}.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
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

        punishmentDisplay.innerHTML = `
            <div class="punishment-card">
                <img src="${this.currentPunishment.image}" 
                     alt="punishment" 
                     class="punishment-icon">
                <h3>${this.sanitizeHTML(this.currentPunishment.task)}</h3>
                <p class="description">${this.sanitizeHTML(this.currentPunishment.description)}</p>
            </div>
        `;
    }

    startTimer() {
        const timerDisplay = document.getElementById('timerDisplay');
        if (!timerDisplay) return;

        if (this.currentPunishment.time > 0) {
            let timeRemaining = this.currentPunishment.time;
            timerDisplay.style.display = 'block';
            
            this.currentCountdown = setInterval(() => {
                this.soundManager.play('tick');
                this.updateTimerDisplay(timerDisplay, timeRemaining);
                if (--timeRemaining < 0) {
                    this.handleTimerComplete(timerDisplay);
                }
            }, 1000);
        } else {
            timerDisplay.style.display = 'none';
        }
    }

    updateTimerDisplay(timerDisplay, timeRemaining) {
        timerDisplay.innerHTML = `
            <div class="timer">
                <div class="timer-circle">
                    <span>${timeRemaining}</span>
                </div>
                <p>seconds remaining</p>
            </div>
        `;
    }

    handleTimerComplete(timerDisplay) {
        clearInterval(this.currentCountdown);
        this.soundManager.play('complete');
        this.confettiManager.celebrate();
        timerDisplay.innerHTML = `
            <div class="timer completed">
                <span>Time's Up!</span>
            </div>
        `;
    }
    
   
    completePunishment() {
        if (this.currentCountdown) {
            clearInterval(this.currentCountdown);
        }

        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.gameState));

            // Get the previous page URL from the referrer
            const previousPage = document.referrer; 

            // Redirect to the previous page if available, otherwise go to the game page
            if (previousPage) {
                window.location.href = previousPage; 
            } else {
                window.location.href = CONFIG.GAME_REDIRECT; 
            }
        } catch (error) {
            console.error('Error saving game state:', error);
            this.handleError('Failed to save game progress');
        }
    }

    setupEventListeners() {
        document.getElementById('completePunishmentBtn')?.addEventListener('click', 
            () => this.completePunishment()
        );
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
