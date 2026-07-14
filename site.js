document.addEventListener('DOMContentLoaded', () => {

  const injectGlamorousFooter = () => {
    const existing = document.getElementById('footer');
    if (existing) {
      return;
    }

    const hasShell = document.querySelector('.footer-shell');
    if (hasShell) {
      hasShell.id = 'footer';
      return;
    }

    const footerWrap = document.createElement('section');
    footerWrap.className = 'footer-wrap';
    footerWrap.innerHTML = `
      <div class="container">
        <div class="footer-shell p-4 p-lg-5" id="footer">
          <div class="footer-top-columns row g-4 align-items-start">
            <div class="col-lg-4">
              <div class="footer-note text-uppercase mb-2">Glamorous</div>
              <div class="h4 mb-2">Contact Us</div>
              <div class="mb-1">Phone <span class="ms-3">(02) 8123 4567</span></div>
              <div>Hours <span class="ms-3">Monday-Friday: 10am - 7pm GMT+8</span></div>
            </div>
            <div class="col-lg-4 footer-service">
              <div class="h5 text-uppercase mb-3">Customer Service</div>
              <div class="d-grid gap-2">
                <a href="contact.html">Contact Us</a>
                <a href="login.html">Account Login</a>
                <a href="#">FAQs</a>
                <a href="#">Gift Card</a>
                <a href="#">Returns</a>
                <a href="#">Catalog Subscription</a>
                <a href="#">Accessibility Statement</a>
                <a href="#">Terms of Use</a>
              </div>
            </div>
            <div class="col-lg-4 footer-company">
              <div class="h5 text-uppercase mb-3">Company</div>
              <div class="d-grid gap-2">
                <a href="about.html">About Us</a>
                <a href="#">Impact</a>
                <a href="#">Skincare Insights</a>
                <a href="#">Sustainability</a>
                <a href="#">Corporate Inquiries</a>
                <a href="#">Affiliate</a>
                <a href="#">Stores</a>
                <a href="#">Careers</a>
              </div>
            </div>
          </div>

          <div class="footer-bottom-columns row align-items-center g-4">
            <div class="col-lg-3 text-center text-lg-start">
              <div class="d-inline-block border border-light-subtle p-3">
                <div class="h1 mb-0" style="font-family:var(--font-titles); font-style:italic;">g</div>
                <div class="small text-uppercase">Glamorous</div>
              </div>
            </div>
            <div class="col-lg-5">
              <div class="h5 mb-2">Contact Us</div>
              <div>Phone <span class="ms-3">(02) 8123 4567</span></div>
              <div>Hours <span class="ms-3">Monday-Friday: 10am-7pm GMT+8<br>Saturday-Sunday: 11am-8pm GMT+8</span></div>
            </div>
            <div class="col-lg-4 text-lg-end footer-logo-big">GLAMOROUS</div>
          </div>

          <div class="d-flex flex-wrap gap-3 justify-content-start justify-content-lg-center footer-button-row mt-4">
            <a href="store.html" class="btn btn-outline-light">Find a Store</a>
            <a href="returns.html" class="btn btn-outline-light">Returns &amp; Exchanges</a>
            <a href="order-status.html" class="btn btn-outline-light">Check Order Status</a>
          </div>
        </div>
      </div>`;

    const main = document.querySelector('main');
    if (main && main.parentNode) {
      main.insertAdjacentElement('afterend', footerWrap);
    } else {
      document.body.appendChild(footerWrap);
    }
  };

  const STORAGE_KEYS = {
    cart: 'glamorous_cart',
    wishlist: 'glamorous_wishlist',
  };

  const money = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  });

  const readJson = (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  };

  const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const slugify = (value = '') =>
    value
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const parsePrice = (text = '') => {
    const digits = String(text).replace(/[^0-9.]/g, '');
    return Number(digits || 0);
  };

  const formatProductPrice = (value) => money.format(Number(value || 0));

  const initializeDetailPricing = () => {
    document.querySelectorAll('.detail-section').forEach((section) => {
      const priceEl = section.querySelector('.product-price.large');
      const pills = [...section.querySelectorAll('.size-pill')];
      if (!priceEl || pills.length === 0) return;

      const basePrice = parsePrice(priceEl.textContent);
      section.dataset.basePrice = String(basePrice);
      section.dataset.currentPrice = String(basePrice);

      // Make 15ml the default selected size and price.
      pills.forEach((pill, index) => {
        pill.dataset.price = String(basePrice + (index * 100));
        pill.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        pill.classList.toggle('active', index === 0);
      });

      priceEl.textContent = formatProductPrice(basePrice);
    });
  };

  const updateDetailPrice = (pill) => {
    const section = pill.closest('.detail-section');
    if (!section) return;
    const priceEl = section.querySelector('.product-price.large');
    const pills = [...section.querySelectorAll('.size-pill')];
    if (!priceEl || !pills.length) return;

    const index = pills.indexOf(pill);
    const basePrice = Number(section.dataset.basePrice || parsePrice(priceEl.textContent));
    const price = basePrice + (Math.max(index, 0) * 100);

    section.dataset.currentPrice = String(price);
    priceEl.textContent = formatProductPrice(price);
  };

  const getCardData = (card) => {
    if (!card) return null;
    const name = card.querySelector('.product-name')?.textContent.trim() || card.querySelector('h3')?.textContent.trim() || 'Glamorous item';
    const priceText = card.querySelector('.product-price')?.textContent.trim() || '';
    const image = card.querySelector('img')?.src || '';
    const link = card.querySelector('a[href]')?.getAttribute('href') || '#';
    return {
      id: slugify(name),
      name,
      price: parsePrice(priceText),
      priceText,
      image,
      href: link,
      size: '',
      qty: 1,
    };
  };

  const getDetailData = (section) => {
    if (!section) return null;
    const name = section.querySelector('h2')?.textContent.trim() || 'Glamorous item';
    const priceText = section.querySelector('.product-price')?.textContent.trim() || '';
    const image = section.querySelector('img.detail-image')?.src || '';
    const size = section.querySelector('.size-pill.active')?.textContent.trim() || section.querySelector('.size-pill')?.textContent.trim() || '';
    const qty = Number(section.querySelector('.qty-select')?.value || 1);
    const id = slugify(name);
    const pageHref = document.body?.getAttribute('data-product-page') || (window.location.pathname.split('/').pop() || '');
    return {
      id,
      name,
      price: parsePrice(priceText),
      priceText,
      image,
      href: pageHref && pageHref.endsWith('.html') ? pageHref : `product-detail.html#${id}`,
      size,
      qty,
    };
  };

  const loadCart = () => readJson(STORAGE_KEYS.cart);
  const saveCart = (items) => writeJson(STORAGE_KEYS.cart, items);
  const loadWishlist = () => readJson(STORAGE_KEYS.wishlist);
  const saveWishlist = (items) => writeJson(STORAGE_KEYS.wishlist, items);

  const findSame = (items, product) => items.findIndex((item) => item.id === product.id && (item.size || '') === (product.size || ''));

  const addToCart = (product) => {
    if (!product) return;
    const cart = loadCart();
    const index = findSame(cart, product);
    if (index >= 0) {
      cart[index].qty = (cart[index].qty || 1) + (product.qty || 1);
    } else {
      cart.push({ ...product, qty: product.qty || 1 });
    }
    saveCart(cart);
    renderCartBadge();
    renderCartOffcanvas();
    renderCheckoutSummary();
  };

  const toggleWishlist = (product) => {
    if (!product) return false;
    const wishlist = loadWishlist();
    const index = wishlist.findIndex((item) => item.id === product.id);
    if (index >= 0) {
      wishlist.splice(index, 1);
      saveWishlist(wishlist);
      return false;
    }
    wishlist.push({ ...product, qty: 1 });
    saveWishlist(wishlist);
    return true;
  };

  const removeCartItem = (id, size = '') => {
    const cart = loadCart().filter((item) => !(item.id === id && (item.size || '') === size));
    saveCart(cart);
    renderCartBadge();
    renderCartOffcanvas();
    renderCheckoutSummary();
  };

  const updateCartQty = (id, size, delta) => {
    const cart = loadCart();
    const item = cart.find((entry) => entry.id === id && (entry.size || '') === (size || ''));
    if (!item) return;
    item.qty = Math.max(1, (item.qty || 1) + delta);
    saveCart(cart);
    renderCartBadge();
    renderCartOffcanvas();
    renderCheckoutSummary();
  };

  const removeWishlistItem = (id) => {
    saveWishlist(loadWishlist().filter((item) => item.id !== id));
    renderWishlistPage();
    syncWishlistButtons();
  };

  const renderCartBadge = () => {
    const totalQty = loadCart().reduce((sum, item) => sum + (item.qty || 1), 0);
    document.querySelectorAll('[data-cart-count]').forEach((node) => {
      node.textContent = totalQty > 0 ? String(totalQty) : '';
      node.classList.toggle('d-none', totalQty === 0);
    });
  };

  const renderCartOffcanvas = () => {
    const offcanvas = document.getElementById('cartOffcanvas');
    if (!offcanvas) return;
    const body = offcanvas.querySelector('.offcanvas-body');
    const header = offcanvas.querySelector('.offcanvas-title');
    const cart = loadCart();
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (header) header.textContent = `${totalQty || 0} ITEM/S`;

    if (!body) return;
    if (!cart.length) {
      body.innerHTML = `
        <div class="text-center py-4">
          <p class="text-uppercase small mb-2">Your cart is empty.</p>
          <p class="mb-0 text-muted">Add a product from the product pages and it will show here.</p>
        </div>
      `;
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
    body.innerHTML = `
      <p class="text-uppercase small mb-3">You are eligible for free shipping.</p>
      <div class="d-grid gap-3">
        ${cart.map((item) => `
          <div class="d-flex gap-3 align-items-start border-bottom pb-3">
            <img src="${item.image}" alt="${item.name}" width="88" height="88" style="object-fit:cover;">
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between gap-2">
                <div>
                  <div class="fw-semibold">${item.name}</div>
                  <div class="small text-muted">${item.size || 'One size'}</div>
                </div>
                <div class="text-end">${money.format(item.price * (item.qty || 1))}</div>
              </div>
              <div class="d-flex align-items-center gap-2 mt-2 flex-wrap">
                <button class="btn btn-sm btn-outline-secondary" type="button" data-cart-change="-1" data-cart-id="${item.id}" data-cart-size="${item.size || ''}">-</button>
                <span>${item.qty || 1}</span>
                <button class="btn btn-sm btn-outline-secondary" type="button" data-cart-change="1" data-cart-id="${item.id}" data-cart-size="${item.size || ''}">+</button>
                <button class="btn btn-sm btn-link text-muted ms-auto text-decoration-none" type="button" data-remove-cart data-cart-id="${item.id}" data-cart-size="${item.size || ''}">Remove</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="text-center py-3 border-bottom">
        <div class="fw-semibold text-uppercase small mb-2">Complete your cart</div>
        <div class="row g-3">
          <div class="col-6"><img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80" alt="Suggested product" class="img-fluid"></div>
          <div class="col-6"><img src="https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=400&q=80" alt="Suggested product" class="img-fluid"></div>
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center my-3">
        <strong>Subtotal</strong>
        <strong>${money.format(subtotal)}</strong>
      </div>
      <a href="checkout.html" class="btn btn-gold w-100 py-3">Checkout</a>
    `;
  };

  const renderCheckoutSummary = () => {
    const shell = document.querySelector('[data-checkout-summary]');
    if (!shell) return;
    const cart = loadCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
    if (!cart.length) {
      shell.innerHTML = `
        <div class="checkout-empty text-center py-5">
          <h2 class="feature-title mb-2">Your cart is empty</h2>
          <p class="text-muted mb-0">Go back to the product pages and add an item first.</p>
        </div>
      `;
      return;
    }

    shell.innerHTML = `
      <div class="d-grid gap-4">
        ${cart.map((item) => `
          <div class="d-flex gap-3 align-items-start">
            <img src="${item.image}" alt="${item.name}" width="90" height="90" style="object-fit:cover;">
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between gap-2">
                <div>
                  <h2 class="feature-title mb-1">${item.name}</h2>
                  <div class="small text-muted">${item.size || 'One size'}</div>
                  <div class="small text-muted">Qty ${item.qty || 1}</div>
                </div>
                <div class="text-end">${money.format(item.price * (item.qty || 1))}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="bg-white border p-3 my-3">Don't miss out! Log in to earn and redeem rewards.</div>
      <div class="d-flex justify-content-between mb-2"><span>Subtotal</span><strong>${money.format(subtotal)}</strong></div>
      <div class="d-flex justify-content-between mb-2"><span>Shipping</span><strong>${money.format(subtotal >= 1000 ? 0 : 0)}</strong></div>
      <hr>
      <div class="d-flex justify-content-between align-items-center mb-4"><span class="h5 mb-0">Total</span><strong class="h4 mb-0">${money.format(subtotal)}</strong></div>
      <div class="text-center mb-4">
        <img src="https://images.unsplash.com/photo-1582719478171-2a9f9f2b3d5b?auto=format&fit=crop&w=400&q=80" alt="Shipping" class="img-fluid mb-3" style="max-width:220px;">
        <div>Free shipping on orders ₱1000+</div>
      </div>
    `;
  };

  const renderWishlistPage = () => {
    const container = document.querySelector('[data-wishlist-list]');
    if (!container) return;
    const wishlist = loadWishlist();
    if (!wishlist.length) {
      container.innerHTML = `
        <div class="col-12">
          <div class="coming-soon-card">
            <h2 class="section-title mb-3">Your wishlist is empty</h2>
            <p class="section-copy mx-auto">Tap the heart icon on any product card or product page to save it here.</p>
            <a href="index.html" class="btn btn-gold mt-2 px-4 py-3">Shop products</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = wishlist.map((item) => `
      <div class="col-12 col-md-6 col-lg-4">
        <article class="product-card h-100">
          <div class="product-image-wrap">
            <img src="${item.image}" alt="${item.name}" class="product-image">
            <button class="favorite active" type="button" aria-label="Remove from wishlist" data-remove-wishlist data-wishlist-id="${item.id}"><i class="bi bi-heart-fill"></i></button>
          </div>
          <div class="product-body">
            <p class="product-brand">Glamorous</p>
            <h3 class="product-name">${item.name}</h3>
            <p class="product-price">${money.format(item.price)}</p>
            <div class="d-flex gap-2 flex-wrap mt-3">
              <a href="${item.href}" class="btn btn-outline-gold btn-sm px-3">View product</a>
            </div>
          </div>
        </article>
      </div>
    `).join('');
  };

  const syncWishlistButtons = () => {
    const wishlistIds = new Set(loadWishlist().map((item) => item.id));
    document.querySelectorAll('.favorite, .wishlist-button').forEach((btn) => {
      const card = btn.closest('.product-card');
      const section = btn.closest('.detail-section');
      const product = card ? getCardData(card) : getDetailData(section);
      if (!product) return;
      const active = wishlistIds.has(product.id);
      btn.classList.toggle('active', active);
      const icon = btn.querySelector('i');
      if (icon) icon.className = active ? 'bi bi-heart-fill' : 'bi bi-heart';
      if (btn.classList.contains('wishlist-button')) {
        btn.innerHTML = active ? '<i class="bi bi-heart-fill me-1"></i> Saved' : '<i class="bi bi-heart me-1"></i> Save';
      }
    });
  };

  const selectSizePill = (pill) => {
    const section = pill.closest('.detail-section');
    if (!section) return;
    section.querySelectorAll('.size-pill').forEach((el) => {
      el.classList.remove('active');
      el.setAttribute('aria-pressed', 'false');
    });
    pill.classList.add('active');
    pill.setAttribute('aria-pressed', 'true');
    updateDetailPrice(pill);
  };

  initializeDetailPricing();

  document.addEventListener('click', (event) => {
    const removeWishlistBtn = event.target.closest('[data-remove-wishlist]');
    if (removeWishlistBtn) {
      event.preventDefault();
      event.stopPropagation();
      removeWishlistItem(removeWishlistBtn.getAttribute('data-wishlist-id'));
      return;
    }

    const wishlistBtn = event.target.closest('.favorite, .wishlist-button');
    if (wishlistBtn) {
      event.preventDefault();
      event.stopPropagation();
      const card = wishlistBtn.closest('.product-card');
      const section = wishlistBtn.closest('.detail-section');
      const product = card ? getCardData(card) : getDetailData(section);
      const nowSaved = toggleWishlist(product);
      wishlistBtn.classList.toggle('active', nowSaved);
      const icon = wishlistBtn.querySelector('i');
      if (icon) icon.className = nowSaved ? 'bi bi-heart-fill' : 'bi bi-heart';
      if (wishlistBtn.classList.contains('wishlist-button')) {
        wishlistBtn.innerHTML = nowSaved ? '<i class="bi bi-heart-fill me-1"></i> Saved' : '<i class="bi bi-heart me-1"></i> Save';
      }
      if (document.querySelector('[data-wishlist-list]')) {
        renderWishlistPage();
      } else {
        syncWishlistButtons();
      }
      if (!card && !section && nowSaved) {
        window.location.href = 'wishlist.html';
      }
      return;
    }

    const sizePill = event.target.closest('.size-pill');
    if (sizePill) {
      selectSizePill(sizePill);
      return;
    }

    const addBtn = event.target.closest('.add-to-cart-btn');
    if (addBtn) {
      event.preventDefault();
      const section = addBtn.closest('.detail-section');
      const product = getDetailData(section);
      addToCart(product);
      addBtn.textContent = 'Added to cart';
      window.setTimeout(() => {
        addBtn.textContent = 'Add to cart';
      }, 1200);
      return;
    }

    const removeCartBtn = event.target.closest('[data-remove-cart]');
    if (removeCartBtn) {
      event.preventDefault();
      removeCartItem(removeCartBtn.getAttribute('data-cart-id'), removeCartBtn.getAttribute('data-cart-size') || '');
      return;
    }

    const cartChangeBtn = event.target.closest('[data-cart-change]');
    if (cartChangeBtn) {
      event.preventDefault();
      updateCartQty(
        cartChangeBtn.getAttribute('data-cart-id'),
        cartChangeBtn.getAttribute('data-cart-size') || '',
        Number(cartChangeBtn.getAttribute('data-cart-change') || 0),
      );
      return;
    }
  });

  document.querySelectorAll('form[data-page-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="search"], input[type="text"]');
      const query = (input?.value || '').trim().toLowerCase();
      const cards = document.querySelectorAll('[data-search-item]');
      if (!cards.length) return;
      cards.forEach((card) => {
        const text = (card.getAttribute('data-search-item') || card.textContent || '').toLowerCase();
        const wrapper = card.closest('.col-12, .col-md-6, .col-lg-4, .col-lg-6, .col-xl-4, .grid-item, article, section');
        if (wrapper) wrapper.classList.remove('d-none');
        if (query && !text.includes(query) && wrapper) wrapper.classList.add('d-none');
      });
      const visible = [...cards].some((card) => {
        const wrapper = card.closest('.col-12, .col-md-6, .col-lg-4, .col-lg-6, .col-xl-4, .grid-item, article, section');
        return wrapper ? !wrapper.classList.contains('d-none') : true;
      });
      if (!visible) {
        alert('No matching products found. Try makeup, skincare, foundation, serum, or palette.');
      }
    });
  });

  document.querySelectorAll('.auto-fill').forEach((field) => {
    const saved = localStorage.getItem(`glamorous_${field.name}`);
    if (saved) field.value = saved;
    field.addEventListener('input', () => localStorage.setItem(`glamorous_${field.name}`, field.value));
    field.addEventListener('focus', () => {
      const value = localStorage.getItem(`glamorous_${field.name}`);
      if (!field.value && value) field.value = value;
    });
    field.addEventListener('mouseenter', () => {
      const value = localStorage.getItem(`glamorous_${field.name}`);
      if (!field.value && value) field.value = value;
    });
  });

  const checkoutForm = document.querySelector('[data-checkout-form]');
  if (checkoutForm) {
    const savedFields = ['email', 'firstName', 'lastName', 'address', 'city', 'region', 'barangay', 'phone'];
    savedFields.forEach((name) => {
      const field = checkoutForm.querySelector(`[name="${name}"]`);
      const saved = localStorage.getItem(`glamorous_${name}`);
      if (field && saved) field.value = saved;
      if (field) {
        field.addEventListener('input', () => localStorage.setItem(`glamorous_${name}`, field.value));
        field.addEventListener('focus', () => {
          const value = localStorage.getItem(`glamorous_${name}`);
          if (!field.value && value) field.value = value;
        });
        field.addEventListener('mouseenter', () => {
          const value = localStorage.getItem(`glamorous_${name}`);
          if (!field.value && value) field.value = value;
        });
      }
    });

    const payButton = checkoutForm.querySelector('[data-pay-now]');
    const thankYou = checkoutForm.querySelector('[data-thank-you]');
    payButton?.addEventListener('click', (event) => {
      event.preventDefault();
      if (thankYou) thankYou.classList.add('show');
      localStorage.removeItem(STORAGE_KEYS.cart);
      renderCartBadge();
      renderCartOffcanvas();
      renderCheckoutSummary();
      window.setTimeout(() => {
        window.location.href = 'index.html';
      }, 1800);
    });
  }


  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const contactEmail = contactForm.getAttribute('data-contact-email') || 'glamorous.ph@gmail.com';
    ['firstName', 'lastName', 'email', 'phone', 'message'].forEach((name) => {
      const field = contactForm.querySelector(`[name="${name}"]`);
      const saved = localStorage.getItem(`glamorous_${name}`);
      if (field && saved && !field.value) field.value = saved;
      if (field) {
        field.addEventListener('input', () => localStorage.setItem(`glamorous_${name}`, field.value));
      }
    });

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const firstName = contactForm.querySelector('[name="firstName"]')?.value.trim() || '';
      const lastName = contactForm.querySelector('[name="lastName"]')?.value.trim() || '';
      const email = contactForm.querySelector('[name="email"]')?.value.trim() || '';
      const phone = contactForm.querySelector('[name="phone"]')?.value.trim() || '';
      const message = contactForm.querySelector('[name="message"]')?.value.trim() || '';
      const subject = `Glamorous inquiry from ${[firstName, lastName].filter(Boolean).join(' ') || 'website visitor'}`;
      const body = [
        `Name: ${[firstName, lastName].filter(Boolean).join(' ') || 'N/A'}`,
        `Email: ${email || 'N/A'}`,
        `Phone: ${phone || 'N/A'}`,
        '',
        'Message:',
        message || 'N/A',
      ].join('\n');

      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = gmailUrl;
    });
  }

  const cartOffcanvas = document.getElementById('cartOffcanvas');
  if (cartOffcanvas) {
    cartOffcanvas.addEventListener('show.bs.offcanvas', () => {
      renderCartOffcanvas();
    });
  }

  injectGlamorousFooter();
  document.querySelectorAll('a[href=\"footer.html\"]').forEach((link) => {
    if (link.closest('.coming-soon-card')) {
      link.setAttribute('href', 'index.html');
      link.textContent = 'Back to Home';
    } else {
      link.setAttribute('href', '#footer');
    }
  });

  renderCartBadge();
  renderCartOffcanvas();
  renderCheckoutSummary();
  renderWishlistPage();
  syncWishlistButtons();
});