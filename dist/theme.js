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
      root.classList.add("theme-transition");
      dark = !dark;
      apply();
      toggle.setAttribute('aria-pressed', String(dark));
      try { localStorage.setItem(key, dark ? 'dark' : 'light'); } catch {}
    });
  });
})();
document.addEventListener('DOMContentLoaded', () => {
  const channel = document.querySelector('#press-channel');
  if (channel) {
    const cards = [...document.querySelectorAll('[data-channel]')];
    const status = document.querySelector('#press-count');
    channel.closest('.press-filter').hidden = false;
    const filter = () => {
      let count = 0;
      for (const card of cards) {
        card.hidden = channel.value !== 'all' && channel.value !== card.dataset.channel;
        if (!card.hidden) count++;
      }
      status.textContent = count === 1 ? '1 registro' : count + ' registros';
    };
    channel.addEventListener('change', () => {
      filter();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      for (const card of cards) {
        card.classList.remove('press-enter');
        if (!card.hidden) {
          void card.offsetWidth;
          card.classList.add('press-enter');
        }
      }
    });
    filter();
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || reduced.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target || link.classList.contains('skip')) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll:true});
    const start = scrollY;
    const inset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const end = Math.max(0, Math.min(document.documentElement.scrollHeight-innerHeight,target.getBoundingClientRect().top+start-inset));
    const duration = Math.min(1450, Math.max(650, Math.abs(end-start)*.75));
    const began = performance.now();
    const stop = new AbortController();
    for (const type of ['wheel','touchstart','keydown','pointerdown','popstate']) {
      window.addEventListener(type, () => stop.abort(), {signal:stop.signal, passive:true});
    }
    function frame(now) {
      if (stop.signal.aborted) return;
      if (reduced.matches) { scrollTo({top:end,behavior:'instant'}); stop.abort(); return; }
      const t = Math.min(1,(now-began)/duration);
      scrollTo({top:start+(end-start)*(t < .5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2),behavior:'instant'});
      if (t < 1) requestAnimationFrame(frame);
      else stop.abort();
    }
    requestAnimationFrame(frame);
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const cover = document.querySelector('.cover-carousel');
  if (!cover) return;
  const slides = [...cover.querySelectorAll('.cover-slide')];
  const controls = cover.querySelector('.cover-controls');
  const pause = cover.querySelector('.cover-pause');
  const position = cover.querySelector('.cover-position');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = reduced.matches;
  let timer;
  controls.hidden = false;

  function show(step) {
    current = (current + step + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-current', index === current);
      slide.setAttribute('aria-hidden', String(index !== current));
    });
    position.textContent = (current + 1) + ' / ' + slides.length;
  }

  function schedule() {
    clearTimeout(timer);
    if (paused || document.hidden || cover.matches(':hover,:focus-within')) return;
    timer = setTimeout(() => {
      show(1);
      schedule();
    }, 6500);
  }

  function setPaused(value) {
    paused = value;
    pause.textContent = paused ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-label', paused ? 'Reproduzir carrossel' : 'Pausar carrossel');
    schedule();
  }

  controls.querySelectorAll('[data-cover-step]').forEach(button => {
    button.addEventListener('click', () => {
      show(Number(button.dataset.coverStep));
      setPaused(true);
    });
  });
  pause.addEventListener('click', () => setPaused(!paused));
  for (const type of ['pointerenter', 'pointerleave', 'focusin', 'focusout']) {
    cover.addEventListener(type, () => setTimeout(schedule, 0));
  }
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => setPaused(reduced.matches));
  setPaused(paused);
});
