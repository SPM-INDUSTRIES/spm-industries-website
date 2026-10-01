(() => {
  const header = document.querySelector('.header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');

  const setScrollState = () => header?.classList.toggle('scrolled', window.scrollY > 18);
  setScrollState();
  window.addEventListener('scroll', setScrollState, { passive: true });

  const closeMenu = () => {
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-open');
  };

  toggle?.addEventListener('click', () => {
    const opening = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('open', opening);
    document.body.classList.toggle('menu-open', opening);
  });

  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  const chatPanel = document.querySelector('#chat-panel');
  const chatLauncher = document.querySelector('.chat-launcher');
  const chatClose = document.querySelector('.chat-close');
  const chatForm = document.querySelector('#chat-form');
  const chatInput = document.querySelector('#chat-input');
  const chatMessages = document.querySelector('#chat-messages');
  const chatError = document.querySelector('#chat-error');

  const setChatOpen = open => {
    chatPanel.hidden = !open;
    chatLauncher.setAttribute('aria-expanded', String(open));
    if (open) chatInput.focus();
  };

  const addChatMessage = (message, sender) => {
    const item = document.createElement('p');
    item.className = `chat-message chat-message-${sender}`;
    item.textContent = message;
    chatMessages.append(item);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return item;
  };

  chatLauncher.addEventListener('click', () => setChatOpen(chatPanel.hidden));
  chatClose.addEventListener('click', () => {
    setChatOpen(false);
    chatLauncher.focus();
  });

  chatForm.addEventListener('submit', async event => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    chatError.hidden = true;
    addChatMessage(message, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    chatForm.querySelector('button').disabled = true;

    const loading = document.createElement('p');
    loading.className = 'chat-message chat-message-assistant chat-loading';
    loading.setAttribute('aria-label', 'Mevaa is replying');
    loading.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.append(loading);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'The chat service is unavailable. Please try again.');
      }
      if (typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('The chat service returned an empty reply. Please try again.');
      }
      addChatMessage(data.reply.trim(), 'assistant');
    } catch (error) {
      chatError.textContent = error.message || 'Could not reach the chat service. Check your connection and try again.';
      chatError.hidden = false;
    } finally {
      loading.remove();
      chatInput.disabled = false;
      chatForm.querySelector('button').disabled = false;
      chatInput.focus();
    }
  });
})();
