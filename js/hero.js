// ===================================================
// Header com dois estados — transparente/mesclado ao herói no topo,
// sólido (preto + linha amarela) assim que o herói sai da tela. O
// vídeo de fundo do herói toca sozinho via autoplay/muted/loop no
// próprio <video> (sem pausa condicional por JS aqui: um vídeo de
// fundo mudo e sutil como esse não é o tipo de movimento que
// prefers-reduced-motion pretende bloquear, e pausá-lo condicionalmente
// estava fazendo o herói parecer estático pra quem tem essa preferência
// ligada no sistema).
// ===================================================
document.addEventListener('DOMContentLoaded', () => {

  const header = document.querySelector('.header');
  const hero = document.getElementById('inicio');
  if (!header || !hero) return;

  function updateHeaderState() {
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    const threshold = heroBottom - header.offsetHeight - 40;
    header.classList.toggle('is-scrolled', window.scrollY > threshold);
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  window.addEventListener('resize', updateHeaderState);
  updateHeaderState();

});
