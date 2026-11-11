# NeuroCare – Different Minds. Endless Possibilities.

> An inclusive, sensory-friendly learning and everyday support website built with pure **HTML5, CSS3, and Vanilla JavaScript** for people with ADHD, dyslexia, autism, dyscalculia, and diverse neurodevelopmental profiles.

**Live Website (GitHub Pages):** [https://digantamukherjee-19.github.io/NEUROCARE/](https://digantamukherjee-19.github.io/NEUROCARE/)  
**Repository:** [https://github.com/digantamukherjee-19/NEUROCARE](https://github.com/digantamukherjee-19/NEUROCARE)  
**Author & Maintainer:** Diganta Mukherjee

---

## 1. Project Overview

**NeuroCare** is a client-side web companion created to make digital learning, daily planning, reading, and sensory self-regulation calmer and easier to navigate. Instead of using clinical or hospital styling, the interface uses a gentle pastel palette, generous spacing, rounded cards, and interactive browser tools tailored to executive function, visual comfort, and emotional pacing.

### Who NeuroCare Supports
- **Individuals with ADHD:** Reduces task initiation friction with micro-step task decomposition, editable checklists, visual Pomodoro timing, study blocks, and reminders.
- **Readers with Dyslexia:** Provides real-time typography and spacing sliders, background overlay tints, reading rulers, selective text highlighting, Reading-Friendly distraction-free focus mode, and Web Speech API narration.
- **Autistic & Sensory-Sensitive Learners:** Includes low-stimulation and reduced-motion preferences, brightness dimming, editable picture-assisted daily routines, emotion identification guides, interactive social stories, silent break timers, and a customizable AAC communication board.
- **Parents, Teachers & Allies:** Offers home and classroom accommodation checklists, printable and `.txt`-downloadable support guides, live synced local activity overviews, and structured observation logging.

---

## 2. Key Features & Modules

### 12 Interactive Sections
1. **Home:** Dynamic progress summary strip synced with user activity, global tool and resource search bar, quick-access module cards, 4 neurodevelopmental pillars, inspirational messages, and informational About/Privacy dialogs.
2. **My Dashboard:** Personalized greeting, customizable dashboard widget visibility toggles, live bar charts tracking tasks, learning milestones, and mood check-ins, plus the 5-stage SVG **Achievement Garden**.
3. **ADHD Support:**
   - Daily To-Do list with add, inline edit (`window.prompt`), completion toggle, priority badges, and delete confirmation.
   - **Break It Down:** Task decomposer generating 5-minute actionable micro-steps for single or bulk import into your To-Do list.
   - **Pomodoro Focus Timer:** Start, pause, resume, and reset controls (`25m Focus` / `5m Short Break` / `15m Long Break`), optional session topic naming, manual focus logging, focus session history, progress report metrics, and milestone badges.
   - **Study Planner, Assignment Tracker & Reminders:** Add/edit/complete study blocks, cycle assignment status (`Not Started` -> `In Progress` -> `Completed`), and schedule timed browser toast + chime reminders.
4. **Dyslexia Support:**
   - Font selector (`OpenDyslexic` fallback stack, `Verdana`, clean sans-serif, serif), font size slider, line-height slider, letter-spacing slider, and word-spacing slider.
   - Pastel overlay tint swatches + custom text color picker, mouse/keyboard-guided **Reading Ruler**, and clickable yellow/mint/pink text highlighting tools.
   - **Reading-Friendly Mode** (hides sidebar/header/footer distractions) and **Web Speech API** Text-to-Speech (Play, Pause, Resume, Stop, speech speed slider, voice selector, and active word highlighting).
   - Rule-based **Text Simplifier (Demo)** with Restore button, **RSVP Speed Pacer**, multiple-choice **Reading Practice**, and a custom **Vocabulary Builder** with audio pronunciation.
5. **Learning Centre:**
   - **"My Learning Style" Modality Selector** (`Visual`, `Audio`, `Reading`, `Interactive`).
   - **3D Interactive Flashcards** across Science, Social Cues, Life Skills, and custom user-created decks.
   - **Leveled Quizzes** (`Easy`, `Medium`, `Hard`) with instant feedback and star rewards, plus **Leveled Memory Match** (4, 6, or 8 pairs).
   - **Visual Mathematics Exercises** with colored dot builders, **Reading Context Practice**, **Attention Target Finder** mini-game, and **Audio Lessons** with transcripts.
6. **Wellness Centre:**
   - **Mood Check-In Tracker** with intensity slider, optional reflection note, 7-entry vertical trend chart, and confirmed entry deletion.
   - **Guided Reflection Journal** supporting create, edit, and confirmed delete.
   - **Guided Breathing Visualizer** (Box `4-4-4-4` and `4-7-8` relaxation patterns with live phase timer) and **5-4-3-2-1 Sensory Grounding Walkthrough**.
   - **Positive Affirmations** generator + custom affirmation saver, interactive **Break Reminder Timer**, browser-synthesized **Ambient Soundscapes** (soft rain, gentle ocean waves, 432Hz calm tone), and a **Sleep & Evening Routine Tracker**.
7. **Autism & Sensory Support:**
   - **Customizable Visual Routine Builder** (add, edit, complete, and confirmed delete schedule blocks).
   - Quick toggles for **Low-Stimulation Mode**, **Reduced Motion**, and a screen **Brightness Dimmer** slider (`50%–100%`).
   - **Express Without Words (AAC Board)** with spoken phrases and custom AAC tile creation, **Emotion Identification Cards**, **Interactive Social Stories** across 3 common scenarios, and a **Quiet Sensory Break Timer**.
8. **AI Learning Assistant (Demo):** Local rule-based educational guide responding to questions about ADHD paralysis, dyslexia fatigue, study focus, math strategies, sleep, and accommodations, with persisted local conversation history.
9. **Community Hub (Local Demo):** Peer-style story and tip showcase with category filters, keyword search, upvote toggles, inline comment replies, confirmed deletion of user-created posts, and an **Anonymous Question** posting option.
10. **Parent & Teacher Portal:** Tabbed hub covering Home Routines, Classroom Strategies, School Accommodations Reference, live **Student Progress Overview** (synced from browser `localStorage`), interactive accommodation checklist, persisted observation notes log, `.txt` guide download, and print view.
11. **Professional Resources:** Searchable and type-filterable informational directory covering specialist roles and support organizations, clearly labeled sample listing entry, plus a customizable, downloadable (`.txt`), and printable **Appointment Preparation Checklist**.
12. **Settings & Accessibility:** Live switching between Daylight Pastel, Dark Mode, High Contrast, Low Stimulation, font stacks, spacing selects, Reading Ruler toggle, gentle Web Audio feedback toggle, interface translation (**English**, **Hindi / हिंदी**, **Bengali / বাংলা**), and confirmed reset controls.

---

## 3. Technologies Used

NeuroCare runs directly in the browser using zero third-party frameworks or runtime servers:
- **HTML5:** Semantic landmarks, ARIA roles/labels, `<svg>` graphics, and accessible form controls.
- **CSS3:** Custom CSS properties for multi-theme palettes, CSS Grid/Flexbox responsive layouts, subtle animations respecting `prefers-reduced-motion`, and print stylesheets.
- **Vanilla JavaScript (ES6+):** Modular IIFE state controllers, DOM rendering, event delegation, and `localStorage` persistence.
- **Browser APIs:** `window.speechSynthesis` (Web Speech API), `AudioContext` / `Web Audio API` (offline soundscapes and gentle chimes), `Blob` / `URL.createObjectURL` (`.txt` exports), `window.localStorage`, and `navigator.serviceWorker` + Web App Manifest (`manifest.json`).

---

## 4. Screenshots

| Module | Preview Placeholder |
| :--- | :--- |
| **Homepage & Search** | `[ Screenshot Placeholder: NeuroCare Pastel Hero, Pillars & Global Search ]` |
| **My Dashboard & Garden** | `[ Screenshot Placeholder: Live Activity Charts & 5-Stage SVG Achievement Garden ]` |
| **ADHD Support** | `[ Screenshot Placeholder: Pomodoro Focus Timer, Study Planner & Break It Down ]` |
| **Dyslexia Support** | `[ Screenshot Placeholder: Overlay Tints, Word Spacing, Highlights & Reading Ruler ]` |
| **Autism & Sensory** | `[ Screenshot Placeholder: Visual Routine Builder, AAC Tiles & Social Stories ]` |

---

## 5. Complete Project Folder Structure

```text
NEUROCARE/
├── index.html                   # Single-page application shell across all 12 sections & modals
├── manifest.json                # Web App Manifest for installable PWA experience
├── sw.js                        # Service Worker for offline static shell caching
├── README.md                    # Complete project & deployment documentation
├── LICENSE                      # Project license terms
├── .gitignore                   # Excludes OS artifacts, editor folders, and caches
├── .gitattributes               # Repository line-ending configuration
│
├── css/
│   └── style.css                # Themes, variables, component layout, responsive & print CSS
│
├── js/
│   ├── accessibility.js         # Themes, typography/spacing controls, ruler, dimmer, i18n, sound
│   ├── adhd.js                  # Tasks, Break It Down, Pomodoro timer, planner, reminders, badges
│   ├── dyslexia.js              # Reader styles, TTS controls, highlights, simplifier demo, vocab/RSVP
│   ├── learning.js              # Learning style, flashcards, quizzes, memory, visual math, attention, audio
│   ├── wellness.js              # Moods & chart, journal, breathing, grounding, sound synth, sleep & break
│   ├── sensory.js               # Visual routine builder, AAC board, emotions, social stories, break timer
│   ├── assistant.js             # Local rule-based AI Assistant demonstration module
│   └── app.js                   # SPA hash routing, search, dashboard charts/customizer, portal, community, SW
│
└── assets/
    ├── icons/
    │   ├── favicon.svg          # Vector browser favicon
    │   ├── icon-192.png         # 192x192 PWA app icon
    │   ├── icon-512.png         # 512x512 PWA splash/install icon
    │   ├── brain-infinity.svg   # Neurodiversity emblem icon
    │   ├── neurocare-logo.svg   # Application brand logo
    │   └── plant-sprout.svg     # Growth sprout vector icon
    └── images/
        └── hero-illustration.svg # Homepage hero artwork
```

---

## 6. Installation & Setup Instructions

No Node.js, package install steps, or build pipeline are required.

1. Clone the repository:
   ```bash
   git clone https://github.com/digantamukherjee-19/NEUROCARE.git
   ```
2. Change into the project folder:
   ```bash
   cd NEUROCARE
   ```

---

## 7. Running Locally

### Option A: Open Directly in a Browser
Open `index.html` directly from your file manager or terminal:
- **Windows:** `start index.html`
- **macOS:** `open index.html`
- **Linux:** `xdg-open index.html`

### Option B: VS Code Live Server
1. Open the `NEUROCARE` folder in **Visual Studio Code**.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` and select **Open with Live Server**.

---

## 8. How to Use Main Features

- **Quick Navigation & Search:** Use the sidebar links on desktop (or the `☰` menu on mobile/tablet) or type a tool keyword (e.g., `pomodoro`, `ruler`, `aac`, `mood`) into the Homepage search bar.
- **Breaking Down Tasks & Focusing:** Open **ADHD Support**, type an overwhelming task into **Break It Down**, import the 5-minute steps into your To-Do list, and run the **Pomodoro Focus Timer**.
- **Tailored Reading Experience:** Open **Dyslexia Support**, paste text or load a sample passage, pick a background tint, adjust letter/word/line spacing, select text to highlight, or press **Read Aloud**. Toggle the **Reading Ruler** anytime via the header or `Alt + Up/Down`.
- **Personalized Dashboard & Growth:** Complete learning exercises, wellness check-ins, and tasks to earn points for your **Achievement Garden**, and open **Customize Layout** in **My Dashboard** to save your preferred name and visible widgets.
- **Sensory & Communication Tools:** Use **Autism & Sensory Support** to build daily routines, tap **AAC** tiles for speech output, enable **Low-Stimulation** mode, or open **Sensory Escape** from the top bar.

---

## 9. Browser Compatibility

Tested on modern desktop and mobile Chromium/WebKit/Gecko engines:
- **Microsoft Edge / Google Chrome (90+):** Full support for layout themes, Web Speech API (`SpeechSynthesis`), Web Audio synthesis, `.txt` downloads, and `localStorage`.
- **Mozilla Firefox (88+):** Full interface themes, Web Audio synthesis, and `localStorage` persistence (`SpeechSynthesis` voice availability depends on OS).
- **Apple Safari (macOS & iOS 14.1+):** Full responsive layout, Web Audio synthesis (triggered on user gesture), and `localStorage`.

---

## 10. Accessibility & Customization Features

- **4 Visual Themes:** Soft Pastel Daylight, Dark Mode, WCAG High Contrast, and Low-Stimulation Muted Mode.
- **Typography & Spacing:** Adjustable font family stack (`OpenDyslexic`, `Lexend`, `Verdana`, sans-serif, serif), font size scale, line height, letter spacing, and word spacing.
- **Sensory Controls:** Reduced-motion toggle (plus OS `prefers-reduced-motion` awareness), screen brightness dimmer (`50%–100%`), Reading Ruler guide, distraction-free Reading-Friendly mode, and optional sound feedback toggle.
- **Multilingual UI:** Built-in heading and navigation translation switching between **English**, **Hindi (हिंदी)**, and **Bengali (বাংলা)**.
- **Responsive Mobile & Touch UX:** Designed down to `320px` width and verified across `320px`, `375px`, `390px`, `430px`, landscape mobile (`667x375`), `768px`, `1024px`, and `1440px` viewports with a collapsible hamburger drawer + backdrop, `44px` minimum mobile touch controls, `16px` mobile inputs to avoid auto-zoom, and synced `<meta name="theme-color">`.
- **Progressive Web App (PWA):** Includes [manifest.json](manifest.json), PNG/SVG icons, and [sw.js](sw.js) for basic static-shell offline caching when served over HTTPS or localhost. Offline mode preserves local tools and `localStorage` data; external resource links still require an active internet connection.

---

## 11. Privacy & Local Storage Information

NeuroCare is **100% client-side**. No personal notes, journal reflections, tasks, or usage metrics are uploaded or transmitted to any backend server.

The following `localStorage` keys store your preferences and activity locally on your device:
- `neurocare_accessibility_prefs` (theme, fonts, spacing, ruler, motion, dimmer, sound, language)
- `neurocare_dashboard_prefs`, `neurocare_garden_data`
- `neurocare_adhd_data`, `neurocare_dyslexia_prefs`, `neurocare_dyslexia_custom_vocab`
- `neurocare_learning_progress`, `neurocare_learning_custom_cards`
- `neurocare_wellness_data`, `neurocare_sensory_data`, `neurocare_assistant_history`
- `neurocare_community_posts`, `neurocare_portal_observations`, `neurocare_portal_checklist`, `neurocare_appointment_checklist`

You can clear saved visual preferences or wipe all locally stored user data anytime inside **Settings & Accessibility** (each reset prompts for confirmation).

---

## 12. Important Limitations & Demo Notices

- **AI Assistant (Demo):** Uses deterministic client-side keyword matching rather than an external generative AI API.
- **Community Hub (Local Demo):** Preloaded with sample posts; any new posts, questions, upvotes, or comments exist only inside your browser's `localStorage` and are not shared with other users online.
- **Text Simplifier (Demo):** Uses client-side rule-based word and sentence simplification (`Simplify (Demo)`) with one-click Restore rather than an external NLP model.
- **Sample Resource Entry:** The *BrightMind Neurodevelopmental Center* entry in **Professional Resources** is explicitly marked as a **Sample / Demo Entry** illustrating directory format and does not represent an actual clinic.
- **Non-Medical Disclaimer:** NeuroCare is an educational and productivity tool. It does not diagnose, treat, cure, or prevent any medical or neurodevelopmental condition.

---

## 13. Deployment & Troubleshooting

### Public Deployment (GitHub Pages)
NeuroCare is deployed publicly via GitHub Pages at [https://digantamukherjee-19.github.io/NEUROCARE/](https://digantamukherjee-19.github.io/NEUROCARE/).

To deploy or re-deploy a fork via GitHub Pages:
1. Push all files (`index.html`, `manifest.json`, `sw.js`, `css/`, `js/`, `assets/`) to the `main` branch.
2. In your GitHub repository, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**, select **`main`** and folder **`/ (root)`**, and click **Save**.
4. Wait ~1–2 minutes for GitHub Pages to finish building, then open `https://<your-username>.github.io/<repo-name>/`.

### Troubleshooting
- **Changes not visible immediately after pushing:** Wait ~1 minute for GitHub Pages to finish rebuilding, then perform a hard refresh (`Ctrl + Shift + R` / `Cmd + Shift + R`) or unregister old cached versions in DevTools → Application → Service Workers because `sw.js` caches static shell assets for offline support.
- **404 errors on CSS/JS/icons on a subpath:** Ensure all links in `index.html`, `manifest.json`, and `sw.js` use relative paths (`./` or no leading `/`), not root-absolute `/` paths.
- **Service Worker error when opening `index.html` via `file://`:** Service Workers only register over `https://` or `http://localhost` by browser security rules; `js/app.js` checks `location.protocol` and skips registration cleanly when opened directly from disk.
- **Speech voices unavailable in Text-to-Speech / AAC:** `window.speechSynthesis` relies on operating system speech packs; verify TTS voices are enabled in Windows/macOS/iOS/Android accessibility settings.

---

## 14. Future Improvements

- JSON import/export backup tool to transfer local data across devices cleanly.
- Additional regional interface translations across all module body copy.
- Bundled local `.woff2` webfont files (such as OpenDyslexic) for guaranteed offline rendering even when not installed on the OS.

---

## 15. Contributing

Contributions that enhance accessibility, keyboard ergonomics, localization, or cognitive clarity are welcome:
1. Fork this repository (`https://github.com/digantamukherjee-19/NEUROCARE`).
2. Create a feature branch (`git checkout -b feature/accessibility-improvement`).
3. Keep all additions strictly within HTML5, CSS3, and Vanilla JavaScript (no external frameworks or runtime dependencies).
4. Open `index.html` and verify zero console errors across desktop and mobile viewports.
5. Submit a Pull Request describing your changes and accessibility testing.

---

## 16. License

Licensing details for this repository are specified directly in the [LICENSE](LICENSE) file included at the project root.

---

## 17. Author & Repository

- **Author / Maintainer:** Diganta Mukherjee
- **GitHub Repository:** [https://github.com/digantamukherjee-19/NEUROCARE](https://github.com/digantamukherjee-19/NEUROCARE)
