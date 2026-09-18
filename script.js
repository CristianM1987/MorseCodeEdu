const TRANSLATIONS = {
    es: {
        title: "Código Morse",
        subtitle: "Aprende, practica y traduce.",
        tabTranslator: "Traductor",
        tabGuide: "Abecedario",
        tabExercises: "Ejercicios",
        currentSeq: "Secuencia Actual",
        translatedText: "Mensaje Traducido",
        undo: "Deshacer",
        clear: "Borrar Todo",
        pressDur: "Duración Pulsación",
        pauseDur: "Tiempo Entre Pulsaciones",
        guideTitle: "Guía de Tiempos",
        guideDot: "Punto: Corto (< 250ms)",
        guideDash: "Raya: Largo (> 250ms)",
        guideLetterPause: "Pausa entre letras: > 600ms",
        guideWordPause: "Pausa entre palabras: > 1400ms",
        guideAlphabet: "Alfabeto y Números",
        practiceMode: "Modo Práctica",
        score: "Puntuación:",
        typeThis: "Digita esta letra/número:",
        yourAttempt: "Tu Intento",
        waiting: "Esperando...",
        nextEx: "Siguiente Ejercicio",
        holdBtn: "MANTÉN PRESIONADO",
        soundToggle: "Activar Sonido"
    },
    en: {
        title: "Morse Code",
        subtitle: "Learn, practice and translate.",
        tabTranslator: "Translator",
        tabGuide: "Alphabet",
        tabExercises: "Exercises",
        currentSeq: "Current Sequence",
        translatedText: "Translated Message",
        undo: "Undo",
        clear: "Clear All",
        pressDur: "Press Duration",
        pauseDur: "Time Between Presses",
        guideTitle: "Timing Guide",
        guideDot: "Dot: Short (< 250ms)",
        guideDash: "Dash: Long (> 250ms)",
        guideLetterPause: "Pause between letters: > 600ms",
        guideWordPause: "Pause between words: > 1400ms",
        guideAlphabet: "Alphabet & Numbers",
        practiceMode: "Practice Mode",
        score: "Score:",
        typeThis: "Type this letter/number:",
        yourAttempt: "Your Attempt",
        waiting: "Waiting...",
        nextEx: "Next Exercise",
        holdBtn: "HOLD TO TYPE",
        soundToggle: "Enable Sound"
    }
};

let currentLang = 'es';

function updateLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[lang][key]) {
            el.textContent = TRANSLATIONS[lang][key];
        }
    });
    
    // Update active button state
    document.getElementById('langEsBtn').classList.toggle('active', lang === 'es');
    document.getElementById('langEnBtn').classList.toggle('active', lang === 'en');
}

const MORSE_CODE_DICT = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
    '--..': 'Z', '.----': '1', '..---': '2', '...--': '3',
    '....-': '4', '.....': '5', '-....': '6', '--...': '7',
    '---..': '8', '----.': '9', '-----': '0'
};

const REVERSE_DICT = Object.entries(MORSE_CODE_DICT).reduce((acc, [morse, char]) => {
    acc[char] = morse;
    return acc;
}, {});

// Thresholds in milliseconds
const DOT_THRESHOLD = 250;
const LETTER_THRESHOLD = 600;
const WORD_THRESHOLD = 1400;

// State variables
let pressStartTime = 0;
let pressEndTime = 0;
let isPressed = false;
let currentSequence = '';
let translatedMessage = '';
let pauseTimer = null;
let animationFrameId = null;
let currentMode = 'translator'; // 'translator', 'guide', 'exercises'

// Audio State
let audioCtx = null;
let oscillator = null;
let gainNode = null;

// Exercise State
let currentExerciseChar = '';
let currentExerciseMorse = '';
let score = 0;

// DOM Elements
const translatedTextEl = document.getElementById('translatedText');
const currentSequenceEl = document.getElementById('currentSequence');
const pressDurationEl = document.getElementById('pressDuration');
const pauseDurationEl = document.getElementById('pauseDuration');
const morseButton = document.getElementById('morseButton');
const soundToggle = document.getElementById('soundToggle');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');

