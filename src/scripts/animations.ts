import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Selectors that get auto fade-up without needing data-anim on every element
const AUTO_CARD_SELECTORS = [
  '.card',
  '.album-row',
  '.figurita-card',
  '.album-card',
  '.promo-card',
  '.grid > a',   // noticias / el-otro-lado cards (rendered as <a> inside .grid)
].join(', ')

function fadeUpEl(el: HTMLElement, i: number) {
  gsap.fromTo(
    el,
    { opacity: 0, y: 48 },
    {
      opacity: 1,
      y: 0,
      duration: 0.65,
      delay: (i % 4) * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        toggleActions: 'play none none none',
      },
    }
  )
}

function initScrollAnimations() {
  // Matar triggers anteriores para evitar duplicados en nav
  ScrollTrigger.getAll().forEach(t => t.kill())

  // Fade-up para elementos marcados manualmente
  gsap.utils.toArray<HTMLElement>('[data-anim="fade-up"]').forEach(fadeUpEl)

  // Fade-up automático para todos los tipos de card del sitio
  gsap.utils.toArray<HTMLElement>(AUTO_CARD_SELECTORS).forEach((el, i) => {
    // Skip si ya tiene data-anim (evita doble animación)
    if (el.closest('[data-anim="fade-up"]') || el.hasAttribute('data-anim')) return
    fadeUpEl(el, i)
  })

  // Fade-up simple para secciones genéricas
  gsap.utils.toArray<HTMLElement>('[data-anim="section"]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    )
  })
}

function initHeroText() {
  const hero = document.querySelector<HTMLElement>('[data-anim="hero-title"]')
  if (!hero) return

  const raw = hero.innerHTML

  // Partir en spans por letra, preservando etiquetas HTML
  hero.innerHTML = raw
    .split('')
    .map(ch => (ch === ' ' ? ' ' : `<span class="gsap-char" style="display:inline-block;will-change:transform">${ch}</span>`))
    .join('')

  gsap.fromTo(
    hero.querySelectorAll('.gsap-char'),
    { opacity: 0, y: 28, rotateX: -90 },
    {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.55,
      stagger: 0.03,
      ease: 'back.out(1.6)',
      delay: 0.1,
    }
  )
}

function init() {
  initHeroText()
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
    initScrollAnimations()
  })
}

// Primer load y cada navegación con View Transitions
document.addEventListener('astro:page-load', init)
