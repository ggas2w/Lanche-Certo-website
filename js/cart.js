// ===================================================
// Carrinho de compras — usado nas seções de destaques e cardápio.
// ===================================================
document.addEventListener('DOMContentLoaded', () => {

  const cartButton = document.getElementById('cartButton');
  const cartPanel = document.getElementById('cartPanel');
  const cartClose = document.getElementById('cartClose');
  const cartCount = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooterEl = document.getElementById('cartFooter');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartClearEl = document.getElementById('cartClear');

  if (!cartButton || !cartPanel) return;

  // cart = { [id]: { id, name, price, qty } }
  let cart = {};

  function formatBRL(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function cartTotalItems() {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  }

  function cartTotalPrice() {
    return Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);
  }

  function renderCart() {
    const items = Object.values(cart);
    const count = cartTotalItems();

    cartCount.textContent = String(count);
    cartCount.hidden = count === 0;

    cartEmptyEl.hidden = items.length > 0;
    cartFooterEl.hidden = items.length === 0;

    cartItemsEl.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div>
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-item-custom">${item.qty}x ${formatBRL(item.price)}</div>
        </div>
        <button type="button" class="cart-item-remove" data-action="remove">Remover</button>
      `;
      li.querySelector('[data-action="remove"]').addEventListener('click', () => removeItem(item.id));
      cartItemsEl.appendChild(li);
    });

    cartTotalEl.textContent = formatBRL(cartTotalPrice());
  }

  function addToCart(product) {
    const existing = cart[product.id];
    if (existing) {
      existing.qty += 1;
    } else {
      cart[product.id] = { ...product, qty: 1 };
    }
    renderCart();
    openCart();
  }

  function removeItem(id) {
    delete cart[id];
    renderCart();
  }

  function clearCart() {
    if (Object.keys(cart).length === 0) return;
    if (!window.confirm('Esvaziar o carrinho? Isso remove todos os itens.')) return;
    cart = {};
    renderCart();
  }

  function openCart() {
    cartPanel.hidden = false;
    cartButton.setAttribute('aria-expanded', 'true');
  }
  function closeCart() {
    cartPanel.hidden = true;
    cartButton.setAttribute('aria-expanded', 'false');
  }
  function toggleCart() {
    if (cartPanel.hidden) openCart(); else closeCart();
  }

  cartButton.addEventListener('click', toggleCart);
  cartClose?.addEventListener('click', closeCart);
  cartClearEl?.addEventListener('click', clearCart);

  document.addEventListener('click', (e) => {
    if (cartPanel.hidden) return;
    const path = e.composedPath();
    if (path.includes(cartPanel) || path.includes(cartButton)) return;
    if (path.some(el => el.dataset && (el.dataset.addId !== undefined))) return;
    closeCart();
  });

  // Qualquer botão com data-add-id/data-add-name/data-add-price (cards de
  // destaque e cards do cardápio) adiciona ao carrinho.
  document.querySelectorAll('[data-add-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart({
        id: btn.dataset.addId,
        name: btn.dataset.addName,
        price: parseFloat(btn.dataset.addPrice)
      });
    });
  });

  renderCart();

});
