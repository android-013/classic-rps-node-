// frontend.js
let mode = 'medium';
let playerChoice = '';
let isPlaying = false; // Prevent multiple clicks on the Play button

const modes = document.querySelectorAll('.modes button');
const playerDisplay = document.getElementById('playerDisplay');
const autoDisplay = document.getElementById('autoDisplay');
const playBtn = document.getElementById('playBtn');
const choiceBtns = document.querySelectorAll('.choice-btn');
const resultDisplay = document.getElementById('result');

modes.forEach(button => {
    button.addEventListener('click', () => {
        if (isPlaying) return;
        mode = button.id;
        resetGame();
        updateModeButtonGlow();
        resultDisplay.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    });
});

choiceBtns.forEach(button => {
    button.addEventListener('click', () => {
        if (isPlaying) return;
        playerChoice = button.innerHTML;
        playerDisplay.innerHTML = playerChoice;
    });
});

playBtn.addEventListener('click', async () => {
    if (isPlaying || !playerChoice) return;
    isPlaying = true;
    playBtn.disabled = true;
    resultDisplay.textContent = "Auto is choosing...";

    await showAutoChoiceAnimation();

    fetch('/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, playerChoice })
    })
    .then(response => response.json())
    .then(data => {
        autoDisplay.innerHTML = data.autoChoice;
        resultDisplay.textContent = data.result;
    })
    .finally(() => {
        setTimeout(() => {
            isPlaying = false;
            playBtn.disabled = false;
        }, 1000);
    });
});

async function showAutoChoiceAnimation() {
    const choices = ['🪨', '📄', '✂️'];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < choices.length; j++) {
            autoDisplay.textContent = choices[j];
            await delay(100);
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resetGame() {
    playerChoice = '';
    playerDisplay.textContent = '🧑';
    autoDisplay.textContent = '🤖';
    resultDisplay.textContent = '';
}

function updateModeButtonGlow() {
    modes.forEach(button => {
        button.classList.remove('active');
        if (button.id === mode) {
            button.classList.add('active');
        }
    });
}

// backend.js (Requires Node.js + Express)
const express = require('express');
const app = express();
app.use(express.json());

app.post('/play', (req, res) => {
    const { mode, playerChoice } = req.body;
    const autoChoice = getAutoChoice(mode, playerChoice);
    const result = determineWinner(playerChoice, autoChoice);
    res.json({ autoChoice, result });
});

function getAutoChoice(mode, playerChoice) {
    const choices = ['🪨', '📄', '✂️'];
    if (mode === 'easy') {
        return playerChoice === '🪨' ? choices[0] : choices[Math.floor(Math.random() * 2)];
    } else if (mode === 'medium') {
        return choices[Math.floor(Math.random() * 3)];
    } else {
        return playerChoice === '🪨' ? '📄' : playerChoice === '📄' ? '✂️' : '🪨';
    }
}

function determineWinner(playerChoice, autoChoice) {
    if (playerChoice === autoChoice) return 'It\'s a draw!';
    if (
        (playerChoice === '🪨' && autoChoice === '✂️') ||
        (playerChoice === '📄' && autoChoice === '🪨') ||
        (playerChoice === '✂️' && autoChoice === '📄')
    ) return 'You win!';
    return 'You lose!';
}

app.listen(3000, () => console.log('Server running on port 3000'));
