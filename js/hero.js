// ===================================================
// Vitrine do hero — a MESMA animação de troca de foto usada no
// carrossel do projeto Chapa Quente/Gulamix (duas camadas de imagem
// que se cruzam + par de emojis saindo de trás da foto), reaproveitada
// tal como foi ajustada: mesmas curvas de easing, mesma duração, mesmo
// comportamento de pop dos emojis. A única mudança é que o percurso de
// entrada/saída agora é relativo à própria vitrine (não a 100vw da
// tela inteira), pra caber no layout da Lanche Certo sem cobrir o
// headline nem gerar overflow horizontal — e passou a rodar sozinha em
// loop automático, além de continuar respondendo às setas.
// ===================================================
document.addEventListener('DOMContentLoaded', () => {

  const heroPhotoA = document.getElementById('heroPhotoA');
  const heroPhotoB = document.getElementById('heroPhotoB');
  const emojiBig = document.getElementById('emojiBig');
  const emojiSmall = document.getElementById('emojiSmall');
  const circleBig = document.querySelector('.emoji-circle-big');
  const circleSmall = document.querySelector('.emoji-circle-small');
  const arrowLeft = document.querySelector('.hero-showcase-arrow-left');
  const arrowRight = document.querySelector('.hero-showcase-arrow-right');
  if (!heroPhotoA || !heroPhotoB) return;

  // Sem nome/legenda por cima da foto — o hambúrguer é o foco visual,
  // sem texto de produto dentro do card (pedido explícito do cliente).
  const SLIDES = [
    {
      photo: 'public/hamburguer-hero-solto.png',
      alt: 'Hambúrguer Lanche Certo',
      emojiBig: 'public/emoji-foguinho.png',
      emojiSmall: 'public/emoji-batata-frita.png'
    },
    {
      photo: 'public/cachorro-quente-solto.png',
      alt: 'Cachorro-quente Lanche Certo',
      emojiBig: 'public/emoji-saboreando-comida.png',
      emojiSmall: 'public/emoji-coracao.png'
    },
    {
      photo: 'public/xis-carne-solto.png',
      alt: 'Xis Carne Lanche Certo',
      emojiBig: 'public/emoji-carinha-de-amor.png',
      emojiSmall: 'public/emoji-gesto-italiano.png'
    }
  ];

  let currentSlide = 0;
  let activeIsA = true;
  let isTransitioning = false;
  let emojiTimer = null;
  let autoTimer = null;
  const preloaded = [];

  // Pré-carrega e decodifica tudo assim que a página abre — igual ao original.
  (function preload() {
    SLIDES.forEach(slide => {
      [slide.photo, slide.emojiBig, slide.emojiSmall].forEach(src => {
        const img = new Image();
        img.src = src;
        if (img.decode) img.decode().catch(() => {});
        preloaded.push(img);
      });
    });
  })();

  function hideEmojiCircles() {
    [circleBig, circleSmall].forEach(el => {
      if (!el) return;
      el.getAnimations().forEach(anim => anim.cancel());
      el.style.opacity = '0';
      el.style.transform = 'scale(.4)';
    });
  }

  // origin = ponto de partida debaixo do lanche (a foto tem z-index maior,
  // então o círculo começa coberto por ela e só aparece saindo de trás).
  function popEmojiCircle(el, origin, delay) {
    if (!el) return;
    el.getAnimations().forEach(anim => anim.cancel());
    el.animate(
      [
        { transform: `translate(${origin.x}px, ${origin.y}px) scale(.5)`, opacity: .3 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 }
      ],
      { duration: 420, delay: delay || 0, easing: 'cubic-bezier(.16,.9,.3,1)', fill: 'both' }
    );
  }

  function revealEmojis(index) {
    const slide = SLIDES[index];
    if (!slide) return;
    emojiBig.src = slide.emojiBig;
    emojiSmall.src = slide.emojiSmall;
    popEmojiCircle(circleBig, { x: -70, y: -60 }, 0);
    popEmojiCircle(circleSmall, { x: -80, y: -40 }, 80);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Fallback estático: mostra só o primeiro item parado, sem loop nem setas.
    emojiBig.src = SLIDES[0].emojiBig;
    emojiSmall.src = SLIDES[0].emojiSmall;
    arrowLeft && (arrowLeft.hidden = true);
    arrowRight && (arrowRight.hidden = true);
    return;
  }

  // direction: 1 = seta direita (sai pela direita, entra pela esquerda)
  //           -1 = seta esquerda (sai pela esquerda, entra pela direita)
  function transitionTo(index, direction) {
    const slide = SLIDES[index];
    if (!slide) return;
    isTransitioning = true;

    const current = activeIsA ? heroPhotoA : heroPhotoB;
    const incoming = activeIsA ? heroPhotoB : heroPhotoA;

    // percurso relativo à própria vitrine (não 100vw da tela) — a foto
    // atravessa a caixa inteira, mas nunca sai por cima do headline.
    const exitX = direction === 1 ? '100%' : '-100%';
    const enterFromX = direction === 1 ? '-100%' : '100%';

    hideEmojiCircles();
    window.clearTimeout(emojiTimer);

    [current, incoming].forEach(el => el.getAnimations().forEach(anim => anim.cancel()));

    incoming.alt = slide.alt;
    incoming.src = slide.photo;
    incoming.classList.toggle('xis-carne-photo', index === 2);
    incoming.style.zIndex = '3';
    incoming.style.opacity = '1';
    incoming.style.transform = `translateX(${enterFromX})`;
    current.style.zIndex = '2';

    const runSlide = () => {
      activeIsA = !activeIsA;
      currentSlide = index;

      current.animate(
        [{ transform: 'translateX(0)' }, { transform: `translateX(${exitX})` }],
        { duration: 300, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }
      );
      const inAnim = incoming.animate(
        [{ transform: `translateX(${enterFromX})` }, { transform: 'translateX(0)' }],
        { duration: 320, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' }
      );
      inAnim.finished.then(() => {
        isTransitioning = false;
        emojiTimer = window.setTimeout(() => revealEmojis(index), 250);
      }).catch(() => { isTransitioning = false; });
    };

    if (incoming.decode) {
      incoming.decode().catch(() => {}).then(() => requestAnimationFrame(runSlide));
    } else {
      requestAnimationFrame(runSlide);
    }
  }

  function goToSlide(newIndex, direction) {
    if (isTransitioning) return;
    const total = SLIDES.length;
    const index = (newIndex + total) % total;
    if (index === currentSlide) return;
    transitionTo(index, direction);
    resetAutoplay();
  }

  function autoAdvance() {
    if (isTransitioning) return;
    goToSlide(currentSlide + 1, 1);
  }
  function resetAutoplay() {
    window.clearInterval(autoTimer);
    autoTimer = window.setInterval(autoAdvance, 3800);
  }

  window.setTimeout(() => revealEmojis(0), 400);

  arrowLeft?.addEventListener('click', () => goToSlide(currentSlide - 1, -1));
  arrowRight?.addEventListener('click', () => goToSlide(currentSlide + 1, 1));

  resetAutoplay();

});