// Language DOM
const langEsBtn = document.getElementById('langEsBtn');
const langEnBtn = document.getElementById('langEnBtn');

// Tabs DOM
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Guide DOM
const alphabetGrid = document.getElementById('alphabetGrid');

// Exercise DOM
const targetCharEl = document.getElementById('targetChar');
const targetMorseEl = document.getElementById('targetMorse');
const exerciseSequenceEl = document.getElementById('exerciseSequence');
const exerciseFeedbackEl = document.getElementById('exerciseFeedback');
const scoreValueEl = document.getElementById('scoreValue');
const nextExerciseBtn = document.getElementById('nextExerciseBtn');

/* --- Audio Setup --- */
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function startBeep() {
    if (!soundToggle.checked) return;
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // 600Hz 
    
    // Smooth attack
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
}

function stopBeep() {
    if (oscillator && gainNode && audioCtx) {
        // Smooth release
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.02);
        
        oscillator.stop(audioCtx.currentTime + 0.02);
        oscillator = null;
        gainNode = null;
    }
}

/* --- Core Logic --- */
function updateDisplay() {
    if (currentMode === 'translator') {
        translatedTextEl.textContent = translatedMessage || '_';
        currentSequenceEl.textContent = currentSequence;
    } else if (currentMode === 'exercises') {
        exerciseSequenceEl.textContent = currentSequence;
    }
}

function processSequence() {
    if (currentSequence === '') return;
    
    if (currentMode === 'translator') {
        const letter = MORSE_CODE_DICT[currentSequence];
        if (letter) {
            translatedMessage += letter;
        } else {
            translatedMessage += '?';
        }
    } else if (currentMode === 'exercises') {
        checkExercise(currentSequence);
    }
    
    currentSequence = '';
    updateDisplay();
}

function handlePress() {
    if (isPressed) return;
    
    startBeep();

    if (pauseTimer) {
        clearTimeout(pauseTimer);
        pauseTimer = null;
    }
    
    const now = Date.now();
    if (pressEndTime > 0) {
        const pauseDuration = now - pressEndTime;
        if (currentMode === 'translator') {
            pauseDurationEl.textContent = `${pauseDuration} ms`;
            if (pauseDuration >= WORD_THRESHOLD && currentSequence === '') {
                if (!translatedMessage.endsWith(' ') && translatedMessage !== '') {
                    translatedMessage += ' ';
                    updateDisplay();
                }
            }
        }
    } else {
        if (currentMode === 'translator') pauseDurationEl.textContent = `0 ms`;
    }

    isPressed = true;
    pressStartTime = now;
    morseButton.classList.add('active');
    
    if (currentMode === 'translator') {
        updateLiveDuration();
    }
}

function handleRelease() {
    if (!isPressed) return;
    
    stopBeep();
    isPressed = false;
    pressEndTime = Date.now();
    morseButton.classList.remove('active');
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    const duration = pressEndTime - pressStartTime;
    
    if (currentMode === 'translator') {
        pressDurationEl.textContent = `${duration} ms`;
    }
    
    if (duration < DOT_THRESHOLD) {
        currentSequence += '.';
    } else {
        currentSequence += '-';
    }
    
    updateDisplay();
    
    pauseTimer = setTimeout(() => {
        processSequence();
        
        if (currentMode === 'translator') {
            pauseTimer = setTimeout(() => {
                if (!translatedMessage.endsWith(' ') && translatedMessage !== '') {
                    translatedMessage += ' ';
                    updateDisplay();
                }
            }, WORD_THRESHOLD - LETTER_THRESHOLD);
        }
    }, LETTER_THRESHOLD);
}

