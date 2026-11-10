# NeuroCare – Different Minds. Endless Possibilities.

> An inclusive, sensory-friendly web platform engineered to support individuals with ADHD, dyslexia, autism, dyscalculia, and diverse neurological learning profiles.

**Repository Link:** [https://github.com/digantamukherjee-19/NEUROCARE](https://github.com/digantamukherjee-19/NEUROCARE)  
**Author & Maintainer:** Diganta Mukherjee

---

## 1. Project Overview

**NeuroCare** is a modern, accessible web companion designed from the ground up for neurodivergent individuals, educators, and families. Rather than adopting a clinical or diagnostic tone, NeuroCare focuses on everyday cognitive ergonomics, executive function empowerment, visual pacing, and sensory balance.

### Who NeuroCare Supports:
- **People with ADHD:** Minimizes task initiation paralysis, provides visual time tracking via Pomodoro techniques, and offers atomic task chunking.
- **Individuals with Dyslexia:** Offers visual accommodation tools including high-legibility fonts, customizable background tints, line-height/letter-spacing sliders, text-to-speech with word tracking, and bionic saccadic reading aids.
- **Autistic & Sensory-Sensitive Users:** Provides low-stimulation interface filters, augmentative and alternative communication (AAC) tiles, structured visual schedules, and predictable social narratives.
- **Parents, Teachers & Allies:** Supplies evidence-based classroom accommodation tips, home routine strategies, and printable meeting checklists.

---

## 2. Key Modules & Features

### Core Modules:
1. **Home:** Welcoming introduction, four core condition pillars, feature spotlights, and daily inspirational thoughts.
2. **My Dashboard:** Real-time date display, daily cognitive metrics (tasks completed, focus minutes logged, current mood), and the interactive **Achievement Garden**.
3. **ADHD Support:** Daily priority to-do list, Pomodoro circular countdown timer with Web Audio chime, assignment tracker, and milestone achievement badges.
4. **Dyslexia Support:** Multi-feature reading canvas with real-time text customization, native Web Speech text-to-speech, syllable/bionic formatters, RSVP speed reading practice, and vocabulary glossary.
5. **Learning Centre:** Modality preferences, interactive 3D flip flashcards, mastery quizzes with rationales, memory-matching pair games, and concrete visual math counters.
6. **Wellness Centre:** Non-clinical emotional self-regulation, emoji mood check-ins with 7-day history, guided de-clutter journal, 4-4-4-4 Box Breathing visualizer, and synthetic ambient relaxation audio.
7. **Autism & Sensory Support:** Visual daily routine timeline, sensory comfort switches (low-stimulation, reduced motion), and body sensation mapping.
8. **AI Assistant (Demo):** Rule-based educational guide answering questions regarding study strategies, executive dysfunction, and school accommodations.
9. **Community Hub (Demo):** Demonstrative peer-support feed with category filters, keyword search, helpfulness upvotes, and post creation.
10. **Parent & Teacher Portal:** Home routine tips, classroom strategies, and an accommodations reference matrix with print support.
11. **Professional Resources:** Directory describing medical and developmental specialists, support organizations, and an interactive appointment preparation checklist.
12. **Settings & Accessibility:** Six color themes, typography controls, reading ruler toggle, audio feedback settings, data reset tools, and multi-language support (English, Hindi, Bengali).

### The Six Signature Features:
- **A. Break It Down:** Decomposes intimidating tasks (e.g., *"Clean bedroom"*, *"Write essay"*) into sequenced 5-minute atomic steps.
- **B. Read It for Me:** Browser-native speech synthesis that highlights words in real time as they are spoken.
- **C. Achievement Garden:** Gamified SVG plant visualization that grows across five distinct biological stages as users complete learning, wellness, and focus tasks.
- **D. Express Without Words:** Interactive AAC communication board with spoken audio output for non-speaking or overwhelmed moments.
- **E. My Learning Style:** Dynamically adapts advice according to visual, auditory, reading/writing, or kinesthetic preferences.
- **F. Sensory Escape:** Full-screen sensory reset with guided breathing rhythms and synthetic ambient soundscapes.

---

## 3. Technologies Used

NeuroCare is built strictly with vanilla web standards without external dependencies or heavy frontend frameworks:
- **HTML5:** Semantic architecture, accessible forms, ARIA landmarks, and SVG vectors.
- **CSS3:** Responsive CSS Grid and Flexbox, CSS custom properties (variables), subtle transitions, and custom media queries.
- **Vanilla JavaScript (ES6+):** Modular, object-oriented state managers and event dispatchers.
- **Web Speech API:** Browser-native `SpeechSynthesis` for text-to-speech reading and AAC voice assistance.
- **Web Audio API:** Programmatic audio synthesis (filtered noise for rain, modulated waves, 432 Hz sine tone) running 100% offline.
- **Browser LocalStorage:** Local persistence for tasks, assignments, mood records, and settings.

---

## 4. Screenshots & Visual Interface

| Section | Preview |
| :--- | :--- |
| **Hero & Overview** | *[ Screenshot Placeholder: NeuroCare Pastel Hero & Pillars ]* |
| **ADHD Productivity Hub** | *[ Screenshot Placeholder: Pomodoro Focus Ring & Break It Down ]* |
| **Dyslexia Reading Workspace** | *[ Screenshot Placeholder: Color Tints & Reading Ruler ]* |
| **Achievement Garden** | *[ Screenshot Placeholder: Flourishing Virtual Plant Stage ]* |
| **Autism & AAC Board** | *[ Screenshot Placeholder: Visual Communication Tiles ]* |

---

## 5. Project Folder Structure

```
NeuroCare/
│
├── index.html                   # Single-page application entrypoint
├── LICENSE                      # Project license file
├── .gitignore                   # Ignored files (OS, IDE, temp files)
├── .gitattributes               # Line-ending and text normalization rules
├── README.md                    # Comprehensive documentation
│
├── css/
│   └── style.css                # Master stylesheet and theme variables
│
├── js/
│   ├── app.js                   # Main application router and garden controller
│   ├── adhd.js                  # ADHD to-do, timer, and task decomposition
│   ├── dyslexia.js              # Reading tools, speech synthesis, and RSVP
│   ├── learning.js              # Flashcards, quizzes, memory game, and visual math
│   ├── wellness.js              # Mood tracking, breathing guide, and audio synth
│   ├── accessibility.js         # Themes, typography, reading ruler, and language
│   └── assistant.js             # Rule-based educational assistant simulator
│
└── assets/
    ├── icons/                   # Local SVG icon vectors
    │   ├── brain-infinity.svg
    │   ├── neurocare-logo.svg
    │   └── plant-sprout.svg
    └── images/                  # Local SVG illustrations
        └── hero-illustration.svg
```

---

## 6. Installation & Setup Instructions

Because NeuroCare uses pure browser-supported technologies, no compilation, package managers, or server runtimes are necessary.

### Option 1: Direct Local Execution
1. Clone the repository:
   ```bash
   git clone https://github.com/digantamukherjee-19/NEUROCARE.git
   ```
2. Navigate into the project folder:
   ```bash
   cd NEUROCARE
   ```
3. Open `index.html` directly in your preferred web browser by double-clicking it or running:
   - **Windows:** `start index.html`
   - **macOS:** `open index.html`
   - **Linux:** `xdg-open index.html`

### Option 2: Using VS Code Live Server
1. Open the repository folder inside **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey) if not already installed.
3. Right-click `index.html` in the file explorer and select **"Open with Live Server"**.
4. The site will launch automatically at `http://127.0.0.1:5500`.

