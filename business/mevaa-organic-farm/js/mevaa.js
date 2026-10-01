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

  const inquiryForm = document.querySelector('#inquiry-form');
  const inquiryStatus = document.querySelector('#inquiry-status');
  inquiryForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!inquiryForm.reportValidity()) return;

    const submitButton = inquiryForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    inquiryStatus.textContent = '';
    inquiryStatus.classList.remove('is-error');

    try {
      const response = await fetch(inquiryForm.dataset.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(inquiryForm)))
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not send your inquiry. Please try again.');
      inquiryStatus.textContent = result.message;
      inquiryForm.reset();
    } catch (error) {
      inquiryStatus.textContent = error.message.includes('Failed to fetch')
        ? 'The inquiry service is unavailable. Please try again in a moment.'
        : error.message;
      inquiryStatus.classList.add('is-error');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });
})();
