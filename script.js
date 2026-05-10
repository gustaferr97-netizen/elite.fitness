// Registra o ScrollTrigger no GSAP
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. Hero Section Animations
// ==========================================
const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

heroTl.from(".hero-title", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    delay: 0.2
})
.from(".hero-subtitle", {
    y: 50,
    opacity: 0,
    duration: 1
}, "-=1")
.from(".btn-primary", {
    y: 30,
    opacity: 0,
    duration: 0.8
}, "-=0.8")
.from(".navbar", {
    y: -50,
    opacity: 0,
    duration: 1
}, "-=1.5");

// Efeito sutil de parallax no fundo do Hero no scroll
gsap.to(".hero-bg img", {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// ==========================================
// 2. Elementos Fade-Up Globais
// ==========================================
const mq = window.matchMedia('(max-width: 768px)');
const isMobile = mq.matches;

const fadeElements = gsap.utils.toArray('.fade-up');
fadeElements.forEach(elem => {
    const isCard = elem.classList.contains('plan-card') || elem.classList.contains('product-card');
    gsap.from(elem, {
        y: isMobile ? 20 : 40,
        opacity: 0,
        duration: isMobile ? 0.5 : 0.7,
        ease: "power3.out",
        scrollTrigger: {
            trigger: elem,
            start: (isMobile && isCard) ? "top 105%" : "top 90%",
            once: true,
            lazy: false
        }
    });
});

// ==========================================
// 3. Stagger Animations (Grid de Sócios)
// ==========================================
// Anima cada card individualmente com delay manual — evita recalc simultâneo
document.querySelectorAll('.stagger-item').forEach((card, i) => {
    gsap.from(card, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: card,
            start: "top 95%",
            once: true,
            lazy: false
        }
    });
});

// ==========================================
// 4. Smooth Anchor Scrolling
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80, // Compensar altura da navbar
                behavior: 'smooth'
            });
        }
    });
});

// Nota: VanillaTilt já é inicializado automaticamente pelos atributos data-tilt no HTML.

// ==========================================
// 5. Shopping Cart Logic
// ==========================================
const cartState = [];

// Estoque inicial lido dos data-stock de cada botão
const stockState = {};
document.querySelectorAll('.btn-add-cart').forEach(btn => {
    stockState[btn.getAttribute('data-id')] = parseInt(btn.getAttribute('data-stock'));
});

function updateStockUI(id) {
    const btn = document.querySelector(`.btn-add-cart[data-id="${id}"]`);
    if (!btn) return;
    const qty = stockState[id];
    const stockLabel = btn.closest('.product-info').querySelector('.stock-label');
    const stockDot = btn.closest('.product-info').querySelector('.stock-dot');

    if (qty <= 0) {
        btn.disabled = true;
        btn.textContent = 'Esgotado';
        btn.classList.add('out-of-stock');
        stockLabel.textContent = 'Sem estoque';
        stockDot.classList.add('empty');
    } else if (qty <= 3) {
        stockLabel.textContent = `Últimas ${qty} unidade${qty > 1 ? 's' : ''}!`;
        stockDot.classList.add('low');
        stockDot.classList.remove('empty');
    } else {
        stockLabel.textContent = `${qty} unidades disponíveis`;
        stockDot.classList.remove('low', 'empty');
    }
}
const floatingCart = document.getElementById('floatingCart');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartCountElement = document.querySelector('.cart-count');

function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

floatingCart.addEventListener('click', toggleCart);
closeCartBtn.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

function updateCartUI() {
    // Update count
    cartCountElement.textContent = cartState.reduce((acc, item) => acc + item.quantity, 0);

    // Update items
    cartItemsContainer.innerHTML = '';
    
    if (cartState.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Seu carrinho está vazio.</div>';
    } else {
        cartState.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">R$ ${item.price}</p>
                    <div class="cart-item-qty">Qtd: ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" data-index="${index}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    // Update total
    const total = cartState.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `R$ ${total.toFixed(2)}`;
}

// Add to cart event
document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const card = this.closest('.product-card');
        const image = card.querySelector('.product-image img').getAttribute('src');

        // Verifica estoque
        if (stockState[id] <= 0) return;

        // Decrementa estoque
        stockState[id]--;
        updateStockUI(id);

        const existingItem = cartState.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartState.push({ id, name, price, quantity: 1, image });
        }

        updateCartUI();
        gsap.fromTo(floatingCart, { scale: 1.15, y: -10 }, { scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" });
    });
});

