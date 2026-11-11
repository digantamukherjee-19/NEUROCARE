/**
 * NeuroCare - Learning Centre Module
 * Features:
 * - My Learning Style selector
 * - 3D Interactive Flashcards (with custom card creator & delete confirmation)
 * - Difficulty-Leveled Quizzes with score tracking & immediate feedback
 * - Difficulty-Leveled Memory Match Game
 * - Interactive Visual Mathematics Exercises (with visual dot counters)
 * - Interactive Reading Exercise
 * - Attention & Concentration Exercise ("Find the Target")
 * - Audio-Based Learning Lessons with captions and quick check
 */

var Learning = window.Learning = (function () {
  'use strict';

  const STORAGE_KEY_PROGRESS = 'neurocare_learning_progress';
  const STORAGE_KEY_CUSTOM_CARDS = 'neurocare_learning_custom_cards';

  let progress = {
    flashcardsReviewed: 0,
    quizzesCompleted: 0,
    mathSolved: 0,
    attentionWins: 0,
    readingWins: 0,
    starsEarned: 0,
    memoryBestMoves: null,
    preferredStyle: 'visual'
  };

  const flashcardDecks = {
    science: [
      { q: 'What is Photosynthesis?', a: 'The process where plants use sunlight, water, and carbon dioxide to create oxygen and energy.', hint: 'Plants cooking with sunlight ☀️' },
      { q: 'What are the 3 States of Matter?', a: 'Solid (fixed shape), Liquid (flows), and Gas (fills space).', hint: 'Ice 🧊, Water 💧, Steam 💨' },
      { q: 'Why do we have seasons?', a: 'Because the Earth is tilted on its axis as it orbits the Sun.', hint: 'Tilt of the planet 🌍' }
    ],
    social: [
      { q: 'When a friend looks away and sighs, what might that mean?', a: 'They might feel tired, overwhelmed, or need a quiet moment.', hint: 'Body language cue' },
      { q: 'What can you say if someone talks too loudly?', a: '"My ears feel sensitive right now, could we speak a bit softer please?"', hint: 'Polite self-advocacy' },
      { q: 'How can you show you are listening?', a: 'Nodding gently, summarizing what they said, or saying "I understand".', hint: 'Active listening' }
    ],
    skills: [
      { q: 'What is the 2-Minute Rule?', a: 'If a task takes under 2 minutes, do it right away rather than postponing it.', hint: 'Quick ADHD habit' },
      { q: 'What is 5-4-3-2-1 Grounding?', a: 'Notice 5 things seen, 4 felt, 3 heard, 2 smelled, 1 tasted.', hint: 'Sensory calm technique' },
      { q: 'What is a Brain Dump?', a: 'Writing every racing thought on paper without organizing to clear mental clutter.', hint: 'Mental reset' }
    ]
  };

  let customCards = [];
  let currentCategory = 'science';
  let currentCardIndex = 0;
  let isCardFlipped = false;

  // --- QUIZ DATA BY DIFFICULTY ---
  const quizBank = {
    easy: [
      {
        q: 'Which timer method splits work into 25-minute focus blocks with 5-minute breaks?',
        options: ['The Marathon Method', 'The Pomodoro Technique', 'The Midnight Sprint', 'The Guessing Game'],
        correct: 1,
        explanation: 'The Pomodoro Technique breaks open-ended time into short, manageable 25-minute blocks.'
      },
      {
        q: 'What can help reduce visual crowding while reading?',
        options: ['Tiny crowded letters', 'Using a reading ruler and wider line spacing', 'Reading in a flashing room', 'Holding your breath'],
        correct: 1,
        explanation: 'Wider line spacing and a reading ruler help eyes stay anchored on one line at a time.'
      },
      {
        q: 'What does "Neurodiversity" mean?',
        options: ['Every brain must work identically', 'Human brains naturally vary in how they think and process', 'Only adults learn differently', 'Technology is unhelpful'],
        correct: 1,
        explanation: 'Neurodiversity celebrates natural variations in human cognition such as ADHD, autism, and dyslexia.'
      }
    ],
    medium: [
      {
        q: 'Which strategy helps someone with ADHD overcome task initiation paralysis?',
        options: [
          'Waiting for sudden bursts of 100% motivation',
          'Breaking the task into tiny 5-minute micro-steps',
          'Attempting a 6-hour non-stop session',
          'Removing all breaks'
        ],
        correct: 1,
        explanation: 'Chunking lowers the mental effort required to start, making the first step approachable.'
      },
      {
        q: 'Why do visual schedules assist autistic learners?',
        options: [
          'They create unpredictability',
          'They make transitions concrete and reduce uncertainty anxiety',
          'They replace communication entirely',
          'They speed up the clock'
        ],
        correct: 1,
        explanation: 'Visual schedules show exactly what happens now and next, easing transition stress.'
      },
      {
        q: 'Why are pastel background tints used in dyslexia tools?',
        options: [
          'To reduce harsh glare from stark white pages',
          'To hide punctuation',
          'To shrink text size',
          'To make text harder to scan'
        ],
        correct: 0,
        explanation: 'Soft cream, mint, or blue tints lower harsh contrast glare that can cause visual stress.'
      }
    ],
    hard: [
      {
        q: 'What is "Bionic Reading" eye-pacing designed to assist with?',
        options: [
          'Increasing screen brightness',
          'Guiding saccadic eye fixations via bolded word prefixes',
          'Replacing spoken audio completely',
          'Deleting adjectives'
        ],
        correct: 1,
        explanation: 'Highlighting initial letters gives the eye anchor points so the brain completes familiar words smoothly.'
      },
      {
        q: 'Which sensory system senses body position, movement, and deep pressure?',
        options: ['Olfactory', 'Proprioception', 'Gustatory', 'Photoreception'],
        correct: 1,
        explanation: 'Proprioception helps regulate body awareness; gentle deep pressure or stretching supports it.'
      },
      {
        q: 'In executive function coaching, what is "externalizing working memory"?',
        options: [
          'Forcing yourself to memorize 20 dates without notes',
          'Using visible checklists, timers, and planners outside your head',
          'Hiding calendars away',
          'Skipping reminders'
        ],
        correct: 1,
        explanation: 'Writing steps down and using visible timers frees up working memory for problem-solving.'
      }
    ]
  };

  let quizDifficulty = 'easy';
  let currentQuizStep = 0;
  let quizScore = 0;
  let hasAnsweredCurrent = false;

  // --- MEMORY MATCHING GAME ---
  const allMemoryIcons = ['🌟', '🎨', '🚀', '🌱', '💡', '🎵', '🦋', '🌈'];
  let memoryDifficulty = 'medium'; // easy: 4 pairs (8), medium: 6 pairs (12), hard: 8 pairs (16)
  let memoryDeck = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let totalPairs = 6;
  let memoryMoves = 0;
  let memoryLock = false;

  // --- INTERACTIVE MATH EXERCISE ---
  let mathDifficulty = 'easy';
  let currentMathProblem = { a: 3, b: 4, op: '+', answer: 7 };

  // --- INTERACTIVE READING EXERCISE ---
  const readingQuestions = [
    { sentence: 'Every brain learns in its own ___ way.', blank: 'unique', options: ['unique', 'loud', 'heavy'] },
    { sentence: 'A quiet sensory break helps restore ___ and calm.', blank: 'focus', options: ['clutter', 'focus', 'panic'] },
    { sentence: 'Visual checklists make daily ___ easy to follow.', blank: 'routines', options: ['routines', 'storms', 'noises'] }
  ];
  let readingExIdx = 0;

  // --- ATTENTION GAME ("FIND THE TARGET") ---
  let attentionTarget = '⭐';
  let attentionScore = 0;
  let attentionRounds = 0;

  function init() {
    loadProgress();
    loadCustomCards();
    setupFlashcards();
    setupQuiz();
    setupMemoryGame();
    generateMathProblem();
    renderReadingExercise();
    setupAttentionRound();
    bindEvents();
    renderProgressUI();
    setLearningStyle(progress.preferredStyle, false);
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) progress = { ...progress, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Could not read learning progress', e);
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn('Could not save learning progress', e);
    }
  }

  function loadCustomCards() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_CARDS);
      customCards = saved ? JSON.parse(saved) : [];
    } catch (e) {
      customCards = [];
    }
  }

  function saveCustomCards() {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_CARDS, JSON.stringify(customCards));
    } catch (e) {
      console.warn('Could not save custom cards', e);
    }
  }

  // --- MY LEARNING STYLE ---
  function setLearningStyle(style, notify = true) {
    progress.preferredStyle = style;
    saveProgress();
    document.querySelectorAll('.learning-style-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-style') === style);
    });

    const adviceBox = document.getElementById('learning-style-advice');
    if (adviceBox) {
      const adviceMap = {
        visual: '💡 <strong>Visual Learner:</strong> We recommend 3D flashcards, color-coded notes, and the Visual Math Dot Builder below!',
        audio: '🎧 <strong>Audio Learner:</strong> Try the Audio Lessons with synchronized captions and Web Speech voice reader!',
        reading: '📖 <strong>Reading/Writing Learner:</strong> Practice with the Reading Comprehension blanks and customize spacing in Dyslexia Support!',
        interactive: '🧩 <strong>Interactive / Kinesthetic Learner:</strong> Dive into the Memory Match Game, Attention Target Finder, and Interactive Quizzes!'
      };
      adviceBox.innerHTML = adviceMap[style] || adviceMap.visual;
    }

    if (notify && window.App && window.App.showToast) {
      window.App.showToast(`Learning style set to: ${style.toUpperCase()}`);
    }
  }

  // --- 3D FLASHCARDS ---
  function getActiveDeck() {
    if (currentCategory === 'custom') {
      return customCards.length ? customCards : [{ q: 'No custom cards yet', a: 'Use the form below to create your own flashcards!', hint: 'Add your first card', empty: true }];
    }
    return flashcardDecks[currentCategory] || flashcardDecks.science;
  }

  function setupFlashcards() {
    renderFlashcard();
  }

  function renderFlashcard() {
    const cardEl = document.getElementById('interactive-flashcard');
    const qEl = document.getElementById('flashcard-question');
    const aEl = document.getElementById('flashcard-answer');
    const hintEl = document.getElementById('flashcard-hint');
    const countEl = document.getElementById('flashcard-counter');
    const deleteCustomBtn = document.getElementById('btn-delete-custom-flashcard');

    if (!cardEl || !qEl || !aEl) return;

    cardEl.classList.remove('flipped');
    isCardFlipped = false;

    const deck = getActiveDeck();
    if (currentCardIndex >= deck.length) currentCardIndex = 0;
    const card = deck[currentCardIndex];

    qEl.textContent = card.q;
    aEl.textContent = card.a;
    if (hintEl) hintEl.textContent = card.hint || '';
    if (countEl) countEl.textContent = `Card ${currentCardIndex + 1} of ${deck.length}`;
    if (deleteCustomBtn) {
      deleteCustomBtn.style.display = (currentCategory === 'custom' && !card.empty) ? 'inline-flex' : 'none';
    }
  }

  function flipFlashcard() {
    const cardEl = document.getElementById('interactive-flashcard');
    if (cardEl) {
      isCardFlipped = !isCardFlipped;
      cardEl.classList.toggle('flipped', isCardFlipped);
      if (window.Accessibility) window.Accessibility.playSound('click');
    }
  }

  function nextFlashcard() {
    const deck = getActiveDeck();
    currentCardIndex = (currentCardIndex + 1) % deck.length;
    renderFlashcard();
  }

  function prevFlashcard() {
    const deck = getActiveDeck();
    currentCardIndex = (currentCardIndex - 1 + deck.length) % deck.length;
    renderFlashcard();
  }

  function markCardKnown() {
    progress.flashcardsReviewed++;
    progress.starsEarned += 2;
    saveProgress();
    renderProgressUI();
    if (window.App && window.App.addGardenPoints) {
      window.App.addGardenPoints(5, 'Flashcard Mastered!');
    }
    nextFlashcard();
  }

  function setFlashcardCategory(category) {
    currentCategory = category;
    currentCardIndex = 0;
    document.querySelectorAll('.flashcard-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === category);
    });
    renderFlashcard();
  }

  function addCustomFlashcard(q, a) {
    if (!q || !q.trim() || !a || !a.trim()) return;
    customCards.push({ id: Date.now(), q: q.trim(), a: a.trim(), hint: 'Custom card' });
    saveCustomCards();
    setFlashcardCategory('custom');
    currentCardIndex = customCards.length - 1;
    renderFlashcard();
    if (window.App && window.App.showToast) window.App.showToast('Custom flashcard added!');
  }

  function deleteCurrentCustomFlashcard() {
    if (currentCategory !== 'custom' || !customCards.length) return;
    if (!window.confirm('Delete this custom flashcard?')) return;
    customCards.splice(currentCardIndex, 1);
    saveCustomCards();
    currentCardIndex = 0;
    renderFlashcard();
    if (window.App && window.App.showToast) window.App.showToast('Custom flashcard removed.');
  }

  // --- EDUCATIONAL QUIZ WITH DIFFICULTY ---
  function setQuizDifficulty(diff) {
    quizDifficulty = diff;
    document.querySelectorAll('.quiz-diff-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-diff') === diff);
    });
    setupQuiz();
  }

  function setupQuiz() {
    currentQuizStep = 0;
    quizScore = 0;
    hasAnsweredCurrent = false;
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const qContainer = document.getElementById('quiz-question-container');
    const progressText = document.getElementById('quiz-progress-text');
    if (!qContainer) return;

    const questions = quizBank[quizDifficulty] || quizBank.easy;
    if (currentQuizStep >= questions.length) {
      renderQuizResults(questions.length);
      return;
    }

    const currentQ = questions[currentQuizStep];
    hasAnsweredCurrent = false;

    if (progressText) {
      progressText.textContent = `${quizDifficulty.toUpperCase()} • Q${currentQuizStep + 1}/${questions.length}`;
    }

    qContainer.innerHTML = `
      <div>
        <h4 style="font-size: 17px; margin-bottom: 14px;">${escapeHtml(currentQ.q)}</h4>
        <div class="quiz-option-list">
          ${currentQ.options.map((opt, idx) => `
            <button type="button" class="quiz-option-btn" data-idx="${idx}" onclick="Learning.handleQuizAnswer(${idx})">
              <span><strong>${String.fromCharCode(65 + idx)}.</strong> ${escapeHtml(opt)}</span>
              <span class="quiz-feedback-icon" id="opt-icon-${idx}"></span>
            </button>
          `).join('')}
        </div>
        <div id="quiz-explanation-box" style="display: none; padding: 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); border-left: 4px solid var(--accent-blue); margin-top: 12px; font-size: 13.5px;"></div>
      </div>
    `;
  }

  function handleQuizAnswer(selectedIdx) {
    if (hasAnsweredCurrent) return;
    hasAnsweredCurrent = true;

    const questions = quizBank[quizDifficulty] || quizBank.easy;
    const currentQ = questions[currentQuizStep];
    const isCorrect = selectedIdx === currentQ.correct;

    document.querySelectorAll('.quiz-option-btn').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === currentQ.correct) {
        btn.classList.add('correct');
        const icon = document.getElementById(`opt-icon-${idx}`);
        if (icon) icon.textContent = '✓ Correct';
      } else if (idx === selectedIdx) {
        btn.classList.add('incorrect');
        const icon = document.getElementById(`opt-icon-${idx}`);
        if (icon) icon.textContent = '✕';
      }
    });

    if (isCorrect) {
      quizScore++;
      if (window.Accessibility) window.Accessibility.playSound('chime');
    }

    const expBox = document.getElementById('quiz-explanation-box');
    if (expBox) {
      expBox.style.display = 'block';
      expBox.innerHTML = `<strong>${isCorrect ? '🌟 Well done!' : '💡 Helpful insight:'}</strong> ${escapeHtml(currentQ.explanation)}`;
    }

    const container = document.getElementById('quiz-question-container');
    const nextBtn = document.createElement('div');
    nextBtn.style.marginTop = '14px';
    nextBtn.style.textAlign = 'right';
    nextBtn.innerHTML = `
      <button type="button" class="btn btn-primary" onclick="Learning.nextQuizQuestion()">
        ${currentQuizStep === questions.length - 1 ? 'See Results 🎉' : 'Next Question →'}
      </button>
    `;
    container.appendChild(nextBtn);
  }

  function nextQuizQuestion() {
    currentQuizStep++;
    renderQuizQuestion();
  }

  function renderQuizResults(totalLen) {
    const qContainer = document.getElementById('quiz-question-container');
    if (!qContainer) return;

    progress.quizzesCompleted++;
    progress.starsEarned += quizScore * 3;
    saveProgress();
    renderProgressUI();

    if (window.App && window.App.addGardenPoints) {
      window.App.addGardenPoints(quizScore * 10, 'Quiz Completed!');
    }

    qContainer.innerHTML = `
      <div style="text-align: center; padding: 24px 12px;">
        <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
        <h3 style="font-size: 22px; margin-bottom: 8px;">Quiz Completed!</h3>
        <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 16px;">
          Level: <strong>${quizDifficulty.toUpperCase()}</strong> • Score: <strong>${quizScore} / ${totalLen}</strong>
        </p>
        <button type="button" class="btn btn-primary" onclick="Learning.setupQuiz()">Try Again</button>
      </div>
    `;
  }

  // --- MEMORY MATCH GAME WITH DIFFICULTY ---
  function setMemoryDifficulty(diff) {
    memoryDifficulty = diff;
    totalPairs = diff === 'easy' ? 4 : (diff === 'hard' ? 8 : 6);
    setupMemoryGame();
  }

  function setupMemoryGame() {
    const grid = document.getElementById('memory-game-grid');
    const movesEl = document.getElementById('memory-moves-counter');
    if (!grid) return;

    memoryMoves = 0;
    matchedPairs = 0;
    flippedCards = [];
    memoryLock = false;
    if (movesEl) movesEl.textContent = '0';

    const chosen = allMemoryIcons.slice(0, totalPairs);
    memoryDeck = [...chosen, ...chosen]
      .sort(() => Math.random() - 0.5)
      .map((icon, id) => ({ id, icon, matched: false }));

    grid.innerHTML = memoryDeck.map(card => `
      <div class="memory-tile hidden-tile" id="mem-card-${card.id}" onclick="Learning.flipMemoryTile(${card.id})" role="button" tabindex="0" aria-label="Memory tile">
        <span>${card.icon}</span>
      </div>
    `).join('');
  }

  function flipMemoryTile(id) {
    if (memoryLock) return;
    const cardEl = document.getElementById(`mem-card-${id}`);
    const card = memoryDeck[id];
    if (!cardEl || !card || card.matched || flippedCards.includes(id)) return;

    cardEl.classList.remove('hidden-tile');
    flippedCards.push(id);

    if (flippedCards.length === 2) {
      memoryMoves++;
      const movesEl = document.getElementById('memory-moves-counter');
      if (movesEl) movesEl.textContent = memoryMoves;

      const [firstId, secondId] = flippedCards;
      if (memoryDeck[firstId].icon === memoryDeck[secondId].icon) {
        memoryDeck[firstId].matched = true;
        memoryDeck[secondId].matched = true;
        document.getElementById(`mem-card-${firstId}`).classList.add('matched');
        document.getElementById(`mem-card-${secondId}`).classList.add('matched');
        matchedPairs++;
        flippedCards = [];
        if (window.Accessibility) window.Accessibility.playSound('chime');

        if (matchedPairs === totalPairs) {
          if (!progress.memoryBestMoves || memoryMoves < progress.memoryBestMoves) {
            progress.memoryBestMoves = memoryMoves;
          }
          progress.starsEarned += 5;
          saveProgress();
          renderProgressUI();
          setTimeout(() => {
            if (window.App && window.App.showToast) {
              window.App.showToast(`🎉 Memory Match Won in ${memoryMoves} moves!`);
            }
            if (window.App && window.App.addGardenPoints) {
              window.App.addGardenPoints(20, 'Memory Match Win!');
            }
          }, 250);
        }
      } else {
        memoryLock = true;
        setTimeout(() => {
          const el1 = document.getElementById(`mem-card-${firstId}`);
          const el2 = document.getElementById(`mem-card-${secondId}`);
          if (el1) el1.classList.add('hidden-tile');
          if (el2) el2.classList.add('hidden-tile');
          flippedCards = [];
          memoryLock = false;
        }, 800);
      }
    }
  }

  // --- INTERACTIVE VISUAL MATHEMATICS EXERCISE ---
  function setMathDifficulty(diff) {
    mathDifficulty = diff;
    generateMathProblem();
  }

  function generateMathProblem() {
    let a, b, op, answer;
    if (mathDifficulty === 'easy') {
      a = Math.floor(Math.random() * 7) + 1;
      b = Math.floor(Math.random() * 7) + 1;
      op = '+';
      answer = a + b;
    } else if (mathDifficulty === 'medium') {
      a = Math.floor(Math.random() * 12) + 5;
      b = Math.floor(Math.random() * a) + 1;
      op = '-';
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 6) + 2;
      b = Math.floor(Math.random() * 6) + 2;
      op = '×';
      answer = a * b;
    }
    currentMathProblem = { a, b, op, answer };
    renderMathProblem();
  }

  function renderMathProblem() {
    const promptEl = document.getElementById('math-problem-prompt');
    const dotsEl = document.getElementById('math-dots-container');
    const feedbackEl = document.getElementById('math-feedback-msg');
    const answerInput = document.getElementById('math-answer-input');

    if (answerInput) answerInput.value = '';
    if (feedbackEl) feedbackEl.textContent = '';

    const { a, b, op } = currentMathProblem;
    if (promptEl) promptEl.textContent = `${a} ${op} ${b} = ?`;

    if (dotsEl) {
      const renderDots = (count, color) => Array.from({ length: Math.min(count, 16) }).map(() =>
        `<span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:${color}; margin:2px;"></span>`
      ).join('');

      if (op === '+') {
        dotsEl.innerHTML = `<div>${renderDots(a, 'var(--accent-blue)')} <strong>+</strong> ${renderDots(b, 'var(--accent-mint)')}</div>`;
      } else if (op === '-') {
        dotsEl.innerHTML = `<div>${renderDots(a, 'var(--accent-blue)')} <small style="display:block; color:var(--text-muted);">(Take away ${b} dots)</small></div>`;
      } else {
        dotsEl.innerHTML = `<div>${Array.from({ length: a }).map(() => `<div style="margin:2px 0;">${renderDots(b, 'var(--accent-lavender)')}</div>`).join('')}</div>`;
      }
    }
  }

  function checkMathAnswer() {
    const input = document.getElementById('math-answer-input');
    const feedbackEl = document.getElementById('math-feedback-msg');
    if (!input || !feedbackEl) return;

    const val = parseInt(input.value, 10);
    if (Number.isNaN(val)) {
      feedbackEl.style.color = 'var(--accent-rose)';
      feedbackEl.textContent = 'Please type a number first.';
      return;
    }

    if (val === currentMathProblem.answer) {
      progress.mathSolved++;
      progress.starsEarned += 2;
      saveProgress();
      renderProgressUI();
      feedbackEl.style.color = 'var(--accent-mint)';
      feedbackEl.textContent = `🎉 Correct! ${currentMathProblem.a} ${currentMathProblem.op} ${currentMathProblem.b} = ${currentMathProblem.answer}`;
      if (window.Accessibility) window.Accessibility.playSound('chime');
      if (window.App && window.App.addGardenPoints) window.App.addGardenPoints(8, 'Math Exercise Solved!');
      setTimeout(generateMathProblem, 1300);
    } else {
      feedbackEl.style.color = 'var(--accent-rose)';
      feedbackEl.textContent = 'Count the colored dots gently and try again!';
    }
  }

  // --- INTERACTIVE READING EXERCISE ---
  function renderReadingExercise() {
    const container = document.getElementById('learning-reading-ex-container');
    if (!container) return;
    const item = readingQuestions[readingExIdx];

    container.innerHTML = `
      <p style="font-size: 16px; padding: 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); margin-bottom: 12px;">
        "${escapeHtml(item.sentence)}"
      </p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        ${item.options.map(opt => `
          <button type="button" class="btn btn-sm btn-secondary" onclick="Learning.checkReadingChoice('${escapeHtml(opt)}')">${escapeHtml(opt)}</button>
        `).join('')}
      </div>
      <div id="learning-reading-feedback" style="margin-top: 10px; font-size: 13.5px; font-weight: 600;"></div>
    `;
  }

  function checkReadingChoice(choice) {
    const item = readingQuestions[readingExIdx];
    const fb = document.getElementById('learning-reading-feedback');
    if (!fb) return;

    if (choice === item.blank) {
      progress.readingWins++;
      progress.starsEarned += 2;
      saveProgress();
      renderProgressUI();
      fb.style.color = 'var(--accent-mint)';
      fb.textContent = '✓ Great match! Loading next sentence...';
      if (window.Accessibility) window.Accessibility.playSound('chime');
      if (window.App && window.App.addGardenPoints) window.App.addGardenPoints(5, 'Reading Practice!');
      setTimeout(() => {
        readingExIdx = (readingExIdx + 1) % readingQuestions.length;
        renderReadingExercise();
      }, 1100);
    } else {
      fb.style.color = 'var(--accent-rose)';
      fb.textContent = 'Read the sentence out loud and try another word!';
    }
  }

  // --- ATTENTION & CONCENTRATION GAME ("FIND THE TARGET") ---
  function setupAttentionRound() {
    const grid = document.getElementById('learning-attention-grid');
    const targetDisplay = document.getElementById('attention-target-symbol');
    const scoreDisplay = document.getElementById('attention-score-display');
    if (!grid) return;

    const pairs = [
      { target: '⭐', decoy: '🌟' },
      { target: '🟢', decoy: '🔵' },
      { target: '🍀', decoy: '🌿' },
      { target: '🦋', decoy: '🐝' },
      { target: '🌙', decoy: '☀️' }
    ];
    const chosen = pairs[Math.floor(Math.random() * pairs.length)];
    attentionTarget = chosen.target;

    if (targetDisplay) targetDisplay.textContent = attentionTarget;
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${attentionScore}`;

    const totalCells = 15;
    const targetPos = Math.floor(Math.random() * totalCells);

    grid.innerHTML = Array.from({ length: totalCells }).map((_, idx) => {
      const sym = idx === targetPos ? chosen.target : chosen.decoy;
      return `<button type="button" class="attention-cell" onclick="Learning.clickAttentionCell(${idx === targetPos})" aria-label="Symbol tile">${sym}</button>`;
    }).join('');
  }

  function clickAttentionCell(isTarget) {
    const fb = document.getElementById('attention-feedback');
    if (isTarget) {
      attentionScore++;
      attentionRounds++;
      progress.attentionWins++;
      progress.starsEarned += 1;
      saveProgress();
      renderProgressUI();
      if (fb) {
        fb.style.color = 'var(--accent-mint)';
        fb.textContent = '✓ Sharp eyes! Next pattern...';
      }
      if (window.Accessibility) window.Accessibility.playSound('chime');
      if (attentionRounds % 3 === 0 && window.App && window.App.addGardenPoints) {
        window.App.addGardenPoints(10, '3 Attention Rounds Won!');
      }
      setTimeout(setupAttentionRound, 450);
    } else {
      if (fb) {
        fb.style.color = 'var(--accent-rose)';
        fb.textContent = 'Close! Look carefully for the exact target symbol.';
      }
    }
  }

  // --- AUDIO LEARNING LESSONS ---
  function playAudioLesson(lessonKey) {
    const lessons = {
      executive: {
        title: 'Executive Function 101',
        text: 'Executive function is like the air traffic controller of your brain. It helps prioritize tasks, pause impulses, and shift attention. Using visual checklists and external timers gives your air traffic controller clear runways!'
      },
      sensory: {
        title: 'Sensory Regulation Tips',
        text: 'Sensory regulation means noticing when bright lights, loud rooms, or tight clothing drain your mental battery. Taking a five-minute low-stimulation break restores calm before overwhelm sets in.'
      }
    };

    const lesson = lessons[lessonKey] || lessons.executive;
    const transcriptEl = document.getElementById('audio-lesson-transcript');
    if (transcriptEl) {
      transcriptEl.innerHTML = `<strong>🎧 ${escapeHtml(lesson.title)}:</strong> ${escapeHtml(lesson.text)}`;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(lesson.text);
      u.rate = 0.95;
      u.onend = () => {
        if (window.App && window.App.addGardenPoints) window.App.addGardenPoints(10, 'Audio Lesson Completed!');
      };
      window.speechSynthesis.speak(u);
      if (window.App && window.App.showToast) window.App.showToast(`Playing: ${lesson.title}`);
    }
  }

  function stopAudioLesson() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function renderProgressUI() {
    const summaryEl = document.getElementById('learning-progress-summary');
    if (summaryEl) {
      summaryEl.textContent = `Stars: ${progress.starsEarned} ★ • Quizzes: ${progress.quizzesCompleted} • Math Solved: ${progress.mathSolved} • Flashcards: ${progress.flashcardsReviewed}`;
    }
  }

  function bindEvents() {
    const flipBtn = document.getElementById('btn-flashcard-flip');
    if (flipBtn) flipBtn.addEventListener('click', flipFlashcard);

    const nextBtn = document.getElementById('btn-flashcard-next');
    if (nextBtn) nextBtn.addEventListener('click', nextFlashcard);

    const prevBtn = document.getElementById('btn-flashcard-prev');
    if (prevBtn) prevBtn.addEventListener('click', prevFlashcard);

    const knowBtn = document.getElementById('btn-flashcard-know');
    if (knowBtn) knowBtn.addEventListener('click', markCardKnown);

    const deleteCustomBtn = document.getElementById('btn-delete-custom-flashcard');
    if (deleteCustomBtn) deleteCustomBtn.addEventListener('click', deleteCurrentCustomFlashcard);

    const cardEl = document.getElementById('interactive-flashcard');
    if (cardEl) cardEl.addEventListener('click', flipFlashcard);

    const customCardForm = document.getElementById('learning-custom-card-form');
    if (customCardForm) {
      customCardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = document.getElementById('custom-card-q');
        const a = document.getElementById('custom-card-a');
        if (q && a && q.value.trim() && a.value.trim()) {
          addCustomFlashcard(q.value, a.value);
          q.value = '';
          a.value = '';
        }
      });
    }

    document.querySelectorAll('.learning-style-pill').forEach(pill => {
      pill.addEventListener('click', (e) => setLearningStyle(e.currentTarget.getAttribute('data-style')));
    });

    const memReset = document.getElementById('btn-reset-memory-game');
    if (memReset) memReset.addEventListener('click', setupMemoryGame);

    const memDiffSelect = document.getElementById('memory-difficulty-select');
    if (memDiffSelect) memDiffSelect.addEventListener('change', (e) => setMemoryDifficulty(e.target.value));

    const mathDiffSelect = document.getElementById('math-difficulty-select');
    if (mathDiffSelect) mathDiffSelect.addEventListener('change', (e) => setMathDifficulty(e.target.value));

    const mathCheckBtn = document.getElementById('btn-math-check');
    if (mathCheckBtn) mathCheckBtn.addEventListener('click', checkMathAnswer);

    const mathInput = document.getElementById('math-answer-input');
    if (mathInput) {
      mathInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); checkMathAnswer(); }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    init,
    flipFlashcard,
    nextFlashcard,
    prevFlashcard,
    markCardKnown,
    setFlashcardCategory,
    setLearningStyle,
    setQuizDifficulty,
    handleQuizAnswer,
    nextQuizQuestion,
    setupQuiz,
    flipMemoryTile,
    setupMemoryGame,
    checkMathAnswer,
    generateMathProblem,
    checkReadingChoice,
    clickAttentionCell,
    playAudioLesson,
    stopAudioLesson,
    getProgress: () => ({ ...progress })
  };
})();
