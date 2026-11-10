/**
 * NeuroCare - AI Assistant Demonstration Module
 * A rule-based educational assistant simulator for neurodivergent learning strategies,
 * executive function tips, dyslexia reading methods, and sensory accommodations.
 * 
 * NOTE: Clearly labeled as a non-diagnostic educational demonstration.
 */

const Assistant = (function () {
  'use strict';

  // Rule-based knowledge base matching keywords
  const knowledgeBase = [
    {
      keywords: ['paralysis', 'start', 'stuck', 'begin', 'initiat', 'adhd start'],
      response: `When experiencing ADHD task paralysis, the brain often perceives the task as an enormous, overwhelming wall. Here is a proven 3-step jumpstart:
1. **The 2-Minute Promise:** Tell yourself you only have to work for 120 seconds. If you still want to stop, you can. Usually, crossing the initiation threshold is the hardest part.
2. **Body Doubling:** Work alongside a friend, family member, or study stream. Having another person nearby can help anchor focus.
3. **Use our "Break It Down" tool:** Enter your large task in the ADHD Support section to split it into bite-sized 5-minute micro-actions!`
    },
    {
      keywords: ['dyslexia', 'reading fatigue', 'tired', 'blur', 'crowd'],
      response: `Reading fatigue with dyslexia happens because the brain works extra hard to decode phonemes and track lines. Try these gentle accommodations:
- **Change Background Color:** Switch from bright white to a soft mint, cream, or peach background in our Dyslexia Support tool.
- **Activate Reading Ruler:** Toggle our reading guide bar (Alt + Arrow Keys or toolbar button) to isolate one line at a time.
- **Listen While Reading:** Use the "Read It for Me" button to let the browser read aloud while you follow along visually.`
    },
    {
      keywords: ['sensory', 'overload', 'loud', 'meltdown', 'lights', 'crowd'],
      response: `Sensory overload occurs when sensory input exceeds your nervous system's capacity to process it. To reset:
1. **Reduce Stimulation:** Dim screen brightness, wear noise-cancelling headphones, or retreat to a quiet, dimly lit corner.
2. **Engage Deep Pressure:** A weighted lap pad, deep breathing (like the Box Breathing in our Wellness Centre), or wrapping yourself in a blanket can help calm the autonomic nervous system.
3. **Use AAC Expression:** Check our "Express Without Words" communication board if speaking feels too demanding right now.`
    },
    {
      keywords: ['pomodoro', 'timer', 'focus', 'interval', 'time'],
      response: `The Pomodoro Technique is great for ADHD brains because it transforms indefinite, open-ended time into short, concrete blocks.
- **Standard interval:** 25 minutes of single-task focus followed by a 5-minute break.
- **ADHD tip:** If 25 minutes feels too long, start with 15 minutes! The key is celebrating when the timer dings and honoring the break without guilt.`
    },
    {
      keywords: ['accommodation', 'school', 'teacher', 'work', 'boss', 'college'],
      response: `Requesting accommodations is a proactive step toward fairness. Effective accommodations include:
- **Written instructions** rather than only spoken directions.
- **Permission to use noise-cancelling headphones** in open study/work spaces.
- **Extra time (25% - 50%)** on timed exams or extended project checkpoints.
- Check our **Parent & Teacher Portal** for a comprehensive accommodations checklist you can view and print!`
    },
    {
      keywords: ['garden', 'plant', 'achievement', 'grow'],
      response: `The **Achievement Garden** is NeuroCare’s positive reinforcement feature! Whenever you complete a task, finish a quiz, practice breathing, or use the dyslexia reader, you earn sunshine and water points. Watch your seed sprout into a blooming flower and grand blossom tree!`
    },
    {
      keywords: ['diagnos', 'cure', 'medical', 'medicine', 'doctor'],
      response: `⚠️ **Important Notice:** NeuroCare and this assistant provide educational and lifestyle organization tools only. We do not provide medical diagnosis, treatment, or clinical prescriptions. If you are seeking an official evaluation, please consult our **Professional Resources** section to find qualified clinical psychologists, neurologists, and speech therapists in your region.`
    }
  ];

  const defaultGreeting = `Hello! I'm your NeuroCare Learning Companion (Demo). I can share evidence-informed tips on study organization, ADHD focus strategies, dyslexia reading adjustments, and sensory calming techniques. What would you like to explore today?`;

  const fallbackResponses = [
    `That is a thoughtful question! While I am a rule-based demonstration assistant, I suggest exploring our **ADHD Support** section for task chunking, or our **Wellness Centre** for soothing sensory breathing exercises.`,
    `Great topic! For personalized techniques, try testing different visual styles in our **Learning Centre** or using our **Reading Ruler** in the Dyslexia section.`,
    `Neurodivergent brains thrive with concrete tools and predictable structures. Feel free to ask about "ADHD paralysis", "Dyslexia reading fatigue", or "Sensory overload"!`
  ];

  let messages = [];

  function init() {
    messages = [
      { sender: 'bot', text: defaultGreeting, time: 'Just now' }
    ];
    renderMessages();
    bindEvents();
  }

  function renderMessages() {
    const container = document.getElementById('assistant-messages-container');
    if (!container) return;

    container.innerHTML = messages.map(m => `
      <div class="chat-bubble ${m.sender}">
        ${m.sender === 'bot' ? '<strong>🤖 NeuroCare Companion:</strong><br>' : '<strong>You:</strong><br>'}
        ${formatMarkdownText(m.text)}
        <div style="font-size: 10px; opacity: 0.6; margin-top: 4px; text-align: right;">${m.time}</div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  }

  function sendMessage(userText) {
    if (!userText || !userText.trim()) return;

    // Add user message
    messages.push({
      sender: 'user',
      text: userText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    renderMessages();

    // Show simulated typing indicator
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const botReply = generateReply(userText);
      messages.push({
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      renderMessages();

      if (window.Accessibility) window.Accessibility.playSound('click');
    }, 600);
  }

  function generateReply(text) {
    const lower = text.toLowerCase();

    for (const entry of knowledgeBase) {
      for (const kw of entry.keywords) {
        if (lower.includes(kw)) {
          return entry.response;
        }
      }
    }

    // Fallback
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  function showTypingIndicator() {
    const container = document.getElementById('assistant-messages-container');
    if (!container) return;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'chat-typing-indicator';
    typingDiv.className = 'chat-bubble bot';
    typingDiv.innerHTML = `<em>NeuroCare Assistant is typing...</em>`;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  function formatMarkdownText(raw) {
    // Basic formatting for bold and lists
    let formatted = escapeHtml(raw);
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  function clearChat() {
    messages = [
      { sender: 'bot', text: defaultGreeting, time: 'Just now' }
    ];
    renderMessages();
  }

  function bindEvents() {
    const form = document.getElementById('assistant-chat-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('assistant-chat-input');
        if (input && input.value) {
          sendMessage(input.value);
          input.value = '';
        }
      });
    }

    // Suggested chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const text = e.target.textContent.replace(/^[💡❓⚡]\s*/, '');
        sendMessage(text);
      });
    });

    const clearBtn = document.getElementById('btn-clear-chat');
    if (clearBtn) clearBtn.addEventListener('click', clearChat);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init,
    sendMessage,
    clearChat
  };
})();
