/**
 * NeuroCare - Accessibility & Settings Engine
 * Manages theme modes, typography sizing, contrast, reading ruler, and multi-language support.
 */

const Accessibility = (function () {
  'use strict';

  const STORAGE_KEY = 'neurocare_accessibility_settings';

  const defaultSettings = {
    theme: 'default', // 'default', 'dark', 'high-contrast', 'low-stim', 'lavender', 'mint'
    fontSize: '16px',
    fontFamily: 'default', // 'default', 'dyslexic', 'sans', 'serif'
    lineHeight: '1.6',
    letterSpacing: '0.01em',
    wordSpacing: '0.05em',
    reduceMotion: false,
    soundEnabled: true,
    language: 'en', // 'en', 'hi', 'bn'
    readingRuler: false,
    readingRulerHeight: 50,
    readingRulerColor: 'yellow'
  };

  let state = { ...defaultSettings };

  // Multi-Language Translation Dictionaries
  const translations = {
    en: {
      nav_home: 'Home',
      nav_dashboard: 'My Dashboard',
      nav_adhd: 'ADHD Support',
      nav_dyslexia: 'Dyslexia Support',
      nav_learning: 'Learning Centre',
      nav_wellness: 'Wellness Centre',
      nav_sensory: 'Autism & Sensory',
      nav_assistant: 'AI Assistant (Demo)',
      nav_community: 'Community',
      nav_portal: 'Parent & Teacher',
      nav_resources: 'Professional Resources',
      nav_settings: 'Settings & Accessibility',
      hero_title: 'Different Minds. Endless Possibilities.',
      hero_subtitle: 'A sensory-friendly, empowering learning and support platform designed to celebrate neurodiversity. Crafted with calm pastel aesthetics and practical, everyday cognitive tools.',
      btn_get_started: 'Get Started',
      btn_explore: 'Explore Features',
      btn_sensory_escape: 'Sensory Escape',
      garden_title: 'Achievement Garden',
      plant_growing: 'Plant is thriving!'
    },
    hi: {
      nav_home: 'होम (Home)',
      nav_dashboard: 'मेरा डैशबोर्ड (Dashboard)',
      nav_adhd: 'एडीएचडी सहायता (ADHD Support)',
      nav_dyslexia: 'डिस्लेक्सिया सहायता (Dyslexia)',
      nav_learning: 'सीखने का केंद्र (Learning Centre)',
      nav_wellness: 'कल्याण केंद्र (Wellness Centre)',
      nav_sensory: 'ऑटिज्म और संवेदी सहायता',
      nav_assistant: 'एआई सहायक (डेमो)',
      nav_community: 'समुदाय (Community)',
      nav_portal: 'अभिभावक और शिक्षक पोर्टल',
      nav_resources: 'व्यावसायिक संसाधन',
      nav_settings: 'सेटिंग्स और सुगमता',
      hero_title: 'अलग मस्तिष्क। असीम संभावनाएं।',
      hero_subtitle: 'न्यूरोडाइवर्सिटी के सम्मान और समर्थन के लिए एक शांत, सहज और अनुकूलित शिक्षण मंच।',
      btn_get_started: 'शुरू करें',
      btn_explore: 'सुविधाएं देखें',
      btn_sensory_escape: 'शांत वातावरण (Sensory Escape)',
      garden_title: 'उपलब्धि बगीचा',
      plant_growing: 'पौधा फल-फूल रहा है!'
    },
    bn: {
      nav_home: 'হোম (Home)',
      nav_dashboard: 'আমার ড্যাশবোর্ড (Dashboard)',
      nav_adhd: 'এডিএইচডি সহায়তা (ADHD Support)',
      nav_dyslexia: 'ডিসলেক্সিয়া সহায়তা (Dyslexia)',
      nav_learning: 'শেখার কেন্দ্র (Learning Centre)',
      nav_wellness: 'সুস্থতা কেন্দ্র (Wellness)',
      nav_sensory: 'অটিজম ও সংবেদনশীল সহায়তা',
      nav_assistant: 'এআই সহকারী (ডেমো)',
      nav_community: 'কমিউনিটি (Community)',
      nav_portal: 'অভিভাবক ও শিক্ষক পোর্টাল',
      nav_resources: 'পেশাদার সম্পদসমূহ',
      nav_settings: 'সেটিংস ও অ্যাক্সেসিবিলিটি',
      hero_title: 'অনন্য মস্তিষ্ক। সীমাহীন সম্ভাবনা।',
      hero_subtitle: 'নিউরোডাইভার্সিটি উদযাপনের জন্য একটি শান্ত, সংবেদনশীল ও সহজ শিক্ষণ এবং সহায়ক প্ল্যাটফর্ম।',
      btn_get_started: 'শুরু করুন',
      btn_explore: 'বৈশিষ্ট্যগুলি দেখুন',
      btn_sensory_escape: 'সংবেদনশীল প্রশান্তি (Sensory Escape)',
      garden_title: 'কৃতিত্ব বাগান',
      plant_growing: 'গাছটি সুন্দরভাবে বেড়ে উঠছে!'
    }
  };

  function init() {
    loadSettings();
    applyAllSettings();
    setupRulerTracking();
    bindSettingsControls();
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read accessibility settings from localStorage', e);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save accessibility settings to localStorage', e);
    }
  }

  function applyAllSettings() {
    applyTheme(state.theme);
    applyFontSize(state.fontSize);
    applyFontFamily(state.fontFamily);
    applySpacing(state.lineHeight, state.letterSpacing, state.wordSpacing);
    applyReduceMotion(state.reduceMotion);
    applyReadingRuler(state.readingRuler);
    applyLanguage(state.language);
  }

  function applyTheme(theme) {
    state.theme = theme;
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-high-contrast', 'theme-low-stim', 'theme-lavender', 'theme-mint');

    if (theme === 'dark') body.classList.add('theme-dark');
    else if (theme === 'high-contrast') body.classList.add('theme-high-contrast');
    else if (theme === 'low-stim') body.classList.add('theme-low-stim');
    else if (theme === 'lavender') body.classList.add('theme-lavender');
    else if (theme === 'mint') body.classList.add('theme-mint');

    // Update settings dropdown / radio if present
    const select = document.getElementById('setting-theme-select');
    if (select) select.value = theme;
    saveSettings();
  }

  function applyFontSize(size) {
    state.fontSize = size;
    document.documentElement.style.fontSize = size;
    const select = document.getElementById('setting-font-size-select');
    if (select) select.value = size;
    saveSettings();
  }

  function applyFontFamily(font) {
    state.fontFamily = font;
    const body = document.body;
    body.classList.remove('font-dyslexic');

    if (font === 'dyslexic') {
      body.classList.add('font-dyslexic');
      document.documentElement.style.setProperty('--font-family-base', "'OpenDyslexic', 'Comic Sans MS', 'Lexend', Verdana, sans-serif");
    } else if (font === 'sans') {
      document.documentElement.style.setProperty('--font-family-base', "'Segoe UI', Roboto, Helvetica, Arial, sans-serif");
    } else if (font === 'serif') {
      document.documentElement.style.setProperty('--font-family-base', "Georgia, 'Times New Roman', serif");
    } else {
      document.documentElement.style.setProperty('--font-family-base', "'Segoe UI', system-ui, -apple-system, sans-serif");
    }

    const select = document.getElementById('setting-font-family-select');
    if (select) select.value = font;
    saveSettings();
  }

  function applySpacing(lineH, letterS, wordS) {
    state.lineHeight = lineH;
    state.letterSpacing = letterS;
    state.wordSpacing = wordS;

    document.documentElement.style.setProperty('--font-line-height', lineH);
    document.documentElement.style.setProperty('--font-letter-spacing', letterS);
    document.documentElement.style.setProperty('--font-word-spacing', wordS);
    saveSettings();
  }

  function applyReduceMotion(reduce) {
    state.reduceMotion = Boolean(reduce);
    if (state.reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    const check = document.getElementById('setting-reduce-motion-check');
    if (check) check.checked = state.reduceMotion;
    saveSettings();
  }

  function applyReadingRuler(enabled) {
    state.readingRuler = Boolean(enabled);
    const ruler = document.getElementById('reading-ruler');
    if (ruler) {
      ruler.style.display = state.readingRuler ? 'block' : 'none';
      ruler.style.height = `${state.readingRulerHeight}px`;
    }
    const check = document.getElementById('setting-reading-ruler-check');
    if (check) check.checked = state.readingRuler;

    const headerRulerBtn = document.getElementById('btn-header-ruler');
    if (headerRulerBtn) {
      headerRulerBtn.classList.toggle('active', state.readingRuler);
    }
    saveSettings();
  }

  function setupRulerTracking() {
    const ruler = document.getElementById('reading-ruler');
    if (!ruler) return;

    window.addEventListener('mousemove', function (e) {
      if (!state.readingRuler) return;
      const topPos = e.clientY - (state.readingRulerHeight / 2);
      ruler.style.top = `${Math.max(0, topPos)}px`;
    }, { passive: true });

    // Allow keyboard arrow navigation for ruler
    window.addEventListener('keydown', function (e) {
      if (!state.readingRuler) return;
      const currentTop = parseInt(ruler.style.top || '100', 10);
      if (e.key === 'ArrowDown' && e.altKey) {
        ruler.style.top = `${currentTop + 30}px`;
        e.preventDefault();
      } else if (e.key === 'ArrowUp' && e.altKey) {
        ruler.style.top = `${Math.max(0, currentTop - 30)}px`;
        e.preventDefault();
      }
    });
  }

  function applyLanguage(lang) {
    state.language = lang;
    const dict = translations[lang] || translations.en;

    // Update all elements with data-i18n attributes
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    const langSelect = document.getElementById('setting-lang-select');
    if (langSelect) langSelect.value = lang;
    saveSettings();
  }

  function bindSettingsControls() {
    // Theme select
    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) {
      themeSelect.value = state.theme;
      themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
    }

    // Font size
    const fontSizeSelect = document.getElementById('setting-font-size-select');
    if (fontSizeSelect) {
      fontSizeSelect.value = state.fontSize;
      fontSizeSelect.addEventListener('change', (e) => applyFontSize(e.target.value));
    }

    // Font family
    const fontFamSelect = document.getElementById('setting-font-family-select');
    if (fontFamSelect) {
      fontFamSelect.value = state.fontFamily;
      fontFamSelect.addEventListener('change', (e) => applyFontFamily(e.target.value));
    }

    // Spacing
    const lineSpacingSelect = document.getElementById('setting-line-spacing-select');
    if (lineSpacingSelect) {
      lineSpacingSelect.value = state.lineHeight;
      lineSpacingSelect.addEventListener('change', (e) => {
        applySpacing(e.target.value, state.letterSpacing, state.wordSpacing);
      });
    }

    const letterSpacingSelect = document.getElementById('setting-letter-spacing-select');
    if (letterSpacingSelect) {
      letterSpacingSelect.value = state.letterSpacing;
      letterSpacingSelect.addEventListener('change', (e) => {
        applySpacing(state.lineHeight, e.target.value, state.wordSpacing);
      });
    }

    // Reduced motion
    const reduceMotionCheck = document.getElementById('setting-reduce-motion-check');
    if (reduceMotionCheck) {
      reduceMotionCheck.checked = state.reduceMotion;
      reduceMotionCheck.addEventListener('change', (e) => applyReduceMotion(e.target.checked));
    }

    // Reading ruler check
    const rulerCheck = document.getElementById('setting-reading-ruler-check');
    if (rulerCheck) {
      rulerCheck.checked = state.readingRuler;
      rulerCheck.addEventListener('change', (e) => applyReadingRuler(e.target.checked));
    }

    // Language
    const langSelect = document.getElementById('setting-lang-select');
    if (langSelect) {
      langSelect.value = state.language;
      langSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
    }

    // Sound toggle
    const soundCheck = document.getElementById('setting-sound-check');
    if (soundCheck) {
      soundCheck.checked = state.soundEnabled;
      soundCheck.addEventListener('change', (e) => {
        state.soundEnabled = e.target.checked;
        saveSettings();
      });
    }

    // Reset Data Button with modal confirmation
    const resetBtn = document.getElementById('btn-reset-user-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const confirmed = window.confirm(
          'Are you sure you want to reset all your NeuroCare local data, tasks, notes and garden progress? This action cannot be undone.'
        );
        if (confirmed) {
          localStorage.clear();
          alert('All local data has been reset to defaults.');
          window.location.reload();
        }
      });
    }
  }

  // Sound cue generator using Web Audio API
  function playSound(type = 'click') {
    if (!state.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } else if (type === 'plant') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else {
        // subtle click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (e) {
      // AudioContext may be blocked before user interaction
    }
  }

  return {
    init,
    applyTheme,
    applyFontSize,
    applyFontFamily,
    applySpacing,
    applyReduceMotion,
    applyReadingRuler,
    applyLanguage,
    playSound,
    getState: () => ({ ...state })
  };
})();
