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
        clearProps: "opacity,transform",
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
                    <p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    <div class="cart-item-qty">Qtd: ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" data-index="${index}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    // Update total
    const total = cartState.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Add to cart event
document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const priceStr = this.getAttribute('data-price').replace(',', '.');
        const price = parseFloat(priceStr);
        // get image from closest product card
        const card = this.closest('.product-card');
        const image = card.querySelector('.product-image img').getAttribute('src');

        const existingItem = cartState.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartState.push({ id, name, price, quantity: 1, image });
        }
        
        updateCartUI();
        
        // Notify user with a small animation on floating cart
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

    // --- Awards card ---
    document.querySelectorAll('.awards-image-container').forEach(card => {
        const img = card.querySelector('img');
        gsap.set(img, { scale: 1 });
        ScrollTrigger.create({
            trigger: card,
            start: "top 100%",
            once: true,
            onEnter: () => {
                gsap.to(img, { scale: 1.04, duration: 0.9, ease: "power2.out" });
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
        const index = e.target.getAttribute('data-index');
        const item = cartState[index];
        
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cartState.splice(index, 1);
        }
        
        updateCartUI();
    }
});

// ==========================================
// 7. Ver Mais Produtos
// ==========================================
const btnVerMais = document.getElementById('btnVerMais');
const storeGridExtra = document.getElementById('storeGridExtra');

if (btnVerMais && storeGridExtra) {
    btnVerMais.addEventListener('click', function () {
        const aberto = storeGridExtra.classList.contains('visible');

        if (!aberto) {
            storeGridExtra.classList.add('visible');
            btnVerMais.classList.add('aberto');
            btnVerMais.querySelector('span').textContent = 'Ver menos';
        } else {
            storeGridExtra.classList.remove('visible');
            btnVerMais.classList.remove('aberto');
            btnVerMais.querySelector('span').textContent = 'Ver mais produtos';
        }
    });
}

// ==========================================
// 9. Botões Assinar & Payment Modal
// ==========================================
const numeroAcademia = '5598984787905';

const paymentOverlay = document.getElementById('paymentOverlay');
const paymentModal = document.getElementById('paymentModal');
const closePaymentBtn = document.getElementById('closePayment');
const btnConfirmPayment = document.getElementById('btnConfirmPayment');
const paymentMethodInputs = document.querySelectorAll('input[name="paymentMethod"]');
const installmentsWrapper = document.getElementById('installmentsWrapper');
const installmentsSelect = document.getElementById('installments');
const cardOptionLabel = document.getElementById('cardOptionLabel');

let pendingCheckout = null; 
// { type: 'plan' | 'cart', maxInstallments: number, data: any }

function closePaymentModal() {
    paymentOverlay.classList.remove('active');
    paymentModal.classList.remove('active');
    pendingCheckout = null;
}

if (closePaymentBtn) closePaymentBtn.addEventListener('click', closePaymentModal);
if (paymentOverlay) paymentOverlay.addEventListener('click', closePaymentModal);

const cardTypeWrapper = document.getElementById('cardTypeWrapper');
const cardTypeInputs = document.querySelectorAll('input[name="cardType"]');

function updateInstallmentsVisibility() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const cardType = document.querySelector('input[name="cardType"]:checked').value;
    
    if (paymentMethod && paymentMethod.value === 'cartao') {
        cardTypeWrapper.style.display = 'block';
        if (cardType === 'credito' && pendingCheckout && pendingCheckout.maxInstallments >= 1) {
            installmentsWrapper.style.display = 'block';
        } else {
            installmentsWrapper.style.display = 'none';
        }
    } else {
        cardTypeWrapper.style.display = 'none';
        installmentsWrapper.style.display = 'none';
    }
}

