/**
 * NeuroCare - Wellness Centre Module
 * Features:
 * - Mood Tracker with emoji + visual 7-entry Mood Bar Chart + delete confirmation
 * - Personal Journal (save, edit, delete with confirmation)
 * - Animated Breathing Exercise (Box 4-4-4-4 & 4-7-8 patterns) with timer
 * - Interactive 5-4-3-2-1 Sensory Grounding relaxation activity
 * - Web Audio API Ambient Sound Synthesizer
 * - Positive Affirmations generator & custom favorites
 * - Working Break Reminder Timer
 * - Sleep & Evening Routine Tracker
 */

var Wellness = window.Wellness = (function () {
  'use strict';

  const STORAGE_KEY_MOOD = 'neurocare_wellness_mood';
  const STORAGE_KEY_JOURNAL = 'neurocare_wellness_journal';
  const STORAGE_KEY_SLEEP = 'neurocare_wellness_sleep';
  const STORAGE_KEY_SLEEP_CHECK = 'neurocare_wellness_sleep_check';
  const STORAGE_KEY_AFFIRMATIONS = 'neurocare_wellness_affirmations';

  let moodHistory = [];
  let journalEntries = [];
  let sleepLogs = [];
  let sleepChecklist = [
    { id: 'sc-1', text: 'Dim bright overhead lights 45 mins before bed', done: false },
    { id: 'sc-2', text: 'Switch screens to night-shift / warm mode', done: false },
    { id: 'sc-3', text: 'Sip warm herbal tea or water', done: false },
    { id: 'sc-4', text: 'Put phone on Do Not Disturb / calm mode', done: false }
  ];

  let breathingInterval = null;
  let isBreathingActive = false;
  let breathingPattern = 'box'; // 'box' (4-4-4-4) or '478' (4-7-8)
  let breathingSecondsElapsed = 0;

  let breakInterval = null;
  let breakSecondsLeft = 0;
  let isBreakTimerRunning = false;

  let groundingStep = 0;
  const groundingPrompts = [
    { num: 5, sense: '👁️ 5 Things You Can See', prompt: 'Look slowly around the room. Name 5 calm objects or colors you notice.' },
    { num: 4, sense: '🖐️ 4 Things You Can Feel', prompt: 'Notice the texture of your chair, clothes, feet on the floor, or cool air.' },
    { num: 3, sense: '👂 3 Things You Can Hear', prompt: 'Listen for distant birds, a quiet fan hum, or your own gentle breath.' },
    { num: 2, sense: '👃 2 Things You Can Smell', prompt: 'Notice fresh air, tea, soap, or simply take two slow mindful breaths.' },
    { num: 1, sense: '💧 1 Kind Thought or Taste', prompt: 'Sip water or remind yourself: "I am safe in this present moment."' }
  ];

  // Web Audio Ambient Synthesizer
  let audioCtx = null;
  let ambientNodes = { rainGain: null, chimeOsc: null, masterGain: null };
  let activeAmbientTrack = null;

  let affirmations = [
    'My worth is not defined by how productive I was today.',
    'My unique perspective is a gift to my community and the world.',
    'It is completely okay to pause, rest, and regulate my nervous system.',
    'I can take things one micro-step at a time without guilt.',
    'Different brains create wonderful, creative, and groundbreaking solutions.',
    'I honor my sensory boundaries and respect what my body needs.',
    'I am learning how to work with my brain, not against it.',
    'Mistakes are simply data points guiding my learning journey.'
  ];
  let currentAffirmationText = affirmations[0];

  function init() {
    loadData();
    renderMoodHistory();
    renderMoodChart();
    renderJournalEntries();
    renderAffirmation();
    renderGroundingStep();
    renderSleepChecklist();
    renderSleepLogs();
    bindEvents();
  }

  function loadData() {
    try {
      const savedMood = localStorage.getItem(STORAGE_KEY_MOOD);
      moodHistory = savedMood ? JSON.parse(savedMood) : [
        { id: 1, emoji: '😊', label: 'Calm', intensity: 8, note: 'Peaceful morning reset', date: 'Yesterday' },
        { id: 2, emoji: '😄', label: 'Great', intensity: 9, note: 'Finished a big study block', date: '2 days ago' }
      ];

      const savedJournal = localStorage.getItem(STORAGE_KEY_JOURNAL);
      journalEntries = savedJournal ? JSON.parse(savedJournal) : [
        { id: 1, date: 'Yesterday', prompt: 'One small win today', note: 'I finished my flashcards and remembered to drink water.' }
      ];

      const savedSleep = localStorage.getItem(STORAGE_KEY_SLEEP);
      sleepLogs = savedSleep ? JSON.parse(savedSleep) : [
        { id: 1, bed: '10:30 PM', wake: '06:45 AM', hours: '8.3', quality: 'Restful', date: 'Last Night' }
      ];

      const savedCheck = localStorage.getItem(STORAGE_KEY_SLEEP_CHECK);
      if (savedCheck) sleepChecklist = JSON.parse(savedCheck);

      const savedAff = localStorage.getItem(STORAGE_KEY_AFFIRMATIONS);
      if (savedAff) {
        const custom = JSON.parse(savedAff);
        affirmations = [...new Set([...custom, ...affirmations])];
      }
    } catch (e) {
      console.warn('Could not read wellness data', e);
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY_MOOD, JSON.stringify(moodHistory));
      localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(journalEntries));
      localStorage.setItem(STORAGE_KEY_SLEEP, JSON.stringify(sleepLogs));
      localStorage.setItem(STORAGE_KEY_SLEEP_CHECK, JSON.stringify(sleepChecklist));
    } catch (e) {
      console.warn('Could not save wellness data', e);
    }
  }

  // --- MOOD TRACKER & CHART ---
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
    const intensity = slider ? parseInt(slider.value, 10) : 7;
    const note = noteInput ? noteInput.value.trim() : '';

    moodHistory.unshift({
      id: Date.now(),
      emoji: selectedMoodEmoji,
      label: selectedMoodLabel,
      intensity,
      note: note || 'Checked in',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (moodHistory.length > 20) moodHistory.pop();

    saveData();
    renderMoodHistory();
    renderMoodChart();
    if (noteInput) noteInput.value = '';
    if (window.App && window.App.addGardenPoints) window.App.addGardenPoints(10, 'Mood Check-in Saved!');
    if (window.App && window.App.updateDashboardAll) window.App.updateDashboardAll();
  }

  function deleteMoodEntry(id) {
    if (!window.confirm('Delete this mood check-in entry?')) return;
    moodHistory = moodHistory.filter(m => m.id !== id);
    saveData();
    renderMoodHistory();
    renderMoodChart();
    if (window.App && window.App.updateDashboardAll) window.App.updateDashboardAll();
  }

  function renderMoodHistory() {
    const container = document.getElementById('wellness-mood-history');
    if (!container) return;

    if (moodHistory.length === 0) {
      container.innerHTML = `<div class="empty-state-box">No mood check-ins logged yet.</div>`;
    } else {
      container.innerHTML = moodHistory.slice(0, 5).map(m => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); margin-bottom: 8px; border: 1px solid var(--border-light);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">${m.emoji}</span>
            <div>
              <strong style="font-size: 14px;">${escapeHtml(m.label)} (${m.intensity}/10)</strong>
              <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(m.note)}</div>
            </div>
          </div>
          <div class="item-actions">
            <span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(m.date)}</span>
            <button type="button" class="btn btn-sm btn-secondary" onclick="Wellness.deleteMoodEntry(${m.id})" aria-label="Delete mood entry">✕</button>
          </div>
        </div>
      `).join('');
    }

    const dashMood = document.getElementById('dash-stat-mood');
    if (dashMood && moodHistory[0]) {
      dashMood.textContent = `${moodHistory[0].emoji} ${moodHistory[0].label}`;
    }
  }

  function renderMoodChart() {
    const chartEl = document.getElementById('wellness-mood-chart');
    if (!chartEl) return;

    const recent = moodHistory.slice(0, 7).reverse();
    if (!recent.length) {
      chartEl.innerHTML = `<div style="width:100%; text-align:center; color:var(--text-muted); font-size:12px;">Log moods to see your energy trend chart</div>`;
      return;
    }

    chartEl.innerHTML = recent.map(m => {
      const pct = Math.max(15, m.intensity * 10);
      return `
        <div class="mood-chart-col" title="${escapeHtml(m.label)}: ${m.intensity}/10">
          <div style="font-size:14px;">${m.emoji}</div>
          <div class="mood-chart-bar" style="height: ${pct}%;"></div>
          <div style="font-size:10px; color:var(--text-muted);">${m.intensity}</div>
        </div>
      `;
    }).join('');
  }

  // --- PERSONAL JOURNAL (SAVE, EDIT, DELETE WITH CONFIRM) ---
  function saveJournalEntry() {
    const promptSelect = document.getElementById('journal-prompt-select');
    const noteArea = document.getElementById('journal-note-textarea');
    if (!noteArea || !noteArea.value.trim()) {
      if (window.App && window.App.showToast) window.App.showToast('Please write a short reflection first.');
      if (noteArea) noteArea.focus();
      return;
    }

    journalEntries.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      prompt: promptSelect ? promptSelect.value : 'Reflection',
      note: noteArea.value.trim()
    });
    if (journalEntries.length > 30) journalEntries.pop();

    saveData();
    renderJournalEntries();
    noteArea.value = '';
    if (window.App && window.App.addGardenPoints) window.App.addGardenPoints(15, 'Journal Saved!');
  }

  function editJournalEntry(id) {
    const entry = journalEntries.find(j => j.id === id);
    if (!entry) return;
    const updated = window.prompt('Edit your journal reflection:', entry.note);
    if (updated !== null && updated.trim()) {
      entry.note = updated.trim();
      saveData();
      renderJournalEntries();
      if (window.App && window.App.showToast) window.App.showToast('Journal entry updated.');
    }
  }

  function deleteJournalEntry(id) {
    if (!window.confirm('Delete this journal entry permanently?')) return;
    journalEntries = journalEntries.filter(j => j.id !== id);
    saveData();
    renderJournalEntries();
    if (window.App && window.App.showToast) window.App.showToast('Journal entry deleted.');
  }

  function renderJournalEntries() {
    const container = document.getElementById('wellness-journal-list');
    if (!container) return;

    if (journalEntries.length === 0) {
      container.innerHTML = `<div class="empty-state-box">Your journal is empty. Write a peaceful reflection above!</div>`;
      return;
    }

    container.innerHTML = journalEntries.map(j => `
      <div class="card" style="padding: 14px; margin-bottom: 10px; background: var(--bg-card-subtle);">
        <div style="display: flex; justify-content: space-between; align-items:center; margin-bottom: 6px;">
          <span class="badge badge-lavender">${escapeHtml(j.prompt)}</span>
          <div class="item-actions">
            <span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(j.date)}</span>
            <button type="button" class="btn btn-sm btn-secondary" onclick="Wellness.editJournalEntry(${j.id})" title="Edit entry">✏️</button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="Wellness.deleteJournalEntry(${j.id})" title="Delete entry">✕</button>
          </div>
        </div>
        <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">${escapeHtml(j.note)}</p>
      </div>
    `).join('');
  }

  // --- ANIMATED BREATHING EXERCISE ---
  function setBreathingPattern(pattern) {
    stopBreathing();
    breathingPattern = pattern;
    const desc = document.getElementById('breathing-pattern-label');
    if (desc) {
      desc.textContent = pattern === 'box' ? 'Box Breathing (4s In • 4s Hold • 4s Out • 4s Rest)' : '4-7-8 Calming Breath (4s In • 7s Hold • 8s Out)';
    }
  }

  function startBreathing() {
    if (isBreathingActive) return;
    isBreathingActive = true;
    breathingSecondsElapsed = 0;
    updateBreathingBtnUI(true);

    const circle = document.getElementById('breathing-circle-anim');
    const text = document.getElementById('breathing-instruction-text');
    const counter = document.getElementById('breathing-countdown-num');
    const timerDisplay = document.getElementById('breathing-elapsed-timer');

    let seconds = 0;
    breathingInterval = setInterval(() => {
      breathingSecondsElapsed++;
      if (timerDisplay) {
        const m = Math.floor(breathingSecondsElapsed / 60);
        const s = breathingSecondsElapsed % 60;
        timerDisplay.textContent = `Session: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }

      if (breathingPattern === 'box') {
        const step = seconds % 16;
        if (step < 4) {
          if (circle) circle.className = 'breathing-circle inhale';
          if (text) text.textContent = 'Gently Inhale...';
          if (counter) counter.textContent = `${4 - step}`;
        } else if (step < 8) {
          if (circle) circle.className = 'breathing-circle hold';
          if (text) text.textContent = 'Softly Hold...';
          if (counter) counter.textContent = `${8 - step}`;
        } else if (step < 12) {
          if (circle) circle.className = 'breathing-circle exhale';
          if (text) text.textContent = 'Slowly Exhale...';
          if (counter) counter.textContent = `${12 - step}`;
        } else {
          if (circle) circle.className = 'breathing-circle';
          if (text) text.textContent = 'Rest & Pause...';
          if (counter) counter.textContent = `${16 - step}`;
        }
      } else {
        // 4-7-8 pattern (19s total)
        const step = seconds % 19;
        if (step < 4) {
          if (circle) circle.className = 'breathing-circle inhale';
          if (text) text.textContent = 'Inhale Quietly...';
          if (counter) counter.textContent = `${4 - step}`;
        } else if (step < 11) {
          if (circle) circle.className = 'breathing-circle hold';
          if (text) text.textContent = 'Hold Gently...';
          if (counter) counter.textContent = `${11 - step}`;
        } else {
          if (circle) circle.className = 'breathing-circle exhale';
          if (text) text.textContent = 'Long Slow Exhale...';
          if (counter) counter.textContent = `${19 - step}`;
        }
      }

      seconds++;
      if (seconds === 32 && window.App && window.App.addGardenPoints) {
        window.App.addGardenPoints(15, 'Calming Breathing Session!');
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
    if (counter) counter.textContent = '4';
  }

  function updateBreathingBtnUI(active) {
    const btn = document.getElementById('btn-toggle-breathing');
    if (!btn) return;
    btn.textContent = active ? '⏹ Pause Breathing' : '▶ Start Breathing';
    btn.classList.toggle('btn-primary', !active);
    btn.classList.toggle('btn-secondary', active);
  }

  // --- INTERACTIVE 5-4-3-2-1 GROUNDING ---
  function renderGroundingStep() {
    const box = document.getElementById('wellness-grounding-box');
    if (!box) return;
    const item = groundingPrompts[groundingStep];
    box.innerHTML = `
      <div style="font-size: 17px; font-weight: 700; color: var(--accent-blue); margin-bottom: 6px;">${item.sense}</div>
      <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 14px;">${item.prompt}</p>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size: 12px; color: var(--text-muted);">Step ${groundingStep + 1} of 5</span>
        <button type="button" class="btn btn-sm btn-primary" onclick="Wellness.nextGroundingStep()">
          ${groundingStep === 4 ? '✓ Complete Grounding' : 'Next Sense →'}
        </button>
      </div>
    `;
  }

  function nextGroundingStep() {
    if (groundingStep === 4) {
      groundingStep = 0;
      if (window.App && window.App.addGardenPoints) window.App.addGardenPoints(10, '5-4-3-2-1 Grounding Complete!');
    } else {
      groundingStep++;
    }
    renderGroundingStep();
  }

  // --- BREAK REMINDERS ---
  function startBreakReminder() {
    const select = document.getElementById('wellness-break-interval');
    const mins = select ? parseInt(select.value, 10) : 20;
    clearInterval(breakInterval);
    breakSecondsLeft = mins * 60;
    isBreakTimerRunning = true;
    updateBreakCountdownUI();

    breakInterval = setInterval(() => {
      if (breakSecondsLeft > 0) {
        breakSecondsLeft--;
        updateBreakCountdownUI();
      } else {
        clearInterval(breakInterval);
        isBreakTimerRunning = false;
        if (window.Accessibility) window.Accessibility.playSound('chime');
        if (window.App && window.App.showToast) {
          window.App.showToast('💧 Break Time! Look away from the screen, stretch, and sip water.');
        }
        updateBreakCountdownUI();
      }
    }, 1000);

    if (window.App && window.App.showToast) window.App.showToast(`Break reminder set for ${mins} mins.`);
  }

  function stopBreakReminder() {
    clearInterval(breakInterval);
    isBreakTimerRunning = false;
    breakSecondsLeft = 0;
    updateBreakCountdownUI();
  }

  function updateBreakCountdownUI() {
    const el = document.getElementById('wellness-break-countdown');
    if (!el) return;
    if (!isBreakTimerRunning && breakSecondsLeft === 0) {
      el.textContent = 'No break timer active';
      return;
    }
    const m = Math.floor(breakSecondsLeft / 60);
    const s = breakSecondsLeft % 60;
    el.textContent = `Next gentle break in ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // --- SLEEP & DAILY ROUTINE TRACKER ---
  function toggleSleepChecklistItem(id) {
    const item = sleepChecklist.find(i => i.id === id);
    if (item) {
      item.done = !item.done;
      saveData();
      renderSleepChecklist();
    }
  }

  function renderSleepChecklist() {
    const container = document.getElementById('wellness-sleep-checklist');
    if (!container) return;
    container.innerHTML = sleepChecklist.map(item => `
      <label style="display:flex; align-items:center; gap:10px; padding:8px 10px; background:var(--bg-card-subtle); border-radius:var(--radius-sm); margin-bottom:6px; cursor:pointer; font-size:13.5px;">
        <input type="checkbox" ${item.done ? 'checked' : ''} onchange="Wellness.toggleSleepChecklistItem('${item.id}')" style="width:17px; height:17px; accent-color:var(--accent-lavender);">
        <span style="${item.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${escapeHtml(item.text)}</span>
      </label>
    `).join('');
  }

  function logSleepEntry(bed, wake, quality) {
    if (!bed || !wake) return;
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins <= 0) mins += 24 * 60;
    const hours = (mins / 60).toFixed(1);

    sleepLogs.unshift({
      id: Date.now(),
      bed,
      wake,
      hours,
      quality: quality || 'Restful',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
    if (sleepLogs.length > 10) sleepLogs.pop();
    saveData();
    renderSleepLogs();
    if (window.App && window.App.addGardenPoints) window.App.addGardenPoints(10, 'Sleep Log Recorded!');
  }

  function deleteSleepLog(id) {
    if (!window.confirm('Delete this sleep log entry?')) return;
    sleepLogs = sleepLogs.filter(s => s.id !== id);
    saveData();
    renderSleepLogs();
  }

  function renderSleepLogs() {
    const container = document.getElementById('wellness-sleep-logs');
    if (!container) return;
    if (!sleepLogs.length) {
      container.innerHTML = `<div class="empty-state-box">No sleep logs yet.</div>`;
      return;
    }
    container.innerHTML = sleepLogs.slice(0, 4).map(s => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--bg-card-subtle); border-radius:var(--radius-sm); margin-bottom:6px; font-size:13px;">
        <div>
          <strong>🌙 ${s.hours} hrs</strong> (${escapeHtml(s.bed)} → ${escapeHtml(s.wake)})
          <span class="badge badge-lavender" style="margin-left:6px;">${escapeHtml(s.quality)}</span>
        </div>
        <div class="item-actions">
          <span style="font-size:11px; color:var(--text-muted);">${escapeHtml(s.date)}</span>
          <button type="button" class="btn btn-sm btn-secondary" onclick="Wellness.deleteSleepLog(${s.id})">✕</button>
        </div>
      </div>
    `).join('');
  }

  // --- AFFIRMATIONS ---
  function renderAffirmation() {
    const textEl = document.getElementById('affirmation-quote-text');
    if (!textEl) return;
    currentAffirmationText = affirmations[Math.floor(Math.random() * affirmations.length)];
    textEl.textContent = `"${currentAffirmationText}"`;
  }

  function addCustomAffirmation(text) {
    if (!text || !text.trim()) return;
    affirmations.unshift(text.trim());
    try {
      localStorage.setItem(STORAGE_KEY_AFFIRMATIONS, JSON.stringify(affirmations.slice(0, 20)));
    } catch (e) {}
    currentAffirmationText = text.trim();
    const textEl = document.getElementById('affirmation-quote-text');
    if (textEl) textEl.textContent = `"${currentAffirmationText}"`;
    if (window.App && window.App.showToast) window.App.showToast('Custom affirmation saved!');
  }

  // --- WEB AUDIO AMBIENT SOUND SYNTHESIZER ---
  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      ambientNodes.masterGain = audioCtx.createGain();
      ambientNodes.masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      ambientNodes.masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
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

    if (trackName === 'rain') startRainSynth();
    else if (trackName === 'ocean') startOceanSynth();
    else if (trackName === 'binaural') startBinauralSynth();
    else if (trackName === 'pink') startPinkNoiseSynth();
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

  function startRainSynth() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
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

  function startOceanSynth() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, audioCtx.currentTime);
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime);
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

  function startBinauralSynth() {
    const osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, audioCtx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(436, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ambientNodes.masterGain);
    ambientNodes.rainGain = gain;
    ambientNodes.chimeOsc = osc;
    osc.start();
    osc2.start();
  }

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
      btn.classList.toggle('active', btn.getAttribute('data-sound') === activeTrack);
    });
    const headerSoundBtn = document.getElementById('btn-header-sound');
    if (headerSoundBtn) headerSoundBtn.classList.toggle('active', Boolean(activeTrack));
  }

  function bindEvents() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectMood(e.currentTarget.getAttribute('data-emoji'), e.currentTarget.getAttribute('data-label'));
      });
    });

    const moodSaveBtn = document.getElementById('btn-save-mood');
    if (moodSaveBtn) moodSaveBtn.addEventListener('click', saveCurrentMood);

    const journalSaveBtn = document.getElementById('btn-save-journal');
    if (journalSaveBtn) journalSaveBtn.addEventListener('click', saveJournalEntry);

    const breathBtn = document.getElementById('btn-toggle-breathing');
    if (breathBtn) {
      breathBtn.addEventListener('click', () => {
        if (isBreathingActive) stopBreathing();
        else startBreathing();
      });
    }

    const breathPatternSelect = document.getElementById('breathing-pattern-select');
    if (breathPatternSelect) {
      breathPatternSelect.addEventListener('change', (e) => setBreathingPattern(e.target.value));
    }

    const affirmBtn = document.getElementById('btn-new-affirmation');
    if (affirmBtn) affirmBtn.addEventListener('click', renderAffirmation);

    const customAffirmForm = document.getElementById('wellness-affirm-form');
    if (customAffirmForm) {
      customAffirmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('wellness-affirm-input');
        if (input && input.value.trim()) {
          addCustomAffirmation(input.value);
          input.value = '';
        }
      });
    }

    document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => toggleAmbientTrack(e.currentTarget.getAttribute('data-sound')));
    });

    const startBreakBtn = document.getElementById('btn-start-break-reminder');
    if (startBreakBtn) startBreakBtn.addEventListener('click', startBreakReminder);

    const stopBreakBtn = document.getElementById('btn-stop-break-reminder');
    if (stopBreakBtn) stopBreakBtn.addEventListener('click', stopBreakReminder);

    const sleepForm = document.getElementById('wellness-sleep-form');
    if (sleepForm) {
      sleepForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const bed = document.getElementById('sleep-bed-input').value;
        const wake = document.getElementById('sleep-wake-input').value;
        const qual = document.getElementById('sleep-quality-select').value;
        logSleepEntry(bed, wake, qual);
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
    selectMood,
    saveCurrentMood,
    deleteMoodEntry,
    saveJournalEntry,
    editJournalEntry,
    deleteJournalEntry,
    startBreathing,
    stopBreathing,
    nextGroundingStep,
    renderAffirmation,
    toggleAmbientTrack,
    toggleSleepChecklistItem,
    deleteSleepLog,
    getMoodHistory: () => [...moodHistory],
    getJournalCount: () => journalEntries.length
  };
})();
