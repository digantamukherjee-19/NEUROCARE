/**
 * NeuroCare - ADHD Support Module
 * Complete interactive productivity hub:
 * - To-Do List (add, edit, delete with confirmation, complete)
 * - Break It Down task decomposition
 * - Pomodoro Timer (start, pause, resume, reset) + Focus Session Log
 * - Study Planner & Daily Schedule (add, edit, delete with confirmation, complete)
 * - Assignment & Deadline Tracker (add, cycle status, delete with confirmation)
 * - Reminder System with active countdowns and alerts
 * - Progress Reports & Achievement Badges
 */

var ADHD = window.ADHD = (function () {
  'use strict';

  const STORAGE_KEY_TASKS = 'neurocare_adhd_tasks';
  const STORAGE_KEY_ASSIGNMENTS = 'neurocare_adhd_assignments';
  const STORAGE_KEY_PLANNER = 'neurocare_adhd_planner';
  const STORAGE_KEY_REMINDERS = 'neurocare_adhd_reminders';
  const STORAGE_KEY_SESSIONS = 'neurocare_adhd_sessions';
  const STORAGE_KEY_BADGES = 'neurocare_adhd_badges';
  const STORAGE_KEY_STATS = 'neurocare_adhd_stats';

  let tasks = [];
  let assignments = [];
  let studyPlan = [];
  let reminders = [];
  let focusSessions = [];

  let badges = {
    first_step: false,
    focus_master: false,
    task_crusher: false,
    breakdown_hero: false,
    planner_pro: false,
    reminder_setter: false
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
  let hasStartedOnce = false;

  // Reminder ticker
  let reminderTicker = null;

  const breakdownTemplates = {
    'clean': [
      { step: 'Put on an upbeat playlist or podcast', time: '2 mins' },
      { step: 'Pick up all clothing from the floor and place in basket', time: '5 mins' },
      { step: 'Clear cups, plates, and trash off your desk/table', time: '5 mins' },
      { step: 'Make your bed (pull up duvet/sheets)', time: '3 mins' },
      { step: 'Celebrate completing your reset!', time: '1 min' }
    ],
    'study': [
      { step: 'Gather your notes, textbook, and a glass of water', time: '3 mins' },
      { step: 'Pick just ONE topic or chapter', time: '2 mins' },
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
      { step: 'Double check recipient address and hit send', time: '1 min' }
    ],
    'laundry': [
      { step: 'Gather clothes into darks and lights', time: '4 mins' },
      { step: 'Put one load in the washer, add detergent, press start', time: '3 mins' },
      { step: 'Set a reminder for when the cycle finishes', time: '1 min' },
      { step: 'Fold 5 items or hang up shirts when dry', time: '5 mins' }
    ],
    'project': [
      { step: 'Define the final outcome in one clear sentence', time: '3 mins' },
      { step: 'List 3 resources or links needed to start', time: '5 mins' },
      { step: 'Create the project folder/workspace', time: '3 mins' },
      { step: 'Complete the very first smallest action item', time: '15 mins' }
    ]
  };

  const motivationalQuotes = [
    'Your brain is built for creativity and exploration. Take it one micro-step at a time.',
    'Progress is not all-or-nothing. A 1% effort still counts as moving forward.',
    'Starting is the hardest part. Just aim for 2 minutes of focus.',
    'Hyperfocus works best when paired with gentle sensory pauses.',
    'Done is better than perfect. Celebrate every finished checkmark!',
    'Resting and resetting is a productive part of executive function.'
  ];

  function init() {
    loadData();
    renderTasks();
    renderAssignments();
    renderStudyPlanner();
    renderReminders();
    renderFocusSessions();
    renderBadges();
    renderProgressReport();
    updateProgressBar();
    renderRandomQuote();
    initTimer();
    startReminderTicker();
    bindEvents();
  }

  function loadData() {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      tasks = savedTasks ? JSON.parse(savedTasks) : [
        { id: 1, text: 'Drink a glass of cold water', priority: 'low', completed: true, timestamp: Date.now() - 3600000 },
        { id: 2, text: 'Complete a 5-minute desk declutter', priority: 'med', completed: false, timestamp: Date.now() - 1800000 },
        { id: 3, text: 'Do 1 Pomodoro focus session on study notes', priority: 'high', completed: false, timestamp: Date.now() }
      ];

      const savedAssignments = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      assignments = savedAssignments ? JSON.parse(savedAssignments) : [
        { id: 1, title: 'Biology: Cell Structure Diagram', due: 'Tomorrow', status: 'In Progress' },
        { id: 2, title: 'English: Creative Writing Paragraph', due: 'Friday', status: 'Not Started' }
      ];

      const savedPlanner = localStorage.getItem(STORAGE_KEY_PLANNER);
      studyPlan = savedPlanner ? JSON.parse(savedPlanner) : [
        { id: 1, time: '09:00 AM', subject: 'Science Review (15m chunk)', done: true },
        { id: 2, time: '11:00 AM', subject: 'Math Visual Practice', done: false },
        { id: 3, time: '03:00 PM', subject: 'Reading with Dyslexia Reader', done: false }
      ];

      const savedReminders = localStorage.getItem(STORAGE_KEY_REMINDERS);
      reminders = savedReminders ? JSON.parse(savedReminders) : [];

      const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
      focusSessions = savedSessions ? JSON.parse(savedSessions) : [
        { id: 1, topic: 'Starter Focus Session', duration: 25, date: 'Earlier today' }
      ];

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
      localStorage.setItem(STORAGE_KEY_PLANNER, JSON.stringify(studyPlan));
      localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(reminders));
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(focusSessions));
      localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(badges));
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('Could not save ADHD data to storage', e);
    }
  }

  // --- TO-DO LIST (ADD, EDIT, DELETE WITH CONFIRM, COMPLETE) ---
  function addTask(text, priority = 'med') {
    if (!text || !text.trim()) return;
    tasks.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: text.trim(),
      priority,
      completed: false,
      timestamp: Date.now()
    });
    saveData();
    renderTasks();
    updateProgressBar();
    renderProgressReport();
    if (window.Accessibility) window.Accessibility.playSound('click');
    if (window.App && window.App.updateDashboardAll) window.App.updateDashboardAll();
  }

  function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updatedText = window.prompt('Edit your task:', task.text);
    if (updatedText !== null && updatedText.trim()) {
      task.text = updatedText.trim();
      saveData();
      renderTasks();
      if (window.App && window.App.showToast) window.App.showToast('Task updated!');
    }
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
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
    renderProgressReport();
    if (window.App && window.App.updateDashboardAll) window.App.updateDashboardAll();
  }

  function deleteTask(id) {
    if (!window.confirm('Delete this task from your list?')) return;
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
    updateProgressBar();
    renderProgressReport();
    if (window.App && window.App.showToast) window.App.showToast('Task deleted.');
    if (window.App && window.App.updateDashboardAll) window.App.updateDashboardAll();
  }

  function renderTasks() {
    const container = document.getElementById('adhd-todo-list');
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          🌟 Your list is clear! Add a task above or use <strong>Break It Down</strong>.
        </div>
      `;
      return;
    }

    container.innerHTML = tasks.map(task => `
      <div class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <input type="checkbox" class="todo-check" ${task.completed ? 'checked' : ''} onchange="ADHD.toggleTask(${task.id})" aria-label="Mark task ${escapeHtml(task.text)} complete">
        <span class="todo-text">${escapeHtml(task.text)}</span>
        <span class="todo-tag tag-${task.priority}">${task.priority.toUpperCase()}</span>
        <div class="item-actions">
          <button type="button" class="btn btn-sm btn-secondary" onclick="ADHD.editTask(${task.id})" title="Edit task" aria-label="Edit task">✏️</button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="ADHD.deleteTask(${task.id})" title="Delete task" aria-label="Delete task">✕</button>
        </div>
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

    const dashDone = document.getElementById('dash-stat-tasks-done');
    if (dashDone) dashDone.textContent = `${completed}`;
  }

  // --- BREAK IT DOWN ---
  function breakDownTask(rawInput) {
    if (!rawInput || !rawInput.trim()) return [];
    unlockBadge('breakdown_hero');
    const query = rawInput.toLowerCase();

    let matchedTemplate = null;
    for (const key of Object.keys(breakdownTemplates)) {
      if (query.includes(key)) {
        matchedTemplate = breakdownTemplates[key];
        break;
      }
    }

    if (!matchedTemplate) {
      matchedTemplate = [
        { step: `Gather materials or open apps needed for: "${rawInput}"`, time: '3 mins' },
        { step: `Clear your immediate desk space and take 3 slow breaths`, time: '2 mins' },
        { step: `Work for 5 minutes on "${rawInput}" without judging quality`, time: '5 mins' },
        { step: `Identify the next small milestone and pause`, time: '5 mins' },
        { step: `Take a quick water or stretch break`, time: '3 mins' }
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
      if (window.App && window.App.showToast) window.App.showToast('Please enter a task first.');
      input.focus();
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
              <button type="button" class="btn btn-sm btn-primary break-add-single-btn" data-step="${escapeHtml(s.step)}">+ Add to To-Do</button>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 14px; text-align: right;">
          <button type="button" class="btn btn-sm btn-accent" id="btn-add-all-breakdown-steps">Add All to My Tasks</button>
        </div>
      </div>
    `;

    resultsContainer.querySelectorAll('.break-add-single-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stepText = e.currentTarget.getAttribute('data-step');
        addTask(stepText, 'med');
        if (window.App && window.App.showToast) window.App.showToast('Micro-step added to To-Do!');
      });
    });

    const addAllBtn = document.getElementById('btn-add-all-breakdown-steps');
    if (addAllBtn) {
      addAllBtn.addEventListener('click', () => {
        steps.slice().reverse().forEach(s => addTask(s.step, 'med'));
        if (window.App && window.App.showToast) window.App.showToast('All micro-steps added to To-Do list!');
      });
    }
  }

  // --- POMODORO FOCUS TIMER & SESSION TRACKER ---
  function initTimer() {
    updateTimerDisplay();
  }

  function setTimerMode(mode) {
    pauseTimer();
    hasStartedOnce = false;
    timerMode = mode;
    if (mode === 'focus') timerTotalSeconds = 25 * 60;
    else if (mode === 'short') timerTotalSeconds = 5 * 60;
    else if (mode === 'long') timerTotalSeconds = 15 * 60;

    timerSecondsLeft = timerTotalSeconds;
    updateTimerDisplay();
    updateTimerPlayBtnUI(false, false);

    const modeLabel = document.getElementById('pomodoro-mode-label');
    if (modeLabel) {
      modeLabel.textContent = mode === 'focus' ? 'Focus Block' : (mode === 'short' ? 'Short Break' : 'Long Break');
    }

    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    hasStartedOnce = true;
    updateTimerPlayBtnUI(true, true);

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
    updateTimerPlayBtnUI(false, hasStartedOnce);
  }

  function resetTimer() {
    pauseTimer();
    hasStartedOnce = false;
    timerSecondsLeft = timerTotalSeconds;
    updateTimerDisplay();
    updateTimerPlayBtnUI(false, false);
  }

  function timerFinished() {
    pauseTimer();
    hasStartedOnce = false;
    if (window.Accessibility) window.Accessibility.playSound('chime');

    if (timerMode === 'focus') {
      const mins = Math.round(timerTotalSeconds / 60);
      stats.pomodorosCompleted++;
      stats.minutesFocused += mins;
      unlockBadge('focus_master');

      const topicInput = document.getElementById('pomodoro-topic-input');
      const topic = topicInput && topicInput.value.trim() ? topicInput.value.trim() : 'Focused Study Block';
      logFocusSession(topic, mins);

      if (window.App && window.App.addGardenPoints) {
        window.App.addGardenPoints(25, `${mins}-minute Focus Session Complete!`);
      }
      if (window.App && window.App.showToast) {
        window.App.showToast('🎉 Focus block complete! Take a calm break.');
      }
    } else {
      if (window.App && window.App.showToast) {
        window.App.showToast('🔔 Break finished! Ready when you are.');
      }
    }

    timerSecondsLeft = timerTotalSeconds;
    updateTimerDisplay();
    updateTimerPlayBtnUI(false, false);
    saveData();
    renderProgressReport();
    if (window.App && window.App.updateDashboardAll) window.App.updateDashboardAll();
  }

  function logFocusSession(topic, duration) {
    focusSessions.unshift({
      id: Date.now(),
      topic,
      duration,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (focusSessions.length > 20) focusSessions.pop();
    saveData();
    renderFocusSessions();
  }

  function logManualFocusSession() {
    const topicInput = document.getElementById('pomodoro-topic-input');
    const topic = topicInput && topicInput.value.trim() ? topicInput.value.trim() : 'Manual Focus Check-in';
    stats.pomodorosCompleted++;
    stats.minutesFocused += 15;
    unlockBadge('focus_master');
    logFocusSession(topic, 15);
    if (topicInput) topicInput.value = '';
    if (window.App && window.App.addGardenPoints) {
      window.App.addGardenPoints(15, '15m Focus Session Logged!');
    }
    renderProgressReport();
    if (window.App && window.App.updateDashboardAll) window.App.updateDashboardAll();
  }

  function renderFocusSessions() {
    const container = document.getElementById('adhd-focus-sessions-list');
    if (!container) return;

    if (focusSessions.length === 0) {
      container.innerHTML = `<div class="empty-state-box">No focus sessions recorded yet. Start the timer above!</div>`;
      return;
    }

    container.innerHTML = focusSessions.slice(0, 6).map(s => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 12px; background: var(--bg-card-subtle); border-radius: var(--radius-sm); margin-bottom: 6px; border: 1px solid var(--border-light); font-size: 13px;">
        <div><strong>⏱️ ${escapeHtml(s.topic)}</strong> <span class="badge badge-peach">${s.duration}m</span></div>
        <span style="color: var(--text-muted); font-size: 12px;">${escapeHtml(s.date)}</span>
      </div>
    `).join('');
  }

  function updateTimerDisplay() {
    const digits = document.getElementById('pomodoro-timer-digits');
    const circle = document.getElementById('pomodoro-progress-circle');

    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (digits) digits.textContent = formatted;
    if (circle) {
      const circumference = 691;
      const progress = 1 - (timerSecondsLeft / timerTotalSeconds);
      circle.style.strokeDashoffset = circumference * progress;
    }
  }

  function updateTimerPlayBtnUI(running, pausedMidway) {
    const btn = document.getElementById('btn-timer-toggle');
    if (!btn) return;
    if (running) {
      btn.textContent = '⏸ Pause';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
    } else {
      btn.textContent = pausedMidway ? '▶ Resume' : '▶ Start Focus';
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');
    }
  }

  // --- STUDY PLANNER & DAILY SCHEDULE ---
  function addStudyPlanItem(time, subject) {
    if (!subject || !subject.trim()) return;
    studyPlan.push({
      id: Date.now(),
      time: time || 'Anytime',
      subject: subject.trim(),
      done: false
    });
    unlockBadge('planner_pro');
    saveData();
    renderStudyPlanner();
    if (window.App && window.App.showToast) window.App.showToast('Added to Study Planner!');
  }

  function toggleStudyPlanItem(id) {
    const item = studyPlan.find(i => i.id === id);
    if (item) {
      item.done = !item.done;
      if (item.done && window.App && window.App.addGardenPoints) {
        window.App.addGardenPoints(8, 'Study Block Completed!');
      }
      saveData();
      renderStudyPlanner();
    }
  }

  function editStudyPlanItem(id) {
    const item = studyPlan.find(i => i.id === id);
    if (!item) return;
    const newSubject = window.prompt('Edit study block subject:', item.subject);
    if (newSubject !== null && newSubject.trim()) {
      item.subject = newSubject.trim();
      saveData();
      renderStudyPlanner();
    }
  }

  function deleteStudyPlanItem(id) {
    if (!window.confirm('Remove this study block from your planner?')) return;
    studyPlan = studyPlan.filter(i => i.id !== id);
    saveData();
    renderStudyPlanner();
  }

  function renderStudyPlanner() {
    const list = document.getElementById('adhd-study-planner-list');
    if (!list) return;

    if (studyPlan.length === 0) {
      list.innerHTML = `<div class="empty-state-box">No study blocks planned yet. Add one above!</div>`;
      return;
    }

    list.innerHTML = studyPlan.map(item => `
      <div class="todo-item ${item.done ? 'completed' : ''}">
        <input type="checkbox" class="todo-check" ${item.done ? 'checked' : ''} onchange="ADHD.toggleStudyPlanItem(${item.id})" aria-label="Mark study block done">
        <span class="badge badge-blue">${escapeHtml(item.time)}</span>
        <span class="todo-text">${escapeHtml(item.subject)}</span>
        <div class="item-actions">
          <button type="button" class="btn btn-sm btn-secondary" onclick="ADHD.editStudyPlanItem(${item.id})" title="Edit study block">✏️</button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="ADHD.deleteStudyPlanItem(${item.id})" title="Delete study block">✕</button>
        </div>
      </div>
    `).join('');
  }

  // --- ASSIGNMENT TRACKER ---
  function addAssignment(title, due, status = 'Not Started') {
    if (!title || !title.trim()) return;
    assignments.push({
      id: Date.now(),
      title: title.trim(),
      due: due || 'Next Week',
      status
    });
    saveData();
    renderAssignments();
    if (window.App && window.App.showToast) window.App.showToast('Assignment added!');
  }

  function cycleAssignmentStatus(id) {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    const states = ['Not Started', 'In Progress', 'Completed'];
    const nextIdx = (states.indexOf(a.status) + 1) % states.length;
    a.status = states[nextIdx];
    if (a.status === 'Completed' && window.App && window.App.addGardenPoints) {
      window.App.addGardenPoints(15, 'Assignment Completed!');
    }
    saveData();
    renderAssignments();
  }

  function deleteAssignment(id) {
    if (!window.confirm('Delete this assignment from your tracker?')) return;
    assignments = assignments.filter(a => a.id !== id);
    saveData();
    renderAssignments();
  }

  function renderAssignments() {
    const list = document.getElementById('adhd-assignment-list');
    if (!list) return;

    if (assignments.length === 0) {
      list.innerHTML = `<div class="empty-state-box">No upcoming assignments. Add one above!</div>`;
      return;
    }

    list.innerHTML = assignments.map(a => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); margin-bottom: 8px; border: 1px solid var(--border-light);">
        <div>
          <strong style="font-size: 14px;">${escapeHtml(a.title)}</strong>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
            Due: ${escapeHtml(a.due)} •
            <button type="button" class="badge badge-blue" style="border:none; cursor:pointer;" onclick="ADHD.cycleAssignmentStatus(${a.id})" title="Click to update status">${escapeHtml(a.status)} ↻</button>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-secondary" onclick="ADHD.deleteAssignment(${a.id})" aria-label="Remove assignment">✕</button>
      </div>
    `).join('');
  }

  // --- REMINDER SYSTEM ---
  function addReminder(text, minutes) {
    if (!text || !text.trim()) return;
    const mins = Math.max(1, parseInt(minutes, 10) || 10);
    reminders.push({
      id: Date.now(),
      text: text.trim(),
      triggerAt: Date.now() + mins * 60000,
      fired: false
    });
    unlockBadge('reminder_setter');
    saveData();
    renderReminders();
    if (window.App && window.App.showToast) window.App.showToast(`⏰ Reminder set for ${mins} min(s)`);
  }

  function deleteReminder(id) {
    if (!window.confirm('Remove this reminder?')) return;
    reminders = reminders.filter(r => r.id !== id);
    saveData();
    renderReminders();
  }

  function startReminderTicker() {
    clearInterval(reminderTicker);
    reminderTicker = setInterval(() => {
      const now = Date.now();
      let changed = false;
      reminders.forEach(r => {
        if (!r.fired && now >= r.triggerAt) {
          r.fired = true;
          changed = true;
          if (window.Accessibility) window.Accessibility.playSound('chime');
          if (window.App && window.App.showToast) {
            window.App.showToast(`⏰ REMINDER: ${r.text}`);
          }
        }
      });
      if (changed) saveData();
      renderReminders();
    }, 10000); // check every 10s
  }

  function renderReminders() {
    const list = document.getElementById('adhd-reminders-list');
    if (!list) return;

    if (reminders.length === 0) {
      list.innerHTML = `<div class="empty-state-box">No active reminders set.</div>`;
      return;
    }

    const now = Date.now();
    list.innerHTML = reminders.map(r => {
      const minsLeft = Math.max(0, Math.ceil((r.triggerAt - now) / 60000));
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 12px; background: var(--bg-card-subtle); border-radius: var(--radius-sm); margin-bottom: 6px; border: 1px solid var(--border-light); font-size: 13.5px;">
          <div>
            <strong>${r.fired ? '🔔 Triggered:' : '⏰'} ${escapeHtml(r.text)}</strong>
            <span class="badge ${r.fired ? 'badge-mint' : 'badge-lavender'}" style="margin-left:6px;">
              ${r.fired ? 'Done' : `${minsLeft}m left`}
            </span>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" onclick="ADHD.deleteReminder(${r.id})" aria-label="Delete reminder">✕</button>
        </div>
      `;
    }).join('');
  }

  // --- BADGES & PROGRESS REPORT ---
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
      breakdown_hero: 'Task Decomposer',
      planner_pro: 'Planner Pro',
      reminder_setter: 'Time Anchor'
    };
    return names[key] || 'Achievement';
  }

  function renderBadges() {
    const container = document.getElementById('adhd-badges-container');
    if (!container) return;

    const badgeDefs = [
      { key: 'first_step', icon: '🌱', name: 'First Step', desc: 'Finished your first task' },
      { key: 'focus_master', icon: '⏱️', name: 'Focus Master', desc: 'Completed a focus session' },
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

  function renderProgressReport() {
    const reportEl = document.getElementById('adhd-progress-report-stats');
    if (reportEl) {
      const completedToday = tasks.filter(t => t.completed).length;
      const unlockedCount = Object.values(badges).filter(Boolean).length;
      reportEl.innerHTML = `
        <div class="grid-3" style="gap: 10px;">
          <div style="padding: 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md); text-align:center;">
            <div style="font-size: 20px; font-weight: 800; color: var(--accent-mint);">${stats.tasksCompletedTotal}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Total Tasks Done</div>
          </div>
          <div style="padding: 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md); text-align:center;">
            <div style="font-size: 20px; font-weight: 800; color: var(--accent-peach);">${stats.minutesFocused}m</div>
            <div style="font-size: 11px; color: var(--text-muted);">Minutes Focused</div>
          </div>
          <div style="padding: 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md); text-align:center;">
            <div style="font-size: 20px; font-weight: 800; color: var(--accent-lavender);">${unlockedCount}/6</div>
            <div style="font-size: 11px; color: var(--text-muted);">Badges Earned (${completedToday} active)</div>
          </div>
        </div>
      `;
    }

    const dashFocusMins = document.getElementById('dash-stat-focus-time');
    if (dashFocusMins) dashFocusMins.textContent = `${stats.minutesFocused}m`;
  }

  function renderRandomQuote() {
    const el = document.getElementById('adhd-motivational-quote');
    if (!el) return;
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    el.textContent = `"${randomQuote}"`;
  }

  function bindEvents() {
    const todoForm = document.getElementById('adhd-todo-form');
    if (todoForm) {
      todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('adhd-todo-input');
        const prio = document.getElementById('adhd-todo-priority');
        if (input && input.value.trim()) {
          addTask(input.value, prio ? prio.value : 'med');
          input.value = '';
        }
      });
    }

    const breakdownBtn = document.getElementById('btn-run-breakdown');
    if (breakdownBtn) breakdownBtn.addEventListener('click', handleBreakDownSubmit);

    const toggleBtn = document.getElementById('btn-timer-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (isTimerRunning) pauseTimer();
        else startTimer();
      });
    }

    const resetBtn = document.getElementById('btn-timer-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    const logManualBtn = document.getElementById('btn-log-focus-manual');
    if (logManualBtn) logManualBtn.addEventListener('click', logManualFocusSession);

    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => setTimerMode(e.currentTarget.getAttribute('data-mode')));
    });

    const assignForm = document.getElementById('adhd-assignment-form');
    if (assignForm) {
      assignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('assign-title-input');
        const due = document.getElementById('assign-due-input');
        if (title && title.value.trim()) {
          addAssignment(title.value, due ? due.value : 'Next Week');
          title.value = '';
          if (due) due.value = '';
        }
      });
    }

    const plannerForm = document.getElementById('adhd-planner-form');
    if (plannerForm) {
      plannerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const timeInput = document.getElementById('planner-time-input');
        const subjectInput = document.getElementById('planner-subject-input');
        if (subjectInput && subjectInput.value.trim()) {
          addStudyPlanItem(timeInput ? timeInput.value : 'Anytime', subjectInput.value);
          if (timeInput) timeInput.value = '';
          subjectInput.value = '';
        }
      });
    }

    const reminderForm = document.getElementById('adhd-reminder-form');
    if (reminderForm) {
      reminderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textInput = document.getElementById('reminder-text-input');
        const minsInput = document.getElementById('reminder-mins-input');
        if (textInput && textInput.value.trim()) {
          addReminder(textInput.value, minsInput ? minsInput.value : 10);
          textInput.value = '';
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
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    cycleAssignmentStatus,
    deleteAssignment,
    toggleStudyPlanItem,
    editStudyPlanItem,
    deleteStudyPlanItem,
    deleteReminder,
    breakDownTask,
    getStats: () => ({ ...stats }),
    getTasks: () => [...tasks],
    getBadges: () => ({ ...badges })
  };
})();
