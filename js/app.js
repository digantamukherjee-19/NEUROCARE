/**
 * NeuroCare - Main Application Controller
 * Coordinates SPA routing, Home Search, Dashboard Customization & Charts,
 * Achievement Garden, Community (with Comments & Anonymous Questions),
 * Parent/Teacher Portal (with Downloads & Live Local Progress),
 * and Searchable Professional Resources.
 */

var App = window.App = (function () {
  'use strict';

  const STORAGE_KEY_GARDEN = 'neurocare_garden_data';
  const STORAGE_KEY_DASH_PREFS = 'neurocare_dashboard_prefs';
  const STORAGE_KEY_COMMUNITY = 'neurocare_community_posts';
  const STORAGE_KEY_CHECKLIST = 'neurocare_appointment_checklist';
  const STORAGE_KEY_PORTAL_NOTES = 'neurocare_portal_observations';
  const STORAGE_KEY_PORTAL_CHECK = 'neurocare_portal_checklist';

  // --- GLOBAL TOOL & RESOURCE SEARCH INDEX ---
  const searchableIndex = [
    { title: 'Break It Down (Task Decomposer)', desc: 'Split overwhelming tasks into 5-min micro-steps', section: 'adhd', icon: '🧩' },
    { title: 'ADHD To-Do List & Study Planner', desc: 'Add, edit, complete tasks & schedule blocks', section: 'adhd', icon: '⚡' },
    { title: 'Pomodoro Visual Focus Timer', desc: '25/5/15 min timer with focus session log', section: 'adhd', icon: '⏱️' },
    { title: 'Reminders & Assignment Tracker', desc: 'Deadlines & timed alert notifications', section: 'adhd', icon: '⏰' },
    { title: 'Dyslexia Reading Canvas & TTS', desc: 'Read aloud with word highlight, tints & OpenDyslexic font', section: 'dyslexia', icon: '📖' },
    { title: 'Reading Ruler & Text Highlighter', desc: 'Line guide & yellow/mint/pink text highlights', section: 'dyslexia', icon: '📏' },
    { title: 'Text Simplifier & Vocabulary Builder', desc: 'Simplify complex text & hear pronunciations', section: 'dyslexia', icon: '✨' },
    { title: '3D Flashcards & Mastery Quiz', desc: 'Leveled quizzes, custom flashcards & stars', section: 'learning', icon: '💡' },
    { title: 'Memory Game, Visual Math & Attention', desc: 'Interactive games & dyscalculia dot builder', section: 'learning', icon: '🧠' },
    { title: 'Mood Tracker & Guided Journal', desc: 'Emoji check-ins, charts & edit/delete journal', section: 'wellness', icon: '🌿' },
    { title: 'Box Breathing & 5-4-3-2-1 Grounding', desc: 'Animated breathing & sensory calm walkthrough', section: 'wellness', icon: '🫁' },
    { title: 'Ambient Rain, Ocean & 432Hz Synth', desc: 'Offline browser-synthesized calming soundscapes', section: 'wellness', icon: '🎧' },
    { title: 'Sleep & Break Reminder Tracker', desc: 'Log sleep hours & set break intervals', section: 'wellness', icon: '🌙' },
    { title: 'Express Without Words (AAC Board)', desc: 'Spoken visual communication & emotion cards', section: 'sensory', icon: '🗣️' },
    { title: 'Visual Routine Builder & Social Stories', desc: 'Add/edit daily schedule & sensory break timer', section: 'sensory', icon: '🧩' },
    { title: 'AI Learning Assistant (Demo)', desc: 'Rule-based Q&A for ADHD, dyslexia & sensory tips', section: 'assistant', icon: '🤖' },
    { title: 'Community Hub (Local Demo)', desc: 'Share stories, comment, or ask anonymous questions', section: 'community', icon: '💬' },
    { title: 'Parent & Teacher Portal', desc: 'Classroom accommodations, progress & downloadable guides', section: 'portal', icon: '🎓' },
    { title: 'Professional Resources Directory', desc: 'Specialists guide & appointment preparation checklist', section: 'resources', icon: '🏥' },
    { title: 'Accessibility Settings & Languages', desc: 'Themes, dark mode, high contrast, Hindi/Bengali/English', section: 'settings', icon: '⚙️' }
  ];

  // --- DASHBOARD PREFERENCES ---
  let dashPrefs = {
    userName: 'Friend',
    showGarden: true,
    showCharts: true,
    showQuickActions: true,
    showSummaryStats: true
  };

  // --- ACHIEVEMENT GARDEN ---
  let gardenData = {
    points: 35,
    waterDrops: 3,
    sunshine: 5,
    stage: 2
  };

  // --- COMMUNITY STATE ---
  let communityPosts = [];
  let activeCommunityCategory = 'all';
  let activeCommunitySearch = '';

  const initialCommunityPosts = [
    {
      id: 1,
      author: 'Maya S.',
      role: 'College Student (ADHD & Dyslexia)',
      category: 'adhd',
      title: 'The "Micro-Countdown" that stopped my morning paralysis',
      content: 'Whenever I feel glued to my bed or couch, I count down 3-2-1 out loud and wiggle my toes first, then stand up. Once physical movement starts, the ADHD paralysis wall breaks!',
      upvotes: 42,
      tags: ['ADHD Hacks', 'Executive Function'],
      time: '2 hours ago',
      own: false,
      comments: [
        { id: 101, author: 'Sam R.', text: 'Tried this today for starting dishes and it genuinely helped!' }
      ]
    },
    {
      id: 2,
      author: 'David L.',
      role: 'High School Teacher',
      category: 'parent-teacher',
      title: 'Classroom tip: Soft yellow & mint paper instead of stark white',
      content: 'Printing worksheets on soft pastel yellow or mint green paper reduced reading fatigue for several of my dyslexic students. It is a simple, zero-cost accommodation.',
      upvotes: 68,
      tags: ['Teaching', 'Dyslexia Wins'],
      time: '1 day ago',
      own: false,
      comments: []
    },
    {
      id: 3,
      author: 'Sam R.',
      role: 'Software Developer (Autistic)',
      category: 'sensory',
      title: 'Carrying a mini sensory kit in my backpack',
      content: 'Earplugs, tinted glasses for store fluorescent lighting, and a smooth fidget stone made errands far calmer. Normalizing sensory aids is empowering.',
      upvotes: 53,
      tags: ['Autism & Sensory', 'Self Care'],
      time: '2 days ago',
      own: false,
      comments: []
    },
    {
      id: 4,
      author: 'Anonymous Question',
      role: 'Community Member',
      category: 'questions',
      title: 'How do you remember to drink water during hyperfocus?',
      content: 'When I get locked into coding or drawing, 4 hours vanish and I get headaches. What gentle reminders actually work without breaking flow?',
      upvotes: 19,
      tags: ['Question', 'ADHD'],
      time: '3 days ago',
      own: false,
      comments: [
        { id: 102, author: 'Maya S.', text: 'Keep a bright insulated bottle right beside your mouse and use the 45-min Break Reminder in Wellness!' }
      ]
    }
  ];

  // --- PORTAL OBSERVATIONS & CHECKLIST ---
  let portalObservations = [];
  let portalChecklist = [
    { id: 'pc-1', text: 'Provide written instructions alongside spoken directions', done: true },
    { id: 'pc-2', text: 'Offer quiet seating away from doors or bright flickering bulbs', done: false },
    { id: 'pc-3', text: 'Allow audio books, TTS tools, or untimed reading checks', done: false },
    { id: 'pc-4', text: 'Give 5-minute transition cues before activity switches', done: false }
  ];

  // --- PROFESSIONAL RESOURCES DIRECTORY (Clearly marked sample entries) ---
  const resourcesDirectory = [
    {
      id: 'res-1',
      type: 'psychologist',
      category: 'Assessment & Executive Function',
      icon: '🧠',
      title: 'Clinical & Neuropsychologists (Role Guide)',
      badge: 'Informational Guide',
      desc: 'Conduct comprehensive neuropsychological evaluations for ADHD, autism, and learning differences, and provide evidence-based cognitive behavioral strategies.',
      link: 'https://www.apa.org/topics/neuropsychology',
      linkLabel: 'Learn via APA →'
    },
    {
      id: 'res-2',
      type: 'neurologist',
      category: 'Medical & Brain Health',
      icon: '⚕️',
      title: 'Pediatric & Adult Neurologists (Role Guide)',
      badge: 'Informational Guide',
      desc: 'Medical physicians specializing in nervous system development, sleep-related neurobiology, sensory processing pathways, and neurological screenings.',
      link: 'https://www.aan.com/',
      linkLabel: 'American Academy of Neurology →'
    },
    {
      id: 'res-3',
      type: 'speech',
      category: 'Communication & Literacy',
      icon: '🗣️',
      title: 'Speech-Language Pathologists (SLPs)',
      badge: 'Informational Guide',
      desc: 'Support phonological awareness for dyslexia, expressive/receptive language, AAC communication systems, and pragmatic social communication.',
      link: 'https://www.asha.org/public/',
      linkLabel: 'ASHA Public Info →'
    },
    {
      id: 'res-4',
      type: 'occupational',
      category: 'Sensory & Motor Skills',
      icon: '🖐️',
      title: 'Occupational Therapists (OTs)',
      badge: 'Informational Guide',
      desc: 'Specialize in sensory integration diets, proprioceptive regulation, handwriting/dysgraphia ergonomics, and daily living independence.',
      link: 'https://www.aota.org/',
      linkLabel: 'AOTA Resources →'
    },
    {
      id: 'res-5',
      type: 'educator',
      category: 'Academic & IEP Support',
      icon: '📚',
      title: 'Special Educators & Reading Specialists',
      badge: 'Informational Guide',
      desc: 'Deliver structured literacy (such as Orton-Gillingham methods), dyscalculia math scaffolding, and school IEP/504 classroom accommodations.',
      link: 'https://dyslexiaida.org/',
      linkLabel: 'International Dyslexia Assoc. →'
    },
    {
      id: 'res-6',
      type: 'organization',
      category: 'Advocacy & Peer Support',
      icon: '🌐',
      title: 'CHADD, Understood & ASAN (Organizations)',
      badge: 'External Directory',
      desc: 'Reputable nonprofit advocacy organizations offering free toolkits, local chapter finders, and neurodiversity-affirming educational articles.',
      link: 'https://www.understood.org/',
      linkLabel: 'Visit Understood.org →'
    },
    {
      id: 'res-7',
      type: 'psychologist',
      category: 'Sample Local Listing',
      icon: '📋',
      title: 'Sample Clinic Profile: BrightMind Neurodevelopmental Center (Demo)',
      badge: 'Sample / Demo Entry',
      desc: 'Example placeholder showing how a multidisciplinary clinic listing appears (Educational testing, OT sensory gym, parent coaching). Not a real clinic or address.',
      link: null,
      linkLabel: ''
    }
  ];

  // --- APPOINTMENT CHECKLIST ---
  const defaultChecklist = [
    { id: 'item-1', text: 'Written list of primary observations (focus patterns, reading fatigue, sensory triggers)', done: false },
    { id: 'item-2', text: 'School report cards, teacher notes, or workplace feedback', done: false },
    { id: 'item-3', text: 'Sleep schedule notes and current medications/supplements', done: false },
    { id: 'item-4', text: '3 key questions about classroom or workplace accommodations', done: false },
    { id: 'item-5', text: 'Comfort item or headphones for waiting rooms', done: false }
  ];
  let checklistItems = [];

  function init() {
    loadGarden();
    loadDashPrefs();
    loadCommunity();
    loadChecklist();
    loadPortalData();

    setupRouting();
    setupMobileMenu();
    setupHomeSearch();
    setupGardenUI();
    setupSensoryEscapeModal();
    setupCommunityUI();
    setupPortalUI();
    setupResourcesUI();
    setupChecklistUI();
    setupModalKeyboardClose();
    updateDashboardDate();

    // Initialize all sub-modules cleanly
    if (window.Accessibility) window.Accessibility.init();
    if (window.ADHD) window.ADHD.init();
    if (window.Dyslexia) window.Dyslexia.init();
    if (window.Learning) window.Learning.init();
    if (window.Wellness) window.Wellness.init();
    if (window.Sensory) window.Sensory.init();
    if (window.Assistant) window.Assistant.init();

    // Sync cross-module home/dashboard summaries after init
    updateHomeWelcomeProgress();
    updateDashboardAll();
    registerServiceWorker();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  // --- SPA ROUTING ---
  function setupRouting() {
    window.addEventListener('hashchange', () => handleRoute());
    handleRoute();
  }

  function handleRoute(overrideSection) {
    const rawHash = typeof overrideSection === 'string' ? overrideSection : window.location.hash.slice(1);
    const validSections = [
      'home', 'dashboard', 'adhd', 'dyslexia', 'learning',
      'wellness', 'sensory', 'assistant', 'community', 'portal',
      'resources', 'settings'
    ];
    const currentSection = validSections.includes(rawHash) ? rawHash : 'home';

    document.querySelectorAll('.page-section').forEach(section => {
      const id = section.id.replace('section-', '');
      section.classList.toggle('active', id === currentSection);
    });

    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
    });

    const breadcrumbCurrent = document.getElementById('header-breadcrumb-current');
    if (breadcrumbCurrent) {
      const prettyNames = {
        home: 'Home',
        dashboard: 'My Dashboard',
        adhd: 'ADHD Support',
        dyslexia: 'Dyslexia Support',
        learning: 'Learning Centre',
        wellness: 'Wellness Centre',
        sensory: 'Autism & Sensory',
        assistant: 'AI Assistant (Demo)',
        community: 'Community',
        portal: 'Parent & Teacher Portal',
        resources: 'Professional Resources',
        settings: 'Settings & Accessibility'
      };
      breadcrumbCurrent.textContent = prettyNames[currentSection] || 'Home';
    }

    if (currentSection === 'dashboard') updateDashboardAll();
    if (currentSection === 'home') updateHomeWelcomeProgress();
    if (currentSection === 'portal') renderPortalProgressOverview();

    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateTo(sectionId) {
    const cleanId = String(sectionId || 'home').replace(/^#/, '');
    if (window.location.hash !== `#${cleanId}`) {
      window.location.hash = cleanId;
    }
    handleRoute(cleanId);
  }

  function setupMobileMenu() {
    const btn = document.getElementById('btn-mobile-menu');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!btn || !sidebar) return;

    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const open = sidebar.classList.toggle('mobile-open');
      if (backdrop) backdrop.classList.toggle('active', open);
      btn.setAttribute('aria-expanded', String(open));
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeMobileMenu);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
        closeMobileMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && !btn.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  function closeMobileMenu() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const btn = document.getElementById('btn-mobile-menu');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  // --- HOME: GLOBAL SEARCH & DYNAMIC PROGRESS ---
  function setupHomeSearch() {
    const input = document.getElementById('home-global-search');
    const resultsBox = document.getElementById('home-search-results');
    if (!input || !resultsBox) return;

    input.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        resultsBox.classList.remove('open');
        resultsBox.innerHTML = '';
        return;
      }

      const matches = searchableIndex.filter(item =>
        item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
      );

      if (!matches.length) {
        resultsBox.innerHTML = `<div style="padding: 14px; font-size: 13.5px; color: var(--text-muted);">No matching tools found for "${escapeHtml(q)}". Try "Pomodoro", "Reading", "Flashcards", or "Breathing".</div>`;
      } else {
        resultsBox.innerHTML = matches.map(m => `
          <div class="search-result-item" onclick="App.navigateTo('${m.section}'); document.getElementById('home-search-results').classList.remove('open'); document.getElementById('home-global-search').value='';">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:20px;">${m.icon}</span>
              <div>
                <div style="font-weight:700; font-size:14px;">${escapeHtml(m.title)}</div>
                <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(m.desc)}</div>
              </div>
            </div>
            <span class="badge badge-blue">Open →</span>
          </div>
        `).join('');
      }
      resultsBox.classList.add('open');
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !resultsBox.contains(e.target)) {
        resultsBox.classList.remove('open');
      }
    });
  }

  function updateHomeWelcomeProgress() {
    const bannerEl = document.getElementById('home-dynamic-progress-strip');
    if (!bannerEl) return;

    const adhdStats = window.ADHD ? window.ADHD.getStats() : { tasksCompletedTotal: 0, minutesFocused: 0 };
    const learnProg = window.Learning ? window.Learning.getProgress() : { starsEarned: 0 };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');

    bannerEl.innerHTML = `
      <span>👋 <strong>${greeting}, ${escapeHtml(dashPrefs.userName)}!</strong></span>
      <span>• ✅ <strong>${adhdStats.tasksCompletedTotal}</strong> tasks done</span>
      <span>• ★ <strong>${learnProg.starsEarned}</strong> learning stars</span>
      <span>• 🌱 <strong>${gardenData.points}</strong> garden pts</span>
      <a href="#dashboard" style="margin-left:auto; font-weight:700;">Open Dashboard →</a>
    `;
  }

  // --- DASHBOARD: REAL PROGRESS CHARTS & CUSTOMIZATION ---
  function loadDashPrefs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DASH_PREFS);
      if (saved) dashPrefs = { ...dashPrefs, ...JSON.parse(saved) };
    } catch (e) {}
  }

  function saveDashPrefs() {
    try {
      localStorage.setItem(STORAGE_KEY_DASH_PREFS, JSON.stringify(dashPrefs));
    } catch (e) {}
  }

  function updateDashboardDate() {
    const dateEl = document.getElementById('dash-current-date');
    if (!dateEl) return;
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  }

  function updateDashboardAll() {
    const greetEl = document.getElementById('dash-user-greeting');
    if (greetEl) greetEl.textContent = `Welcome back, ${dashPrefs.userName}!`;

    const adhdTasks = window.ADHD ? window.ADHD.getTasks() : [];
    const adhdStats = window.ADHD ? window.ADHD.getStats() : { tasksCompletedTotal: 0, minutesFocused: 0 };
    const learnProg = window.Learning ? window.Learning.getProgress() : { starsEarned: 0, quizzesCompleted: 0, flashcardsReviewed: 0, mathSolved: 0 };
    const moodHist = window.Wellness ? window.Wellness.getMoodHistory() : [];

    const completedToday = adhdTasks.filter(t => t.completed).length;
    const totalTasks = adhdTasks.length;
    const taskPct = totalTasks ? Math.round((completedToday / totalTasks) * 100) : 0;

    const dashTasksEl = document.getElementById('dash-stat-tasks-done');
    const dashFocusEl = document.getElementById('dash-stat-focus-time');
    const dashMoodEl = document.getElementById('dash-stat-mood');
    if (dashTasksEl) dashTasksEl.textContent = `${completedToday}/${totalTasks}`;
    if (dashFocusEl) dashFocusEl.textContent = `${adhdStats.minutesFocused}m`;
    if (dashMoodEl && moodHist[0]) dashMoodEl.textContent = `${moodHist[0].emoji} ${moodHist[0].label}`;

    // Render Progress Charts
    const chartsEl = document.getElementById('dash-progress-charts-body');
    if (chartsEl) {
      const focusPct = Math.min(100, Math.round((adhdStats.minutesFocused / 60) * 100));
      const learnPct = Math.min(100, Math.round((learnProg.starsEarned / 30) * 100));
      const gardenPct = Math.min(100, Math.round((gardenData.points / 200) * 100));

      chartsEl.innerHTML = `
        <div class="chart-bar-group">
          <div class="chart-bar-row">
            <span class="chart-bar-label">Daily Tasks (${taskPct}%)</span>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${taskPct}%; background:var(--accent-mint);"></div></div>
          </div>
          <div class="chart-bar-row">
            <span class="chart-bar-label">Focus Goal (${adhdStats.minutesFocused}/60m)</span>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${focusPct}%; background:var(--accent-peach);"></div></div>
          </div>
          <div class="chart-bar-row">
            <span class="chart-bar-label">Learning Stars (${learnProg.starsEarned}★)</span>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${learnPct}%; background:var(--accent-blue);"></div></div>
          </div>
          <div class="chart-bar-row">
            <span class="chart-bar-label">Garden Bloom (${gardenData.points}/200)</span>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${gardenPct}%; background:var(--accent-lavender);"></div></div>
          </div>
        </div>
      `;
    }

    // Apply Dashboard widget visibility preferences
    const widgetStats = document.getElementById('dash-widget-stats');
    const widgetGarden = document.getElementById('dash-widget-garden');
    const widgetCharts = document.getElementById('dash-widget-charts');
    const widgetQuick = document.getElementById('dash-widget-quick');

    if (widgetStats) widgetStats.style.display = dashPrefs.showSummaryStats ? 'grid' : 'none';
    if (widgetGarden) widgetGarden.style.display = dashPrefs.showGarden ? 'grid' : 'none';
    if (widgetCharts) widgetCharts.style.display = dashPrefs.showCharts ? 'block' : 'none';
    if (widgetQuick) widgetQuick.style.display = dashPrefs.showQuickActions ? 'block' : 'none';

    // Sync customizer inputs
    const nameInput = document.getElementById('dash-pref-name');
    if (nameInput) nameInput.value = dashPrefs.userName;
    const cStats = document.getElementById('dash-pref-stats');
    if (cStats) cStats.checked = dashPrefs.showSummaryStats;
    const cGarden = document.getElementById('dash-pref-garden');
    if (cGarden) cGarden.checked = dashPrefs.showGarden;
    const cCharts = document.getElementById('dash-pref-charts');
    if (cCharts) cCharts.checked = dashPrefs.showCharts;
    const cQuick = document.getElementById('dash-pref-quick');
    if (cQuick) cQuick.checked = dashPrefs.showQuickActions;
  }

  function saveDashboardCustomization() {
    const nameInput = document.getElementById('dash-pref-name');
    if (nameInput && nameInput.value.trim()) dashPrefs.userName = nameInput.value.trim();

    const cStats = document.getElementById('dash-pref-stats');
    const cGarden = document.getElementById('dash-pref-garden');
    const cCharts = document.getElementById('dash-pref-charts');
    const cQuick = document.getElementById('dash-pref-quick');

    if (cStats) dashPrefs.showSummaryStats = cStats.checked;
    if (cGarden) dashPrefs.showGarden = cGarden.checked;
    if (cCharts) dashPrefs.showCharts = cCharts.checked;
    if (cQuick) dashPrefs.showQuickActions = cQuick.checked;

    saveDashPrefs();
    updateDashboardAll();
    updateHomeWelcomeProgress();
    const panel = document.getElementById('dash-customizer-panel');
    if (panel) panel.style.display = 'none';
    showToast('Dashboard layout saved!');
  }

  // --- ACHIEVEMENT GARDEN ---
  function loadGarden() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GARDEN);
      if (saved) gardenData = { ...gardenData, ...JSON.parse(saved) };
    } catch (e) {}
    calculateGardenStage();
  }

  function saveGarden() {
    try {
      localStorage.setItem(STORAGE_KEY_GARDEN, JSON.stringify(gardenData));
    } catch (e) {}
  }

  function calculateGardenStage() {
    const p = gardenData.points;
    if (p < 25) gardenData.stage = 1;
    else if (p < 60) gardenData.stage = 2;
    else if (p < 120) gardenData.stage = 3;
    else if (p < 200) gardenData.stage = 4;
    else gardenData.stage = 5;
  }

  function addGardenPoints(amount, reason = 'Activity completed') {
    gardenData.points += amount;
    gardenData.waterDrops++;
    gardenData.sunshine++;
    calculateGardenStage();
    saveGarden();
    updateGardenUI();
    updateHomeWelcomeProgress();
    showToast(`🌱 +${amount} Garden Points: ${reason}`);
    if (window.Accessibility) window.Accessibility.playSound('plant');
  }

  function waterPlant() {
    if (gardenData.waterDrops <= 0) {
      showToast('Complete a task, quiz, or breathing cycle to earn more water drops!');
      return;
    }
    gardenData.waterDrops--;
    gardenData.points += 5;
    calculateGardenStage();
    saveGarden();
    updateGardenUI();
    updateDashboardAll();
    showToast('💧 Plant watered! (+5 Growth Points)');
    if (window.Accessibility) window.Accessibility.playSound('chime');
  }

  function setupGardenUI() {
    updateGardenUI();
    const waterBtn = document.getElementById('btn-garden-water');
    if (waterBtn) waterBtn.addEventListener('click', waterPlant);

    const miniWidget = document.getElementById('sidebar-garden-widget');
    if (miniWidget) miniWidget.addEventListener('click', () => navigateTo('dashboard'));

    const toggleCustBtn = document.getElementById('btn-toggle-dash-customizer');
    const custPanel = document.getElementById('dash-customizer-panel');
    if (toggleCustBtn && custPanel) {
      toggleCustBtn.addEventListener('click', () => {
        custPanel.style.display = custPanel.style.display === 'none' ? 'block' : 'none';
      });
    }

    const saveCustBtn = document.getElementById('btn-save-dash-prefs');
    if (saveCustBtn) saveCustBtn.addEventListener('click', saveDashboardCustomization);
  }

  function updateGardenUI() {
    calculateGardenStage();
    const stageNames = ['', 'Dormant Seed', 'Curious Little Sprout', 'Vibrant Green Sapling', 'Budding Pastel Flower', 'Grand Flourishing Tree'];
    const stageIcons = ['', '🌰', '🌱', '🌿', '🌸', '🌳'];
    const currentName = stageNames[gardenData.stage];
    const currentIcon = stageIcons[gardenData.stage];

    const miniIcon = document.getElementById('sidebar-garden-icon');
    const miniText = document.getElementById('sidebar-garden-stage');
    if (miniIcon) miniIcon.textContent = currentIcon;
    if (miniText) miniText.textContent = `Stage ${gardenData.stage}: ${currentName}`;

    const badgeEl = document.getElementById('garden-stage-badge');
    const pointsEl = document.getElementById('garden-points-display');
    const progressFill = document.getElementById('garden-progress-fill');
    const progressText = document.getElementById('garden-progress-text');
    const waterDropsEl = document.getElementById('garden-water-drops');
    const plantCanvas = document.getElementById('garden-plant-svg');

    if (badgeEl) badgeEl.textContent = `${currentIcon} Stage ${gardenData.stage}: ${currentName}`;
    if (pointsEl) pointsEl.textContent = `${gardenData.points} Growth Points`;
    if (waterDropsEl) waterDropsEl.textContent = `💧 ${gardenData.waterDrops} drops`;

    let nextTarget = 200, prevTarget = 0;
    if (gardenData.stage === 1) { prevTarget = 0; nextTarget = 25; }
    else if (gardenData.stage === 2) { prevTarget = 25; nextTarget = 60; }
    else if (gardenData.stage === 3) { prevTarget = 60; nextTarget = 120; }
    else if (gardenData.stage === 4) { prevTarget = 120; nextTarget = 200; }
    else { prevTarget = 200; nextTarget = 300; }

    const stageProgress = Math.min(100, Math.round(((gardenData.points - prevTarget) / (nextTarget - prevTarget)) * 100));
    if (progressFill) progressFill.style.width = `${Math.max(5, stageProgress)}%`;
    if (progressText) progressText.textContent = `${gardenData.points} / ${nextTarget} pts to next bloom`;
    if (plantCanvas) plantCanvas.innerHTML = renderSvgPlant(gardenData.stage);
  }

  function renderSvgPlant(stage) {
    if (stage === 1) {
      return `<svg viewBox="0 0 160 160" width="100%" height="100%"><ellipse cx="80" cy="130" rx="45" ry="14" fill="#a68a68"/><path d="M45,110 L115,110 L105,145 L55,145 Z" fill="#d4a373" stroke="#bc6c25" stroke-width="2"/><ellipse cx="80" cy="110" rx="35" ry="10" fill="#582f0e"/><ellipse cx="80" cy="106" rx="9" ry="6" fill="#dda15e" transform="rotate(-15 80 106)"/></svg>`;
    } else if (stage === 2) {
      return `<svg viewBox="0 0 160 160" width="100%" height="100%"><path d="M45,110 L115,110 L105,145 L55,145 Z" fill="#d4a373" stroke="#bc6c25" stroke-width="2"/><ellipse cx="80" cy="110" rx="35" ry="10" fill="#582f0e"/><path d="M80,108 Q82,85 80,75" stroke="#52b788" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M80,78 Q60,65 72,55 Q82,65 80,78" fill="#74c69d"/><path d="M80,78 Q100,65 88,55 Q78,65 80,78" fill="#52b788"/></svg>`;
    } else if (stage === 3) {
      return `<svg viewBox="0 0 160 160" width="100%" height="100%"><path d="M45,115 L115,115 L105,148 L55,148 Z" fill="#d4a373" stroke="#bc6c25" stroke-width="2"/><ellipse cx="80" cy="115" rx="35" ry="10" fill="#582f0e"/><path d="M80,114 Q78,75 80,45" stroke="#2d6a4f" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M79,85 Q60,75 50,60 Q70,68 79,80" fill="#74c69d"/><path d="M80,72 Q100,60 110,48 Q90,56 80,68" fill="#52b788"/><path d="M80,48 Q70,30 80,22 Q90,30 80,48" fill="#95d5b2"/></svg>`;
    } else if (stage === 4) {
      return `<svg viewBox="0 0 160 160" width="100%" height="100%"><path d="M45,118 L115,118 L105,150 L55,150 Z" fill="#d4a373" stroke="#bc6c25" stroke-width="2"/><ellipse cx="80" cy="118" rx="35" ry="10" fill="#582f0e"/><path d="M80,118 Q83,75 80,40" stroke="#2d6a4f" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M80,85 Q55,75 50,55 Q72,66 80,80" fill="#52b788"/><path d="M80,70 Q105,62 110,42 Q88,54 80,68" fill="#74c69d"/><circle cx="80" cy="30" r="9" fill="#ffb4a2"/><circle cx="70" cy="38" r="9" fill="#ffb4a2"/><circle cx="90" cy="38" r="9" fill="#ffb4a2"/><circle cx="74" cy="50" r="9" fill="#ffb4a2"/><circle cx="86" cy="50" r="9" fill="#ffb4a2"/><circle cx="80" cy="41" r="8" fill="#ffe3a8"/></svg>`;
    }
    return `<svg viewBox="0 0 160 160" width="100%" height="100%"><ellipse cx="80" cy="142" rx="55" ry="12" fill="#d8f3dc"/><path d="M72,140 Q76,90 70,65 Q80,85 88,140 Z" fill="#6f4e37"/><circle cx="55" cy="55" r="28" fill="#52b788" opacity="0.9"/><circle cx="105" cy="55" r="28" fill="#74c69d" opacity="0.9"/><circle cx="80" cy="40" r="32" fill="#40916c" opacity="0.95"/><circle cx="60" cy="45" r="5" fill="#f4a261"/><circle cx="95" cy="40" r="5" fill="#e76f51"/><circle cx="80" cy="65" r="5" fill="#ffd166"/></svg>`;
  }

  function speakAacMessage(phrase) {
    const banner = document.getElementById('aac-spoken-banner');
    const bannerText = document.getElementById('aac-spoken-phrase');
    if (banner && bannerText) {
      bannerText.textContent = `"${phrase}"`;
      banner.style.display = 'flex';
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(phrase);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
    showToast(`🗣️ Communicated: ${phrase}`);
    if (window.Accessibility) window.Accessibility.playSound('click');
  }

  // --- SENSORY ESCAPE MODAL ---
  function setupSensoryEscapeModal() {
    const modal = document.getElementById('modal-sensory-escape-container');
    const closeBtn = document.getElementById('btn-close-sensory-escape');
    document.querySelectorAll('.trigger-sensory-escape').forEach(btn => {
      btn.addEventListener('click', () => {
        if (modal) modal.classList.add('active');
        if (window.Wellness) window.Wellness.startBreathing();
      });
    });
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        if (window.Wellness) window.Wellness.stopBreathing();
      });
    }
  }

  // --- COMMUNITY (POSTS, ANONYMOUS QUESTIONS, LIKES, COMMENTS, DELETE WITH CONFIRM) ---
  function loadCommunity() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMMUNITY);
      communityPosts = saved ? JSON.parse(saved) : [...initialCommunityPosts];
    } catch (e) {
      communityPosts = [...initialCommunityPosts];
    }
  }

  function saveCommunity() {
    try {
      localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(communityPosts));
    } catch (e) {}
  }

  function setupCommunityUI() {
    renderCommunityPosts();

    document.querySelectorAll('.community-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.community-filters .filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        activeCommunityCategory = e.currentTarget.getAttribute('data-category');
        renderCommunityPosts();
      });
    });

    const searchInput = document.getElementById('community-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        activeCommunitySearch = e.target.value.toLowerCase();
        renderCommunityPosts();
      });
    }

    const openModalBtn = document.getElementById('btn-open-community-modal');
    const modal = document.getElementById('modal-community-post');
    const closeModalBtn = document.getElementById('btn-close-community-modal');
    const anonCheck = document.getElementById('post-anonymous-check');
    const authorInput = document.getElementById('post-author-input');

    if (anonCheck && authorInput) {
      anonCheck.addEventListener('change', () => {
        authorInput.disabled = anonCheck.checked;
        if (anonCheck.checked) authorInput.value = 'Anonymous Member';
        else authorInput.value = '';
      });
    }

    if (openModalBtn && modal) openModalBtn.addEventListener('click', () => modal.classList.add('active'));
    if (closeModalBtn && modal) closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));

    const form = document.getElementById('community-new-post-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const isAnon = anonCheck && anonCheck.checked;
        const author = isAnon ? 'Anonymous Member' : (authorInput.value.trim() || 'Community Friend');
        const role = isAnon ? 'Anonymous Submission' : (document.getElementById('post-role-input').value.trim() || 'Community Member');
        const cat = document.getElementById('post-category-select').value;
        const title = document.getElementById('post-title-input').value.trim();
        const content = document.getElementById('post-content-textarea').value.trim();

        if (!title || !content) {
          showToast('Please enter both a title and a message.');
          return;
        }

        communityPosts.unshift({
          id: Date.now(),
          author,
          role,
          category: cat,
          title,
          content,
          upvotes: 1,
          tags: [cat.toUpperCase(), isAnon ? 'ANONYMOUS' : 'LOCAL POST'],
          time: 'Just now',
          own: true,
          comments: []
        });

        saveCommunity();
        renderCommunityPosts();
        if (modal) modal.classList.remove('active');
        form.reset();
        if (authorInput) authorInput.disabled = false;
        showToast('Post saved to your local Community Demo!');
        addGardenPoints(10, 'Community Contribution');
      });
    }
  }

  function renderCommunityPosts() {
    const container = document.getElementById('community-posts-container');
    if (!container) return;

    let filtered = communityPosts;
    if (activeCommunityCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCommunityCategory);
    }
    if (activeCommunitySearch) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(activeCommunitySearch) ||
        p.content.toLowerCase().includes(activeCommunitySearch) ||
        p.tags.some(t => t.toLowerCase().includes(activeCommunitySearch))
      );
    }

    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state-box">No posts match this filter yet. Be the first to share a question or experience!</div>`;
      return;
    }

    container.innerHTML = filtered.map(post => {
      const comments = post.comments || [];
      return `
        <div class="post-card" data-id="${post.id}">
          <div class="post-meta">
            <div class="post-author-box">
              <div class="post-avatar">${escapeHtml(post.author.charAt(0).toUpperCase())}</div>
              <div>
                <div class="post-author-name">${escapeHtml(post.author)}</div>
                <div class="post-author-role">${escapeHtml(post.role)}</div>
              </div>
            </div>
            <div class="item-actions">
              <span style="font-size: 12px; color: var(--text-muted);">${escapeHtml(post.time)}</span>
              ${post.own ? `<button type="button" class="btn btn-sm btn-secondary" onclick="App.deleteCommunityPost(${post.id})" title="Delete your post">✕</button>` : ''}
            </div>
          </div>
          <h4 style="font-size: 17px; margin-bottom: 8px;">${escapeHtml(post.title)}</h4>
          <p class="post-content">${escapeHtml(post.content)}</p>
          <div class="post-footer">
            <div style="display:flex; gap: 6px; flex-wrap:wrap;">
              ${post.tags.map(t => `<span class="badge badge-blue">${escapeHtml(t)}</span>`).join('')}
            </div>
            <button type="button" class="btn btn-sm btn-secondary" onclick="App.upvotePost(${post.id})">
              💙 <span>${post.upvotes} Helpful</span>
            </button>
          </div>
          <div class="comments-thread">
            ${comments.map(c => `
              <div class="comment-item">
                <strong>${escapeHtml(c.author)}:</strong> ${escapeHtml(c.text)}
              </div>
            `).join('')}
            <form class="comment-form-row" onsubmit="event.preventDefault(); App.addCommentToPost(${post.id}, this);">
              <input type="text" class="form-input" placeholder="Write a supportive reply..." required aria-label="Reply to post">
              <button type="submit" class="btn btn-sm btn-primary">Reply</button>
            </form>
          </div>
        </div>
      `;
    }).join('');
  }

  function upvotePost(id) {
    const post = communityPosts.find(p => p.id === id);
    if (post) {
      post.upvotes++;
      saveCommunity();
      renderCommunityPosts();
      if (window.Accessibility) window.Accessibility.playSound('click');
    }
  }

  function addCommentToPost(id, formEl) {
    const input = formEl.querySelector('input');
    if (!input || !input.value.trim()) return;
    const post = communityPosts.find(p => p.id === id);
    if (!post) return;
    if (!post.comments) post.comments = [];
    post.comments.push({
      id: Date.now(),
      author: dashPrefs.userName || 'You',
      text: input.value.trim()
    });
    saveCommunity();
    renderCommunityPosts();
    showToast('Comment added!');
  }

  function deleteCommunityPost(id) {
    if (!window.confirm('Delete this post from the local community board?')) return;
    communityPosts = communityPosts.filter(p => p.id !== id);
    saveCommunity();
    renderCommunityPosts();
    showToast('Post removed.');
  }

  // --- PARENT & TEACHER PORTAL ---
  function loadPortalData() {
    try {
      const savedObs = localStorage.getItem(STORAGE_KEY_PORTAL_NOTES);
      portalObservations = savedObs ? JSON.parse(savedObs) : [
        { id: 1, date: 'Sample Log', note: 'Worked 15 mins smoothly using colored mint reading tint and headphones.' }
      ];
      const savedCheck = localStorage.getItem(STORAGE_KEY_PORTAL_CHECK);
      if (savedCheck) portalChecklist = JSON.parse(savedCheck);
    } catch (e) {}
  }

  function savePortalData() {
    try {
      localStorage.setItem(STORAGE_KEY_PORTAL_NOTES, JSON.stringify(portalObservations));
      localStorage.setItem(STORAGE_KEY_PORTAL_CHECK, JSON.stringify(portalChecklist));
    } catch (e) {}
  }

  function setupPortalUI() {
    document.querySelectorAll('.portal-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.portal-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const tab = e.currentTarget.getAttribute('data-tab');
        document.querySelectorAll('.portal-tab-pane').forEach(pane => {
          pane.style.display = pane.id === `portal-pane-${tab}` ? 'block' : 'none';
        });
      });
    });

    const printGuideBtn = document.getElementById('btn-print-parent-guide');
    if (printGuideBtn) printGuideBtn.addEventListener('click', () => window.print());

    const downloadParentBtn = document.getElementById('btn-download-parent-guide');
    if (downloadParentBtn) {
      downloadParentBtn.addEventListener('click', () => {
        downloadTextFile('NeuroCare-Parent-Teacher-Guide.txt',
          `NEUROCARE PARENT & TEACHER ACCOMMODATION GUIDE\n================================================\n\n` +
          `1. AT-HOME SUPPORT\n- Externalize routines with visual picture schedules.\n- Give 5-minute & 2-minute gentle transition notices.\n- During sensory overload, prioritize quiet safety over lectures.\n\n` +
          `2. CLASSROOM ACCOMMODATIONS\n- Break instructions into single numbered steps.\n- Permit pastel reading overlays, TTS audio readers, and quiet fidgets.\n- Offer alternative assessment formats (oral, mind-map, typed).\n\n` +
          `Note: Educational resource generated from NeuroCare.`
        );
      });
    }

    const obsForm = document.getElementById('portal-observation-form');
    if (obsForm) {
      obsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('portal-observation-input');
        if (input && input.value.trim()) {
          portalObservations.unshift({
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            note: input.value.trim()
          });
          savePortalData();
          renderPortalObservations();
          input.value = '';
          showToast('Observation note saved!');
        }
      });
    }

    renderPortalChecklist();
    renderPortalObservations();
    renderPortalProgressOverview();
  }

  function renderPortalProgressOverview() {
    const el = document.getElementById('portal-student-overview');
    if (!el) return;
    const adhdStats = window.ADHD ? window.ADHD.getStats() : { tasksCompletedTotal: 0, minutesFocused: 0 };
    const learnProg = window.Learning ? window.Learning.getProgress() : { quizzesCompleted: 0, starsEarned: 0, mathSolved: 0 };
    const moodCount = window.Wellness ? window.Wellness.getMoodHistory().length : 0;

    el.innerHTML = `
      <div style="font-size:13px; color:var(--text-muted); margin-bottom:10px;">
        Learner Profile: <strong style="color:var(--text-primary);">${escapeHtml(dashPrefs.userName)}</strong> (Synced with this browser)
      </div>
      <div class="grid-4" style="gap:12px;">
        <div style="padding:14px; background:var(--bg-card-subtle); border-radius:var(--radius-md); text-align:center;">
          <strong style="font-size:22px; color:var(--accent-mint);">${adhdStats.tasksCompletedTotal}</strong>
          <div style="font-size:12px; color:var(--text-muted);">Tasks Completed</div>
        </div>
        <div style="padding:14px; background:var(--bg-card-subtle); border-radius:var(--radius-md); text-align:center;">
          <strong style="font-size:22px; color:var(--accent-peach);">${adhdStats.minutesFocused}m</strong>
          <div style="font-size:12px; color:var(--text-muted);">Focused Study Time</div>
        </div>
        <div style="padding:14px; background:var(--bg-card-subtle); border-radius:var(--radius-md); text-align:center;">
          <strong style="font-size:22px; color:var(--accent-blue);">${learnProg.quizzesCompleted} / ${learnProg.starsEarned}★</strong>
          <div style="font-size:12px; color:var(--text-muted);">Quizzes & Learning Stars</div>
        </div>
        <div style="padding:14px; background:var(--bg-card-subtle); border-radius:var(--radius-md); text-align:center;">
          <strong style="font-size:22px; color:var(--accent-lavender);">${moodCount}</strong>
          <div style="font-size:12px; color:var(--text-muted);">Wellness Check-Ins</div>
        </div>
      </div>
    `;
  }

  function togglePortalChecklist(id) {
    const item = portalChecklist.find(i => i.id === id);
    if (item) {
      item.done = !item.done;
      savePortalData();
      renderPortalChecklist();
    }
  }

  function renderPortalChecklist() {
    const container = document.getElementById('portal-practical-checklist');
    if (!container) return;
    container.innerHTML = portalChecklist.map(item => `
      <label style="display:flex; align-items:center; gap:10px; padding:10px; background:var(--bg-card-subtle); border-radius:var(--radius-sm); margin-bottom:6px; cursor:pointer; font-size:13.5px;">
        <input type="checkbox" ${item.done ? 'checked' : ''} onchange="App.togglePortalChecklist('${item.id}')" style="width:17px; height:17px; accent-color:var(--accent-blue);">
        <span style="${item.done ? 'text-decoration:line-through; opacity:0.65;' : ''}">${escapeHtml(item.text)}</span>
      </label>
    `).join('');
  }

  function deletePortalObservation(id) {
    if (!window.confirm('Delete this observation note?')) return;
    portalObservations = portalObservations.filter(o => o.id !== id);
    savePortalData();
    renderPortalObservations();
  }

  function renderPortalObservations() {
    const container = document.getElementById('portal-observations-list');
    if (!container) return;
    if (!portalObservations.length) {
      container.innerHTML = `<div class="empty-state-box">No observations logged yet.</div>`;
      return;
    }
    container.innerHTML = portalObservations.map(o => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--bg-card-subtle); border-radius:var(--radius-sm); margin-bottom:6px; font-size:13.5px;">
        <div><strong>${escapeHtml(o.date)}:</strong> ${escapeHtml(o.note)}</div>
        <button type="button" class="btn btn-sm btn-secondary" onclick="App.deletePortalObservation(${o.id})">✕</button>
      </div>
    `).join('');
  }

  // --- PROFESSIONAL RESOURCES SEARCHABLE DIRECTORY & CHECKLIST ---
  function setupResourcesUI() {
    const searchInput = document.getElementById('resources-search-input');
    const filterSelect = document.getElementById('resources-type-filter');

    const update = () => {
      const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const type = filterSelect ? filterSelect.value : 'all';
      renderResourcesDirectory(type, q);
    };

    if (searchInput) searchInput.addEventListener('input', update);
    if (filterSelect) filterSelect.addEventListener('change', update);
    renderResourcesDirectory('all', '');
  }

  function renderResourcesDirectory(typeFilter = 'all', query = '') {
    const container = document.getElementById('resources-directory-grid');
    if (!container) return;

    const filtered = resourcesDirectory.filter(item => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesQuery = !query ||
        item.title.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesType && matchesQuery;
    });

    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state-box" style="grid-column: 1 / -1;">No matching specialist guides found. Try clearing the search filter.</div>`;
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="card" style="display:flex; flex-direction:column;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <span style="font-size:32px;">${item.icon}</span>
          <span class="badge ${item.badge.includes('Sample') ? 'badge-peach' : 'badge-blue'}">${escapeHtml(item.badge)}</span>
        </div>
        <h4>${escapeHtml(item.title)}</h4>
        <div style="font-size:12px; color:var(--accent-blue); font-weight:600; margin:4px 0 8px;">${escapeHtml(item.category)}</div>
        <p style="font-size:13.5px; color:var(--text-secondary); line-height:1.5; flex:1;">${escapeHtml(item.desc)}</p>
        ${item.link ? `<div style="margin-top:14px;"><a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">${escapeHtml(item.linkLabel)}</a></div>` : ''}
      </div>
    `).join('');
  }

  function loadChecklist() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHECKLIST);
      checklistItems = saved ? JSON.parse(saved) : [...defaultChecklist];
    } catch (e) {
      checklistItems = [...defaultChecklist];
    }
  }

  function saveChecklist() {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(checklistItems));
    } catch (e) {}
  }

  function setupChecklistUI() {
    renderChecklist();

    const addForm = document.getElementById('appointment-checklist-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('checklist-new-item-input');
        if (input && input.value.trim()) {
          checklistItems.push({ id: 'item-' + Date.now(), text: input.value.trim(), done: false });
          saveChecklist();
          renderChecklist();
          input.value = '';
          showToast('Checklist item added!');
        }
      });
    }

    const printChecklistBtn = document.getElementById('btn-print-appointment-checklist');
    if (printChecklistBtn) printChecklistBtn.addEventListener('click', () => window.print());

    const downloadChecklistBtn = document.getElementById('btn-download-checklist');
    if (downloadChecklistBtn) {
      downloadChecklistBtn.addEventListener('click', () => {
        const text = `NEUROCARE APPOINTMENT PREPARATION CHECKLIST\n===============================================\n\n` +
          checklistItems.map(i => `[${i.done ? 'x' : ' '}] ${i.text}`).join('\n');
        downloadTextFile('NeuroCare-Appointment-Checklist.txt', text);
      });
    }
  }

  function toggleChecklistItem(id) {
    const item = checklistItems.find(i => i.id === id);
    if (item) {
      item.done = !item.done;
      saveChecklist();
      renderChecklist();
      if (window.Accessibility) window.Accessibility.playSound('click');
    }
  }

  function deleteChecklistItem(id) {
    if (!window.confirm('Remove this item from your appointment checklist?')) return;
    checklistItems = checklistItems.filter(i => i.id !== id);
    saveChecklist();
    renderChecklist();
  }

  function renderChecklist() {
    const container = document.getElementById('appointment-checklist-container');
    if (!container) return;
    if (!checklistItems.length) {
      container.innerHTML = `<div class="empty-state-box">Checklist is empty. Add your own questions or reminders above!</div>`;
      return;
    }

    container.innerHTML = checklistItems.map(item => `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); margin-bottom: 8px; border: 1px solid var(--border-light);">
        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; flex:1;">
          <input type="checkbox" ${item.done ? 'checked' : ''} onchange="App.toggleChecklistItem('${item.id}')" style="width: 18px; height: 18px; accent-color: var(--accent-blue);">
          <span style="font-size: 14.5px; ${item.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(item.text)}</span>
        </label>
        <button type="button" class="btn btn-sm btn-secondary" onclick="App.deleteChecklistItem('${item.id}')" aria-label="Delete checklist item">✕</button>
      </div>
    `).join('');
  }

  // --- UTILITIES: FILE DOWNLOAD, MODALS & TOASTS ---
  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  }

  function setupModalKeyboardClose() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
        if (window.Wellness) window.Wellness.stopBreathing();
      }
    });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
          if (backdrop.id === 'modal-sensory-escape-container' && window.Wellness) {
            window.Wellness.stopBreathing();
          }
        }
      });
    });
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
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
    navigateTo,
    addGardenPoints,
    waterPlant,
    speakAacMessage,
    upvotePost,
    addCommentToPost,
    deleteCommunityPost,
    toggleChecklistItem,
    deleteChecklistItem,
    togglePortalChecklist,
    deletePortalObservation,
    updateDashboardAll,
    showToast
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
