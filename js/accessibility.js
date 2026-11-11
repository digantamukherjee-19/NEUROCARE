/**
 * NeuroCare - Accessibility & Settings Engine
 * Manages theme modes, typography sizing, word/letter/line spacing, contrast,
 * reading ruler, sound cues, and multi-language support (English, Hindi, Bengali).
 */

var Accessibility = window.Accessibility = (function () {
  'use strict';

  const STORAGE_KEY = 'neurocare_accessibility_settings';

  const defaultSettings = {
    theme: 'default', // 'default', 'dark', 'high-contrast', 'low-stim', 'lavender', 'mint'
    fontSize: '16px',
    fontFamily: 'default', // 'default', 'dyslexic', 'sans', 'serif'
    lineHeight: '1.8',
    letterSpacing: '0.01em',
    wordSpacing: '0.05em',
    reduceMotion: false,
    soundEnabled: true,
    language: 'en', // 'en', 'hi', 'bn'
    readingRuler: false,
    readingRulerHeight: 50
  };

  let state = { ...defaultSettings };

  // Multi-Language Translation Dictionaries (100% real translations for supported languages)
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
      nav_settings: 'Settings & A11y',
      hero_title: 'Different Minds. Endless Possibilities.',
      hero_subtitle: 'An empowering, calm, and sensory-friendly platform built to embrace neurodiversity. Discover personalized tools for ADHD focus, dyslexia reading support, autistic sensory balance, and engaging visual learning.',
      btn_get_started: 'Get Started →',
      btn_explore: 'Explore Features',
      btn_sensory_escape: 'Sensory Escape',
      garden_title: 'Achievement Garden',
      settings_title: 'Settings & Universal Accessibility',
      settings_subtitle: 'Customize every visual and cognitive dimension of NeuroCare. Your settings are automatically saved locally.',
      dashboard_title: 'My Personal Dashboard',
      adhd_title: 'ADHD Productivity & Focus Hub',
      dyslexia_title: 'Dyslexia-Friendly Reading Tool',
      learning_title: 'Multi-Sensory Learning Centre',
      wellness_title: 'Sensory & Wellness Centre',
      sensory_title: 'Autism & Sensory Support',
      assistant_title: 'NeuroCare Learning Assistant (Demo)',
      community_title: 'Neurodivergent Community Hub',
      portal_title: 'Parent & Teacher Support Portal',
      resources_title: 'Professional Resources & Specialist Guide'
    },
    hi: {
      nav_home: 'होम (Home)',
      nav_dashboard: 'मेरा डैशबोर्ड',
      nav_adhd: 'एडीएचडी सहायता',
      nav_dyslexia: 'डिस्लेक्सिया सहायता',
      nav_learning: 'सीखने का केंद्र',
      nav_wellness: 'कल्याण केंद्र',
      nav_sensory: 'ऑटिज्म और संवेदी',
      nav_assistant: 'एआई सहायक (डेमो)',
      nav_community: 'समुदाय',
      nav_portal: 'अभिभावक और शिक्षक',
      nav_resources: 'व्यावसायिक संसाधन',
      nav_settings: 'सेटिंग्स और सुगमता',
      hero_title: 'अलग मस्तिष्क। असीम संभावनाएं।',
      hero_subtitle: 'न्यूरोडाइवर्सिटी के सम्मान और समर्थन के लिए एक शांत, सहज और संवेदी-अनुकूल शिक्षण मंच।',
      btn_get_started: 'शुरू करें →',
      btn_explore: 'सुविधाएं देखें',
      btn_sensory_escape: 'शांत वातावरण',
      garden_title: 'उपलब्धि बगीचा',
      settings_title: 'सेटिंग्स और सार्वभौमिक सुगमता',
      settings_subtitle: 'NeuroCare के हर दृश्य और संज्ञानात्मक पहलू को अनुकूलित करें। आपकी सेटिंग्स स्थानीय रूप से सहेजी जाती हैं।',
      dashboard_title: 'मेरा व्यक्तिगत डैशबोर्ड',
      adhd_title: 'एडीएचडी उत्पादकता और फोकस हब',
      dyslexia_title: 'डिस्लेक्सिया-अनुकूल पठन उपकरण',
      learning_title: 'बहु-संवेदी शिक्षण केंद्र',
      wellness_title: 'संवेदी और कल्याण केंद्र',
      sensory_title: 'ऑटिज्म और संवेदी सहायता',
      assistant_title: 'NeuroCare शिक्षण सहायक (डेमो)',
      community_title: 'न्यूरोडाइवर्जेंट समुदाय केंद्र',
      portal_title: 'अभिभावक और शिक्षक सहायता पोर्टल',
      resources_title: 'व्यावसायिक संसाधन और विशेषज्ञ मार्गदर्शिका'
    },
    bn: {
      nav_home: 'হোম (Home)',
      nav_dashboard: 'আমার ড্যাশবোর্ড',
      nav_adhd: 'এডিএইচডি সহায়তা',
      nav_dyslexia: 'ডিসলেক্সিয়া সহায়তা',
      nav_learning: 'শেখার কেন্দ্র',
      nav_wellness: 'সুস্থতা কেন্দ্র',
      nav_sensory: 'অটিজম ও সংবেদনশীল',
      nav_assistant: 'এআই সহকারী (ডেমো)',
      nav_community: 'কমিউনিটি',
      nav_portal: 'অভিভাবক ও শিক্ষক',
      nav_resources: 'পেশাদার সম্পদ',
      nav_settings: 'সেটিংস ও অ্যাক্সেসিবিলিটি',
      hero_title: 'অনন্য মস্তিষ্ক। সীমাহীন সম্ভাবনা।',
      hero_subtitle: 'নিউরোডাইভার্সিটি উদযাপনের জন্য একটি শান্ত, সংবেদনশীল ও সহজ শিক্ষণ এবং সহায়ক প্ল্যাটফর্ম।',
      btn_get_started: 'শুরু করুন →',
      btn_explore: 'বৈশিষ্ট্যগুলি দেখুন',
      btn_sensory_escape: 'সংবেদনশীল প্রশান্তি',
      garden_title: 'কৃতিত্ব বাগান',
      settings_title: 'সেটিংস ও সার্বজনীন অ্যাক্সেসিবিলিটি',
      settings_subtitle: 'NeuroCare-এর প্রতিটি দৃশ্যমান ও জ্ঞানীয় দিক কাস্টমাইজ করুন। আপনার সেটিংস স্থানীয়ভাবে সংরক্ষিত হয়।',
      dashboard_title: 'আমার ব্যক্তিগত ড্যাশবোর্ড',
      adhd_title: 'এডিএইচডি উৎপাদনশীলতা ও ফোকাস হাব',
      dyslexia_title: 'ডিসলেক্সিয়া-বান্ধব পঠন সরঞ্জাম',
      learning_title: 'বহু-সংবেদনশীল শিক্ষণ কেন্দ্র',
      wellness_title: 'সংবেদনশীল ও সুস্থতা কেন্দ্র',
      sensory_title: 'অটিজম ও সংবেদনশীল সহায়তা',
      assistant_title: 'NeuroCare শিক্ষণ সহকারী (ডেমো)',
      community_title: 'নিউরোডাইভারজেন্ট কমিউনিটি হাব',
      portal_title: 'অভিভাবক ও শিক্ষক সহায়তা পোর্টাল',
      resources_title: 'পেশাদার সম্পদ ও বিশেষজ্ঞ নির্দেশিকা'
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
    applyTheme(state.theme, false);
    applyFontSize(state.fontSize, false);
    applyFontFamily(state.fontFamily, false);
    applySpacing(state.lineHeight, state.letterSpacing, state.wordSpacing, false);
    applyReduceMotion(state.reduceMotion, false);
    applyReadingRuler(state.readingRuler, false);
    applyLanguage(state.language, false);
    syncControlsUI();
  }

  function syncControlsUI() {
    const map = {
      'setting-theme-select': state.theme,
      'setting-font-size-select': state.fontSize,
      'setting-font-family-select': state.fontFamily,
      'setting-line-spacing-select': state.lineHeight,
      'setting-letter-spacing-select': state.letterSpacing,
      'setting-word-spacing-select': state.wordSpacing,
      'setting-lang-select': state.language
    };

    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });

    const reduceCheck = document.getElementById('setting-reduce-motion-check');
    if (reduceCheck) reduceCheck.checked = state.reduceMotion;

    const lowStimCheck = document.getElementById('setting-low-stim-check');
    if (lowStimCheck) lowStimCheck.checked = state.theme === 'low-stim';

    const rulerCheck = document.getElementById('setting-reading-ruler-check');
    if (rulerCheck) rulerCheck.checked = state.readingRuler;

    const soundCheck = document.getElementById('setting-sound-check');
    if (soundCheck) soundCheck.checked = state.soundEnabled;
  }

  function applyTheme(theme, persist = true) {
    state.theme = theme;
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-high-contrast', 'theme-low-stim', 'theme-lavender', 'theme-mint');

    if (theme === 'dark') body.classList.add('theme-dark');
    else if (theme === 'high-contrast') body.classList.add('theme-high-contrast');
    else if (theme === 'low-stim') body.classList.add('theme-low-stim');
    else if (theme === 'lavender') body.classList.add('theme-lavender');
    else if (theme === 'mint') body.classList.add('theme-mint');

    const select = document.getElementById('setting-theme-select');
    if (select) select.value = theme;

    const lowStimCheck = document.getElementById('setting-low-stim-check');
    if (lowStimCheck) lowStimCheck.checked = theme === 'low-stim';

    const sensoryLowStim = document.getElementById('sensory-low-stim-toggle');
    if (sensoryLowStim) sensoryLowStim.checked = theme === 'low-stim';

    if (persist) {
      saveSettings();
      if (window.App && window.App.showToast) window.App.showToast(`Theme applied: ${theme}`);
    }
  }

  function applyFontSize(size, persist = true) {
    state.fontSize = size;
    document.documentElement.style.fontSize = size;
    const select = document.getElementById('setting-font-size-select');
    if (select) select.value = size;
    if (persist) saveSettings();
  }

  function applyFontFamily(font, persist = true) {
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
    if (persist) saveSettings();
  }

  function applySpacing(lineH, letterS, wordS, persist = true) {
    state.lineHeight = lineH;
    state.letterSpacing = letterS;
    state.wordSpacing = wordS;

    document.documentElement.style.setProperty('--font-line-height', lineH);
    document.documentElement.style.setProperty('--font-letter-spacing', letterS);
    document.documentElement.style.setProperty('--font-word-spacing', wordS);
    if (persist) saveSettings();
  }

  function applyReduceMotion(reduce, persist = true) {
    state.reduceMotion = Boolean(reduce);
    document.body.classList.toggle('reduce-motion', state.reduceMotion);

    const check = document.getElementById('setting-reduce-motion-check');
    if (check) check.checked = state.reduceMotion;

    const sensoryMotion = document.getElementById('sensory-reduce-motion-toggle');
    if (sensoryMotion) sensoryMotion.checked = state.reduceMotion;

    if (persist) {
      saveSettings();
      if (window.App && window.App.showToast) {
        window.App.showToast(state.reduceMotion ? 'Reduced motion enabled' : 'Animations restored');
      }
    }
  }

  function applyReadingRuler(enabled, persist = true) {
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
    if (persist) saveSettings();
  }

  function setRulerHeight(heightPx) {
    state.readingRulerHeight = parseInt(heightPx, 10) || 50;
    const ruler = document.getElementById('reading-ruler');
    if (ruler) ruler.style.height = `${state.readingRulerHeight}px`;
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

    window.addEventListener('keydown', function (e) {
      if (!state.readingRuler) return;
      const currentTop = parseInt(ruler.style.top || '120', 10);
      if (e.key === 'ArrowDown' && e.altKey) {
        ruler.style.top = `${currentTop + 32}px`;
        e.preventDefault();
      } else if (e.key === 'ArrowUp' && e.altKey) {
        ruler.style.top = `${Math.max(0, currentTop - 32)}px`;
        e.preventDefault();
      }
    });
  }

  function applyLanguage(lang, persist = true) {
    state.language = translations[lang] ? lang : 'en';
    const dict = translations[state.language];

    document.querySelectorAll('[data-i18n]').forEach(el => {
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
    if (langSelect) langSelect.value = state.language;

    if (persist) {
      saveSettings();
      if (window.App && window.App.showToast) window.App.showToast(`Language updated`);
    }
  }

  function resetAccessibilityOnly() {
    if (!window.confirm('Reset all accessibility and visual settings back to defaults?')) return;
    state = { ...defaultSettings };
    saveSettings();
    applyAllSettings();
    if (window.App && window.App.showToast) window.App.showToast('Accessibility settings restored to defaults.');
  }

  function bindSettingsControls() {
    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
    }

    const lowStimCheck = document.getElementById('setting-low-stim-check');
    if (lowStimCheck) {
      lowStimCheck.addEventListener('change', (e) => {
        applyTheme(e.target.checked ? 'low-stim' : 'default');
      });
    }

    const fontSizeSelect = document.getElementById('setting-font-size-select');
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', (e) => applyFontSize(e.target.value));
    }

    const fontFamSelect = document.getElementById('setting-font-family-select');
    if (fontFamSelect) {
      fontFamSelect.addEventListener('change', (e) => applyFontFamily(e.target.value));
    }

    const lineSpacingSelect = document.getElementById('setting-line-spacing-select');
    if (lineSpacingSelect) {
      lineSpacingSelect.addEventListener('change', (e) => {
        applySpacing(e.target.value, state.letterSpacing, state.wordSpacing);
      });
    }

    const letterSpacingSelect = document.getElementById('setting-letter-spacing-select');
    if (letterSpacingSelect) {
      letterSpacingSelect.addEventListener('change', (e) => {
        applySpacing(state.lineHeight, e.target.value, state.wordSpacing);
      });
    }

    const wordSpacingSelect = document.getElementById('setting-word-spacing-select');
    if (wordSpacingSelect) {
      wordSpacingSelect.addEventListener('change', (e) => {
        applySpacing(state.lineHeight, state.letterSpacing, e.target.value);
      });
    }

    const reduceMotionCheck = document.getElementById('setting-reduce-motion-check');
    if (reduceMotionCheck) {
      reduceMotionCheck.addEventListener('change', (e) => applyReduceMotion(e.target.checked));
    }

    const rulerCheck = document.getElementById('setting-reading-ruler-check');
    if (rulerCheck) {
      rulerCheck.addEventListener('change', (e) => applyReadingRuler(e.target.checked));
    }

    const langSelect = document.getElementById('setting-lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
    }

    const soundCheck = document.getElementById('setting-sound-check');
    if (soundCheck) {
      soundCheck.addEventListener('change', (e) => {
        state.soundEnabled = e.target.checked;
        saveSettings();
      });
    }

    const resetSettingsBtn = document.getElementById('btn-reset-settings-only');
    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener('click', resetAccessibilityOnly);
    }

    const resetBtn = document.getElementById('btn-reset-user-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const confirmed = window.confirm(
          'Are you sure you want to reset ALL your NeuroCare local data (tasks, journals, mood logs, community posts, routines, and garden progress)? This action cannot be undone.'
        );
        if (confirmed) {
          localStorage.clear();
          window.location.reload();
        }
      });
    }
  }

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
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.3);
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
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (e) {
      // AudioContext blocked prior to user gesture
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
    setRulerHeight,
    applyLanguage,
    resetAccessibilityOnly,
    playSound,
    getState: () => ({ ...state })
  };
})();
