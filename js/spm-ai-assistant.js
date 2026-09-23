/*
 * SPM AI Assistant
 *
 * This dependency-free assistant sends questions to the local Flask API.
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
  const submitButton = questionForm.querySelector('button[type="submit"]');
  const chatEndpoint = 'http://127.0.0.1:5000/chat';

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
    return message;
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

  async function respondTo(question) {
    const pendingMessage = addMessage('Thinking…');

    try {
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'The chatbot request failed.');
      }

      pendingMessage.querySelector('p').textContent = data.response;
    } catch (error) {
      pendingMessage.querySelector('p').textContent = error instanceof TypeError
        ? 'I cannot reach the chatbot server. Please make sure the backend is running.'
        : error.message;
    } finally {
      questionInput.disabled = false;
      submitButton.disabled = false;
      questionInput.focus();
      scrollMessagesToBottom();
    }
  }

  function ask(question) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      return;
    }

    addMessage(cleanQuestion, 'user');
    questionInput.value = '';
    questionInput.disabled = true;
    submitButton.disabled = true;
    respondTo(cleanQuestion);
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
