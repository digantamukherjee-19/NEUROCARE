/**
 * NeuroCare - Autism & Sensory Support Module
 * Features:
 * - Customizable Routine Builder (add, edit, delete with confirmation, complete)
 * - Sensory Preferences (low-stim, reduced motion, brightness/contrast comfort)
 * - Interactive Emotion Identification Cards with body sensation guides
 * - Express Without Words AAC Board (plus add/delete custom tiles)
 * - Interactive Step-by-Step Social Stories
 * - Quiet Sensory Break Timer
 */

var Sensory = window.Sensory = (function () {
  'use strict';

  const STORAGE_KEY_ROUTINE = 'neurocare_sensory_routine';
  const STORAGE_KEY_AAC = 'neurocare_sensory_custom_aac';
  const STORAGE_KEY_PREFS = 'neurocare_sensory_prefs';

  let routines = [];
  let customAacCards = [];
  let prefs = {
    screenDimLevel: 100 // 70% to 100% brightness comfort
  };

  const defaultRoutines = [
    { id: 1, time: '08:00 AM', icon: '🌅', title: 'Gentle Wake Up & Hydrate', done: true },
    { id: 2, time: '09:30 AM', icon: '💻', title: 'Study / Work Focus Block 1', done: false },
    { id: 3, time: '11:30 AM', icon: '🎧', title: 'Sensory Reset & Quiet Rest', done: false },
    { id: 4, time: '01:00 PM', icon: '🥗', title: 'Nourishing Lunch & Outdoor Walk', done: false },
    { id: 5, time: '08:30 PM', icon: '🌙', title: 'Evening Dim Lighting & Wind Down', done: false }
  ];

  const defaultAacCards = [
    { id: 'aac-1', emoji: '🤫', label: 'Need Quiet Break', speak: 'I need a quiet break please', custom: false },
    { id: 'aac-2', emoji: '🌊', label: 'Feeling Overwhelmed', speak: 'I am feeling overwhelmed right now', custom: false },
    { id: 'aac-3', emoji: '👍', label: 'Yes / Agree', speak: 'Yes, I agree', custom: false },
    { id: 'aac-4', emoji: '✋', label: 'No / Not Now', speak: 'No, not right now thank you', custom: false },
    { id: 'aac-5', emoji: '💧', label: 'Need Water', speak: 'Could I please have a glass of water?', custom: false },
    { id: 'aac-6', emoji: '🤝', label: 'Need Help', speak: 'I need a little help with this', custom: false },
    { id: 'aac-7', emoji: '📢', label: 'Too Loud', speak: 'It is too loud here', custom: false },
    { id: 'aac-8', emoji: '🚶', label: 'Please Give Space', speak: 'Please give me some physical space', custom: false }
  ];

  const emotionCatalog = [
    {
      id: 'calm',
      emoji: '😌',
      name: 'Calm & Regulated',
      body: 'Relaxed shoulders, steady breathing, clear thinking.',
      tip: 'Enjoy this peaceful baseline. Note what helped you feel balanced today.'
    },
    {
      id: 'anxious',
      emoji: '😟',
      name: 'Anxious / Tense',
      body: 'Fluttery stomach, racing thoughts, fast heartbeat, fidgeting hands.',
      tip: 'Try 4-4-4-4 box breathing, cold water on wrists, or checking your visual schedule.'
    },
    {
      id: 'overwhelmed',
      emoji: '🌊',
      name: 'Sensory Overload',
      body: 'Ears hurt from noise, eyes tired from bright lights, urge to cover face.',
      tip: 'Switch on Low-Stimulation mode, put on headphones, and start a 5-min Sensory Break Timer.'
    },
    {
      id: 'frustrated',
      emoji: '😠',
      name: 'Frustrated',
      body: 'Clenched jaw, tight fists, hot cheeks, stuck on an unexpected change.',
      tip: 'Pause speaking if hard. Use an AAC card to ask for space, and stretch your arms firmly.'
    },
    {
      id: 'fatigued',
      emoji: '🔋',
      name: 'Low Battery / Shutdown',
      body: 'Heavy shoulders, zoning out, words feel exhausting to form.',
      tip: 'Honor your energy limit. Reduce demands, dim screen brightness, and rest quietly.'
    },
    {
      id: 'happy',
      emoji: '✨',
      name: 'Excited / Joyful',
      body: 'Warm chest, smiling, energized, eager to share or stim happily!',
      tip: 'Celebrate your special interests and share your joy safely!'
    }
  ];

  const socialStories = {
    change: {
      title: 'Navigating Unexpected Schedule Changes',
      steps: [
        '1. Sometimes, plans change suddenly. A class might move or an appointment may run late. It is normal to feel startled.',
        '2. When this happens, I can pause for three slow breaths before reacting.',
        '3. Change does not mean danger. I can look at my routine list or ask politely: "What is the new plan?"',
        '4. After adjusting, I can reward myself with a 5-minute sensory comfort break.'
      ]
    },
    crowded: {
      title: 'Handling a Loud or Crowded Space',
      steps: [
        '1. Cafeterias, stores, and hallways can have bright lights and overlapping voices.',
        '2. I am allowed to protect my senses by wearing headphones, tinted glasses, or holding a fidget stone.',
        '3. If my sensory bucket gets full, I can step out into a quieter hallway or ask for a brief break.',
        '4. Using a short phrase or AAC card like "Need Quiet Break" helps others support me quickly.'
      ]
    },
    clarify: {
      title: 'Asking for Clear Instructions',
      steps: [
        '1. Spoken instructions can move very fast and feel hard to remember.',
        '2. It is smart and responsible to ask for clarification when directions feel vague.',
        '3. I can say or message: "Could you please write down the main steps or show an example?"',
        '4. Breaking instructions into numbered steps helps me do my best work confidently.'
      ]
    }
  };

  let activeStoryKey = 'change';
  let activeStoryStep = 0;

  // Sensory Break Timer
  let breakTimerInterval = null;
  let breakSecondsLeft = 300;
  let breakTotalSeconds = 300;
  let isBreakRunning = false;

  function init() {
    loadData();
    renderRoutines();
    renderAacBoard();
    renderEmotionCards();
    selectEmotion('calm');
    renderSocialStory();
    applySensoryVisualPrefs();
    updateBreakTimerUI();
    bindEvents();
  }

  function loadData() {
    try {
      const savedR = localStorage.getItem(STORAGE_KEY_ROUTINE);
      routines = savedR ? JSON.parse(savedR) : [...defaultRoutines];

      const savedAac = localStorage.getItem(STORAGE_KEY_AAC);
      customAacCards = savedAac ? JSON.parse(savedAac) : [];

      const savedP = localStorage.getItem(STORAGE_KEY_PREFS);
      if (savedP) prefs = { ...prefs, ...JSON.parse(savedP) };
    } catch (e) {
      routines = [...defaultRoutines];
      customAacCards = [];
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY_ROUTINE, JSON.stringify(routines));
      localStorage.setItem(STORAGE_KEY_AAC, JSON.stringify(customAacCards));
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Could not save sensory data', e);
    }
  }

  // --- CUSTOMIZABLE ROUTINE BUILDER ---
  function addRoutineStep(time, title, icon = '🧩') {
    if (!title || !title.trim()) return;
    routines.push({
      id: Date.now(),
      time: time || 'Anytime',
      icon: icon || '🧩',
      title: title.trim(),
      done: false
    });
    saveData();
    renderRoutines();
    if (window.App && window.App.showToast) window.App.showToast('Routine step added!');
  }

  function toggleRoutineStep(id) {
    const item = routines.find(r => r.id === id);
    if (item) {
      item.done = !item.done;
      if (item.done && window.App && window.App.addGardenPoints) {
        window.App.addGardenPoints(5, 'Routine Step Complete!');
      }
      saveData();
      renderRoutines();
    }
  }

  function editRoutineStep(id) {
    const item = routines.find(r => r.id === id);
    if (!item) return;
    const newTitle = window.prompt('Edit routine step title:', item.title);
    if (newTitle !== null && newTitle.trim()) {
      item.title = newTitle.trim();
      saveData();
      renderRoutines();
      if (window.App && window.App.showToast) window.App.showToast('Routine step updated.');
    }
  }

  function deleteRoutineStep(id) {
    if (!window.confirm('Delete this routine step from your visual schedule?')) return;
    routines = routines.filter(r => r.id !== id);
    saveData();
    renderRoutines();
    if (window.App && window.App.showToast) window.App.showToast('Routine step deleted.');
  }

  function renderRoutines() {
    const container = document.getElementById('sensory-routine-list');
    if (!container) return;

    if (!routines.length) {
      container.innerHTML = `<div class="empty-state-box">No schedule blocks yet. Use the Routine Builder above to add your first block!</div>`;
      return;
    }

    container.innerHTML = routines.map(item => `
      <div class="schedule-block ${item.done ? 'completed' : ''}">
        <input type="checkbox" ${item.done ? 'checked' : ''} onchange="Sensory.toggleRoutineStep(${item.id})" aria-label="Mark routine ${escapeHtml(item.title)} complete" style="width:18px; height:18px; accent-color:var(--accent-mint); cursor:pointer;">
        <span class="schedule-time">${escapeHtml(item.time)}</span>
        <span class="schedule-icon">${item.icon}</span>
        <span class="schedule-title">${escapeHtml(item.title)}</span>
        <div class="item-actions">
          <button type="button" class="btn btn-sm btn-secondary" onclick="Sensory.editRoutineStep(${item.id})" title="Edit step">✏️</button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="Sensory.deleteRoutineStep(${item.id})" title="Delete step">✕</button>
        </div>
      </div>
    `).join('');
  }

  // --- EXPRESS WITHOUT WORDS AAC BOARD ---
  function renderAacBoard() {
    const grid = document.getElementById('sensory-aac-grid');
    if (!grid) return;

    const allCards = [...defaultAacCards, ...customAacCards];
    grid.innerHTML = allCards.map(card => `
      <div class="aac-card" role="button" tabindex="0" onclick="Sensory.speakAac('${escapeHtml(card.speak)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();Sensory.speakAac('${escapeHtml(card.speak)}');}">
        <span class="aac-emoji">${card.emoji}</span>
        <span class="aac-text">${escapeHtml(card.label)}</span>
        ${card.custom ? `<button type="button" class="btn btn-sm btn-secondary" style="margin-top:4px; font-size:11px;" onclick="event.stopPropagation(); Sensory.deleteCustomAac('${card.id}')">Remove</button>` : ''}
      </div>
    `).join('');
  }

  function speakAac(phrase) {
    if (window.App && window.App.speakAacMessage) {
      window.App.speakAacMessage(phrase);
    }
  }

  function addCustomAac(label, speakText, emoji = '💬') {
    if (!label || !label.trim()) return;
    customAacCards.push({
      id: 'aac-' + Date.now(),
      emoji: emoji || '💬',
      label: label.trim(),
      speak: (speakText && speakText.trim()) ? speakText.trim() : label.trim(),
      custom: true
    });
    saveData();
    renderAacBoard();
    if (window.App && window.App.showToast) window.App.showToast('Custom AAC communication card added!');
  }

  function deleteCustomAac(id) {
    if (!window.confirm('Remove this custom communication card?')) return;
    customAacCards = customAacCards.filter(c => c.id !== id);
    saveData();
    renderAacBoard();
  }

  // --- EMOTION IDENTIFICATION CARDS ---
  function renderEmotionCards() {
    const grid = document.getElementById('sensory-emotion-grid');
    if (!grid) return;
    grid.innerHTML = emotionCatalog.map(em => `
      <button type="button" class="emotion-id-card" id="emotion-card-${em.id}" onclick="Sensory.selectEmotion('${em.id}')">
        <div style="font-size: 28px; margin-bottom: 4px;">${em.emoji}</div>
        <div style="font-size: 12.5px; font-weight: 700;">${escapeHtml(em.name)}</div>
      </button>
    `).join('');
  }

  function selectEmotion(id) {
    const em = emotionCatalog.find(e => e.id === id) || emotionCatalog[0];
    document.querySelectorAll('.emotion-id-card').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`emotion-card-${em.id}`);
    if (activeEl) activeEl.classList.add('active');

    const detailBox = document.getElementById('sensory-emotion-detail');
    if (detailBox) {
      detailBox.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <span style="font-size: 28px;">${em.emoji}</span>
          <strong style="font-size: 16px;">${escapeHtml(em.name)}</strong>
        </div>
        <div style="font-size: 13.5px; margin-bottom: 6px;"><strong>Body Clues:</strong> ${escapeHtml(em.body)}</div>
        <div style="font-size: 13.5px; color: var(--accent-blue);"><strong>Helpful Action:</strong> ${escapeHtml(em.tip)}</div>
      `;
    }
  }

  // --- INTERACTIVE SOCIAL STORIES ---
  function selectSocialStory(key) {
    activeStoryKey = key;
    activeStoryStep = 0;
    renderSocialStory();
  }

  function nextStoryStep() {
    const story = socialStories[activeStoryKey];
    activeStoryStep = (activeStoryStep + 1) % story.steps.length;
    renderSocialStory();
  }

  function prevStoryStep() {
    const story = socialStories[activeStoryKey];
    activeStoryStep = (activeStoryStep - 1 + story.steps.length) % story.steps.length;
    renderSocialStory();
  }

  function renderSocialStory() {
    const box = document.getElementById('sensory-social-story-box');
    if (!box) return;
    const story = socialStories[activeStoryKey];
    box.innerHTML = `
      <h4 style="font-size: 16px; margin-bottom: 10px; color: var(--accent-lavender);">${escapeHtml(story.title)}</h4>
      <div style="background: var(--bg-card-subtle); padding: 18px; border-radius: var(--radius-md); border-left: 4px solid var(--accent-lavender); font-size: 15px; line-height: 1.7; min-height: 95px;">
        ${escapeHtml(story.steps[activeStoryStep])}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 12px;">
        <button type="button" class="btn btn-sm btn-secondary" onclick="Sensory.prevStoryStep()">← Back</button>
        <span style="font-size: 12px; color: var(--text-muted);">Page ${activeStoryStep + 1} of ${story.steps.length}</span>
        <button type="button" class="btn btn-sm btn-primary" onclick="Sensory.nextStoryStep()">Next →</button>
      </div>
    `;
  }

  // --- QUIET SENSORY BREAK TIMER ---
  function setBreakDuration(minutes) {
    stopBreakTimer();
    breakTotalSeconds = minutes * 60;
    breakSecondsLeft = breakTotalSeconds;
    updateBreakTimerUI();
  }

  function startBreakTimer() {
    if (isBreakRunning) return;
    isBreakRunning = true;
    breakTimerInterval = setInterval(() => {
      if (breakSecondsLeft > 0) {
        breakSecondsLeft--;
        updateBreakTimerUI();
      } else {
        stopBreakTimer();
        breakSecondsLeft = breakTotalSeconds;
        updateBreakTimerUI();
        if (window.Accessibility) window.Accessibility.playSound('chime');
        if (window.App && window.App.addGardenPoints) window.App.addGardenPoints(10, 'Sensory Break Complete!');
      }
    }, 1000);
  }

  function stopBreakTimer() {
    isBreakRunning = false;
    clearInterval(breakTimerInterval);
  }

  function resetBreakTimer() {
    stopBreakTimer();
    breakSecondsLeft = breakTotalSeconds;
    updateBreakTimerUI();
  }

  function updateBreakTimerUI() {
    const el = document.getElementById('sensory-break-timer-display');
    const bar = document.getElementById('sensory-break-progress-bar');
    const m = Math.floor(breakSecondsLeft / 60);
    const s = breakSecondsLeft % 60;
    if (el) el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (bar) {
      const pct = Math.round(((breakTotalSeconds - breakSecondsLeft) / breakTotalSeconds) * 100);
      bar.style.width = `${pct}%`;
    }
  }

  // --- SENSORY VISUAL BRIGHTNESS COMFORT ---
  function applySensoryVisualPrefs() {
    document.documentElement.style.filter = prefs.screenDimLevel < 100 ? `brightness(${prefs.screenDimLevel}%)` : '';
    const slider = document.getElementById('sensory-dimmer-slider');
    const valEl = document.getElementById('sensory-dimmer-val');
    if (slider) slider.value = prefs.screenDimLevel;
    if (valEl) valEl.textContent = `${prefs.screenDimLevel}%`;
  }

  function bindEvents() {
    const routineForm = document.getElementById('sensory-routine-form');
    if (routineForm) {
      routineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const time = document.getElementById('routine-time-input').value;
        const icon = document.getElementById('routine-icon-select').value;
        const title = document.getElementById('routine-title-input').value;
        if (title.trim()) {
          addRoutineStep(time, title, icon);
          document.getElementById('routine-title-input').value = '';
        }
      });
    }

    const aacForm = document.getElementById('sensory-aac-form');
    if (aacForm) {
      aacForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emoji = document.getElementById('aac-custom-emoji').value;
        const label = document.getElementById('aac-custom-label').value;
        if (label.trim()) {
          addCustomAac(label, label, emoji);
          document.getElementById('aac-custom-label').value = '';
        }
      });
    }

    const storySelect = document.getElementById('sensory-story-select');
    if (storySelect) {
      storySelect.addEventListener('change', (e) => selectSocialStory(e.target.value));
    }

    const dimmerSlider = document.getElementById('sensory-dimmer-slider');
    if (dimmerSlider) {
      dimmerSlider.addEventListener('input', (e) => {
        prefs.screenDimLevel = parseInt(e.target.value, 10);
        saveData();
        applySensoryVisualPrefs();
      });
    }

    const lowStimToggle = document.getElementById('sensory-low-stim-toggle');
    if (lowStimToggle && window.Accessibility) {
      lowStimToggle.checked = window.Accessibility.getState().theme === 'low-stim';
      lowStimToggle.addEventListener('change', (e) => {
        window.Accessibility.applyTheme(e.target.checked ? 'low-stim' : 'default');
      });
    }

    const motionToggle = document.getElementById('sensory-reduce-motion-toggle');
    if (motionToggle && window.Accessibility) {
      motionToggle.checked = window.Accessibility.getState().reduceMotion;
      motionToggle.addEventListener('change', (e) => {
        window.Accessibility.applyReduceMotion(e.target.checked);
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
    toggleRoutineStep,
    editRoutineStep,
    deleteRoutineStep,
    speakAac,
    deleteCustomAac,
    selectEmotion,
    nextStoryStep,
    prevStoryStep,
    setBreakDuration,
    startBreakTimer,
    stopBreakTimer,
    resetBreakTimer
  };
})();