// ==========================================
// 6. Mobile Scroll Hover Effects + Tilt
// ==========================================
function initMobileEffects() {
    // Função que simula o efeito de balanço (tilt) via GSAP
    function mobileTilt(el) {
        gsap.fromTo(el,
            { rotateY: -8, rotateX: 5, scale: 0.97 },
            {
                rotateY: 0,
                rotateX: 0,
                scale: 1,
                duration: 1.4,
                ease: "elastic.out(1, 0.45)",
                transformPerspective: 900,
                transformOrigin: "center center",
                force3D: true
            }
        );
    }

    // --- Gallery items ---
    document.querySelectorAll('.gallery-item').forEach(item => {
        const img = item.querySelector('img');
        gsap.set(img, { scale: 1, opacity: 0.6, filter: 'grayscale(80%)' });
        ScrollTrigger.create({
            trigger: item,
            start: "top 92%",
            once: true,
            onEnter: () => {
                gsap.to(img, { scale: 1.05, opacity: 0.9, filter: 'grayscale(0%)', duration: 0.9, ease: "power3.out" });
                mobileTilt(item);
            }
        });
    });

    // --- Plan cards ---
    document.querySelectorAll('.plan-card').forEach(card => {
        const isPro = card.classList.contains('pro');
        ScrollTrigger.create({
            trigger: card,
            start: "top 100%",
            once: true,
            onEnter: () => {
                gsap.to(card, {
                    y: -10,
                    borderColor: isPro ? 'rgba(242,226,5,1)' : 'rgba(255,255,255,0.25)',
                    boxShadow: isPro
                        ? '0 15px 50px rgba(242,226,5,0.35)'
                        : '0 15px 40px rgba(255,255,255,0.15)',
                    duration: 0.7,
                    ease: "power3.out"
                });
                mobileTilt(card);
            }
        });
    });

    // --- Product cards ---
    document.querySelectorAll('.product-card').forEach(card => {
        const img = card.querySelector('.product-image img');
        gsap.set(img, { scale: 1, opacity: 0.8 });
        ScrollTrigger.create({
            trigger: card,
            start: "top 100%",
            once: true,
            onEnter: () => {
                gsap.to(card, {
                    y: -8,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    duration: 0.7,
                    ease: "power3.out"
                });
                gsap.to(img, { scale: 1.06, opacity: 1, duration: 0.7, ease: "power3.out" });
                mobileTilt(card);
            }
        });
    });

    // --- Trainer cards ---
    document.querySelectorAll('.trainer-card').forEach(card => {
        const img = card.querySelector('img');
        gsap.set(img, { scale: 1 });
        ScrollTrigger.create({
            trigger: card,
            start: "top 110%",
            once: true,
            onEnter: () => {
                card.classList.add('revealed');
                gsap.to(img, { scale: 1.05, duration: 0.9, ease: "power2.out" });
                mobileTilt(card);
            }
        });
    });
}

// Roda no mobile real e também quando DevTools simula mobile
if (window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window)) {
    // Desativa VanillaTilt (não funciona com touch)
    document.querySelectorAll('[data-tilt]').forEach(el => {
        if (el.vanillaTilt) el.vanillaTilt.destroy();
    });
    initMobileEffects();
}

// Remove item event delegation
cartItemsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('cart-item-remove')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const item = cartState[index];

        // Devolve 1 unidade ao estoque
        stockState[item.id]++;
        updateStockUI(item.id);

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cartState.splice(index, 1);
        }

        updateCartUI();
    }
});

// Finalizar compra — envia mensagem para WhatsApp
document.getElementById('btnCheckout').addEventListener('click', function() {
    if (cartState.length === 0) return;

    const numero = '5598984787905';

    let mensagem = '🛒 *Olá! Gostaria de finalizar meu pedido na Elite Fitness:*\n\n';

    cartState.forEach(item => {
        const subtotal = (item.price * item.quantity).toFixed(2);
        mensagem += `▪ *${item.name}*\n`;
        mensagem += `   Qtd: ${item.quantity} × R$ ${item.price.toFixed(2)} = R$ ${subtotal}\n\n`;
    });

    const total = cartState.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    mensagem += `━━━━━━━━━━━━━━━\n`;
    mensagem += `💰 *Total: R$ ${total.toFixed(2)}*\n\n`;
    mensagem += `Aguardo confirmação para pagamento. Obrigado! 😊`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
});
