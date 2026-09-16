// ===================================================
// Vitrine giratória do hero — reaproveita a mecânica de slide
// horizontal (dois slots alternando, translateX + as mesmas curvas de
// easing/duração) criada originalmente pro carrossel de fotos do
// projeto Chapa Quente. Aqui ela roda sozinha em loop contínuo, dentro
// de uma vitrine menor (translateX relativo à própria caixa, não a
// 100vw da tela — por isso nunca gera overflow horizontal de página).
// ===================================================
document.addEventListener('DOMContentLoaded', () => {

  const slotA = document.getElementById('heroSlideA');
  const slotB = document.getElementById('heroSlideB');
  const dotsEl = document.getElementById('heroShowcaseDots');
  const arrowLeft = document.querySelector('.hero-showcase-arrow-left');
  const arrowRight = document.querySelector('.hero-showcase-arrow-right');
  if (!slotA || !slotB) return;

  const SLIDES = [
    { icon: 'illus-burger', name: 'X-Tudo', tag: 'Duplo hambúrguer' },
    { icon: 'illus-hotdog', name: 'Cachorro-quente', tag: 'Completo' },
    { icon: 'illus-toast', name: 'Misto Quente', tag: 'Na chapa' },
    { icon: 'illus-combo', name: 'Combo Duplo', tag: '2 lanches + bebida' }
  ];

  function slideMarkup(slide) {
    return `<svg class="hero-slide-illus" viewBox="0 0 100 100" aria-hidden="true"><use href="#${slide.icon}"></use></svg>
      <span class="hero-slide-caption"><strong>${slide.name}</strong><small>${slide.tag}</small></span>`;
  }

  function renderDots(activeIndex) {
    if (!dotsEl) return;
    dotsEl.innerHTML = SLIDES.map((_, i) => `<span class="${i === activeIndex ? 'is-active' : ''}"></span>`).join('');
  }

  let currentIndex = 0;
  let activeIsA = true;
  let isTransitioning = false;
  let autoTimer = null;

  slotA.innerHTML = slideMarkup(SLIDES[0]);
  renderDots(0);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Fallback estático: mostra só o primeiro item, sem loop nem setas.
    arrowLeft && (arrowLeft.hidden = true);
    arrowRight && (arrowRight.hidden = true);
    return;
  }

  // direction: 1 = avança (entra pela direita, sai pela esquerda)
  //           -1 = volta (entra pela esquerda, sai pela direita)
  function transitionTo(index, direction) {
    const slide = SLIDES[index];
    if (!slide) return;
    isTransitioning = true;

    const current = activeIsA ? slotA : slotB;
    const incoming = activeIsA ? slotB : slotA;

    const exitX = direction === 1 ? '100%' : '-100%';
    const enterFromX = direction === 1 ? '-100%' : '100%';

    [current, incoming].forEach(el => el.getAnimations().forEach(anim => anim.cancel()));

    incoming.innerHTML = slideMarkup(slide);
    incoming.style.zIndex = '3';
    incoming.style.transform = `translateX(${enterFromX})`;
    current.style.zIndex = '2';

    activeIsA = !activeIsA;
    currentIndex = index;
    renderDots(currentIndex);

    current.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(${exitX})` }],
      { duration: 300, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }
    );
    const inAnim = incoming.animate(
      [{ transform: `translateX(${enterFromX})` }, { transform: 'translateX(0)' }],
      { duration: 320, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' }
    );
    inAnim.finished.then(() => { isTransitioning = false; }).catch(() => { isTransitioning = false; });
  }

  function goToSlide(newIndex, direction) {
    if (isTransitioning) return;
    const total = SLIDES.length;
    const index = (newIndex + total) % total;
    if (index === currentIndex) return;
    transitionTo(index, direction);
    resetAutoplay();
  }

  function autoAdvance() {
    if (isTransitioning) return;
    const index = (currentIndex + 1) % SLIDES.length;
    transitionTo(index, 1);
  }

  function resetAutoplay() {
    window.clearInterval(autoTimer);
    autoTimer = window.setInterval(autoAdvance, 3400);
  }

  arrowLeft?.addEventListener('click', () => goToSlide(currentIndex - 1, -1));
  arrowRight?.addEventListener('click', () => goToSlide(currentIndex + 1, 1));

  resetAutoplay();

});
