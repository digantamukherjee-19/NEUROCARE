/**
 * NeuroCare - Main Application Controller
 * Handles SPA hash routing, mobile navigation, Achievement Garden engine,
 * AAC board speech, Community forum, Parent/Teacher portal, Resources checklist,
 * and Toast notifications.
 */

const App = (function () {
  'use strict';

  const STORAGE_KEY_GARDEN = 'neurocare_garden_data';
  const STORAGE_KEY_COMMUNITY = 'neurocare_community_posts';
  const STORAGE_KEY_CHECKLIST = 'neurocare_appointment_checklist';

  // Achievement Garden State
  let gardenData = {
    points: 35,
    waterDrops: 3,
    sunshine: 5,
    stage: 2, // 1 to 5
    lastWatered: Date.now()
  };

  // Community Feed State
  let communityPosts = [];

  // Default initial sample posts for demonstration
  const initialCommunityPosts = [
    {
      id: 1,
      author: 'Maya S.',
      role: 'College Student (ADHD & Dyslexia)',
      category: 'adhd',
      title: 'The "Micro-Countdown" that stopped my morning paralysis',
      content: 'Whenever I feel glued to my bed or couch, I count down 3-2-1 out loud and just wiggle my toes first, then stand up. Once physical movement starts, the ADHD paralysis wall breaks!',
      upvotes: 42,
      tags: ['ADHD Hacks', 'Executive Function'],
      time: '2 hours ago'
    },
    {
      id: 2,
      author: 'David L.',
      role: 'High School Teacher',
      category: 'parent-teacher',
      title: 'Classroom tip: Soft yellow & mint paper instead of stark white',
      content: 'Printing worksheets on soft pastel yellow or mint green paper reduced reading fatigue for several of my dyslexic students. It is a simple, zero-cost accommodation that helps everyone!',
      upvotes: 68,
      tags: ['Teaching', 'Dyslexia Wins'],
      time: '1 day ago'
    },
    {
      id: 3,
      author: 'Sam R.',
      role: 'Software Developer (Autistic)',
      category: 'sensory',
      title: 'Carrying a mini sensory kit in my backpack',
      content: 'Loop earplugs, sunglasses for grocery store fluorescent lighting, and a soft texture fidget stone have made shopping trips so much calmer. Normalizing sensory aids is empowering.',
      upvotes: 53,
      tags: ['Autism & Sensory', 'Self Care'],
      time: '2 days ago'
    }
  ];

  // Appointment Checklist items
  const defaultChecklist = [
    { id: 'item-1', text: 'Written list of primary challenges (attention, reading speed, sensory triggers)', done: false },
    { id: 'item-2', text: 'School reports, teacher observations, or workplace feedback', done: false },
    { id: 'item-3', text: 'List of medications, vitamins, and regular sleep schedule notes', done: false },
    { id: 'item-4', text: 'Specific questions to ask the specialist regarding accommodations', done: false },
    { id: 'item-5', text: 'Comfort item or sensory tool for waiting in the clinic', done: false }
  ];
  let checklistItems = [];

  function init() {
    loadGarden();
    loadCommunity();
    loadChecklist();
    setupRouting();
    setupMobileMenu();
    setupGardenUI();
    setupSensoryEscapeModal();
    setupAacBoard();
    setupCommunityUI();
    setupPortalTabs();
    setupChecklistUI();
    updateDashboardDate();

    // Initialize all sub-modules
    if (window.Accessibility) window.Accessibility.init();
    if (window.ADHD) window.ADHD.init();
    if (window.Dyslexia) window.Dyslexia.init();
    if (window.Learning) window.Learning.init();
    if (window.Wellness) window.Wellness.init();
    if (window.Assistant) window.Assistant.init();
  }

  // --- SPA ROUTING & NAVIGATION ---
  function setupRouting() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Initial load
  }

  function handleRoute() {
    const rawHash = window.location.hash.slice(1);
    const validSections = [
      'home', 'dashboard', 'adhd', 'dyslexia', 'learning',
      'wellness', 'sensory', 'assistant', 'community', 'portal',
      'resources', 'settings'
    ];

    const currentSection = validSections.includes(rawHash) ? rawHash : 'home';

    // Toggle active section
    document.querySelectorAll('.page-section').forEach(section => {
      const id = section.id.replace('section-', '');
      section.classList.toggle('active', id === currentSection);
    });

    // Update sidebar nav active links
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentSection}`);
    });

    // Update header breadcrumb
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

    // Close mobile menu drawer if open
    closeMobileMenu();

    // Scroll window smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateTo(sectionId) {
    window.location.hash = sectionId;
  }

  function setupMobileMenu() {
    const btn = document.getElementById('btn-mobile-menu');
    const sidebar = document.getElementById('app-sidebar');
    if (!btn || !sidebar) return;

    btn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });

    // Close on click outside sidebar on mobile
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && !btn.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  function closeMobileMenu() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
  }

  function updateDashboardDate() {
    const dateEl = document.getElementById('dash-current-date');
    if (!dateEl) return;
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  // --- INNOVATIVE FEATURE C: ACHIEVEMENT GARDEN ---
  function loadGarden() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GARDEN);
      if (saved) gardenData = { ...gardenData, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Could not read garden data', e);
    }
    calculateGardenStage();
  }

  function saveGarden() {
    try {
      localStorage.setItem(STORAGE_KEY_GARDEN, JSON.stringify(gardenData));
    } catch (e) {
      console.warn('Could not save garden data', e);
    }
  }

  function calculateGardenStage() {
    const p = gardenData.points;
    if (p < 25) gardenData.stage = 1;      // Seed
    else if (p < 60) gardenData.stage = 2; // Sprout
    else if (p < 120) gardenData.stage = 3;// Sapling
    else if (p < 200) gardenData.stage = 4;// Budding Flower
    else gardenData.stage = 5;             // Flourishing Tree
  }

  function addGardenPoints(amount, reason = 'Activity completed') {
    gardenData.points += amount;
    gardenData.waterDrops++;
    gardenData.sunshine++;
    calculateGardenStage();
    saveGarden();
    updateGardenUI();
    showToast(`🌱 +${amount} Garden Points: ${reason}`);
    if (window.Accessibility) window.Accessibility.playSound('plant');
  }

  function waterPlant() {
    if (gardenData.waterDrops <= 0) {
      alert('Complete more tasks or reading exercises to earn water drops!');
      return;
    }
    gardenData.waterDrops--;
    gardenData.points += 5;
    calculateGardenStage();
    saveGarden();
    updateGardenUI();
    showToast('💧 Plant lovingly watered! (+5 pts)');
    if (window.Accessibility) window.Accessibility.playSound('chime');
  }

  function setupGardenUI() {
    updateGardenUI();

    const waterBtn = document.getElementById('btn-garden-water');
    if (waterBtn) waterBtn.addEventListener('click', waterPlant);

    // Mini widget click navigates to dashboard
    const miniWidget = document.getElementById('sidebar-garden-widget');
    if (miniWidget) {
      miniWidget.addEventListener('click', () => navigateTo('dashboard'));
    }
  }

  function updateGardenUI() {
    calculateGardenStage();

    const stageNames = [
      '', 'Dormant Seed in Warm Soil', 'Curious Little Sprout',
      'Vibrant Green Sapling', 'Budding Pastel Flower', 'Grand Flourishing Tree'
    ];
    const stageIcons = ['', '🌰', '🌱', '🌿', '🌸', '🌳'];

    const currentName = stageNames[gardenData.stage];
    const currentIcon = stageIcons[gardenData.stage];

    // Sidebar mini widget
    const miniIcon = document.getElementById('sidebar-garden-icon');
    const miniText = document.getElementById('sidebar-garden-stage');
    if (miniIcon) miniIcon.textContent = currentIcon;
    if (miniText) miniText.textContent = `Stage ${gardenData.stage}: ${currentName}`;

    // Full dashboard widget
    const badgeEl = document.getElementById('garden-stage-badge');
    const pointsEl = document.getElementById('garden-points-display');
    const progressFill = document.getElementById('garden-progress-fill');
    const progressText = document.getElementById('garden-progress-text');
    const waterDropsEl = document.getElementById('garden-water-drops');
    const plantCanvas = document.getElementById('garden-plant-svg');

    if (badgeEl) badgeEl.textContent = `${currentIcon} Stage ${gardenData.stage}: ${currentName}`;
    if (pointsEl) pointsEl.textContent = `${gardenData.points} Growth Points`;
    if (waterDropsEl) waterDropsEl.textContent = `💧 ${gardenData.waterDrops} drops`;

    // Calculate percentage towards next stage
    let nextTarget = 200;
    let prevTarget = 0;
    if (gardenData.stage === 1) { prevTarget = 0; nextTarget = 25; }
    else if (gardenData.stage === 2) { prevTarget = 25; nextTarget = 60; }
    else if (gardenData.stage === 3) { prevTarget = 60; nextTarget = 120; }
    else if (gardenData.stage === 4) { prevTarget = 120; nextTarget = 200; }
    else { prevTarget = 200; nextTarget = 300; }

    const stageProgress = Math.min(100, Math.round(((gardenData.points - prevTarget) / (nextTarget - prevTarget)) * 100));
    if (progressFill) progressFill.style.width = `${Math.max(5, stageProgress)}%`;
    if (progressText) progressText.textContent = `${gardenData.points} / ${nextTarget} pts to next bloom`;

    // Render SVG plant based on stage
    if (plantCanvas) {
      plantCanvas.innerHTML = renderSvgPlant(gardenData.stage);
    }
  }

  function renderSvgPlant(stage) {
    if (stage === 1) {
      // Seed in pot
      return `
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <ellipse cx="80" cy="130" rx="45" ry="14" fill="#a68a68" />
          <path d="M45,110 L115,110 L105,145 L55,145 Z" fill="#d4a373" stroke="#bc6c25" stroke-width="2" />
          <ellipse cx="80" cy="110" rx="35" ry="10" fill="#582f0e" />
          <!-- Seed -->
          <ellipse cx="80" cy="106" rx="9" ry="6" fill="#dda15e" transform="rotate(-15 80 106)" />
        </svg>
      `;
    } else if (stage === 2) {
      // Small sprout
      return `
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <path d="M45,110 L115,110 L105,145 L55,145 Z" fill="#d4a373" stroke="#bc6c25" stroke-width="2" />
          <ellipse cx="80" cy="110" rx="35" ry="10" fill="#582f0e" />
          <!-- Stem -->
          <path d="M80,108 Q82,85 80,75" stroke="#52b788" stroke-width="4" fill="none" stroke-linecap="round" />
          <!-- Leaf 1 -->
          <path d="M80,78 Q60,65 72,55 Q82,65 80,78" fill="#74c69d" stroke="#40916c" stroke-width="1.5" />
          <!-- Leaf 2 -->
          <path d="M80,78 Q100,65 88,55 Q78,65 80,78" fill="#52b788" stroke="#40916c" stroke-width="1.5" />
        </svg>
      `;
    } else if (stage === 3) {
      // Sapling with branches
      return `
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <path d="M45,115 L115,115 L105,148 L55,148 Z" fill="#d4a373" stroke="#bc6c25" stroke-width="2" />
          <ellipse cx="80" cy="115" rx="35" ry="10" fill="#582f0e" />
          <!-- Main Trunk -->
          <path d="M80,114 Q78,75 80,45" stroke="#2d6a4f" stroke-width="5" fill="none" stroke-linecap="round" />
          <!-- Branches & Leaves -->
          <path d="M79,85 Q60,75 50,60 Q70,68 79,80" fill="#74c69d" stroke="#2d6a4f" stroke-width="1.5" />
          <path d="M80,72 Q100,60 110,48 Q90,56 80,68" fill="#52b788" stroke="#2d6a4f" stroke-width="1.5" />
          <path d="M80,48 Q70,30 80,22 Q90,30 80,48" fill="#95d5b2" stroke="#2d6a4f" stroke-width="1.5" />
        </svg>
      `;
    } else if (stage === 4) {
      // Budding Flower
      return `
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <path d="M45,118 L115,118 L105,150 L55,150 Z" fill="#d4a373" stroke="#bc6c25" stroke-width="2" />
          <ellipse cx="80" cy="118" rx="35" ry="10" fill="#582f0e" />
          <path d="M80,118 Q83,75 80,40" stroke="#2d6a4f" stroke-width="5" fill="none" stroke-linecap="round" />
          <path d="M80,85 Q55,75 50,55 Q72,66 80,80" fill="#52b788" />
          <path d="M80,70 Q105,62 110,42 Q88,54 80,68" fill="#74c69d" />
          <!-- Flower Petals -->
          <circle cx="80" cy="30" r="9" fill="#ffb4a2" />
          <circle cx="70" cy="38" r="9" fill="#ffb4a2" />
          <circle cx="90" cy="38" r="9" fill="#ffb4a2" />
          <circle cx="74" cy="50" r="9" fill="#ffb4a2" />
          <circle cx="86" cy="50" r="9" fill="#ffb4a2" />
          <!-- Flower Center -->
          <circle cx="80" cy="41" r="8" fill="#ffe3a8" />
        </svg>
      `;
    } else {
      // Stage 5: Grand Flourishing Tree
      return `
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <ellipse cx="80" cy="142" rx="55" ry="12" fill="#d8f3dc" />
          <path d="M72,140 Q76,90 70,65 Q80,85 88,140 Z" fill="#6f4e37" stroke="#4a3525" stroke-width="1.5" />
          <!-- Lush Foliage Cloud -->
          <circle cx="55" cy="55" r="28" fill="#52b788" opacity="0.9" />
          <circle cx="105" cy="55" r="28" fill="#74c69d" opacity="0.9" />
          <circle cx="80" cy="40" r="32" fill="#40916c" opacity="0.95" />
          <!-- Blossoms / Golden Fruit -->
          <circle cx="60" cy="45" r="5" fill="#f4a261" />
          <circle cx="95" cy="40" r="5" fill="#e76f51" />
          <circle cx="80" cy="65" r="5" fill="#ffd166" />
          <circle cx="110" cy="68" r="4" fill="#f4a261" />
          <circle cx="50" cy="70" r="4" fill="#e76f51" />
        </svg>
      `;
    }
  }

  // --- INNOVATIVE FEATURE D: EXPRESS WITHOUT WORDS (AAC BOARD) ---
  function setupAacBoard() {
    document.querySelectorAll('.aac-card').forEach(card => {
      card.addEventListener('click', () => {
        const text = card.getAttribute('data-speak') || card.querySelector('.aac-text').textContent;
        speakAacMessage(text);
      });
    });
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

  // --- INNOVATIVE FEATURE F: SENSORY ESCAPE MODAL ---
  function setupSensoryEscapeModal() {
    const triggerButtons = document.querySelectorAll('.trigger-sensory-escape');
    const modal = document.getElementById('modal-sensory-escape-container');
    const closeBtn = document.getElementById('btn-close-sensory-escape');

    triggerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (modal) modal.classList.add('active');
        if (window.Wellness) {
          window.Wellness.toggleAmbientTrack('rain');
          window.Wellness.startBreathing();
        }
      });
    });

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        if (window.Wellness) {
          window.Wellness.stopBreathing();
        }
      });
    }
  }

  // --- COMMUNITY SECTION ---
  function loadCommunity() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMMUNITY);
      if (saved) communityPosts = JSON.parse(saved);
      else communityPosts = [...initialCommunityPosts];
    } catch (e) {
      communityPosts = [...initialCommunityPosts];
    }
  }

  function saveCommunity() {
    try {
      localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(communityPosts));
    } catch (e) {
      console.warn('Could not save community posts', e);
    }
  }

  function setupCommunityUI() {
    renderCommunityPosts('all');

    // Filter buttons
    document.querySelectorAll('.community-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.community-filters .filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const cat = e.currentTarget.getAttribute('data-category');
        renderCommunityPosts(cat);
      });
    });

    // Search bar
    const searchInput = document.getElementById('community-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        renderCommunityPosts('all', query);
      });
    }

    // Modal for posting
    const openModalBtn = document.getElementById('btn-open-community-modal');
    const modal = document.getElementById('modal-community-post');
    const closeModalBtn = document.getElementById('btn-close-community-modal');
    const form = document.getElementById('community-new-post-form');

    if (openModalBtn && modal) {
      openModalBtn.addEventListener('click', () => modal.classList.add('active'));
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const author = document.getElementById('post-author-input').value.trim() || 'Anonymous Friend';
        const role = document.getElementById('post-role-input').value.trim() || 'Community Member';
        const cat = document.getElementById('post-category-select').value;
        const title = document.getElementById('post-title-input').value.trim();
        const content = document.getElementById('post-content-textarea').value.trim();

        if (!title || !content) {
          alert('Please provide a title and your message.');
          return;
        }

        const newPost = {
          id: Date.now(),
          author,
          role,
          category: cat,
          title,
          content,
          upvotes: 1,
          tags: [cat.toUpperCase()],
          time: 'Just now'
        };

        communityPosts.unshift(newPost);
        saveCommunity();
        renderCommunityPosts('all');
        if (modal) modal.classList.remove('active');
        form.reset();
        showToast('🌟 Post shared with community!');
        addGardenPoints(10, 'Community Insight Shared');
      });
    }
  }

  function renderCommunityPosts(category = 'all', searchFilter = '') {
    const container = document.getElementById('community-posts-container');
    if (!container) return;

    let filtered = communityPosts;
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (searchFilter) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchFilter) ||
        p.content.toLowerCase().includes(searchFilter) ||
        p.tags.some(t => t.toLowerCase().includes(searchFilter))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-muted);">No posts found matching this filter. Be the first to share!</div>`;
      return;
    }

    container.innerHTML = filtered.map(post => `
      <div class="post-card" data-id="${post.id}">
        <div class="post-meta">
          <div class="post-author-box">
            <div class="post-avatar">${post.author.charAt(0).toUpperCase()}</div>
            <div>
              <div class="post-author-name">${escapeHtml(post.author)}</div>
              <div class="post-author-role">${escapeHtml(post.role)}</div>
            </div>
          </div>
          <span style="font-size: 12px; color: var(--text-muted);">${escapeHtml(post.time)}</span>
        </div>
        <h4 style="font-size: 17px; margin-bottom: 8px;">${escapeHtml(post.title)}</h4>
        <p class="post-content">${escapeHtml(post.content)}</p>
        <div class="post-footer">
          <div style="display:flex; gap: 6px;">
            ${post.tags.map(t => `<span class="badge badge-blue">${escapeHtml(t)}</span>`).join('')}
          </div>
          <button class="btn btn-sm btn-secondary" onclick="App.upvotePost(${post.id})" title="Helpful insight">
            💙 <span>${post.upvotes} Helpful</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  function upvotePost(id) {
    const post = communityPosts.find(p => p.id === id);
    if (post) {
      post.upvotes++;
      saveCommunity();
      renderCommunityPosts('all');
      if (window.Accessibility) window.Accessibility.playSound('click');
    }
  }

  // --- PARENT & TEACHER PORTAL ---
  function setupPortalTabs() {
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
    if (printGuideBtn) {
      printGuideBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // --- PROFESSIONAL RESOURCES CHECKLIST ---
  function loadChecklist() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHECKLIST);
      if (saved) checklistItems = JSON.parse(saved);
      else checklistItems = [...defaultChecklist];
    } catch (e) {
      checklistItems = [...defaultChecklist];
    }
  }

  function saveChecklist() {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(checklistItems));
    } catch (e) {
      console.warn('Could not save checklist', e);
    }
  }

  function setupChecklistUI() {
    renderChecklist();

    const printChecklistBtn = document.getElementById('btn-print-appointment-checklist');
    if (printChecklistBtn) {
      printChecklistBtn.addEventListener('click', () => {
        window.print();
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

  function renderChecklist() {
    const container = document.getElementById('appointment-checklist-container');
    if (!container) return;

    container.innerHTML = checklistItems.map(item => `
      <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md); margin-bottom: 8px; border: 1px solid var(--border-light);">
        <input type="checkbox" ${item.done ? 'checked' : ''} onchange="App.toggleChecklistItem('${item.id}')" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-blue);">
        <span style="font-size: 14.5px; ${item.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(item.text)}</span>
      </div>
    `).join('');
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init,
    navigateTo,
    addGardenPoints,
    waterPlant,
    speakAacMessage,
    upvotePost,
    toggleChecklistItem,
    showToast
  };
})();

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