function openPaymentModal(type, maxInstallments, data) {
    pendingCheckout = { type, maxInstallments, data };
    
    // Reset selections and hide footer
    paymentMethodInputs.forEach(input => input.checked = false);
    cardTypeInputs.forEach(input => {
        if (input.value === 'credito') input.checked = true;
    });
    document.querySelector('.payment-footer').style.display = 'none';
    cardTypeWrapper.style.display = 'none';
    installmentsWrapper.style.display = 'none';
    
    if (maxInstallments > 1) {
        installmentsSelect.innerHTML = '';
        for (let i = 1; i <= maxInstallments; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${i}x`;
            installmentsSelect.appendChild(opt);
        }
    } else if (maxInstallments === 1) {
        installmentsSelect.innerHTML = '<option value="1">1x (À vista)</option>';
    }

    paymentOverlay.classList.add('active');
    paymentModal.classList.add('active');
}

paymentMethodInputs.forEach(input => {
    input.addEventListener('change', function() {
        document.querySelector('.payment-footer').style.display = 'block';
        updateInstallmentsVisibility();
    });
});

cardTypeInputs.forEach(input => {
    input.addEventListener('change', updateInstallmentsVisibility);
});

document.querySelectorAll('.plan-card .btn-primary, .plan-card .btn-secondary').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const card = this.closest('.plan-card');
        const plano = card.querySelector('h3').textContent.trim();
        const preco = card.querySelector('.price').childNodes[0].textContent.trim();
        
        let maxInstallments = 1; // Default 1x (à vista)
        
        if (card.classList.contains('pro')) {
            const htmlStr = card.innerHTML.toLowerCase();
            const match = htmlStr.match(/até (\d+)x/);
            if (match && match[1]) {
                maxInstallments = parseInt(match[1]);
            }
        }

        const data = { plano, preco };
        openPaymentModal('plan', maxInstallments, data);
    });
});

const btnCheckout = document.getElementById('btnCheckout');
if (btnCheckout) {
    btnCheckout.addEventListener('click', function () {
        if (cartState.length === 0) return;
        
        const totalItems = cartState.reduce((acc, item) => acc + item.quantity, 0);
        let maxInstallments = 1;
        
        if (totalItems === 2) {
            maxInstallments = 2;
        } else if (totalItems >= 3) {
            maxInstallments = 3;
        }

        openPaymentModal('cart', maxInstallments, null);
    });
}

if (btnConfirmPayment) {
    btnConfirmPayment.addEventListener('click', function() {
        if (!pendingCheckout) return;

        let totalValue = 0;

        if (pendingCheckout.type === 'plan') {
            const { preco } = pendingCheckout.data;
            const parsed = parseFloat(preco.replace(/[^\d,-]/g, '').replace(',', '.'));
            if (!isNaN(parsed)) {
                totalValue = parsed;
            }
        } else if (pendingCheckout.type === 'cart') {
            totalValue = cartState.reduce((acc, item) => acc + item.price * item.quantity, 0);
        }

        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        let paymentInfo = '';
        if (paymentMethod === 'pix') paymentInfo = 'Pix';
        else if (paymentMethod === 'dinheiro') paymentInfo = 'Dinheiro';
        else if (paymentMethod === 'cartao') {
            const cardType = document.querySelector('input[name="cardType"]:checked').value;
            if (cardType === 'debito') {
                paymentInfo = 'Cartão de Débito (À vista)';
            } else {
                paymentInfo = 'Cartão de Crédito';
                const installments = parseInt(installmentsSelect.value) || 1;
                if (totalValue > 0) {
                    const valorParcela = (totalValue / installments).toFixed(2).replace('.', ',');
                    paymentInfo += ` (${installments}x de R$ ${valorParcela})`;
                } else {
                    paymentInfo += ` (${installments}x)`;
                }
            }
        }

        let mensagem = '';

        if (pendingCheckout.type === 'plan') {
            const { plano, preco } = pendingCheckout.data;
            mensagem = `Olá! Tenho interesse em assinar o plano *${plano}* (${preco}) da Elite Fit.\n\nForma de pagamento escolhida: *${paymentInfo}*`;
        } else if (pendingCheckout.type === 'cart') {
            const itens = cartState.map(item =>
                `• ${item.name} (x${item.quantity}) — R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`
            ).join('\n');
            
            mensagem = `Olá! Gostaria de realizar o seguinte pedido pela Elite Fit:\n\n${itens}\n\n*Total: R$ ${totalValue.toFixed(2).replace('.', ',')}*\n\nForma de pagamento escolhida: *${paymentInfo}*`;
        }

        const url = `https://wa.me/${numeroAcademia}?text=${encodeURIComponent(mensagem)}`;
        window.location.href = url;
        closePaymentModal();
    });
}
