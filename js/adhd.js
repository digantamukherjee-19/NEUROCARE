/**
 * NeuroCare - ADHD Support Module
 * Features: To-Do list, Pomodoro timer, Break-It-Down engine, Assignment tracker,
 * Schedule, Reminders, Progress bar, and Achievement Badges.
 */

const ADHD = (function () {
  'use strict';

  const STORAGE_KEY_TASKS = 'neurocare_adhd_tasks';
  const STORAGE_KEY_ASSIGNMENTS = 'neurocare_adhd_assignments';
  const STORAGE_KEY_BADGES = 'neurocare_adhd_badges';
  const STORAGE_KEY_STATS = 'neurocare_adhd_stats';

  // State
  let tasks = [];
  let assignments = [];
  let badges = {
    first_step: false,      // Completed 1 task
    focus_master: false,    // Completed 1 Pomodoro session
    task_crusher: false,    // Completed 5 tasks
    streak_starter: false,  // Logged in 2 consecutive days
    breakdown_hero: false,  // Used Break It Down tool
    garden_sprout: false    // Grew first plant stage
  };

  let stats = {
    pomodorosCompleted: 0,
    tasksCompletedTotal: 0,
    minutesFocused: 0
  };

  // Pomodoro Timer State
  let timerInterval = null;
  let timerMode = 'focus'; // 'focus' (25), 'short' (5), 'long' (15)
  let timerSecondsLeft = 25 * 60;
  let timerTotalSeconds = 25 * 60;
  let isTimerRunning = false;

  // Predefined Task Breakdown Database for the "Break It Down" Innovative Feature
  const breakdownTemplates = {
    'clean': [
      { step: 'Put on an upbeat playlist or podcast', time: '2 mins' },
      { step: 'Pick up all clothing from the floor and place in basket', time: '5 mins' },
      { step: 'Clear cups, plates, and trash off your desk/table', time: '5 mins' },
      { step: 'Make your bed (simply pull up the duvet/sheets)', time: '3 mins' },
      { step: 'Celebrate: You completed your bedroom reset!', time: '1 min' }
    ],
    'study': [
      { step: 'Gather your notes, textbook, and a glass of water', time: '3 mins' },
      { step: 'Pick just ONE topic or chapter (not everything at once)', time: '2 mins' },
      { step: 'Set a 15-minute timer and read key headings & summaries', time: '15 mins' },
      { step: 'Write down 3 main questions or flashcard prompts', time: '5 mins' },
      { step: 'Take a 5-minute stretch or sensory break', time: '5 mins' }
    ],
    'essay': [
      { step: 'Open a blank document and write down the prompt at the top', time: '3 mins' },
      { step: 'Bullet point 3 rough thoughts or ideas (no spelling worries)', time: '7 mins' },
      { step: 'Turn each bullet point into 2 explanatory sentences', time: '10 mins' },
      { step: 'Write an introductory sentence introducing the main idea', time: '5 mins' },
      { step: 'Save file and step away for a quick brain break', time: '2 mins' }
    ],
    'email': [
      { step: 'Identify the one main question or answer needed', time: '2 mins' },
      { step: 'Write a friendly 1-line greeting and the core request', time: '3 mins' },
      { step: 'Add closing thanks and your name', time: '1 min' },
      { step: 'Double check the recipient address and hit send!', time: '1 min' }
    ],
    'laundry': [
      { step: 'Gather clothes into darks and lights', time: '4 mins' },
      { step: 'Put one load in the washer, add detergent, press start', time: '3 mins' },
      { step: 'Set an alarm on your phone for when the cycle finishes', time: '1 min' },
      { step: 'When dry, fold just 5 items or hang up shirts', time: '5 mins' }
    ],
    'project': [
      { step: 'Define the final outcome in one clear sentence', time: '3 mins' },
      { step: 'List 3 resources or links needed to start', time: '5 mins' },
      { step: 'Create the project folder/workspace on your computer', time: '3 mins' },
      { step: 'Complete the very first smallest action item', time: '15 mins' }
    ]
  };

  const motivationalQuotes = [
    "Your brain is built for creativity and exploration. Take it one micro-step at a time.",
    "Progress isn't all-or-nothing. A 1% effort still counts as moving forward.",
    "Starting is the hardest part. Just aim for 2 minutes of focus.",
    "Hyperfocus is a superpower when directed with care. Be gentle with your attention.",
    "Done is better than perfect. Celebrate every finished checkmark!",
    "It's okay to take sensory pauses. Resting is part of working."
  ];

  function init() {
    loadData();
    renderTasks();
    renderAssignments();
    renderBadges();
    updateProgressBar();
    renderRandomQuote();
    initTimer();
    bindEvents();
  }

  function loadData() {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      if (savedTasks) {
        tasks = JSON.parse(savedTasks);
      } else {
        // Default starter ADHD friendly tasks
        tasks = [
          { id: 1, text: 'Drink a glass of cold water', priority: 'low', completed: true, timestamp: Date.now() - 3600000 },
          { id: 2, text: 'Complete a 5-minute desk declutter', priority: 'med', completed: false, timestamp: Date.now() - 1800000 },
          { id: 3, text: 'Do 1 Pomodoro focus session on science notes', priority: 'high', completed: false, timestamp: Date.now() }
        ];
      }

      const savedAssignments = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      if (savedAssignments) {
        assignments = JSON.parse(savedAssignments);
      } else {
        assignments = [
          { id: 1, title: 'Biology: Cell Structure Diagram', due: 'Tomorrow', status: 'In Progress' },
          { id: 2, title: 'English: Creative Writing Paragraph', due: 'Friday', status: 'Not Started' }
        ];
      }

      const savedBadges = localStorage.getItem(STORAGE_KEY_BADGES);
      if (savedBadges) badges = { ...badges, ...JSON.parse(savedBadges) };

      const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
      if (savedStats) stats = { ...stats, ...JSON.parse(savedStats) };
    } catch (e) {
      console.warn('Could not read ADHD data from storage', e);
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
      localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(badges));
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('Could not save ADHD data to storage', e);
    }
  }

  // --- TO-DO LIST MANAGEMENT ---
  function addTask(text, priority = 'med') {
    if (!text || !text.trim()) return;
    const newTask = {
      id: Date.now(),
      text: text.trim(),
      priority: priority,
      completed: false,
      timestamp: Date.now()
    };
    tasks.unshift(newTask);
    saveData();
    renderTasks();
    updateProgressBar();
    if (window.Accessibility) window.Accessibility.playSound('click');
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        stats.tasksCompletedTotal++;
        unlockBadge('first_step');
        if (stats.tasksCompletedTotal >= 5) unlockBadge('task_crusher');
        if (window.App && window.App.addGardenPoints) {
          window.App.addGardenPoints(10, 'Task Completed!');
        }
        if (window.Accessibility) window.Accessibility.playSound('chime');
      }
      saveData();
      renderTasks();
      updateProgressBar();
      renderDashboardSummary();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
    updateProgressBar();
    renderDashboardSummary();
  }

  function renderTasks() {
    const container = document.getElementById('adhd-todo-list');
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 24px; color: var(--text-muted);">
          <p>🌟 Your list is clear! Add a task above or use <strong>Break It Down</strong>.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tasks.map(task => `
      <div class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <input type="checkbox" class="todo-check" ${task.completed ? 'checked' : ''} onchange="ADHD.toggleTask(${task.id})" aria-label="Mark task complete">
        <span class="todo-text">${escapeHtml(task.text)}</span>
        <span class="todo-tag tag-${task.priority}">${task.priority.toUpperCase()}</span>
        <button class="btn btn-sm btn-secondary" onclick="ADHD.deleteTask(${task.id})" title="Delete task" aria-label="Delete task">✕</button>
      </div>
    `).join('');
  }

  function updateProgressBar() {
    const fill = document.getElementById('adhd-progress-fill');
    const label = document.getElementById('adhd-progress-label');
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (fill) fill.style.width = `${percent}%`;
    if (label) label.textContent = `${completed}/${total} tasks finished (${percent}%)`;

    // Also update dashboard stat if exists
    const dashDone = document.getElementById('dash-stat-tasks-done');
    if (dashDone) dashDone.textContent = `${completed}`;
  }

  // --- INNOVATIVE FEATURE A: BREAK IT DOWN ---
  function breakDownTask(rawInput) {
    if (!rawInput || !rawInput.trim()) return [];
    unlockBadge('breakdown_hero');
    const query = rawInput.toLowerCase();

    // Match keywords
    let matchedTemplate = null;
    for (const key of Object.keys(breakdownTemplates)) {
      if (query.includes(key)) {
        matchedTemplate = breakdownTemplates[key];
        break;
      }
    }

    // Default smart decomposition if no direct match
    if (!matchedTemplate) {
      matchedTemplate = [
        { step: `Gather materials or open apps needed for: "${rawInput}"`, time: '3 mins' },
        { step: `Clear your immediate desk space and take 3 deep breaths`, time: '2 mins' },
        { step: `Do the first 5 minutes of work on "${rawInput}" without judging progress`, time: '5 mins' },
        { step: `Evaluate what remains and draft the next tiny milestone`, time: '5 mins' },
        { step: `Reward yourself with a sensory water or stretch break`, time: '3 mins' }
      ];
    }

    return matchedTemplate;
  }

  function handleBreakDownSubmit() {
    const input = document.getElementById('break-it-down-input');
    const resultsContainer = document.getElementById('break-it-down-results');
    if (!input || !resultsContainer) return;

    const query = input.value.trim();
    if (!query) {
      alert('Please enter a task you want to break down.');
      return;
    }

    const steps = breakDownTask(query);
    resultsContainer.innerHTML = `
      <div style="margin-top: 16px;">
        <h4 style="font-size: 15px; margin-bottom: 8px;">Micro-Steps for: "<em>${escapeHtml(query)}</em>"</h4>
        <div class="break-steps-list">
          ${steps.map((s, idx) => `
            <div class="break-step-item">
              <div>
                <strong>Step ${idx + 1}:</strong> ${escapeHtml(s.step)}
                <span class="badge badge-peach" style="margin-left: 8px;">${s.time}</span>
              </div>
              <button class="btn btn-sm btn-primary" onclick="ADHD.addSingleStepToTasks('${escapeHtml(s.step)}')">+ Add to To-Do</button>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 14px; text-align: right;">
          <button class="btn btn-sm btn-accent" id="btn-add-all-breakdown-steps">Add All to My Tasks</button>
        </div>
      </div>
    `;

    const addAllBtn = document.getElementById('btn-add-all-breakdown-steps');
    if (addAllBtn) {
      addAllBtn.addEventListener('click', () => {
        steps.forEach(s => addTask(s.step, 'med'));
        alert('All steps have been added to your daily to-do list!');
        if (window.App && window.App.showToast) window.App.showToast('Micro-steps added to to-do list!');
      });
    }
  }

  function addSingleStepToTasks(stepText) {
    addTask(stepText, 'med');
    if (window.App && window.App.showToast) window.App.showToast('Step added to your tasks!');
  }

  // --- POMODORO FOCUS TIMER ---
  function initTimer() {
    updateTimerDisplay();
  }

  function setTimerMode(mode) {
    pauseTimer();
    timerMode = mode;
    if (mode === 'focus') timerTotalSeconds = 25 * 60;
    else if (mode === 'short') timerTotalSeconds = 5 * 60;
    else if (mode === 'long') timerTotalSeconds = 15 * 60;

    timerSecondsLeft = timerTotalSeconds;
    updateTimerDisplay();

    // Update active mode buttons
    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    updateTimerPlayBtnUI(true);

    timerInterval = setInterval(() => {
      if (timerSecondsLeft > 0) {
        timerSecondsLeft--;
        updateTimerDisplay();
      } else {
        timerFinished();
      }
    }, 1000);
  }

  function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    updateTimerPlayBtnUI(false);
  }

  function resetTimer() {
    pauseTimer();
    timerSecondsLeft = timerTotalSeconds;
    updateTimerDisplay();
  }

  function timerFinished() {
    pauseTimer();
    if (window.Accessibility) window.Accessibility.playSound('chime');

    if (timerMode === 'focus') {
      stats.pomodorosCompleted++;
      stats.minutesFocused += 25;
      unlockBadge('focus_master');
      if (window.App && window.App.addGardenPoints) {
        window.App.addGardenPoints(25, '25-minute Pomodoro Complete!');
      }
      alert('🎉 Fantastic focus session! Take a well-deserved 5-minute break.');
    } else {
      alert('Break is over! Ready for another light focus session?');
    }
    saveData();
    renderDashboardSummary();
  }

  function updateTimerDisplay() {
    const digits = document.getElementById('pomodoro-timer-digits');
    const circle = document.getElementById('pomodoro-progress-circle');

    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (digits) digits.textContent = formatted;

    if (circle) {
      // 2 * PI * r (r=110 => 691.15)
      const circumference = 691;
      const progress = 1 - (timerSecondsLeft / timerTotalSeconds);
      const offset = circumference * progress;
      circle.style.strokeDashoffset = offset;
    }
  }

  function updateTimerPlayBtnUI(running) {
    const btn = document.getElementById('btn-timer-toggle');
    if (!btn) return;
    btn.textContent = running ? '⏸ Pause' : '▶ Start Focus';
    btn.classList.toggle('btn-primary', !running);
    btn.classList.toggle('btn-secondary', running);
  }

  // --- ASSIGNMENT TRACKER ---
  function addAssignment(title, due, status = 'Not Started') {
    if (!title || !title.trim()) return;
    assignments.push({
      id: Date.now(),
      title: title.trim(),
      due: due || 'Next Week',
      status: status
    });
    saveData();
    renderAssignments();
  }

  function deleteAssignment(id) {
    assignments = assignments.filter(a => a.id !== id);
    saveData();
    renderAssignments();
  }

  function renderAssignments() {
    const list = document.getElementById('adhd-assignment-list');
    if (!list) return;

    if (assignments.length === 0) {
      list.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">No upcoming assignments. Enjoy your peace of mind!</p>`;
      return;
    }

    list.innerHTML = assignments.map(a => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); margin-bottom: 8px; border: 1px solid var(--border-light);">
        <div>
          <strong style="font-size: 14px;">${escapeHtml(a.title)}</strong>
          <div style="font-size: 12px; color: var(--text-muted);">Due: ${escapeHtml(a.due)} • <span class="badge badge-blue">${escapeHtml(a.status)}</span></div>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="ADHD.deleteAssignment(${a.id})" aria-label="Remove assignment">✕</button>
      </div>
    `).join('');
  }

  // --- BADGES SYSTEM ---
  function unlockBadge(key) {
    if (!badges[key]) {
      badges[key] = true;
      saveData();
      renderBadges();
      if (window.App && window.App.showToast) {
        window.App.showToast(`🏆 Badge Unlocked: ${getBadgeName(key)}!`);
      }
    }
  }

  function getBadgeName(key) {
    const names = {
      first_step: 'First Step',
      focus_master: 'Focus Master',
      task_crusher: 'Task Crusher',
      streak_starter: 'Streak Starter',
      breakdown_hero: 'Task Decomposer',
      garden_sprout: 'Green Thumb'
    };
    return names[key] || 'Achievement';
  }

  function renderBadges() {
    const container = document.getElementById('adhd-badges-container');
    if (!container) return;

    const badgeDefs = [
      { key: 'first_step', icon: '🌱', name: 'First Step', desc: 'Finished your first task' },
      { key: 'focus_master', icon: '⏱️', name: 'Focus Master', desc: 'Completed a 25-min Pomodoro' },
      { key: 'task_crusher', icon: '⚡', name: 'Task Crusher', desc: 'Completed 5 tasks' },
      { key: 'breakdown_hero', icon: '🧩', name: 'Task Decomposer', desc: 'Broke down a complex task' }
    ];

    container.innerHTML = badgeDefs.map(b => `
      <div class="badge-item ${badges[b.key] ? 'unlocked' : ''}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
        <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${b.desc}</div>
      </div>
    `).join('');
  }

  function renderRandomQuote() {
    const el = document.getElementById('adhd-motivational-quote');
    if (!el) return;
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    el.textContent = `"${randomQuote}"`;
  }

  function renderDashboardSummary() {
    const dashFocusMins = document.getElementById('dash-stat-focus-time');
    if (dashFocusMins) dashFocusMins.textContent = `${stats.minutesFocused}m`;
  }

  function bindEvents() {
    // Add task form
    const todoForm = document.getElementById('adhd-todo-form');
    if (todoForm) {
      todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('adhd-todo-input');
        const prio = document.getElementById('adhd-todo-priority');
        if (input && input.value) {
          addTask(input.value, prio ? prio.value : 'med');
          input.value = '';
        }
      });
    }

    // Break it down button
    const breakdownBtn = document.getElementById('btn-run-breakdown');
    if (breakdownBtn) {
      breakdownBtn.addEventListener('click', handleBreakDownSubmit);
    }

    // Pomodoro controls
    const toggleBtn = document.getElementById('btn-timer-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (isTimerRunning) pauseTimer();
        else startTimer();
      });
    }

    const resetBtn = document.getElementById('btn-timer-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetTimer);
    }

    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.getAttribute('data-mode');
        setTimerMode(mode);
      });
    });

    // Assignment form
    const assignForm = document.getElementById('adhd-assignment-form');
    if (assignForm) {
      assignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('assign-title-input');
        const due = document.getElementById('assign-due-input');
        if (title && title.value) {
          addAssignment(title.value, due ? due.value : 'Next Week');
          title.value = '';
          if (due) due.value = '';
        }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init,
    addTask,
    toggleTask,
    deleteTask,
    addSingleStepToTasks,
    deleteAssignment,
    breakDownTask,
    getStats: () => ({ ...stats })
  };
})();
