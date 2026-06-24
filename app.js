/* =================================================================
   Junsa Hwang — site interactions
   Scroll progress, scroll-reveal, count-up stats, hero word
   rotator, carousel drag/arrows, and the hwanglander easter egg.
   ================================================================= */

/* ---- Carousel arrow controls (global, used by inline onclick) ---- */
function scrollCarousel(dir) {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const item = track.querySelector('.carousel-item');
  const step = item ? item.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
  track.scrollBy({ left: dir * step, behavior: 'smooth' });
}

/* ---- hwanglander easter egg (personal page) ---- */
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

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll progress bar */
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

  /* Scroll-reveal */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* Count-up stats */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target) || 0;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    if (reduceMotion) { el.textContent = prefix + target.toFixed(decimals); return; }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals);
    };
    requestAnimationFrame(tick);
  };
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.stat-num').forEach((el) => countObserver.observe(el));

  /* Hero word rotator */
  const rotator = document.getElementById('rotator');
  if (rotator && !reduceMotion) {
    const words = ['goated', 'unbelievably handsome', 'an Ironman', 'amazing'];
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

  /* Carousel drag-to-scroll */
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
