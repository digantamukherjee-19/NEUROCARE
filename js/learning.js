/**
 * NeuroCare - Learning Centre Module
 * Features: Interactive 3D Flashcards, Educational Quizzes with immediate feedback,
 * Memory Matching Game, Visual Math builder, Attention Game, and Audio Lessons.
 */

const Learning = (function () {
  'use strict';

  const STORAGE_KEY_PROGRESS = 'neurocare_learning_progress';

  let progress = {
    flashcardsReviewed: 0,
    quizzesCompleted: 0,
    starsEarned: 0,
    memoryBestMoves: null,
    preferredStyle: 'visual' // 'visual', 'audio', 'reading', 'interactive'
  };

  // --- FLASHCARDS DATA ---
  const flashcardDecks = {
    science: [
      { q: 'What is Photosynthesis?', a: 'The process where plants use sunlight, water, and carbon dioxide to create oxygen and energy (sugar).', hint: 'Think of plants cooking with sunlight ☀️' },
      { q: 'What are the 3 States of Matter?', a: 'Solid (fixed shape), Liquid (flows), and Gas (fills any space).', hint: 'Ice 🧊, Water 💧, Steam 💨' },
      { q: 'Why do we have seasons?', a: 'Because the Earth is tilted on its axis as it orbits around the Sun.', hint: 'Tilt of the planet 🌍' }
    ],
    social: [
      { q: 'When a friend looks away and sighs, what might that mean?', a: 'They might be feeling tired, overwhelmed, or need a moment of quiet space.', hint: 'Body language cue' },
      { q: 'What can you say if someone talks too loudly?', a: '"My ears are a bit sensitive right now, could we speak a little softer please?"', hint: 'Polite self-advocacy' },
      { q: 'How can you show you are listening?', a: 'Nodding gently, summarizing what they said, or saying "I understand".', hint: 'Active listening' }
    ],
    skills: [
      { q: 'What is the 2-Minute Rule?', a: 'If a task takes less than 2 minutes to complete, do it immediately rather than writing it down.', hint: 'Quick productivity hack' },
      { q: 'What is Sensory Grounding (5-4-3-2-1)?', a: 'Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.', hint: 'Calming technique for overwhelm' },
      { q: 'What is a Brain Dump?', a: 'Writing every thought or task on paper without organizing them to clear mental clutter.', hint: 'De-stressing the mind' }
    ]
  };

  let currentCategory = 'science';
  let currentCardIndex = 0;
  let isCardFlipped = false;

  // --- QUIZ DATA ---
  const quizQuestions = [
    {
      q: 'Which cognitive strategy helps someone with ADHD initiate a big, overwhelming task?',
      options: [
        'Waiting until 100% motivation strikes',
        'Breaking the task into tiny 5-minute micro-steps',
        'Trying to finish everything in one marathon session',
        'Ignoring deadlines entirely'
      ],
      correct: 1,
      explanation: 'Chunking tasks into bite-sized micro-steps lowers the activation energy required by the ADHD brain to overcome task paralysis.'
    },
    {
      q: 'What is a helpful reading accommodation for a student with dyslexia?',
      options: [
        'Using high-contrast pure black and white with tight line spacing',
        'Reading under flickering fluorescent lights',
        'Using a colored reading overlay or ruler with increased line spacing',
        'Forcing rapid aloud reading in front of peers'
      ],
      correct: 2,
      explanation: 'Colored overlays, line guides, and generous line spacing reduce visual crowding and eye fatigue for dyslexic readers.'
    },
    {
      q: 'Why are visual schedules helpful for autistic and neurodivergent individuals?',
      options: [
        'They eliminate predictability',
        'They reduce anxiety by providing clear, concrete expectations of what comes next',
        'They replace the need for breaks',
        'They are only used during examinations'
      ],
      correct: 1,
      explanation: 'Visual schedules make abstract time concrete and provide reassurance against unexpected transitions.'
    },
    {
      q: 'What does the term "Neurodiversity" emphasize?',
      options: [
        'That brain differences are natural biological variations, not defects to be erased',
        'That everyone must learn in the exact same way',
        'That attention spans cannot be adapted',
        'That technology is unhelpful'
      ],
      correct: 0,
      explanation: 'Neurodiversity advocates that variations in brain function (like ADHD, autism, dyslexia) are natural parts of the human genome that enrich society.'
    }
  ];

  let currentQuizStep = 0;
  let quizScore = 0;
  let hasAnsweredCurrent = false;

  // --- MEMORY MATCHING GAME ---
  const memoryIcons = ['🌟', '🎨', '🚀', '🌱', '💡', '🎵'];
  let memoryDeck = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let memoryMoves = 0;
  let memoryLock = false;

  function init() {
    loadProgress();
    setupFlashcards();
    setupQuiz();
    setupMemoryGame();
    setupMathVisualizer();
    bindEvents();
    renderProgressUI();
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

  // --- MY LEARNING STYLE SELECTOR ---
  function setLearningStyle(style) {
    progress.preferredStyle = style;
    saveProgress();
    document.querySelectorAll('.learning-style-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-style') === style);
    });

    // Provide tailored recommendation message
    const adviceBox = document.getElementById('learning-style-advice');
    if (adviceBox) {
      const adviceMap = {
        visual: '💡 <strong>Visual Learner:</strong> We recommend our interactive flashcards with diagrams, color coding, and visual math block counters!',
        audio: '🎧 <strong>Audio Learner:</strong> We recommend using the "Read It for Me" voice reader, sound chimes, and our mini Audio Lessons!',
        reading: '📖 <strong>Reading/Writing Learner:</strong> Adjust font spacing and background tints in the Dyslexia reading workspace for distraction-free reading!',
        interactive: '🧩 <strong>Interactive / Kinesthetic Learner:</strong> Dive into the Memory Match game, Quiz challenges, and hands-on Math counters!'
      };
      adviceBox.innerHTML = adviceMap[style] || adviceMap.visual;
    }
  }

  // --- FLASHCARDS SYSTEM ---
  function setupFlashcards() {
    renderFlashcard();
  }

  function renderFlashcard() {
    const cardEl = document.getElementById('interactive-flashcard');
    const qEl = document.getElementById('flashcard-question');
    const aEl = document.getElementById('flashcard-answer');
    const hintEl = document.getElementById('flashcard-hint');
    const countEl = document.getElementById('flashcard-counter');

    if (!cardEl || !qEl || !aEl) return;

    cardEl.classList.remove('flipped');
    isCardFlipped = false;

    const deck = flashcardDecks[currentCategory] || flashcardDecks.science;
    const card = deck[currentCardIndex];

    qEl.textContent = card.q;
    aEl.textContent = card.a;
    if (hintEl) hintEl.textContent = card.hint;
    if (countEl) countEl.textContent = `Card ${currentCardIndex + 1} of ${deck.length}`;
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
    const deck = flashcardDecks[currentCategory];
    currentCardIndex = (currentCardIndex + 1) % deck.length;
    renderFlashcard();
  }

  function prevFlashcard() {
    const deck = flashcardDecks[currentCategory];
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

  // --- EDUCATIONAL QUIZ SYSTEM ---
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

    if (currentQuizStep >= quizQuestions.length) {
      renderQuizResults();
      return;
    }

    const currentQ = quizQuestions[currentQuizStep];
    hasAnsweredCurrent = false;

    if (progressText) {
      progressText.textContent = `Question ${currentQuizStep + 1} of ${quizQuestions.length}`;
    }

    qContainer.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 18px; margin-bottom: 16px;">${escapeHtml(currentQ.q)}</h4>
        <div class="quiz-option-list">
          ${currentQ.options.map((opt, idx) => `
            <button class="quiz-option-btn" data-idx="${idx}" onclick="Learning.handleQuizAnswer(${idx})">
              <span><strong>${String.fromCharCode(65 + idx)}.</strong> ${escapeHtml(opt)}</span>
              <span class="quiz-feedback-icon" id="opt-icon-${idx}"></span>
            </button>
          `).join('')}
        </div>
        <div id="quiz-explanation-box" style="display: none; padding: 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); border-left: 4px solid var(--accent-blue); margin-top: 14px; font-size: 13.5px;"></div>
      </div>
    `;
  }

  function handleQuizAnswer(selectedIdx) {
    if (hasAnsweredCurrent) return;
    hasAnsweredCurrent = true;

    const currentQ = quizQuestions[currentQuizStep];
    const isCorrect = selectedIdx === currentQ.correct;

    const buttons = document.querySelectorAll('.quiz-option-btn');
    buttons.forEach((btn, idx) => {
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

    // Add Next Question button
    const container = document.getElementById('quiz-question-container');
    const nextBtn = document.createElement('div');
    nextBtn.style.marginTop = '18px';
    nextBtn.style.textAlign = 'right';
    nextBtn.innerHTML = `
      <button class="btn btn-primary" onclick="Learning.nextQuizQuestion()">
        ${currentQuizStep === quizQuestions.length - 1 ? 'See Results 🎉' : 'Next Question →'}
      </button>
    `;
    container.appendChild(nextBtn);
  }

  function nextQuizQuestion() {
    currentQuizStep++;
    renderQuizQuestion();
  }

  function renderQuizResults() {
    const qContainer = document.getElementById('quiz-question-container');
    if (!qContainer) return;

    progress.quizzesCompleted++;
    progress.starsEarned += quizScore * 3;
    saveProgress();
    renderProgressUI();

    if (window.App && window.App.addGardenPoints) {
      window.App.addGardenPoints(quizScore * 10, 'Quiz Finished!');
    }

    qContainer.innerHTML = `
      <div style="text-align: center; padding: 32px 16px;">
        <div style="font-size: 56px; margin-bottom: 12px;">🏆</div>
        <h3 style="font-size: 24px; margin-bottom: 8px;">Quiz Completed!</h3>
        <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 18px;">
          You scored <strong>${quizScore} / ${quizQuestions.length}</strong>! Every question helps deepen neuro-inclusive understanding.
        </p>
        <div style="display: flex; justify-content: center; gap: 12px;">
          <button class="btn btn-primary" onclick="Learning.setupQuiz()">Try Again</button>
        </div>
      </div>
    `;
  }

  // --- MEMORY MATCHING GAME ---
  function setupMemoryGame() {
    const grid = document.getElementById('memory-game-grid');
    const movesEl = document.getElementById('memory-moves-counter');
    if (!grid) return;

    memoryMoves = 0;
    matchedPairs = 0;
    flippedCards = [];
    memoryLock = false;
    if (movesEl) movesEl.textContent = '0';

    // Duplicate icons to form pairs and shuffle
    memoryDeck = [...memoryIcons, ...memoryIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, id) => ({ id, icon, matched: false }));

    grid.innerHTML = memoryDeck.map(card => `
      <div class="memory-tile hidden-tile" id="mem-card-${card.id}" onclick="Learning.flipMemoryTile(${card.id})" role="button" aria-label="Memory tile">
        <span>${card.icon}</span>
      </div>
    `).join('');
  }

  function flipMemoryTile(id) {
    if (memoryLock) return;
    const cardEl = document.getElementById(`mem-card-${id}`);
    const card = memoryDeck[id];

    if (!cardEl || card.matched || flippedCards.includes(id)) return;

    // Reveal
    cardEl.classList.remove('hidden-tile');
    flippedCards.push(id);

    if (flippedCards.length === 2) {
      memoryMoves++;
      const movesEl = document.getElementById('memory-moves-counter');
      if (movesEl) movesEl.textContent = memoryMoves;

      const [firstId, secondId] = flippedCards;
      if (memoryDeck[firstId].icon === memoryDeck[secondId].icon) {
        // Matched!
        memoryDeck[firstId].matched = true;
        memoryDeck[secondId].matched = true;
        document.getElementById(`mem-card-${firstId}`).classList.add('matched');
        document.getElementById(`mem-card-${secondId}`).classList.add('matched');
        matchedPairs++;
        flippedCards = [];

        if (window.Accessibility) window.Accessibility.playSound('chime');

        if (matchedPairs === memoryIcons.length) {
          setTimeout(() => {
            alert(`🎉 Congratulations! You matched all pairs in ${memoryMoves} moves!`);
            if (window.App && window.App.addGardenPoints) {
              window.App.addGardenPoints(20, 'Memory Match Win!');
            }
          }, 300);
        }
      } else {
        // Mismatch - hide again after delay
        memoryLock = true;
        setTimeout(() => {
          document.getElementById(`mem-card-${firstId}`).classList.add('hidden-tile');
          document.getElementById(`mem-card-${secondId}`).classList.add('hidden-tile');
          flippedCards = [];
          memoryLock = false;
        }, 900);
      }
    }
  }

  // --- VISUAL MATHEMATICS BUILDER ---
  let mathCounterVal = 4;
  function setupMathVisualizer() {
    renderMathDots();
  }

  function changeMathCounter(delta) {
    mathCounterVal = Math.max(1, Math.min(20, mathCounterVal + delta));
    renderMathDots();
  }

  function renderMathDots() {
    const container = document.getElementById('math-dots-container');
    const label = document.getElementById('math-number-label');
    if (!container || !label) return;

    label.textContent = `${mathCounterVal}`;
    container.innerHTML = Array.from({ length: mathCounterVal }).map((_, i) => `
      <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-mint), var(--accent-blue)); display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; margin: 4px; animation: fadeIn 0.3s ease;">
        ${i + 1}
      </div>
    `).join('');
  }

  // --- AUDIO LEARNING LESSON ---
  function playAudioLesson(lessonKey) {
    const lessons = {
      executive: "Executive function is like the airport air traffic controller of your brain. It manages incoming flights of thought, decides when to take off with an action, and tells other distractions to wait on the runway. With ADHD, the controller needs clear visual flight strips, timers, and gentle checklists to keep everything moving smoothly.",
      sensory: "Sensory regulation means knowing when your internal battery is being drained by fluorescent lights, chatter, or uncomfortable clothing. By taking a five-minute low stimulation retreat with soft breathing or headphones, you can restore your equilibrium before overload occurs."
    };

    const text = lessons[lessonKey] || lessons.executive;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
      if (window.App && window.App.showToast) {
        window.App.showToast('Playing audio lesson...');
      }
    }
  }

  function renderProgressUI() {
    const starsEl = document.getElementById('learning-stars-count');
    const quizzesEl = document.getElementById('learning-quizzes-count');
    if (starsEl) starsEl.textContent = `${progress.starsEarned} ★`;
    if (quizzesEl) quizzesEl.textContent = `${progress.quizzesCompleted}`;
  }

  function bindEvents() {
    // Flashcard buttons
    const flipBtn = document.getElementById('btn-flashcard-flip');
    if (flipBtn) flipBtn.addEventListener('click', flipFlashcard);

    const nextBtn = document.getElementById('btn-flashcard-next');
    if (nextBtn) nextBtn.addEventListener('click', nextFlashcard);

    const prevBtn = document.getElementById('btn-flashcard-prev');
    if (prevBtn) prevBtn.addEventListener('click', prevFlashcard);

    const knowBtn = document.getElementById('btn-flashcard-know');
    if (knowBtn) knowBtn.addEventListener('click', markCardKnown);

    const cardEl = document.getElementById('interactive-flashcard');
    if (cardEl) cardEl.addEventListener('click', flipFlashcard);

    // Learning style pills
    document.querySelectorAll('.learning-style-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        setLearningStyle(e.currentTarget.getAttribute('data-style'));
      });
    });

    // Memory reset
    const memReset = document.getElementById('btn-reset-memory-game');
    if (memReset) memReset.addEventListener('click', setupMemoryGame);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init,
    flipFlashcard,
    nextFlashcard,
    prevFlashcard,
    markCardKnown,
    setFlashcardCategory,
    setLearningStyle,
    handleQuizAnswer,
    nextQuizQuestion,
    setupQuiz,
    flipMemoryTile,
    setupMemoryGame,
    changeMathCounter,
    playAudioLesson
  };
})();
