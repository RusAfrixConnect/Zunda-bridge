// ===== COUNTDOWN TIMER =====
function updateCountdown() {
    const endDate = new Date('2026-04-30T23:59:59').getTime();
    const now = new Date().getTime();
    const diff = endDate - now;

    if (diff < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

setInterval(updateCountdown, 1000);

// ===== SYSTÈME DE TRADUCTION =====
let currentLang = localStorage.getItem('zunda_lang') || 'fr';

function translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[currentLang][key];
            } else if (element.tagName === 'OPTION') {
                element.textContent = translations[currentLang][key];
            } else {
                element.innerHTML = translations[currentLang][key];
            }
        }
    });

    document.documentElement.lang = currentLang;
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    localStorage.setItem('zunda_lang', currentLang);
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        currentLang = this.dataset.lang;
        translatePage();
        loadProducts(); // Recharger les produits avec la nouvelle langue
    });
});

document.addEventListener('DOMContentLoaded', translatePage);

// ===== MARKETPLACE TABS =====
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        tabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const tabId = this.dataset.tab;
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    });
});

// ===== PRODUITS MULTILANGUES =====
const productsData = {
    wildberries: [
        { 
            name: { fr: 'Smartphone Xiaomi Redmi Note 12', en: 'Xiaomi Redmi Note 12 Smartphone', ru: 'Смартфон Xiaomi Redmi Note 12' },
            price: 180, 
            image: 'https://via.placeholder.com/300x200', 
            origin: 'Wildberries' 
        },
        { 
            name: { fr: 'Casque Bluetooth Sony', en: 'Sony Bluetooth Headphones', ru: 'Bluetooth-наушники Sony' },
            price: 85, 
            image: 'https://via.placeholder.com/300x200', 
            origin: 'Wildberries' 
        },
        { 
            name: { fr: 'Montre Amazfit GTS 4', en: 'Amazfit GTS 4 Watch', ru: 'Часы Amazfit GTS 4' },
            price: 120, 
            image: 'https://via.placeholder.com/300x200', 
            origin: 'Wildberries' 
        },
        { 
            name: { fr: 'Sac à dos imperméable', en: 'Waterproof Backpack', ru: 'Водонепроницаемый рюкзак' },
            price: 35, 
            image: 'https://via.placeholder.com/300x200', 
            origin: 'Wildberries' 
        }
    ],
    '1688': [
        { 
            name: { fr: 'Robot ménager', en: 'Food Processor', ru: 'Кухонный комбайн' },
            price: 150, 
            image: 'https://via.placeholder.com/300x200', 
            origin: '1688' 
        },
        { 
            name: { fr: 'T-shirt en coton', en: 'Cotton T-shirt', ru: 'Хлопковая футболка' },
            price: 12, 
            image: 'https://via.placeholder.com/300x200', 
            origin: '1688' 
        },
        { 
            name: { fr: 'Lampe LED intelligente', en: 'Smart LED Lamp', ru: 'Умная LED-лампа' },
            price: 25, 
            image: 'https://via.placeholder.com/300x200', 
            origin: '1688' 
        },
        { 
            name: { fr: 'Câbles USB pack 5', en: 'USB Cables pack of 5', ru: 'USB-кабели набор 5 шт' },
            price: 8, 
            image: 'https://via.placeholder.com/300x200', 
            origin: '1688' 
        }
    ],
    amazon: [
        { 
            name: { fr: 'Kindle Paperwhite', en: 'Kindle Paperwhite', ru: 'Kindle Paperwhite' },
            price: 140, 
            image: 'https://via.placeholder.com/300x200', 
            origin: 'Amazon' 
        },
        { 
            name: { fr: 'Echo Dot 5ème génération', en: 'Echo Dot 5th Gen', ru: 'Echo Dot 5-го поколения' },
            price: 50, 
            image: 'https://via.placeholder.com/300x200', 
            origin: 'Amazon' 
        },
        { 
            name: { fr: 'Fire TV Stick', en: 'Fire TV Stick', ru: 'Fire TV Stick' },
            price: 40, 
            image: 'https://via.placeholder.com/300x200', 
            origin: 'Amazon' 
        },
        { 
            name: { fr: 'Casque Bose QC45', en: 'Bose QC45 Headphones', ru: 'Наушники Bose QC45' },
            price: 280, 
            image: 'https://via.placeholder.com/300x200', 
            origin: 'Amazon' 
        }
    ]
};

function loadProducts() {
    // Pour la page d'accueil (tabs)
    for (const [marketplace, productList] of Object.entries(productsData)) {
        const container = document.getElementById(`${marketplace}-grid`);
        if (!container) continue;

        container.innerHTML = '';
        
        productList.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-badge">${product.origin}</div>
                <img src="${product.image}" alt="${product.name.fr}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.name[currentLang] || product.name.fr}</h3>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-origin">${product.origin}</div>
                    <button class="btn-add-to-cart" data-i18n="add_to_cart">Ajouter au panier</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Pour la page boutique
    const shopGrid = document.getElementById('shop-products-grid');
    if (shopGrid) {
        shopGrid.innerHTML = '';
        const allProducts = [...productsData.wildberries, ...productsData['1688'], ...productsData.amazon];
        
        allProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-badge">${product.origin}</div>
                <img src="${product.image}" alt="${product.name.fr}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.name[currentLang] || product.name.fr}</h3>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-origin">${product.origin}</div>
                    <button class="btn-add-to-cart" data-i18n="add_to_cart">Ajouter au panier</button>
                </div>
            `;
            shopGrid.appendChild(card);
        });
    }
}

// ===== WHITELIST FORM =====
const whitelistForm = document.getElementById('whitelist-form');
if (whitelistForm) {
    whitelistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        
        alert(`Merci ${name} ! Vous êtes inscrit sur la whitelist. Nous vous contacterons bientôt.`);
        this.reset();
    });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== ANIMATIONS ON SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.solution-card, .step-card, .testimonial-card, .product-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    translatePage();
});
