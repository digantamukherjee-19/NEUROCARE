/**
 * NeuroCare - AI Assistant Demonstration Module
 * A clearly labeled, rule-based educational demonstration chatbot providing study strategies,
 * sensory grounding tips, and neurodivergent learning accommodations.
 * NOTE: Does NOT connect to external AI APIs or provide medical diagnoses.
 */

var Assistant = window.Assistant = (function () {
  'use strict';

  const STORAGE_KEY_CHAT = 'neurocare_assistant_history';

  const knowledgeBase = [
    {
      keywords: ['paralysis', 'start', 'stuck', 'begin', 'initiat', 'procrastinat'],
      response: `When experiencing ADHD task paralysis, the brain perceives the task as a massive wall. Try this 3-step jumpstart:
1. **The 2-Minute Promise:** Commit to working for just 120 seconds. Crossing the starting line is the hardest part.
2. **Body Doubling:** Sit near a friend or study stream so gentle social presence anchors focus.
3. **Break It Down:** Open our **ADHD Support** tab and run your task through the **Break It Down** tool to create 5-minute steps!`
    },
    {
      keywords: ['dyslexia', 'reading fatigue', 'tired', 'blur', 'crowd', 'read'],
      response: `Reading fatigue with dyslexia occurs when visual crowding strains tracking. Here is what helps right away:
- **Overlay Tint:** Switch to warm yellow, mint, or peach in the **Dyslexia Support** toolbar.
- **Reading Ruler:** Toggle our Reading Ruler (` + '`Alt + Up/Down`' + `) to isolate one line at a time.
- **Read It for Me:** Press **Read Aloud** to hear spoken narration with word-by-word highlighting.`
    },
    {
      keywords: ['sensory', 'overload', 'loud', 'meltdown', 'lights', 'crowd', 'overwhelm'],
      response: `When sensory input exceeds your nervous system's capacity:
1. **Reduce Input:** Activate **Low-Stimulation Mode** or click **Sensory Escape** in the top header.
2. **Steady Breathing:** Try 2 cycles of Box Breathing in the **Wellness Centre**.
3. **Express Without Words:** Use our visual **AAC Communication Board** in **Autism & Sensory** if talking feels exhausting.`
    },
    {
      keywords: ['pomodoro', 'timer', 'focus', 'interval', 'time', 'blindness'],
      response: `The Pomodoro Technique makes invisible time concrete:
- **25m Focus + 5m Break:** Keep the visual circular progress ring visible in **ADHD Support**.
- **Flexible Intervals:** If 25 minutes feels too steep, set a short **Study Planner** block or a 10-minute **Reminder** first!`
    },
    {
      keywords: ['study', 'plan', 'organiz', 'exam', 'homework', 'math'],
      response: `Neuro-friendly study planning tips:
- **Visual Math:** Use our dot-array math exercises in the **Learning Centre** to build concrete number sense.
- **Active Recall:** Flip through **3D Flashcards** or create your own custom flashcards.
- **Chunk Deadlines:** Track due dates in the **Assignment Tracker** and pair each session with a **Study Planner** slot.`
    },
    {
      keywords: ['accommodation', 'school', 'teacher', 'work', 'boss', 'college', 'iep', 'parent'],
      response: `Helpful accommodations to request include:
- **Written step-by-step instructions** alongside verbal explanations.
- **Noise-cancelling headphones** or a quiet testing/workspace option.
- **Extended time (25%–50%)** and text-to-speech readers.
Visit our **Parent & Teacher Portal** to view and download the full **Accommodations Matrix**!`
    },
    {
      keywords: ['sleep', 'bed', 'insomnia', 'night', 'rest'],
      response: `Neurodivergent brains often struggle to transition from daytime stimulation to sleep. Try visiting our **Wellness Centre → Sleep & Routine Tracker** to check off a gentle wind-down routine (dimming lights, warm mode, quiet audio).`
    },
    {
      keywords: ['garden', 'plant', 'achievement', 'grow', 'points'],
      response: `The **Achievement Garden** grows whenever you complete tasks, finish quizzes, log mood check-ins, or practice breathing! Head to **My Dashboard** to water your plant and watch it evolve from a seed into a flourishing tree.`
    },
    {
      keywords: ['diagnos', 'cure', 'medical', 'medicine', 'doctor', 'prescrib', 'therapy'],
      response: `⚠️ **Important Notice:** This Assistant is an educational demonstration chatbot. NeuroCare does **not** diagnose, treat, or provide medical advice. For clinical evaluations, please browse our **Professional Resources** directory to learn which qualified specialists (psychologists, neurologists, SLPs, OTs) can help.`
    }
  ];

  const defaultGreeting = `Hello! I'm your NeuroCare Learning Companion (**Rule-Based Educational Demo**). I don't connect to an external AI API or diagnose medical conditions, but I can share practical tips for ADHD focus, dyslexia reading, study planning, and sensory balance. What would you like to try?`;

  const fallbackResponses = [
    `Great question! Because I am a local rule-based demonstration assistant, I work best with keywords like **"ADHD paralysis"**, **"dyslexia reading"**, **"sensory overload"**, **"study plan"**, **"Pomodoro"**, **"sleep"**, or **"accommodations"**.`,
    `Try exploring our **ADHD Support** tab for micro-step task breaking, **Dyslexia Support** for spoken audio reading, or **Wellness Centre** for guided breathing!`
  ];

  let messages = [];

  function init() {
    loadHistory();
    renderMessages();
    bindEvents();
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT);
      messages = saved ? JSON.parse(saved) : [{ sender: 'bot', text: defaultGreeting, time: 'Just now' }];
    } catch (e) {
      messages = [{ sender: 'bot', text: defaultGreeting, time: 'Just now' }];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(messages.slice(-40)));
    } catch (e) {}
  }

  function renderMessages() {
    const container = document.getElementById('assistant-messages-container');
    if (!container) return;

    container.innerHTML = messages.map(m => `
      <div class="chat-bubble ${m.sender}">
        ${m.sender === 'bot' ? '<strong>🤖 NeuroCare Companion (Demo):</strong><br>' : '<strong>You:</strong><br>'}
        ${formatMarkdownText(m.text)}
        <div style="font-size: 10px; opacity: 0.65; margin-top: 4px; text-align: right;">${escapeHtml(m.time)}</div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  }

  function sendMessage(userText) {
    if (!userText || !userText.trim()) return;

    messages.push({
      sender: 'user',
      text: userText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    saveHistory();
    renderMessages();
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const botReply = generateReply(userText);
      messages.push({
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      saveHistory();
      renderMessages();
      if (window.Accessibility) window.Accessibility.playSound('click');
    }, 550);
  }

  function generateReply(text) {
    const lower = text.toLowerCase();
    for (const entry of knowledgeBase) {
      for (const kw of entry.keywords) {
        if (lower.includes(kw)) return entry.response;
      }
    }
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  function showTypingIndicator() {
    const container = document.getElementById('assistant-messages-container');
    if (!container) return;
    const typingDiv = document.createElement('div');
    typingDiv.id = 'chat-typing-indicator';
    typingDiv.className = 'chat-bubble bot';
    typingDiv.innerHTML = `<em>Thinking (searching local knowledge base)...</em>`;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  function formatMarkdownText(raw) {
    let formatted = escapeHtml(raw);
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  function clearChat() {
    if (!window.confirm('Clear the assistant conversation history?')) return;
    messages = [{ sender: 'bot', text: defaultGreeting, time: 'Just now' }];
    saveHistory();
    renderMessages();
    if (window.App && window.App.showToast) window.App.showToast('Chat history cleared.');
  }

  function bindEvents() {
    const form = document.getElementById('assistant-chat-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('assistant-chat-input');
        if (input && input.value.trim()) {
          sendMessage(input.value);
          input.value = '';
          input.focus();
        }
      });
    }

    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const text = e.currentTarget.textContent.replace(/^[💡📖⚡⏱️🎓🛌]\s*/, '');
        sendMessage(text);
      });
    });

    const clearBtn = document.getElementById('btn-clear-chat');
    if (clearBtn) clearBtn.addEventListener('click', clearChat);
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
    sendMessage,
    clearChat
  };
})();
