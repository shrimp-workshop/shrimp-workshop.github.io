(() => {
  const root = document.documentElement;
  const themeOptions = document.querySelectorAll('input[name="theme"]');
  const themeStatus = document.querySelector('#theme-status');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = root.dataset.themePreference || 'system';

  function applyTheme(announce = false) {
    const theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    themeOptions.forEach((option) => { option.checked = option.value === preference; });
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#071b25' : '#edf5f4';
    if (announce) themeStatus.textContent = `${theme === 'dark' ? 'Dark' : 'Light'} theme${preference === 'system' ? ', following your device setting' : ''}.`;
  }

  themeOptions.forEach((option) => {
    option.addEventListener('change', () => {
      if (!option.checked) return;
      preference = option.value;
      try { localStorage.setItem('underwater-theme', preference); } catch {}
      applyTheme(true);
    });
  });
  media.addEventListener('change', () => { if (preference === 'system') applyTheme(true); });
  window.addEventListener('storage', (event) => {
    if (event.key !== 'underwater-theme' && event.key !== null) return;
    preference = ['light', 'dark', 'system'].includes(event.newValue) ? event.newValue : 'system';
    applyTheme(true);
  });
  applyTheme();

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 1201px)').addEventListener('change', closeMenu);

  const logoStrip = document.querySelector('.logo-strip');
  if (logoStrip) {
    const track = logoStrip.querySelector('.logo-track');
    const group = track.querySelector('.logo-group');
    const duplicate = group.cloneNode(true);
    duplicate.classList.add('logo-group-duplicate');
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.inert = true;
    duplicate.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    track.append(duplicate);
    logoStrip.classList.add('is-animated');
  }

  const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
  if ('IntersectionObserver' in window && sectionLinks.length) {
    const sections = document.querySelectorAll('main > section[id]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    sections.forEach((section) => observer.observe(section));
  }
})();
