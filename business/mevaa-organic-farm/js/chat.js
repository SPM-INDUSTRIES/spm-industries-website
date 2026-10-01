(() => {
  const launcher = document.querySelector('#mevaa-chat-launcher');
  const panel = document.querySelector('#mevaa-chat-panel');
  const closeButton = document.querySelector('#mevaa-chat-close');
  const form = document.querySelector('#mevaa-chat-form');
  const input = document.querySelector('#mevaa-chat-input');
  const messages = document.querySelector('#mevaa-chat-messages');
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!launcher || !panel || !form || !input || !messages || !submitButton) return;

  const setOpen = open => {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
  };

  const addMessage = (text, kind) => {
    const bubble = document.createElement('p');
    bubble.className = `mevaa-chat-message ${kind}`;
    bubble.textContent = text;
    messages.append(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };

  launcher.addEventListener('click', () => setOpen(panel.hidden));
  closeButton?.addEventListener('click', () => {
    setOpen(false);
    launcher.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';
    input.disabled = true;
    submitButton.disabled = true;
    submitButton.textContent = '…';
    const pending = addMessage('Thinking…', 'assistant pending');

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The assistant could not reply.');
      pending.textContent = result.response;
      pending.classList.remove('pending');
    } catch (error) {
      pending.textContent = error.message.includes('Failed to fetch')
        ? 'I cannot reach the chat service right now. Please try again shortly.'
        : error.message;
      pending.classList.remove('pending');
      pending.classList.add('error');
    } finally {
      input.disabled = false;
      submitButton.disabled = false;
      submitButton.textContent = 'Send';
      input.focus();
    }
  });
})();
