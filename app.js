/* =================================================================
   Junsa Hwang — site interactions
   Preloader, aurora atmosphere, scroll progress +
   reveal, count-up, hero rotator + char reveal, signature draw-in,
   parallax, tilt cards, carousel, and the hwanglander egg.
   ================================================================= */

/* ---- Carousel arrow controls (global, used by inline onclick) ---- */
function scrollCarousel(dir) {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const item = track.querySelector('.carousel-item');
  const step = item ? item.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
  track.scrollBy({ left: dir * step, behavior: 'smooth' });
}

/* ---- hwanglander easter egg ---- */
function showEgg() {
  const audio = document.getElementById('eggAudio');
  const pop = document.getElementById('eggPop');
  const overlay = document.getElementById('eggOverlay');
  if (!pop || !overlay) return;
  pop.style.display = 'block';
  overlay.style.display = 'block';
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
    audio.addEventListener('ended', hideEgg, { once: true });
  }
}
function hideEgg() {
  const audio = document.getElementById('eggAudio');
  const pop = document.getElementById('eggPop');
  const overlay = document.getElementById('eggOverlay');
  if (pop) pop.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
  if (audio) { audio.pause(); audio.currentTime = 0; }
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---- Preloader: hide once the page is ready ---- */
(function preloader() {
  const pl = document.getElementById('preloader');
  if (!pl) return;
  const dismiss = () => {
    pl.classList.add('done');
    setTimeout(() => pl.remove(), 800);
  };
  window.addEventListener('load', () => setTimeout(dismiss, reduceMotion ? 200 : 1100));
  // safety net in case load already fired / is slow
  setTimeout(dismiss, 3200);
})();

/* ---- Inject atmosphere layers (aurora + grain) once ---- */
(function atmosphere() {
  if (document.querySelector('.atmosphere')) return;
  const atmo = document.createElement('div');
  atmo.className = 'atmosphere';
  atmo.innerHTML = '<div class="aurora a1"></div><div class="aurora a2"></div><div class="aurora a3"></div>';
  document.body.appendChild(atmo);
  const grain = document.createElement('div');
  grain.className = 'grain';
  document.body.appendChild(grain);
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Nav: solidify on scroll ---- */
  const nav = document.querySelector('.nav');
  const onNavScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ---- Scroll progress bar ---- */
  const progress = document.getElementById('progress');
  if (progress) {
    const update = () => {
      const scrolled = document.documentElement.scrollTop || document.body.scrollTop;
      const height = (document.documentElement.scrollHeight || 0) - window.innerHeight;
      progress.style.width = height > 0 ? (scrolled / height) * 100 + '%' : '0%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---- Scroll-reveal (elements + staggered groups) ---- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .stagger').forEach((el) => revealObserver.observe(el));

  /* ---- Count-up stats ---- */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target) || 0;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(tick);
  };
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.stat-num').forEach((el) => countObserver.observe(el));

  /* ---- Hero word rotator ---- */
  const rotator = document.getElementById('rotator');
  if (rotator && !reduceMotion) {
    const words = (rotator.dataset.words || 'goated,amazing').split(',');
    let i = 0;
    setInterval(() => {
      rotator.classList.add('swap');
      setTimeout(() => {
        i = (i + 1) % words.length;
        rotator.textContent = words[i];
        rotator.classList.remove('swap');
      }, 350);
    }, 2400);
  }

  /* ---- Hero name → per-letter spans, grouped by word so lines
         only break between words (hover pop + intro reveal) ---- */
  document.querySelectorAll('.hero-name').forEach((heroName) => {
    if (heroName.dataset.split) return;
    heroName.dataset.split = '1';
    const doReveal = heroName.classList.contains('reveal-chars') && !reduceMotion;
    const text = heroName.textContent;
    heroName.textContent = '';
    let idx = 0;
    text.split(' ').forEach((word, w, words) => {
      const wd = document.createElement('span');
      wd.className = 'wd';
      [...word].forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'ltr';
        span.textContent = ch;
        if (doReveal) span.style.setProperty('--i', idx);
        idx++;
        wd.appendChild(span);
      });
      heroName.appendChild(wd);
      if (w < words.length - 1) {
        const sp = document.createElement('span');
        sp.className = 'ltr space';
        sp.textContent = ' ';
        idx++;
        heroName.appendChild(sp);
      }
    });
  });

  /* ---- Typewriter intro on the home hero name ---- */
  const typedName = document.querySelector('.hero-name.typed');
  if (typedName && !reduceMotion) {
    const letters = [...typedName.querySelectorAll('.ltr')];
    letters.forEach((l) => l.classList.add('pending'));
    const caret = document.createElement('span');
    caret.className = 'type-caret';
    if (letters.length) letters[0].before(caret);
    let i = 0;
    setTimeout(() => {
      const timer = setInterval(() => {
        if (i >= letters.length) {
          clearInterval(timer);
          setTimeout(() => caret.remove(), 2000);
          return;
        }
        const l = letters[i++];
        l.classList.remove('pending');
        l.after(caret);
      }, 95);
    }, 1350);
  }

  /* ---- Signature draw-in (clip-path sweep) ---- */
  const sig = document.querySelector('.hero-sig');
  if (sig) {
    if (reduceMotion) {
      sig.classList.add('drawn');
    } else if (sig.getBoundingClientRect().top < window.innerHeight) {
      // above the fold: draw shortly after the preloader clears
      setTimeout(() => sig.classList.add('drawn'), 1200);
    } else {
      const sObs = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          obs.unobserve(e.target);
          sig.classList.add('drawn');
        });
      }, { threshold: 0.4 });
      sObs.observe(sig);
    }
  }

  /* ---- Cursor-following page glow ---- */
  if (finePointer && !reduceMotion) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let raf = 0;
    document.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        glow.style.setProperty('--mx', (e.clientX / window.innerWidth) * 100 + '%');
        glow.style.setProperty('--my', (e.clientY / window.innerHeight) * 100 + '%');
        glow.classList.add('glow-on');
        raf = 0;
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => glow.classList.remove('glow-on'));
    window.addEventListener('blur', () => glow.classList.remove('glow-on'));
  }

  /* ---- Path cards → 3D tilt toward cursor + sheen ---- */
  document.querySelectorAll('.path-card').forEach((card) => {
    if (!finePointer || reduceMotion) { card.classList.add('no-tilt'); return; }
    const MAX = 8;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 2 * MAX;
      const ry = (px - 0.5) * 2 * MAX;
      card.style.transform = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.setProperty('--cx', px * 100 + '%');
      card.style.setProperty('--cy', py * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ---- Parallax on tagged elements ---- */
  if (!reduceMotion) {
    const layers = document.querySelectorAll('[data-parallax]');
    if (layers.length) {
      let raf = 0;
      const apply = () => {
        layers.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const r = el.getBoundingClientRect();
          const offset = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
          el.style.transform = `translateY(${(-offset).toFixed(1)}px)`;
        });
        raf = 0;
      };
      window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(apply); }, { passive: true });
      apply();
    }
  }

  /* ---- Carousel drag-to-scroll ---- */
  const track = document.getElementById('carouselTrack');
  if (track) {
    let isDown = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      isDown = true; moved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('dragging');
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    const end = () => { isDown = false; track.classList.remove('dragging'); };
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('pointerleave', end);
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }
});
