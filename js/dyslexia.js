/**
 * NeuroCare - Dyslexia Support Module
 * Features: Dyslexia-friendly reading canvas, Web Speech API Text-to-Speech with word highlight,
 * Background tint presets, Bionic reading formatter, Text Simplifier, RSVP speed reader,
 * and Vocabulary Builder.
 */

const Dyslexia = (function () {
  'use strict';

  const STORAGE_KEY_PREFS = 'neurocare_dyslexia_prefs';

  // Sample texts for immediate reading & testing
  const sampleTexts = {
    nature: `Nature has a gentle rhythm that helps our minds rest. When we spend time near green trees and flowing streams, our senses relax. Studies show that spending just twenty minutes in a quiet natural space lowers heart rates and improves concentration. For neurodivergent minds, the natural world offers soft, harmonious patterns without the harsh noise of fluorescent lights or busy screens.`,
    space: `The Solar System is our cosmic neighborhood. At its warm center lies the Sun, a radiant star whose gravity holds eight planets in orbit. From rocky inner worlds like Mercury, Venus, Earth, and Mars to the vast gas giants Jupiter and Saturn, every planet moves in an elliptical dance through space. Exploring the stars reminds us of the endless possibilities of discovery.`,
    creativity: `Neurodiversity means every brain experiences the world in a distinct and valuable way. Many inventors, artists, scientists, and storytellers have dyslexia or ADHD. Thinking outside conventional boxes leads to ingenious breakthroughs in architecture, programming, and literature. When tools accommodate our processing styles, our true talents flourish.`
  };

  const vocabularyList = [
    { word: 'Neurodiversity', phonetics: '/ˌnjʊə.rəʊ.daɪˈvɜː.sə.ti/', meaning: 'The natural diversity of human brains and minds, recognizing that variations like ADHD or dyslexia are normal differences rather than deficits.' },
    { word: 'Executive Function', phonetics: '/ɪɡˈzek.jə.tɪv ˈfʌŋk.ʃən/', meaning: 'The mental skills that help us plan, organize, focus attention, remember instructions, and manage multiple tasks successfully.' },
    { word: 'Sensory Overload', phonetics: '/ˈsen.sər.i ˈəʊ.və.ləʊd/', meaning: 'When one or more of the body senses (sound, light, touch) experiences too much stimulation, leading to mental fatigue.' },
    { word: 'Phonological', phonetics: '/ˌfɒn.əˈlɒdʒ.ɪ.kəl/', meaning: 'Relating to the sounds of spoken language, especially how letters and syllables blend together to form words.' },
    { word: 'Accommodations', phonetics: '/əˌkɒm.əˈdeɪ.ʃənz/', meaning: 'Supportive tools or environmental adjustments (like extra time or audio readers) that provide equal access to learning.' },
    { word: 'Proprioception', phonetics: '/ˌprəʊ.pri.əʊˈsep.ʃən/', meaning: 'The body’s quiet sense of its position, movement, and posture in physical space.' }
  ];

  // Replacements dictionary for "Simplify Language" tool
  const simplificationMap = {
    'utilize': 'use',
    'facilitate': 'help',
    'consequently': 'so',
    'furthermore': 'also',
    'subsequently': 'then',
    'demonstrate': 'show',
    'endeavor': 'try',
    'necessitate': 'require',
    'approximate': 'rough',
    'commence': 'start',
    'terminate': 'end',
    'implement': 'put in place',
    'conventional': 'usual',
    'accommodate': 'support',
    'harmonious': 'peaceful',
    'proclivity': 'natural habit'
  };

  let preferences = {
    fontSize: 20,
    lineHeight: 1.8,
    letterSpacing: 0.04,
    bgColor: '#ffffff',
    textColor: '#1e293b',
    fontFamily: 'OpenDyslexic, Lexend, Comic Sans MS, sans-serif',
    bionicReading: false,
    speechRate: 1.0,
    speechPitch: 1.0
  };

  // TTS State
  let synth = window.speechSynthesis;
  let currentUtterance = null;
  let isSpeaking = false;
  let isPaused = false;
  let activeWords = [];
  let currentWordIndex = 0;

  // RSVP Reader State
  let rsvpInterval = null;
  let rsvpWords = [];
  let rsvpIndex = 0;
  let rsvpWpm = 180;
  let isRsvpRunning = false;

  function init() {
    loadPreferences();
    setupCanvas();
    renderVocabulary();
    bindEvents();
  }

  function loadPreferences() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) preferences = { ...preferences, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Could not read dyslexia prefs from storage', e);
    }
  }

  function savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Could not save dyslexia prefs', e);
    }
  }

  function setupCanvas() {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;

    if (!editor.innerText.trim()) {
      editor.innerText = sampleTexts.nature;
    }
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
    editor.style.fontFamily = preferences.fontFamily;

    // Sync input sliders if present
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
  }

  // --- BACKGROUND TINT PRESETS ---
  function setBackgroundTint(bgHex, textHex) {
    preferences.bgColor = bgHex;
    preferences.textColor = textHex;
    savePreferences();
    applyCanvasStyles();

    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-bg') === bgHex);
    });
  }

  // --- BIONIC READING CONVERTER ---
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
      const bionicWords = words.map(w => {
        if (!w.trim()) return w;
        const midPoint = Math.ceil(w.length * 0.45);
        const boldPart = w.slice(0, midPoint);
        const restPart = w.slice(midPoint);
        return `<strong>${boldPart}</strong>${restPart}`;
      });
      return bionicWords.join(' ');
    }).join('<br><br>');
  }

  // --- TEXT SIMPLIFIER ---
  function simplifyCurrentText() {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;

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
    if (window.App && window.App.showToast) {
      window.App.showToast(`Simplified! Replaced ${replacementsMade} complex words.`);
    }
  }

  // --- TEXT-TO-SPEECH (TTS) & WORD HIGHLIGHTING ---
  function readTextAloud() {
    if (!synth) {
      alert('Speech Synthesis is not supported in this browser.');
      return;
    }

    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;

    const rawText = editor.innerText.trim();
    if (!rawText) return;

    if (isPaused) {
      synth.resume();
      isPaused = false;
      isSpeaking = true;
      updateTTSControlsUI();
      return;
    }

    stopReading();

    // Prepare text for word-by-word visual highlight
    activeWords = rawText.split(/\s+/);
    renderWordsWithSpanTags(activeWords);

    currentUtterance = new SpeechSynthesisUtterance(rawText);
    currentUtterance.rate = preferences.speechRate;
    currentUtterance.pitch = preferences.speechPitch;

    currentUtterance.onboundary = function (event) {
      if (event.name === 'word') {
        const charIdx = event.charIndex;
        highlightWordAtCharIndex(charIdx, rawText);
      }
    };

    currentUtterance.onend = function () {
      isSpeaking = false;
      isPaused = false;
      clearWordHighlights();
      updateTTSControlsUI();
      if (window.App && window.App.addGardenPoints) {
        window.App.addGardenPoints(15, 'Read with Voice!');
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
    // Count words up to charIdx
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
    const stopBtn = document.getElementById('btn-tts-stop');

    if (playBtn) playBtn.classList.toggle('active', isSpeaking);
    if (pauseBtn) pauseBtn.classList.toggle('active', isPaused);
  }

  // --- RSVP SPEED READER EXERCISE ---
  function startRsvp() {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (!editor) return;

    rsvpWords = editor.innerText.trim().split(/\s+/);
    if (rsvpWords.length === 0) return;

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
  }

  // --- VOCABULARY BUILDER ---
  function renderVocabulary() {
    const container = document.getElementById('dyslexia-vocab-container');
    if (!container) return;

    container.innerHTML = vocabularyList.map(item => `
      <div class="card" style="padding: 16px; margin-bottom: 12px; background: var(--bg-card-subtle);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div>
            <strong style="font-size: 16px; color: var(--accent-blue);">${escapeHtml(item.word)}</strong>
            <span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">${escapeHtml(item.phonetics)}</span>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="Dyslexia.speakWord('${escapeHtml(item.word)}')" title="Hear Pronunciation">🔊 Speak</button>
        </div>
        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5;">${escapeHtml(item.meaning)}</p>
      </div>
    `).join('');
  }

  function speakWord(word) {
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.9;
    synth.speak(u);
  }

  function loadSample(key) {
    const editor = document.getElementById('dyslexia-reader-editor');
    if (editor && sampleTexts[key]) {
      editor.innerText = sampleTexts[key];
      stopReading();
    }
  }

  function bindEvents() {
    // Background swatches
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bg = e.target.getAttribute('data-bg');
        const text = e.target.getAttribute('data-text');
        setBackgroundTint(bg, text);
      });
    });

    // Font size slider
    const sizeSlider = document.getElementById('dyslexia-font-size-slider');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', (e) => {
        preferences.fontSize = parseInt(e.target.value, 10);
        savePreferences();
        applyCanvasStyles();
      });
    }

    // Line spacing slider
    const lineSlider = document.getElementById('dyslexia-line-spacing-slider');
    if (lineSlider) {
      lineSlider.addEventListener('input', (e) => {
        preferences.lineHeight = parseFloat(e.target.value);
        savePreferences();
        applyCanvasStyles();
      });
    }

    // Letter spacing slider
    const letterSlider = document.getElementById('dyslexia-letter-spacing-slider');
    if (letterSlider) {
      letterSlider.addEventListener('input', (e) => {
        preferences.letterSpacing = parseInt(e.target.value, 10) / 100;
        savePreferences();
        applyCanvasStyles();
      });
    }

    // TTS Buttons
    const playBtn = document.getElementById('btn-tts-play');
    if (playBtn) playBtn.addEventListener('click', readTextAloud);

    const pauseBtn = document.getElementById('btn-tts-pause');
    if (pauseBtn) pauseBtn.addEventListener('click', pauseReading);

    const stopBtn = document.getElementById('btn-tts-stop');
    if (stopBtn) stopBtn.addEventListener('click', stopReading);

    // Bionic reading
    const bionicBtn = document.getElementById('btn-toggle-bionic');
    if (bionicBtn) bionicBtn.addEventListener('click', toggleBionicReading);

    // Simplify text
    const simplifyBtn = document.getElementById('btn-simplify-text');
    if (simplifyBtn) simplifyBtn.addEventListener('click', simplifyCurrentText);

    // RSVP Reader controls
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
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init,
    readTextAloud,
    pauseReading,
    stopReading,
    setBackgroundTint,
    toggleBionicReading,
    simplifyCurrentText,
    loadSample,
    speakWord,
    startRsvp,
    pauseRsvp
  };
})();
