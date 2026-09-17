// ===================================================
// Menu mobile (header) + filtro de categorias do cardápio +
// aviso nos links de contato que ainda não têm destino real
// (WhatsApp/Instagram) — evita clique "morto" sem explicação.
// ===================================================
document.addEventListener('DOMContentLoaded', () => {

  // --- menu mobile ---
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- filtro de categorias do cardápio (Todos/Lanches/Xis/Porções/
  // Bebidas) — "Ver Combos" agora é um link normal pra combos.html,
  // página dedicada só de combos (ver esse arquivo), não mexe mais
  // nesse filtro. -->
  const tabs = document.querySelectorAll('.menu-tab');
  const cards = document.querySelectorAll('#menuGrid .menu-card');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.toggle('is-active', t === tab));
      const category = tab.dataset.category;
      cards.forEach(card => {
        const show = category === 'todos' || card.dataset.category === category;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  // --- links de WhatsApp/Instagram ainda sem destino real ---
  document.querySelectorAll('[data-placeholder-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const kind = link.dataset.placeholderLink === 'whatsapp' ? 'o número de WhatsApp' : 'o link do Instagram';
      window.alert('Assim que a Lanche Certo informar ' + kind + ', este botão já leva direto pra lá.');
    });
  });

});
