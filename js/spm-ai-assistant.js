/*
 * SPM AI Assistant
 *
 * This dependency-free assistant deliberately answers only from the approved
 * on-page knowledge base. Connect the lead form to a CRM or API when one is
 * available; until then, it prepares a complete enquiry for the SPM team.
 */
(() => {
  const assistant = document.querySelector('.spm-ai');

  if (!assistant) {
    return;
  }

  const launcher = assistant.querySelector('.spm-ai__launcher');
  const panel = assistant.querySelector('.spm-ai__panel');
  const closeButton = assistant.querySelector('.spm-ai__close');
  const messages = assistant.querySelector('.spm-ai__messages');
  const quickActions = assistant.querySelector('.spm-ai__quick-actions');
  const questionForm = assistant.querySelector('.spm-ai__input');
  const questionInput = assistant.querySelector('#spm-ai-question');

  const knowledgeBase = [
    {
      matches: ['about', 'spm industries', 'company', 'location', 'batticaloa'],
      answer: 'SPM Industries is a diversified business ecosystem in Batticaloa, Sri Lanka. We support individuals, businesses and communities through technology, education, renewable energy, agriculture, entrepreneurship and sustainable solutions.'
    },
    {
      matches: ['technology', 'technologies', 'software', 'digital', 'it service', 'iot', 'erp'],
      answer: 'SPM Technologies works on technology solutions, digital innovation, software, IT services and technology-driven projects. Businesses interested in collaboration can share an enquiry with the Technologies team.'
    },
    {
      matches: ['academy', 'education', 'course', 'courses', 'register', 'registration', 'learn', 'student'],
      answer: 'SPM Academy provides education and skill-development programmes, including technology-based learning. Please share your learning interest and contact details, and the Academy team can guide you on suitable opportunities and registration.'
    },
    {
      matches: ['renewable', 'sustainability', 'solar', 'energy', 'sustainable'],
      answer: 'SPM Renewables focuses on renewable energy and sustainability initiatives, including renewable solutions and sustainability projects. We welcome enquiries about collaboration opportunities.'
    },
    {
      matches: ['foundation', 'community', 'social impact', 'community project'],
      answer: 'SPM Foundation leads community development and social-impact initiatives. It supports projects across climate action, education, youth and livelihoods, and welcomes partnership discussions.'
    },
    {
      matches: ['agri', 'agriculture', 'farming', 'farm'],
      answer: 'SPM Agri focuses on agriculture innovation and development. You can share an agriculture collaboration or business requirement with the SPM team for the appropriate follow-up.'
    },
    {
      matches: ['entrepreneur', 'startup', 'msme', 'business support', 'mentorship'],
      answer: 'SPM supports entrepreneurs and MSMEs through technology, knowledge, resources, networks and opportunities. Support may include skills development, business guidance, technology and innovation, incubation, acceleration and partnership pathways.'
    }
  ];

  function scrollMessagesToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function addMessage(text, sender = 'assistant') {
    const message = document.createElement('div');
    const paragraph = document.createElement('p');

    message.className = `spm-ai__message spm-ai__message--${sender}`;
    paragraph.textContent = text;
    message.appendChild(paragraph);
    messages.appendChild(message);
    scrollMessagesToBottom();
  }

  function createLeadForm() {
    const form = document.createElement('form');
    form.className = 'spm-ai__lead-form';
    form.innerHTML = `
      <label>Name<input name="name" type="text" required autocomplete="name"></label>
      <label>Organization<input name="organization" type="text" autocomplete="organization"></label>
      <label>Email<input name="email" type="email" required autocomplete="email"></label>
      <label>Phone number<input name="phone" type="tel" autocomplete="tel"></label>
      <label>Interested SPM division
        <select name="division" required>
          <option value="">Choose a division</option>
          <option>SPM Technologies</option>
          <option>SPM Academy</option>
          <option>SPM Renewables</option>
          <option>SPM Foundation</option>
          <option>SPM Agri</option>
          <option>SPM Industries / General</option>
        </select>
      </label>
      <label>Requirement<textarea name="requirement" required></textarea></label>
      <button type="submit">Prepare enquiry for SPM</button>
      <p class="spm-ai__lead-status" aria-live="polite"></p>
    `;

    form.addEventListener('submit', event => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const subject = `SPM website enquiry: ${data.get('division')}`;
      const body = [
        `Name: ${data.get('name')}`,
        `Organization: ${data.get('organization') || 'Not provided'}`,
        `Email: ${data.get('email')}`,
        `Phone: ${data.get('phone') || 'Not provided'}`,
        `Interested division: ${data.get('division')}`,
        '',
        'Requirement:',
        data.get('requirement')
      ].join('\n');
      const status = form.querySelector('.spm-ai__lead-status');

      status.textContent = 'Your enquiry is ready to send to the SPM team.';
      window.location.href = `mailto:info@spm.industries?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    return form;
  }

  function showLeadForm() {
    if (messages.querySelector('.spm-ai__lead-form')) {
      messages.querySelector('.spm-ai__lead-form input').focus();
      return;
    }

    addMessage('Would you like our team to contact you? Please share your details and we will connect you with the correct SPM team.');
    const leadForm = createLeadForm();
    messages.appendChild(leadForm);
    scrollMessagesToBottom();
    leadForm.querySelector('input').focus();
  }

  function respondTo(question) {
    const normalizedQuestion = question.toLowerCase();
    const leadKeywords = ['enquiry', 'inquiry', 'partner', 'partnership', 'collaborate', 'collaboration', 'contact', 'work with', 'opportunity'];

    if (leadKeywords.some(keyword => normalizedQuestion.includes(keyword))) {
      addMessage('I can help connect you with the right SPM team.');
      showLeadForm();
      return;
    }

    const match = knowledgeBase.find(entry => entry.matches.some(term => normalizedQuestion.includes(term)));

    addMessage(match
      ? match.answer
      : "I don't have that information currently. Please contact the SPM team and we will assist you.");
  }

  function ask(question) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      return;
    }

    addMessage(cleanQuestion, 'user');
    questionInput.value = '';
    window.setTimeout(() => respondTo(cleanQuestion), 180);
  }

  function openAssistant() {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    questionInput.focus();
  }

  function closeAssistant() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }

  launcher.addEventListener('click', () => {
    if (panel.hidden) {
      openAssistant();
    } else {
      closeAssistant();
    }
  });

  closeButton.addEventListener('click', closeAssistant);

  questionForm.addEventListener('submit', event => {
    event.preventDefault();
    ask(questionInput.value);
  });

  quickActions.addEventListener('click', event => {
    const button = event.target.closest('button[data-prompt]');

    if (button) {
      ask(button.dataset.prompt);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      closeAssistant();
    }
  });
})();
