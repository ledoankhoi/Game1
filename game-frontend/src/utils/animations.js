import { gsap } from 'gsap';

export function animatePageIn(container) {
  if (!container.current) return;
  const el = container.current;
  const children = el.children;
  gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  if (children.length) {
    gsap.fromTo(children, { opacity: 0, y: 15 }, {
      opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out'
    });
  }
}

export function animateStagger(selector, fromVars = { y: 20, opacity: 0 }, toVars = { y: 0, opacity: 1, duration: 0.4, stagger: 0.06 }) {
  const ctx = gsap.context(() => {
    gsap.fromTo(selector, fromVars, toVars);
  });
  return () => ctx.revert();
}

export function animateCounter(el, start = 0, end, duration = 1) {
  const obj = { val: start };
  return gsap.to(obj, {
    val: end, duration, ease: 'power2.out',
    onUpdate: () => { if (el) el.textContent = Math.round(obj.val); }
  });
}

export function animateFloat(el, { y = -10, duration = 2, delay = 0 } = {}) {
  return gsap.to(el, {
    y, duration, delay, ease: 'sine.inOut',
    yoyo: true, repeat: -1
  });
}

export function animatePulse(el, { scale = 1.05, duration = 0.8 } = {}) {
  return gsap.to(el, {
    scale, duration, ease: 'sine.inOut',
    yoyo: true, repeat: -1
  });
}

export function animateGlow(el, { color = '#25f46a', duration = 1.5 } = {}) {
  return gsap.to(el, {
    boxShadow: `0 0 20px ${color}`,
    duration, ease: 'sine.inOut',
    yoyo: true, repeat: -1
  });
}

export function animateCardEnter(el, index = 0) {
  return gsap.fromTo(el,
    { opacity: 0, y: 30, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.4, delay: index * 0.06, ease: 'back.out(1.5)' }
  );
}

export function animateCardHover(el) {
  const ctx = gsap.context(() => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, { y: -6, scale: 1.02, duration: 0.25, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { y: 0, scale: 1, duration: 0.25, ease: 'power2.out' });
    });
  }, el);
  return () => ctx.revert();
}

export function animateNumberRoll(el, start, end, duration = 0.8) {
  const obj = { val: start };
  return gsap.to(obj, {
    val: end, duration, ease: 'power3.out',
    onUpdate: () => {
      if (el) {
        el.textContent = Math.floor(obj.val).toLocaleString();
      }
    }
  });
}

export function animateStaggerFrom(el, fromVars, toVars) {
  const ctx = gsap.context(() => {
    gsap.fromTo(el, fromVars, toVars);
  }, el);
  return () => ctx.revert();
}

const MAX_FLOATING_COINS = 3;
let activeFloatingCoins = 0;

export function createFloatingCoin(anchorEl, amount) {
  if (activeFloatingCoins >= MAX_FLOATING_COINS) return;

  const rect = anchorEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.textContent = `+${amount}`;
  Object.assign(el.style, {
    position: 'fixed',
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top}px`,
    transform: 'translateX(-50%)',
    fontSize: '1.25rem',
    fontWeight: '900',
    color: '#facc15',
    pointerEvents: 'none',
    zIndex: '9999',
    textShadow: '0 0 10px rgba(250,204,21,0.6)',
    fontFamily: "'Orbitron', sans-serif"
  });
  document.body.appendChild(el);

  activeFloatingCoins++;
  const tl = gsap.timeline({
    onComplete: () => {
      el.remove();
      activeFloatingCoins = Math.max(0, activeFloatingCoins - 1);
    }
  });
  tl.fromTo(el, { scale: 0, autoAlpha: 1 }, { scale: 1.3, duration: 0.15, ease: 'back.out(2)' })
    .to(el, { scale: 1, y: -40, autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, '+=0.1');
}
