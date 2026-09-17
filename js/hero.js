// ===================================================
// Vídeo de fundo do hero — pausa em prefers-reduced-motion (fica só no
// poster/primeiro frame, sem perder a atmosfera visual da seção).
// ===================================================
document.addEventListener('DOMContentLoaded', () => {

  const bgVideo = document.querySelector('.hero-bg-video');
  if (bgVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bgVideo.pause();
    bgVideo.removeAttribute('autoplay');
  }

});
