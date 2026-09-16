// ===================================================
// Carrinho + checkout completo: adicionar com observação por item,
// quantidade, remover, observação geral do pedido, revisão final e
// preparação da mensagem para WhatsApp (número ainda não configurado
// pelo cliente — ver CHECKOUT_CONFIG abaixo, único ponto a preencher
// quando o número real chegar).
// ===================================================
document.addEventListener('DOMContentLoaded', () => {

  // CLIENT CONFIG — número de WhatsApp em formato internacional, só
  // dígitos (ex.: '5551999998888'). Deixe vazio até a Lanche Certo
  // informar o número real: NUNCA invente um número aqui. Enquanto
  // vazio, o botão "Confirmar e Enviar" mostra um aviso de configuração
  // em vez de tentar abrir um link quebrado.
  const CHECKOUT_CONFIG = {
    whatsappNumber: ''
  };

  const cartButton = document.getElementById('cartButton');
  const cartPanel = document.getElementById('cartPanel');
  const cartClose = document.getElementById('cartClose');
  const cartContinue = document.getElementById('cartContinue');
  const cartCount = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooterEl = document.getElementById('cartFooter');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartClearEl = document.getElementById('cartClear');
  const cartGeneralNoteEl = document.getElementById('cartGeneralNote');
  const cartConfirmBtn = document.getElementById('cartConfirm');

  const addModalOverlay = document.getElementById('addModalOverlay');
  const addModalTitle = document.getElementById('addModalTitle');
  const addModalTotal = document.getElementById('addModalTotal');
  const addQtyValue = document.getElementById('addQtyValue');
  const addQtyDec = document.getElementById('addQtyDec');
  const addQtyInc = document.getElementById('addQtyInc');
  const addNotes = document.getElementById('addNotes');
  const addModalClose = document.getElementById('addModalClose');
  const addModalCancel = document.getElementById('addModalCancel');
  const addModalConfirm = document.getElementById('addModalConfirm');

  const reviewModalOverlay = document.getElementById('reviewModalOverlay');
  const reviewItemsEl = document.getElementById('reviewItems');
  const reviewGeneralNoteEl = document.getElementById('reviewGeneralNote');
  const reviewGeneralNoteTextEl = document.getElementById('reviewGeneralNoteText');
  const reviewTotalEl = document.getElementById('reviewTotal');
  const reviewWhatsappNotice = document.getElementById('reviewWhatsappNotice');
  const reviewModalClose = document.getElementById('reviewModalClose');
  const reviewBack = document.getElementById('reviewBack');
  const reviewConfirm = document.getElementById('reviewConfirm');

  if (!cartButton || !cartPanel) return;

  // cart = { [key]: { key, id, name, unitPrice, qty, note } }
  // key = id + observação (mesmo produto com observações diferentes
  // vira linha separada; mesmo produto + mesma observação soma qty).
  let cart = {};
  let generalNote = '';
  let pendingProduct = null; // produto sendo configurado no modal de adicionar

  function formatBRL(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
  }
  function makeKey(id, note) {
    return id + '::' + (note || '').trim().toLowerCase();
  }
  function cartItemsArray() {
    return Object.values(cart);
  }
  function cartTotalItems() {
    return cartItemsArray().reduce((sum, item) => sum + item.qty, 0);
  }
  function cartTotalPrice() {
    return cartItemsArray().reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  }

  // ---------- render do carrinho ----------
  function renderCart() {
    const items = cartItemsArray();
    const count = cartTotalItems();

    cartCount.textContent = String(count);
    cartCount.hidden = count === 0;

    cartEmptyEl.hidden = items.length > 0;
    cartFooterEl.hidden = items.length === 0;

    cartItemsEl.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.dataset.key = item.key;

      const hasNote = !!item.note;
      li.innerHTML = `
        <div class="cart-item-top">
          <div>
            <span class="cart-item-name">${escapeHtml(item.name)}</span>
            <span class="cart-item-unit">${formatBRL(item.unitPrice)} cada</span>
          </div>
          <button type="button" class="cart-item-remove" data-action="remove">Remover</button>
        </div>

        ${hasNote ? `<p class="cart-item-note-view"><strong>Obs:</strong> ${escapeHtml(item.note)}</p>` : ''}
        <button type="button" class="cart-item-note-toggle" data-action="toggle-note">${hasNote ? 'Editar observação' : '+ Observação do lanche'}</button>
        <div class="cart-item-note-edit">
          <textarea rows="2" placeholder="Ex.: sem cebola, com bacon extra...">${escapeHtml(item.note || '')}</textarea>
          <div class="cart-item-note-actions">
            <button type="button" class="cart-item-note-save" data-action="save-note">Salvar</button>
            <button type="button" class="cart-item-note-cancel" data-action="cancel-note">Cancelar</button>
          </div>
        </div>

        <div class="cart-item-bottom">
          <div class="qty-stepper qty-stepper--sm">
            <button type="button" data-action="dec" aria-label="Diminuir quantidade">&minus;</button>
            <span>${item.qty}</span>
            <button type="button" data-action="inc" aria-label="Aumentar quantidade">+</button>
          </div>
          <span class="cart-item-subtotal">${formatBRL(item.qty * item.unitPrice)}</span>
        </div>
      `;

      li.querySelector('[data-action="remove"]').addEventListener('click', () => removeItem(item.key));
      li.querySelector('[data-action="dec"]').addEventListener('click', () => changeQty(item.key, -1));
      li.querySelector('[data-action="inc"]').addEventListener('click', () => changeQty(item.key, 1));

      const noteToggleBtn = li.querySelector('[data-action="toggle-note"]');
      const noteEditBox = li.querySelector('.cart-item-note-edit');
      const noteTextarea = noteEditBox.querySelector('textarea');
      noteToggleBtn.addEventListener('click', () => {
        noteEditBox.classList.add('is-open');
        noteToggleBtn.hidden = true;
        noteTextarea.focus();
      });
      li.querySelector('[data-action="cancel-note"]').addEventListener('click', () => {
        noteEditBox.classList.remove('is-open');
        noteToggleBtn.hidden = false;
        noteTextarea.value = item.note || '';
      });
      li.querySelector('[data-action="save-note"]').addEventListener('click', () => {
        updateNote(item.key, noteTextarea.value);
      });

      cartItemsEl.appendChild(li);
    });

    cartTotalEl.textContent = formatBRL(cartTotalPrice());
  }

  // ---------- ações do carrinho ----------
  function addToCart({ id, name, unitPrice, qty, note }) {
    const key = makeKey(id, note);
    const existing = cart[key];
    if (existing) {
      existing.qty += qty;
    } else {
      cart[key] = { key, id, name, unitPrice, qty, note: (note || '').trim() };
    }
    renderCart();
    bumpCartButton();
    openCart();
  }

  function changeQty(key, delta) {
    const item = cart[key];
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) delete cart[key];
    renderCart();
  }

  function removeItem(key) {
    delete cart[key];
    renderCart();
  }

  // Observação editada muda a "identidade" do item (mesma lógica do
  // makeKey): se a nova observação já existe como outra linha, funde
  // as quantidades nela; senão, só atualiza a própria linha.
  function updateNote(key, newNote) {
    const item = cart[key];
    if (!item) return;
    const trimmed = newNote.trim();
    const newKey = makeKey(item.id, trimmed);
    if (newKey === key) {
      item.note = trimmed;
      renderCart();
      return;
    }
    delete cart[key];
    if (cart[newKey]) {
      cart[newKey].qty += item.qty;
    } else {
      cart[newKey] = { ...item, key: newKey, note: trimmed };
    }
    renderCart();
  }

  function clearCart() {
    if (Object.keys(cart).length === 0) return;
    if (!window.confirm('Limpar o carrinho? Isso remove todos os itens e observações.')) return;
    cart = {};
    renderCart();
  }

  function bumpCartButton() {
    cartButton.classList.remove('is-bumped');
    void cartButton.offsetWidth; // reinicia a animação mesmo em cliques seguidos
    cartButton.classList.add('is-bumped');
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
  cartContinue?.addEventListener('click', closeCart); // "Continuar Comprando": só fecha, carrinho intacto
  document.getElementById('cartEmptyCta')?.addEventListener('click', closeCart);
  cartClearEl?.addEventListener('click', clearCart);
  cartGeneralNoteEl?.addEventListener('input', () => { generalNote = cartGeneralNoteEl.value; });

  document.addEventListener('click', (e) => {
    if (cartPanel.hidden) return;
    const path = e.composedPath();
    if (path.includes(cartPanel) || path.includes(cartButton)) return;
    if (path.some(el => el.dataset && el.dataset.addId !== undefined)) return;
    if (path.includes(addModalOverlay) || path.includes(reviewModalOverlay)) return;
    closeCart();
  });

  // ---------- modal "adicionar ao carrinho" (quantidade + observação) ----------
  function openAddModal(product) {
    pendingProduct = { ...product, qty: 1 };
    addModalTitle.textContent = 'Adicionar ' + product.name;
    addQtyValue.textContent = '1';
    addNotes.value = '';
    updateAddModalTotal();
    addModalOverlay.hidden = false;
    window.setTimeout(() => addNotes.focus(), 30);
  }
  function updateAddModalTotal() {
    if (!pendingProduct) return;
    addModalTotal.textContent = formatBRL(pendingProduct.qty * pendingProduct.unitPrice);
  }
  function closeAddModal() {
    addModalOverlay.hidden = true;
    pendingProduct = null;
  }

  addQtyDec?.addEventListener('click', () => {
    if (!pendingProduct || pendingProduct.qty <= 1) return;
    pendingProduct.qty -= 1;
    addQtyValue.textContent = String(pendingProduct.qty);
    updateAddModalTotal();
  });
  addQtyInc?.addEventListener('click', () => {
    if (!pendingProduct) return;
    pendingProduct.qty += 1;
    addQtyValue.textContent = String(pendingProduct.qty);
    updateAddModalTotal();
  });
  addModalClose?.addEventListener('click', closeAddModal);
  addModalCancel?.addEventListener('click', closeAddModal);
  addModalOverlay?.addEventListener('click', (e) => { if (e.target === addModalOverlay) closeAddModal(); });
  addModalConfirm?.addEventListener('click', () => {
    if (!pendingProduct) return;
    addToCart({
      id: pendingProduct.id,
      name: pendingProduct.name,
      unitPrice: pendingProduct.unitPrice,
      qty: pendingProduct.qty,
      note: addNotes.value
    });
    closeAddModal();
  });

  // Qualquer botão com data-add-id (cards de destaque e do cardápio)
  // abre o modal de personalização antes de ir pro carrinho.
  document.querySelectorAll('[data-add-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      openAddModal({
        id: btn.dataset.addId,
        name: btn.dataset.addName,
        unitPrice: parseFloat(btn.dataset.addPrice)
      });
    });
  });

  // ---------- revisão final do pedido ----------
  function openReviewModal() {
    if (cartTotalItems() === 0) return; // não confirma carrinho vazio

    reviewItemsEl.innerHTML = cartItemsArray().map(item => `
      <li class="review-item">
        <div class="review-item-top">
          <strong>${item.qty}x ${escapeHtml(item.name)}</strong>
          <span>${formatBRL(item.qty * item.unitPrice)}</span>
        </div>
        ${item.note ? `<p class="review-item-note"><strong>Obs:</strong> ${escapeHtml(item.note)}</p>` : ''}
      </li>
    `).join('');

    if (generalNote.trim()) {
      reviewGeneralNoteTextEl.textContent = generalNote.trim();
      reviewGeneralNote.hidden = false;
    } else {
      reviewGeneralNote.hidden = true;
    }

    reviewTotalEl.textContent = formatBRL(cartTotalPrice());
    updateWhatsappNotice();

    reviewModalOverlay.hidden = false;
  }
  function closeReviewModal() {
    reviewModalOverlay.hidden = true;
  }
  function updateWhatsappNotice() {
    if (!CHECKOUT_CONFIG.whatsappNumber) {
      reviewWhatsappNotice.hidden = false;
      reviewWhatsappNotice.textContent = 'O número de WhatsApp da Lanche Certo ainda não foi configurado. Assim que ele for informado (em js/cart.js, CHECKOUT_CONFIG.whatsappNumber), este botão abre o WhatsApp automaticamente com o pedido pronto.';
    } else {
      reviewWhatsappNotice.hidden = true;
    }
  }

  // Mensagem final em português, pronta pro WhatsApp — único ponto que
  // monta o texto do pedido, pra não espalhar essa lógica pelo site.
  function buildOrderMessage() {
    const lines = [];
    lines.push('Pedido — Lanche Certo');
    lines.push('');
    cartItemsArray().forEach(item => {
      lines.push(`${item.qty}x ${item.name} — ${formatBRL(item.qty * item.unitPrice)}`);
      if (item.note) lines.push(`   Obs: ${item.note}`);
    });
    if (generalNote.trim()) {
      lines.push('');
      lines.push(`Observação geral: ${generalNote.trim()}`);
    }
    lines.push('');
    lines.push(`Total: ${formatBRL(cartTotalPrice())}`);
    return lines.join('\n');
  }

  cartConfirmBtn?.addEventListener('click', openReviewModal);
  reviewModalClose?.addEventListener('click', closeReviewModal);
  reviewBack?.addEventListener('click', closeReviewModal); // volta pro carrinho (que segue aberto por baixo, intacto)
  reviewModalOverlay?.addEventListener('click', (e) => { if (e.target === reviewModalOverlay) closeReviewModal(); });

  reviewConfirm?.addEventListener('click', () => {
    const message = buildOrderMessage();
    if (!CHECKOUT_CONFIG.whatsappNumber) {
      updateWhatsappNotice(); // reforça o aviso — não falha silenciosamente
      return;
    }
    const url = `https://wa.me/${CHECKOUT_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
    cart = {};
    generalNote = '';
    if (cartGeneralNoteEl) cartGeneralNoteEl.value = '';
    renderCart();
    closeReviewModal();
    closeCart();
  });

  renderCart();

});
