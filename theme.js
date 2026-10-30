/* Apply the saved theme before the stylesheet paints. */
(() => {
  document.documentElement.classList.add('js');
  let preference = 'system';
  try { preference = localStorage.getItem('underwater-theme') || 'system'; } catch {}
  if (!['light', 'dark', 'system'].includes(preference)) preference = 'system';
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = preference === 'system' ? (dark ? 'dark' : 'light') : preference;
  document.documentElement.dataset.themePreference = preference;
})();
