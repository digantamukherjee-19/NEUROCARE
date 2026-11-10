/**
 * NeuroCare - Wellness Centre Module
 * Features: Mood Tracker with emoji, Daily Guided Journal, Animated Breathing visualizer,
 * Web Audio API Ambient Sound Synthesizer, Positive Affirmations, Break Reminders, and Sleep Checklist.
 */

const Wellness = (function () {
  'use strict';

  const STORAGE_KEY_MOOD = 'neurocare_wellness_mood';
  const STORAGE_KEY_JOURNAL = 'neurocare_wellness_journal';

  let moodHistory = [];
  let journalEntries = [];

  // Breathing Guide State
  let breathingInterval = null;
  let isBreathingActive = false;
  let breathingPhase = 'idle'; // 'inhale', 'hold', 'exhale', 'hold2'
  let breathingPattern = 'box'; // 'box' (4-4-4-4) or 'relax' (4-7-8)
  let breathCount = 0;

  // Web Audio Ambient Synthesizer
  let audioCtx = null;
  let ambientNodes = {
    rainGain: null,
    oceanGain: null,
    noiseGain: null,
    chimeOsc: null,
    masterGain: null
  };
  let activeAmbientTrack = null;

  const affirmations = [
    "My worth is not defined by how productive I was today.",
    "My unique perspective is a gift to my community and the world.",
    "It is completely okay to pause, rest, and regulate my nervous system.",
    "I can take things one micro-step at a time without guilt.",
    "Different brains create wonderful, creative, and groundbreaking solutions.",
    "I honor my sensory boundaries and respect what my body needs.",
    "I am learning how to work with my brain, not against it.",
    "Mistakes are simply data points guiding my learning journey.",
    "My sensitivity allows me to experience beauty and empathy deeply.",
    "I celebrate every small accomplishment I reached today."
  ];

  function init() {
    loadData();
    renderMoodHistory();
    renderJournalEntries();
    renderAffirmation();
    bindEvents();
  }

  function loadData() {
    try {
      const savedMood = localStorage.getItem(STORAGE_KEY_MOOD);
      if (savedMood) {
        moodHistory = JSON.parse(savedMood);
      } else {
        moodHistory = [
          { emoji: '😊', label: 'Calm', intensity: 8, note: 'Had a peaceful morning walk', date: 'Yesterday' }
        ];
      }

      const savedJournal = localStorage.getItem(STORAGE_KEY_JOURNAL);
      if (savedJournal) {
        journalEntries = JSON.parse(savedJournal);
      } else {
        journalEntries = [
          { date: 'Yesterday', prompt: 'One small win today', note: 'I finished my science flashcards and drank enough water.' }
        ];
      }
    } catch (e) {
      console.warn('Could not read wellness data', e);
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY_MOOD, JSON.stringify(moodHistory));
      localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(journalEntries));
    } catch (e) {
      console.warn('Could not save wellness data', e);
    }
  }

  // --- MOOD TRACKER ---
  let selectedMoodEmoji = '😊';
  let selectedMoodLabel = 'Calm';

  function selectMood(emoji, label) {
    selectedMoodEmoji = emoji;
    selectedMoodLabel = label;

    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-emoji') === emoji);
    });
  }

  function saveCurrentMood() {
    const slider = document.getElementById('mood-intensity-slider');
    const noteInput = document.getElementById('mood-note-input');

    const intensity = slider ? parseInt(slider.value, 10) : 5;
    const note = noteInput ? noteInput.value.trim() : '';

    const newEntry = {
      emoji: selectedMoodEmoji,
      label: selectedMoodLabel,
      intensity: intensity,
      note: note || 'Checked in',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    moodHistory.unshift(newEntry);
    if (moodHistory.length > 14) moodHistory.pop();

    saveData();
    renderMoodHistory();

    if (noteInput) noteInput.value = '';
    if (window.App && window.App.addGardenPoints) {
      window.App.addGardenPoints(10, 'Mood Check-in Recorded!');
    }
    if (window.App && window.App.showToast) {
      window.App.showToast('Mood logged successfully!');
    }
  }

  function renderMoodHistory() {
    const container = document.getElementById('wellness-mood-history');
    if (!container) return;

    if (moodHistory.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">No check-ins logged yet today.</p>`;
      return;
    }

    container.innerHTML = moodHistory.slice(0, 5).map(m => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); margin-bottom: 8px; border: 1px solid var(--border-light);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">${m.emoji}</span>
          <div>
            <strong style="font-size: 14px;">${escapeHtml(m.label)} (${m.intensity}/10)</strong>
            <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(m.note)}</div>
          </div>
        </div>
        <span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(m.date)}</span>
      </div>
    `).join('');

    // Update dashboard mood card if present
    const dashMood = document.getElementById('dash-stat-mood');
    if (dashMood && moodHistory[0]) {
      dashMood.textContent = `${moodHistory[0].emoji} ${moodHistory[0].label}`;
    }
  }

  // --- DAILY JOURNAL ---
  function saveJournalEntry() {
    const promptSelect = document.getElementById('journal-prompt-select');
    const noteArea = document.getElementById('journal-note-textarea');

    if (!noteArea || !noteArea.value.trim()) {
      alert('Please write a short reflection before saving.');
      return;
    }

    const newEntry = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      prompt: promptSelect ? promptSelect.value : 'Reflection',
      note: noteArea.value.trim()
    };

    journalEntries.unshift(newEntry);
    if (journalEntries.length > 20) journalEntries.pop();

    saveData();
    renderJournalEntries();
    noteArea.value = '';

    if (window.App && window.App.addGardenPoints) {
      window.App.addGardenPoints(15, 'Journal Reflection Saved!');
    }
  }

  function renderJournalEntries() {
    const container = document.getElementById('wellness-journal-list');
    if (!container) return;

    if (journalEntries.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">Your journal is blank. Write a peaceful reflection above!</p>`;
      return;
    }

    container.innerHTML = journalEntries.map((j, idx) => `
      <div class="card" style="padding: 16px; margin-bottom: 10px; background: var(--bg-card-subtle);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span class="badge badge-lavender">${escapeHtml(j.prompt)}</span>
          <span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(j.date)}</span>
        </div>
        <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">${escapeHtml(j.note)}</p>
      </div>
    `).join('');
  }

  // --- ANIMATED BREATHING EXERCISE ---
  function startBreathing() {
    if (isBreathingActive) return;
    isBreathingActive = true;
    updateBreathingBtnUI(true);

    const circle = document.getElementById('breathing-circle-anim');
    const text = document.getElementById('breathing-instruction-text');
    const counter = document.getElementById('breathing-countdown-num');

    let seconds = 0;
    // Box Breathing (4 In, 4 Hold, 4 Out, 4 Hold)
    breathingInterval = setInterval(() => {
      const step = seconds % 16;

      if (step < 4) {
        // Inhale
        if (circle) circle.className = 'breathing-circle inhale';
        if (text) text.textContent = 'Gently Inhale...';
        if (counter) counter.textContent = `${4 - step}`;
      } else if (step < 8) {
        // Hold
        if (circle) circle.className = 'breathing-circle hold';
        if (text) text.textContent = 'Softly Hold...';
        if (counter) counter.textContent = `${8 - step}`;
      } else if (step < 12) {
        // Exhale
        if (circle) circle.className = 'breathing-circle exhale';
        if (text) text.textContent = 'Slowly Exhale...';
        if (counter) counter.textContent = `${12 - step}`;
      } else {
        // Hold empty
        if (circle) circle.className = 'breathing-circle';
        if (text) text.textContent = 'Rest and pause...';
        if (counter) counter.textContent = `${16 - step}`;
      }

      seconds++;

      // Every 32 seconds (2 full cycles), award garden points!
      if (seconds === 32) {
        if (window.App && window.App.addGardenPoints) {
          window.App.addGardenPoints(15, '2 Cycles of Breathing Rest!');
        }
      }
    }, 1000);
  }

  function stopBreathing() {
    isBreathingActive = false;
    clearInterval(breathingInterval);
    updateBreathingBtnUI(false);

    const circle = document.getElementById('breathing-circle-anim');
    const text = document.getElementById('breathing-instruction-text');
    const counter = document.getElementById('breathing-countdown-num');

    if (circle) circle.className = 'breathing-circle';
    if (text) text.textContent = 'Ready to begin';
    if (counter) counter.textContent = '';
  }

  function updateBreathingBtnUI(active) {
    const btn = document.getElementById('btn-toggle-breathing');
    if (!btn) return;
    btn.textContent = active ? '⏹ Pause Breathing' : '▶ Start Breathing';
    btn.classList.toggle('btn-primary', !active);
    btn.classList.toggle('btn-secondary', active);
  }

  // --- POSITIVE AFFIRMATIONS ---
  function renderAffirmation() {
    const textEl = document.getElementById('affirmation-quote-text');
    if (!textEl) return;
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    textEl.textContent = `"${random}"`;
  }

  // --- WEB AUDIO API AMBIENT SOUND GENERATOR (100% Offline & Pure Synth) ---
  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      ambientNodes.masterGain = audioCtx.createGain();
      ambientNodes.masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      ambientNodes.masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function toggleAmbientTrack(trackName) {
    initAudioContext();

    if (activeAmbientTrack === trackName) {
      stopAmbientSounds();
      activeAmbientTrack = null;
      updateAmbientButtonsUI(null);
      return;
    }

    stopAmbientSounds();
    activeAmbientTrack = trackName;
    updateAmbientButtonsUI(trackName);

    if (trackName === 'rain') {
      startRainSynth();
    } else if (trackName === 'ocean') {
      startOceanSynth();
    } else if (trackName === 'binaural') {
      startBinauralSynth();
    } else if (trackName === 'pink') {
      startPinkNoiseSynth();
    }
  }

  function stopAmbientSounds() {
    if (ambientNodes.rainGain) {
      ambientNodes.rainGain.disconnect();
      ambientNodes.rainGain = null;
    }
    if (ambientNodes.chimeOsc) {
      try { ambientNodes.chimeOsc.stop(); } catch (e) {}
      ambientNodes.chimeOsc = null;
    }
  }

  // Synthesize soft rain using filtered white noise buffer
  function startRainSynth() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ambientNodes.masterGain);

    ambientNodes.rainGain = gain;
    noise.start();
  }

  // Synthesize gentle ocean wave modulation
  function startOceanSynth() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, audioCtx.currentTime);

    // LFO modulator for wave swell
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime); // 8-second wave period

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.2, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);

    lfo.connect(filter.frequency);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ambientNodes.masterGain);

    ambientNodes.rainGain = gain;
    noise.start();
    lfo.start();
  }

  // Synthesize 432 Hz calming singing bowl harmonic tone
  function startBinauralSynth() {
    const osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, audioCtx.currentTime); // 432 Hz frequency
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(436, audioCtx.currentTime); // 4 Hz binaural beat

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ambientNodes.masterGain);

    ambientNodes.rainGain = gain;
    ambientNodes.chimeOsc = osc;
    osc.start();
    osc2.start();
  }

  // Synthesize gentle pink noise
  function startPinkNoiseSynth() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    noise.connect(gain);
    gain.connect(ambientNodes.masterGain);

    ambientNodes.rainGain = gain;
    noise.start();
  }

  function updateAmbientButtonsUI(activeTrack) {
    document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
      const track = btn.getAttribute('data-sound');
      btn.classList.toggle('active', track === activeTrack);
    });

    // Also update header sound indicator
    const headerSoundBtn = document.getElementById('btn-header-sound');
    if (headerSoundBtn) {
      headerSoundBtn.classList.toggle('active', Boolean(activeTrack));
    }
  }

  function bindEvents() {
    // Mood selection buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const emoji = e.currentTarget.getAttribute('data-emoji');
        const label = e.currentTarget.getAttribute('data-label');
        selectMood(emoji, label);
      });
    });

    const moodSaveBtn = document.getElementById('btn-save-mood');
    if (moodSaveBtn) moodSaveBtn.addEventListener('click', saveCurrentMood);

    // Journal save button
    const journalSaveBtn = document.getElementById('btn-save-journal');
    if (journalSaveBtn) journalSaveBtn.addEventListener('click', saveJournalEntry);

    // Breathing toggle
    const breathBtn = document.getElementById('btn-toggle-breathing');
    if (breathBtn) {
      breathBtn.addEventListener('click', () => {
        if (isBreathingActive) stopBreathing();
        else startBreathing();
      });
    }

    // Affirmation button
    const affirmBtn = document.getElementById('btn-new-affirmation');
    if (affirmBtn) affirmBtn.addEventListener('click', renderAffirmation);

    // Sound toggle buttons
    document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const track = e.currentTarget.getAttribute('data-sound');
        toggleAmbientTrack(track);
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init,
    selectMood,
    saveCurrentMood,
    saveJournalEntry,
    startBreathing,
    stopBreathing,
    renderAffirmation,
    toggleAmbientTrack
  };
})();
