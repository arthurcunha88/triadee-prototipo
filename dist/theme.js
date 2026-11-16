(() => {
  const key = 'triadee-theme';
  const root = document.documentElement;
  let dark = false;
  try { dark = localStorage.getItem(key) === 'dark'; } catch {}
  function apply() {
    root.toggleAttribute('data-dark', dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#201a16' : '#f4efe7');
  }
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    toggle.hidden = false;
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.addEventListener('click', () => {
      dark = !dark;
      apply();
      toggle.setAttribute('aria-pressed', String(dark));
      try { localStorage.setItem(key, dark ? 'dark' : 'light'); } catch {}
    });
  });
})();
