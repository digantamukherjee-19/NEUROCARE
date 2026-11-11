/**
 * NeuroCare - Dyslexia Support Module
 * Features:
 * - Font family, size, line spacing, letter spacing, and word spacing customization
 * - Background & text color customization
 * - Web Speech API Text-to-Speech (Play, Pause, Resume, Stop, Rate, Voice, Word highlight)
 * - Text Highlighting tool (Yellow, Mint, Pink) & Clear highlights
 * - Reading-Friendly Distraction-Free Mode
 * - Rule-based Text Simplification (Demo) with Revert
 * - RSVP Speed Reader + Interactive Reading Practice Exercise
 * - Customizable Vocabulary Builder
 */

var Dyslexia = window.Dyslexia = (function () {
  'use strict';

  const STORAGE_KEY_PREFS = 'neurocare_dyslexia_prefs';
  const STORAGE_KEY_VOCAB = 'neurocare_dyslexia_custom_vocab';

  const sampleTexts = {
    nature: `Nature has a gentle rhythm that helps our minds rest. When we spend time near green trees and flowing streams, our senses relax. Studies show that spending just twenty minutes in a quiet natural space lowers heart rates and improves concentration. For neurodivergent minds, the natural world offers soft, harmonious patterns without the harsh noise of fluorescent lights or busy screens.`,
    space: `The Solar System is our cosmic neighborhood. At its warm center lies the Sun, a radiant star whose gravity holds eight planets in orbit. From rocky inner worlds like Mercury, Venus, Earth, and Mars to the vast gas giants Jupiter and Saturn, every planet moves in an elliptical dance through space. Exploring the stars reminds us of the endless possibilities of discovery.`,
    creativity: `Neurodiversity means every brain experiences the world in a distinct and valuable way. Many inventors, artists, scientists, and storytellers have dyslexia or ADHD. Thinking outside conventional boxes leads to ingenious breakthroughs in architecture, programming, and literature. When tools accommodate our processing styles, our true talents flourish.`
  };

  const defaultVocabulary = [
    { id: 1, word: 'Neurodiversity', phonetics: '/ˌnjʊə.rəʊ.daɪˈvɜː.sə.ti/', meaning: 'The natural diversity of human brains and minds, recognizing variations like ADHD or dyslexia as normal human differences.', custom: false },
    { id: 2, word: 'Executive Function', phonetics: '/ɪɡˈzek.jə.tɪv ˈfʌŋk.ʃən/', meaning: 'Mental skills that help us plan, organize, focus attention, remember instructions, and manage tasks.', custom: false },
    { id: 3, word: 'Sensory Overload', phonetics: '/ˈsen.sər.i ˈəʊ.və.ləʊd/', meaning: 'When one or more senses (sound, light, touch) receive more input than the brain can comfortably process.', custom: false },
    { id: 4, word: 'Phonological', phonetics: '/ˌfɒn.əˈlɒdʒ.ɪ.kəl/', meaning: 'Relating to the sounds of spoken language and how letters blend together into words.', custom: false },
    { id: 5, word: 'Accommodations', phonetics: '/əˌkɒm.əˈdeɪ.ʃənz/', meaning: 'Supportive tools or adjustments (such as audio readers or extra time) that provide equal access to learning.', custom: false }
  ];

  const simplificationMap = {
    'utilize': 'use',
    'facilitate': 'help',
    'consequently': 'so',
    'furthermore': 'also',
    'subsequently': 'then',
    'demonstrate': 'show',
    'endeavor': 'try',
    'necessitate': 'need',
    'approximate': 'rough',
    'commence': 'start',
    'terminate': 'end',
    'implement': 'use',
    'conventional': 'usual',
    'accommodate': 'support',
    'harmonious': 'peaceful',
    'concentration': 'focus',
    'neighborhood': 'area',
    'elliptical': 'oval',
    'breakthroughs': 'big discoveries',
    'fluorescent': 'bright indoor'
  };

  const readingPracticeExercises = [
    {
      passage: 'Maya placed her yellow reading ruler under the third line. Immediately, the crowded words felt calm and easy to follow.',
      question: 'What tool helped Maya track the words cleanly?',
      options: ['A bright flashlight', 'A yellow reading ruler', 'A loud metronome'],
      correct: 1
    },
    {
      passage: 'During evening wind-down, Sam switched the screen to a warm cream tint and listened at a gentle 0.9x voice speed.',
      question: 'Why did Sam use a warm cream tint?',
      options: ['To make the screen harder to read', 'To reduce harsh white glare and reading fatigue', 'To turn off audio'],
      correct: 1
    },
    {
      passage: 'Breaking a 30-page chapter into three short reading blocks kept Leo energized and confident.',
      question: 'How did Leo manage a long chapter?',
      options: ['Read all 30 pages at once without resting', 'Divided it into three shorter blocks', 'Skipped the chapter completely'],
      correct: 1
    }
  ];

  let preferences = {
    fontSize: 20,
    lineHeight: 1.8,
    letterSpacing: 0.04,
    wordSpacing: 0.08,
    bgColor: '#ffffff',
    textColor: '#1e293b',
    fontFamily: "'OpenDyslexic', 'Lexend', 'Comic Sans MS', Verdana, sans-serif",
    bionicReading: false,
    speechRate: 1.0,
    speechVoiceName: ''
  };

  let customVocabulary = [];
  let originalTextBackup = '';
  let practiceIndex = 0;

  // TTS State
  const synth = window.speechSynthesis;
  let currentUtterance = null;
  let isSpeaking = false;
  let isPaused = false;
  let activeWords = [];

  // RSVP Reader State
  let rsvpInterval = null;
  let rsvpWords = [];
  let rsvpIndex = 0;
  let rsvpWpm = 180;
  let isRsvpRunning = false;

  function init() {
    loadPreferences();
    loadCustomVocabulary();
    setupCanvas();
    populateVoices();
    renderVocabulary();
    renderReadingPractice();
    bindEvents();
  }

  function loadPreferences() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) preferences = { ...preferences, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Could not read dyslexia prefs', e);
    }
  }

  function savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Could not save dyslexia prefs', e);
    }
  }

  function loadCustomVocabulary() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOCAB);
      customVocabulary = saved ? JSON.parse(saved) : [];
    } catch (e) {
      customVocabulary = [];
    }
  }

  function saveCustomVocabulary() {
    try {
      localStorage.setItem(STORAGE_KEY_VOCAB, JSON.stringify(customVocabulary));
    } catch (e) {
      console.warn('Could not save custom vocab', e);
    }
  }

  function setupCanvas() {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;
    if (!editor.innerText.trim()) {
      editor.innerText = sampleTexts.nature;
    }
    originalTextBackup = editor.innerText;
    applyCanvasStyles();
  }

  function applyCanvasStyles() {
    const canvas = document.getElementById('dyslexia-reader-canvas');
    const editor = document.getElementById('dyslexia-reader-editor');
    if (!canvas || !editor) return;

    canvas.style.backgroundColor = preferences.bgColor;
    canvas.style.color = preferences.textColor;
    editor.style.fontSize = `${preferences.fontSize}px`;
    editor.style.lineHeight = preferences.lineHeight;
    editor.style.letterSpacing = `${preferences.letterSpacing}em`;
    editor.style.wordSpacing = `${preferences.wordSpacing}em`;
    editor.style.fontFamily = preferences.fontFamily;
    editor.style.color = preferences.textColor;

    const sizeSlider = document.getElementById('dyslexia-font-size-slider');
    const sizeLabel = document.getElementById('dyslexia-font-size-val');
    if (sizeSlider) sizeSlider.value = preferences.fontSize;
    if (sizeLabel) sizeLabel.textContent = `${preferences.fontSize}px`;

    const lineSlider = document.getElementById('dyslexia-line-spacing-slider');
    const lineLabel = document.getElementById('dyslexia-line-spacing-val');
    if (lineSlider) lineSlider.value = preferences.lineHeight;
    if (lineLabel) lineLabel.textContent = `${preferences.lineHeight}`;

    const letterSlider = document.getElementById('dyslexia-letter-spacing-slider');
    const letterLabel = document.getElementById('dyslexia-letter-spacing-val');
    if (letterSlider) letterSlider.value = Math.round(preferences.letterSpacing * 100);
    if (letterLabel) letterLabel.textContent = `${preferences.letterSpacing}em`;

    const wordSlider = document.getElementById('dyslexia-word-spacing-slider');
    const wordLabel = document.getElementById('dyslexia-word-spacing-val');
    if (wordSlider) wordSlider.value = Math.round(preferences.wordSpacing * 100);
    if (wordLabel) wordLabel.textContent = `${preferences.wordSpacing}em`;

    const fontSelect = document.getElementById('dyslexia-font-select');
    if (fontSelect) fontSelect.value = preferences.fontFamily;

    const textColorInput = document.getElementById('dyslexia-text-color-picker');
    if (textColorInput) textColorInput.value = preferences.textColor;

    const rateSlider = document.getElementById('dyslexia-tts-rate');
    const rateLabel = document.getElementById('dyslexia-tts-rate-val');
    if (rateSlider) rateSlider.value = preferences.speechRate;
    if (rateLabel) rateLabel.textContent = `${preferences.speechRate}x`;
  }

  function setBackgroundTint(bgHex, textHex) {
    preferences.bgColor = bgHex;
    if (textHex) preferences.textColor = textHex;
    savePreferences();
    applyCanvasStyles();

    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-bg') === bgHex);
    });
  }

  function toggleBionicReading() {
    preferences.bionicReading = !preferences.bionicReading;
    savePreferences();
    const btn = document.getElementById('btn-toggle-bionic');
    if (btn) btn.classList.toggle('active', preferences.bionicReading);

    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;

    const rawText = editor.innerText;
    if (preferences.bionicReading) {
      editor.innerHTML = formatToBionicHtml(rawText);
    } else {
      editor.innerText = rawText;
    }
  }

  function formatToBionicHtml(text) {
    const paragraphs = text.split('\n');
    return paragraphs.map(para => {
      const words = para.split(' ');
      return words.map(w => {
        if (!w.trim()) return w;
        const midPoint = Math.ceil(w.length * 0.45);
        return `<strong>${escapeHtml(w.slice(0, midPoint))}</strong>${escapeHtml(w.slice(midPoint))}`;
      }).join(' ');
    }).join('<br><br>');
  }

  // --- TEXT HIGHLIGHTING ---
  function highlightSelection(colorClass) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      if (window.App && window.App.showToast) {
        window.App.showToast('Select a word or sentence inside the reader first to highlight it.');
      }
      return;
    }

    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor || !editor.contains(selection.anchorNode)) {
      if (window.App && window.App.showToast) window.App.showToast('Please select text inside the reading canvas.');
      return;
    }

    const range = selection.getRangeAt(0);
    const mark = document.createElement('mark');
    mark.className = colorClass;
    try {
      range.surroundContents(mark);
      selection.removeAllRanges();
    } catch (e) {
      const text = range.toString();
      range.deleteContents();
      mark.textContent = text;
      range.insertNode(mark);
      selection.removeAllRanges();
    }
  }

  function clearAllHighlights() {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;
    editor.querySelectorAll('mark').forEach(m => {
      const text = document.createTextNode(m.textContent);
      m.parentNode.replaceChild(text, m);
    });
    if (window.App && window.App.showToast) window.App.showToast('Highlights cleared.');
  }

  // --- READING-FRIENDLY DISTRACTION-FREE MODE ---
  function toggleReadingFriendlyMode() {
    document.body.classList.toggle('reading-friendly-active');
    const isActive = document.body.classList.contains('reading-friendly-active');
    const btn = document.getElementById('btn-reading-friendly-mode');
    if (btn) {
      btn.classList.toggle('active', isActive);
      btn.textContent = isActive ? '✕ Exit Reading Mode' : '🧘 Reading-Friendly Mode';
    }
    if (window.App && window.App.showToast) {
      window.App.showToast(isActive ? 'Reading-Friendly Focus Mode active!' : 'Returned to full navigation.');
    }
  }

  // --- TEXT SIMPLIFIER (DEMO) ---
  function simplifyCurrentText() {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;

    originalTextBackup = editor.innerText;
    let text = editor.innerText;
    let replacementsMade = 0;

    for (const [complex, simple] of Object.entries(simplificationMap)) {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      if (regex.test(text)) {
        text = text.replace(regex, simple);
        replacementsMade++;
      }
    }

    editor.innerText = text;
    const revertBtn = document.getElementById('btn-revert-simplified');
    if (revertBtn) revertBtn.style.display = 'inline-flex';

    if (window.App && window.App.showToast) {
      window.App.showToast(`Demo Simplifier: Replaced ${replacementsMade} complex word(s).`);
    }
  }

  function revertSimplifiedText() {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (editor && originalTextBackup) {
      editor.innerText = originalTextBackup;
      const revertBtn = document.getElementById('btn-revert-simplified');
      if (revertBtn) revertBtn.style.display = 'none';
      if (window.App && window.App.showToast) window.App.showToast('Original text restored.');
    }
  }

  // --- TEXT-TO-SPEECH (TTS) ---
  function populateVoices() {
    if (!synth) return;
    const fill = () => {
      const select = document.getElementById('dyslexia-tts-voice');
      if (!select) return;
      const voices = synth.getVoices();
      if (!voices.length) return;
      select.innerHTML = `<option value="">Default Browser Voice</option>` +
        voices.slice(0, 20).map(v => `<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)} (${v.lang})</option>`).join('');
      if (preferences.speechVoiceName) select.value = preferences.speechVoiceName;
    };
    fill();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = fill;
    }
  }

  function readTextAloud() {
    if (!synth) {
      window.alert('Text-to-Speech (Web Speech API) is not supported in this browser.');
      return;
    }

    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;

    const rawText = editor.innerText.trim();
    if (!rawText) {
      if (window.App && window.App.showToast) window.App.showToast('Please paste or select some text to read aloud.');
      return;
    }

    if (isPaused) {
      synth.resume();
      isPaused = false;
      isSpeaking = true;
      updateTTSControlsUI();
      return;
    }

    stopReading();

    activeWords = rawText.split(/\s+/);
    renderWordsWithSpanTags(activeWords);

    currentUtterance = new SpeechSynthesisUtterance(rawText);
    currentUtterance.rate = preferences.speechRate;

    if (preferences.speechVoiceName) {
      const match = synth.getVoices().find(v => v.name === preferences.speechVoiceName);
      if (match) currentUtterance.voice = match;
    }

    currentUtterance.onboundary = function (event) {
      if (event.name === 'word') {
        highlightWordAtCharIndex(event.charIndex, rawText);
      }
    };

    currentUtterance.onend = function () {
      isSpeaking = false;
      isPaused = false;
      clearWordHighlights();
      updateTTSControlsUI();
      if (window.App && window.App.addGardenPoints) {
        window.App.addGardenPoints(15, 'Finished Listening with TTS!');
      }
    };

    currentUtterance.onerror = function () {
      isSpeaking = false;
      isPaused = false;
      clearWordHighlights();
      updateTTSControlsUI();
    };

    synth.speak(currentUtterance);
    isSpeaking = true;
    updateTTSControlsUI();
  }

  function pauseReading() {
    if (synth && isSpeaking) {
      synth.pause();
      isPaused = true;
      isSpeaking = false;
      updateTTSControlsUI();
    }
  }

  function stopReading() {
    if (synth) {
      synth.cancel();
      isSpeaking = false;
      isPaused = false;
      clearWordHighlights();
      updateTTSControlsUI();
    }
  }

  function renderWordsWithSpanTags(words) {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;
    editor.innerHTML = words.map((w, i) => `<span id="tts-word-${i}">${escapeHtml(w)}</span>`).join(' ');
  }

  function highlightWordAtCharIndex(charIdx, fullText) {
    const textUpToChar = fullText.slice(0, charIdx);
    const wordIdx = textUpToChar.trim().split(/\s+/).length - 1;
    clearWordHighlights();
    const span = document.getElementById(`tts-word-${wordIdx}`);
    if (span) {
      span.classList.add('highlight-word');
      span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function clearWordHighlights() {
    document.querySelectorAll('.highlight-word').forEach(el => el.classList.remove('highlight-word'));
  }

  function updateTTSControlsUI() {
    const playBtn = document.getElementById('btn-tts-play');
    const pauseBtn = document.getElementById('btn-tts-pause');
    if (playBtn) {
      playBtn.classList.toggle('active', isSpeaking);
      playBtn.textContent = isPaused ? '▶ Resume' : '▶ Read Aloud';
    }
    if (pauseBtn) pauseBtn.classList.toggle('active', isPaused);
  }

  // --- RSVP SPEED READER ---
  function startRsvp() {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;
    rsvpWords = editor.innerText.trim().split(/\s+/);
    if (!rsvpWords.length || !rsvpWords[0]) return;
    isRsvpRunning = true;
    rsvpIndex = 0;
    updateRsvpSpeed();
  }

  function updateRsvpSpeed() {
    clearInterval(rsvpInterval);
    if (!isRsvpRunning) return;
    const intervalMs = (60 / rsvpWpm) * 1000;
    rsvpInterval = setInterval(() => {
      const display = document.getElementById('rsvp-current-word');
      const progress = document.getElementById('rsvp-progress-text');
      if (rsvpIndex < rsvpWords.length) {
        if (display) display.textContent = rsvpWords[rsvpIndex];
        if (progress) progress.textContent = `Word ${rsvpIndex + 1} of ${rsvpWords.length}`;
        rsvpIndex++;
      } else {
        stopRsvp();
        if (display) display.textContent = '🎉 Completed!';
        if (window.App && window.App.addGardenPoints) window.App.addGardenPoints(10, 'RSVP Reading Practice!');
      }
    }, intervalMs);
  }

  function pauseRsvp() {
    isRsvpRunning = false;
    clearInterval(rsvpInterval);
  }

  function stopRsvp() {
    pauseRsvp();
    rsvpIndex = 0;
    const display = document.getElementById('rsvp-current-word');
    const progress = document.getElementById('rsvp-progress-text');
    if (display && !isRsvpRunning && rsvpWords.length === 0) display.textContent = 'Ready...';
    if (progress) progress.textContent = 'Word 0 of 0';
  }

  // --- READING COMPREHENSION PRACTICE ---
  function renderReadingPractice() {
    const container = document.getElementById('dyslexia-reading-practice-box');
    if (!container) return;
    const ex = readingPracticeExercises[practiceIndex];

    container.innerHTML = `
      <div style="padding: 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); border-left: 4px solid var(--accent-blue); margin-bottom: 14px; font-size: 15px; line-height: 1.7;">
        ${escapeHtml(ex.passage)}
      </div>
      <div style="font-weight: 700; margin-bottom: 10px; font-size: 14.5px;">${escapeHtml(ex.question)}</div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${ex.options.map((opt, idx) => `
          <button type="button" class="quiz-option-btn" onclick="Dyslexia.checkPracticeAnswer(${idx})">${escapeHtml(opt)}</button>
        `).join('')}
      </div>
      <div id="dyslexia-practice-feedback" style="margin-top: 12px; font-size: 13.5px; font-weight: 600;"></div>
    `;
  }

  function checkPracticeAnswer(selected) {
    const ex = readingPracticeExercises[practiceIndex];
    const fb = document.getElementById('dyslexia-practice-feedback');
    if (!fb) return;

    if (selected === ex.correct) {
      fb.style.color = 'var(--accent-mint)';
      fb.innerHTML = `✓ Great reading comprehension! <button type="button" class="btn btn-sm btn-primary" style="margin-left:10px;" onclick="Dyslexia.nextPractice()">Next Exercise →</button>`;
      if (window.Accessibility) window.Accessibility.playSound('chime');
      if (window.App && window.App.addGardenPoints) window.App.addGardenPoints(10, 'Reading Exercise Complete!');
    } else {
      fb.style.color = 'var(--accent-rose)';
      fb.textContent = 'Not quite — re-read the highlighted sentence gently and try again!';
    }
  }

  function nextPractice() {
    practiceIndex = (practiceIndex + 1) % readingPracticeExercises.length;
    renderReadingPractice();
  }

  // --- VOCABULARY BUILDER ---
  function addCustomVocab(word, meaning) {
    if (!word || !word.trim() || !meaning || !meaning.trim()) return;
    customVocabulary.unshift({
      id: Date.now(),
      word: word.trim(),
      phonetics: 'Custom word',
      meaning: meaning.trim(),
      custom: true
    });
    saveCustomVocabulary();
    renderVocabulary();
    if (window.App && window.App.showToast) window.App.showToast('Added word to your Vocabulary Builder!');
  }

  function deleteCustomVocab(id) {
    if (!window.confirm('Remove this custom vocabulary word?')) return;
    customVocabulary = customVocabulary.filter(w => w.id !== id);
    saveCustomVocabulary();
    renderVocabulary();
  }

  function renderVocabulary() {
    const container = document.getElementById('dyslexia-vocab-container');
    if (!container) return;

    const allWords = [...customVocabulary, ...defaultVocabulary];
    container.innerHTML = allWords.map(item => `
      <div class="card" style="padding: 14px; margin-bottom: 10px; background: var(--bg-card-subtle);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
          <div>
            <strong style="font-size: 16px; color: var(--accent-blue);">${escapeHtml(item.word)}</strong>
            <span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">${escapeHtml(item.phonetics)}</span>
          </div>
          <div class="item-actions">
            <button type="button" class="btn btn-sm btn-secondary" onclick="Dyslexia.speakWord('${escapeHtml(item.word)}')" title="Hear Pronunciation">🔊</button>
            ${item.custom ? `<button type="button" class="btn btn-sm btn-secondary" onclick="Dyslexia.deleteCustomVocab(${item.id})" title="Delete custom word">✕</button>` : ''}
          </div>
        </div>
        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5;">${escapeHtml(item.meaning)}</p>
      </div>
    `).join('');
  }

  function speakWord(word) {
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.85;
    synth.speak(u);
  }

  function loadSample(key) {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (editor && sampleTexts[key]) {
      editor.innerText = sampleTexts[key];
      originalTextBackup = sampleTexts[key];
      stopReading();
      if (window.App && window.App.showToast) window.App.showToast(`Loaded "${key}" reading passage.`);
    }
  }

  function bindEvents() {
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        setBackgroundTint(e.currentTarget.getAttribute('data-bg'), e.currentTarget.getAttribute('data-text'));
      });
    });

    const textColorPicker = document.getElementById('dyslexia-text-color-picker');
    if (textColorPicker) {
      textColorPicker.addEventListener('input', (e) => {
        preferences.textColor = e.target.value;
        savePreferences();
        applyCanvasStyles();
      });
    }

    const fontSelect = document.getElementById('dyslexia-font-select');
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        preferences.fontFamily = e.target.value;
        savePreferences();
        applyCanvasStyles();
      });
    }

    const sizeSlider = document.getElementById('dyslexia-font-size-slider');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', (e) => {
        preferences.fontSize = parseInt(e.target.value, 10);
        savePreferences();
        applyCanvasStyles();
      });
    }

    const lineSlider = document.getElementById('dyslexia-line-spacing-slider');
    if (lineSlider) {
      lineSlider.addEventListener('input', (e) => {
        preferences.lineHeight = parseFloat(e.target.value);
        savePreferences();
        applyCanvasStyles();
      });
    }

    const letterSlider = document.getElementById('dyslexia-letter-spacing-slider');
    if (letterSlider) {
      letterSlider.addEventListener('input', (e) => {
        preferences.letterSpacing = parseInt(e.target.value, 10) / 100;
        savePreferences();
        applyCanvasStyles();
      });
    }

    const wordSlider = document.getElementById('dyslexia-word-spacing-slider');
    if (wordSlider) {
      wordSlider.addEventListener('input', (e) => {
        preferences.wordSpacing = parseInt(e.target.value, 10) / 100;
        savePreferences();
        applyCanvasStyles();
      });
    }

    const rateSlider = document.getElementById('dyslexia-tts-rate');
    if (rateSlider) {
      rateSlider.addEventListener('input', (e) => {
        preferences.speechRate = parseFloat(e.target.value);
        savePreferences();
        applyCanvasStyles();
      });
    }

    const voiceSelect = document.getElementById('dyslexia-tts-voice');
    if (voiceSelect) {
      voiceSelect.addEventListener('change', (e) => {
        preferences.speechVoiceName = e.target.value;
        savePreferences();
      });
    }

    const playBtn = document.getElementById('btn-tts-play');
    if (playBtn) playBtn.addEventListener('click', readTextAloud);

    const pauseBtn = document.getElementById('btn-tts-pause');
    if (pauseBtn) pauseBtn.addEventListener('click', pauseReading);

    const stopBtn = document.getElementById('btn-tts-stop');
    if (stopBtn) stopBtn.addEventListener('click', stopReading);

    const bionicBtn = document.getElementById('btn-toggle-bionic');
    if (bionicBtn) bionicBtn.addEventListener('click', toggleBionicReading);

    const simplifyBtn = document.getElementById('btn-simplify-text');
    if (simplifyBtn) simplifyBtn.addEventListener('click', simplifyCurrentText);

    const revertBtn = document.getElementById('btn-revert-simplified');
    if (revertBtn) revertBtn.addEventListener('click', revertSimplifiedText);

    const readingFriendlyBtn = document.getElementById('btn-reading-friendly-mode');
    if (readingFriendlyBtn) readingFriendlyBtn.addEventListener('click', toggleReadingFriendlyMode);

    const rsvpStart = document.getElementById('btn-rsvp-start');
    if (rsvpStart) rsvpStart.addEventListener('click', startRsvp);

    const rsvpPause = document.getElementById('btn-rsvp-pause');
    if (rsvpPause) rsvpPause.addEventListener('click', pauseRsvp);

    const rsvpReset = document.getElementById('btn-rsvp-reset');
    if (rsvpReset) rsvpReset.addEventListener('click', stopRsvp);

    const rsvpSpeedSelect = document.getElementById('rsvp-speed-select');
    if (rsvpSpeedSelect) {
      rsvpSpeedSelect.addEventListener('change', (e) => {
        rsvpWpm = parseInt(e.target.value, 10);
        if (isRsvpRunning) updateRsvpSpeed();
      });
    }

    const vocabForm = document.getElementById('dyslexia-vocab-form');
    if (vocabForm) {
      vocabForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const w = document.getElementById('vocab-word-input');
        const m = document.getElementById('vocab-meaning-input');
        if (w && m && w.value.trim() && m.value.trim()) {
          addCustomVocab(w.value, m.value);
          w.value = '';
          m.value = '';
        }
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
    readTextAloud,
    pauseReading,
    stopReading,
    setBackgroundTint,
    toggleBionicReading,
    simplifyCurrentText,
    revertSimplifiedText,
    highlightSelection,
    clearAllHighlights,
    toggleReadingFriendlyMode,
    loadSample,
    speakWord,
    deleteCustomVocab,
    checkPracticeAnswer,
    nextPractice,
    startRsvp,
    pauseRsvp
  };
})();