function updateLiveDuration() {
    if (!isPressed || currentMode !== 'translator') return;
    
    const currentDuration = Date.now() - pressStartTime;
    pressDurationEl.textContent = `${currentDuration} ms`;
    
    if (currentDuration >= DOT_THRESHOLD) {
        pressDurationEl.style.color = '#3b82f6';
    } else {
        pressDurationEl.style.color = '';
    }
    
    animationFrameId = requestAnimationFrame(updateLiveDuration);
}

/* --- Tabs Logic --- */
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        
        // Update active tab buttons
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(c => c.classList.remove('active'));
        document.getElementById(target).classList.add('active');
        
        // Update mode
        currentMode = target;
        currentSequence = '';
        
        if (currentMode === 'exercises' && !currentExerciseChar) {
            nextExercise();
        }
    });
});

/* --- Guide Logic --- */
function populateGuide() {
    const chars = Object.keys(REVERSE_DICT).sort();
    chars.forEach(char => {
        const card = document.createElement('div');
        card.className = 'char-card';
        card.innerHTML = `
            <div class="char-letter">${char}</div>
            <div class="char-morse">${REVERSE_DICT[char]}</div>
        `;
        alphabetGrid.appendChild(card);
    });
}

/* --- Exercise Logic --- */
function nextExercise() {
    const chars = Object.keys(REVERSE_DICT);
    // pick a random char
    currentExerciseChar = chars[Math.floor(Math.random() * chars.length)];
    currentExerciseMorse = REVERSE_DICT[currentExerciseChar];
    
    targetCharEl.textContent = currentExerciseChar;
    targetMorseEl.textContent = currentExerciseMorse;
    
    exerciseSequenceEl.textContent = '';
    exerciseFeedbackEl.textContent = 'Esperando...';
    exerciseFeedbackEl.className = 'feedback-text';
    currentSequence = '';
}

function checkExercise(sequence) {
    if (sequence === currentExerciseMorse) {
        exerciseFeedbackEl.textContent = '¡Correcto!';
        exerciseFeedbackEl.className = 'feedback-text feedback-success';
        score += 10;
        scoreValueEl.textContent = score;
        setTimeout(nextExercise, 1000);
    } else {
        exerciseFeedbackEl.textContent = `Incorrecto. Entendí "${MORSE_CODE_DICT[sequence] || '?'}" (${sequence})`;
        exerciseFeedbackEl.className = 'feedback-text feedback-error';
        score = Math.max(0, score - 5);
        scoreValueEl.textContent = score;
    }
}

nextExerciseBtn.addEventListener('click', nextExercise);

/* --- Global Listeners --- */
morseButton.addEventListener('mousedown', handlePress);
morseButton.addEventListener('mouseup', handleRelease);
morseButton.addEventListener('mouseleave', () => {
    if (isPressed) handleRelease();
});

morseButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handlePress();
});
morseButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleRelease();
});

document.addEventListener('mousedown', (e) => {
    // Enable audio context on first click anywhere
    if (!audioCtx && soundToggle.checked) initAudio();
    
    if (e.button === 0 && e.target !== morseButton && !morseButton.contains(e.target)) {
        // Prevent interfering with UI clicks like tabs and buttons
        if(e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && !e.target.closest('.tabs')) {
             handlePress();
        }
    }
});

document.addEventListener('mouseup', (e) => {
    if (e.button === 0 && e.target !== morseButton && !morseButton.contains(e.target)) {
        if(e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && !e.target.closest('.tabs')) {
             handleRelease();
        }
    }
});

// Initialization
if (undoBtn) {
    undoBtn.addEventListener('click', () => {
        if (currentSequence.length > 0) {
            currentSequence = currentSequence.slice(0, -1);
        } else if (translatedMessage.length > 0) {
            translatedMessage = translatedMessage.slice(0, -1);
        }
        updateDisplay();
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        translatedMessage = '';
        currentSequence = '';
        updateDisplay();
    });
}

populateGuide();
updateDisplay();

// Language listeners
langEsBtn.addEventListener('click', () => updateLanguage('es'));
langEnBtn.addEventListener('click', () => updateLanguage('en'));
