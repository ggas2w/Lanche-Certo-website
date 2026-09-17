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

  // --- filtro de categorias do cardápio ---
  // Função reaproveitada tanto pelas abas visíveis (Todos/Lanches/Xis/
  // Porções/Bebidas — sem aba "Combos" separada, ver item 2 abaixo)
  // quanto pelo botão "Ver Combos" da seção de promoção, que ativa esse
  // mesmo filtro por código em vez de duplicar a listagem de combos.
  const tabs = document.querySelectorAll('.menu-tab');
  const cards = document.querySelectorAll('#menuGrid .menu-card');
  function applyMenuFilter(category) {
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.category === category));
    cards.forEach(card => {
      const show = category === 'todos' || card.dataset.category === category;
      card.style.display = show ? '' : 'none';
    });
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => applyMenuFilter(tab.dataset.category));
  });

  // --- "Ver Combos" (seção de promoção) — sem aba "Combos" visível no
  // cardápio, esse botão é o único caminho até a lista de combos: aplica
  // o filtro (reaproveitando o mesmo mecanismo das abas) e rola até lá. -->
  const verCombosLink = document.getElementById('verCombosLink');
  verCombosLink?.addEventListener('click', (e) => {
    e.preventDefault();
    applyMenuFilter('combos');
    document.getElementById('cardapio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
