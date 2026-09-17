// ===================================================
// Header com dois estados — transparente/mesclado ao herói no topo,
// sólido (preto + linha amarela) assim que o herói sai da tela.
//
// + Reforço de reprodução do vídeo de fundo do herói: o <video> já tem
// autoplay/muted/loop/playsinline (isso sozinho já basta na grande
// maioria dos navegadores — confirmado que funciona), mas alguns
// cenários específicos podem deixá-lo pausado mesmo assim: iOS com
// Modo de Baixo Consumo bloqueia autoplay nativo mesmo em vídeo mudo, e
// navegar de volta a uma página guardada em cache (bfcache/histórico)
// às vezes restaura o <video> já pausado. Por isso chamamos .play()
// explicitamente por código também, com nova tentativa nesses dois
// casos — sem isso o herói pode parecer "uma foto estática" mesmo com
// o vídeo certo no lugar certo.
// ===================================================
document.addEventListener('DOMContentLoaded', () => {

  const bgVideo = document.querySelector('.hero-bg-video');
  if (bgVideo) {
    const tryPlay = () => {
      if (!bgVideo.paused) return;
      const playPromise = bgVideo.play();
      if (playPromise && playPromise.catch) playPromise.catch(() => {});
    };
    tryPlay();
    bgVideo.addEventListener('loadeddata', tryPlay);
    bgVideo.addEventListener('canplay', tryPlay);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tryPlay(); });
    window.addEventListener('pageshow', tryPlay); // cobre restauração via bfcache
  }

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