---

## 7. How to Use Main Features

- **Breaking Down a Task:** Go to **ADHD Support**, type any large project into the *Break It Down* bar, and select *Break It Down*. Review the generated micro-steps and choose *Add All to My Tasks*.
- **Using Text-to-Speech:** Go to **Dyslexia Support**, paste your text into the reading canvas, select your desired overlay tint, and press *Read Aloud*.
- **Activating the Reading Ruler:** Click the *Ruler* button in the top navigation bar or press `Alt + Down Arrow` / `Alt + Up Arrow` to track your position.
- **Growing the Achievement Garden:** Complete to-do items, finish learning quizzes, or log wellness reflections to earn water drops and sunshine points. Visit **My Dashboard** to water your plant and view its progress.
- **Using the AAC Board:** In **Autism & Sensory Support**, tap any visual communication card (e.g., *"Need Quiet Break"*) to display the phrase and speak it aloud.

---

## 8. Browser Compatibility

NeuroCare is tested and functional across modern desktop and mobile browsers:
- **Google Chrome / Chromium:** Version 90+ (Full Web Speech and Web Audio support)
- **Mozilla Firefox:** Version 88+ (Full layout and Web Audio support; speech voices depend on OS)
- **Microsoft Edge:** Version 90+ (Full Web Speech and Web Audio support)
- **Apple Safari (macOS & iOS):** Version 14.1+ (Full responsiveness and Web Audio support)

---

## 9. Accessibility & Customization Options

- **WCAG 2.1 AA Compliance:** Color combinations maintain accessible contrast ratios.
- **Themes:**
  - *Pastel Default:* Soothing daylight palette.
  - *Dark Mode:* Reduced glare for photosensitive users.
  - *High Contrast:* Sharp monochrome outlines for visual impairments.
  - *Low Stimulation:* Muted sepia with all CSS animations disabled.
- **Dyslexia Font Support:** Includes fallback stacks for `OpenDyslexic`, `Lexend`, and clean sans-serif typefaces.
- **Multi-Language Interface:** Dynamic UI translation between **English**, **Hindi (हिंदी)**, and **Bengali (বাংলা)**.

---

## 10. Privacy & Data Handling

- **100% Client-Side:** NeuroCare does not transmit personal data, notes, or entries to external cloud servers.
- **Local Storage:** All to-do lists, mood check-ins, journal reflections, and garden metrics are saved strictly to the user's browser via `window.localStorage`.
- **Data Reset:** Users can completely purge all stored entries at any time using the *Reset All Local Data* button in the Settings panel.

---

## 11. Limitations & Demo Notices

- **AI Assistant:** Operates as a rule-based demonstration engine utilizing client-side keyword matching. It does not connect to third-party generative AI APIs or provide clinical medical consultations.
- **Community Section:** Operates as a local demonstration forum. Submitted posts are saved to the user's local storage and are not transmitted to a public server.
- **Medical Disclaimer:** NeuroCare is an educational and lifestyle accommodation tool. It is not a diagnostic tool or healthcare provider.

---

## 12. Future Roadmap

- Additional localization options for regional languages.
- Printable PDF generation for student progress records.
- Export/import functionality for local JSON data backups.
- Expanded soundscapes with customizable frequencies.

---

## 13. Contributing

Contributions that promote accessibility, cognitive ergonomics, and neuro-inclusion are welcome!

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request detailing the accessibility benefits of your addition.

---

## 14. License

This project is licensed under the terms described in the [LICENSE](LICENSE) file.

---

**(https://github.com/digantamukherjee-19).**
