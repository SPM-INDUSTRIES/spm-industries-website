// Small interactions kept dependency-free.
const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 18), { passive: true });
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open);
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
});
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
}));
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

// Footer content is kept here temporarily while the wider site remains a single page.
// Replace any # placeholders with verified SPM social URLs when they become available.
const footer = document.querySelector('footer');
footer.className = 'reference-footer';
footer.style.backgroundColor = '#E6E6E6';
footer.innerHTML = `
  <div class="reference-footer-grid">
    <div class="footer-brand"><a class="footer-logo" href="#home" aria-label="SPM Industries home"><img src="assets/logos/spm-logo.svg" alt="SPM Industries"></a></div>
    <section class="footer-contact" aria-labelledby="footer-contact-title"><h2 id="footer-contact-title">Get In Touch</h2><p>No: 57 Lloyd's Ave, Batticaloa,<br>30000, Sri Lanka.</p></section>
    <section class="footer-support" aria-labelledby="footer-support-title"><h2 id="footer-support-title">Need support?</h2><a href="tel:+94740164545">+94 74 016 4545</a><a href="mailto:info@spm.industries">info@spm.industries</a></section>
    <section class="footer-social" aria-labelledby="footer-social-title"><h2 id="footer-social-title">Social Media</h2><div class="social-list">
      <a class="social-button" href="#" data-social-placeholder="Facebook URL to be configured" aria-label="Facebook (URL to be configured)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.1 0-5 1.9-5 5v3H6v4h3v5h4v-5h3.1l.9-4H13V9c0-.7.3-1 1-1Z"/></svg></a>
      <a class="social-button" href="#" data-social-placeholder="YouTube URL to be configured" aria-label="YouTube (URL to be configured)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1C1.9 9.1 1.9 12 1.9 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM10.2 15.1V8.9l5.4 3.1-5.4 3.1Z"/></svg></a>
      <a class="social-button" href="#" data-social-placeholder="Instagram URL to be configured" aria-label="Instagram (URL to be configured)"><svg class="stroke-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none"/></svg></a>
      <a class="social-button" href="https://www.linkedin.com/company/spm-industries/" target="_blank" rel="noopener" aria-label="SPM Industries on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.2a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2ZM4.5 9.7h4V21h-4V9.7Zm6.5 0h3.8v1.5h.1c.5-1 1.8-2 3.8-2 4.1 0 4.8 2.6 4.8 6.1V21h-4v-5.1c0-1.2 0-2.8-1.8-2.8s-2 1.3-2 2.7V21h-4V9.7Z"/></svg></a>
    </div></section>
  </div><div class="footer-bottom"><p>© SPM Industries 2025. Developed by <a href="#" aria-label="SPM Technologies">SPM Technologies</a></p></div>`;
