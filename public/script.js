// Configuration
let currentPage = 1;
let currentSource = '1688';
let currentCategory = '';
let currentSearch = '';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const marketplaceTitle = document.getElementById('marketplaceTitle');
const pagination = document.getElementById('pagination');
const marketplaceButtons = document.querySelectorAll('.marketplace-btn');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const convertBtn = document.getElementById('convertBtn');
const convertAmount = document.getElementById('convertAmount');
const convertCurrency = document.getElementById('convertCurrency');
const btnBuy = document.querySelector('.btn-buy');
const btnConnect = document.querySelector('.btn-connect');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// Écouteurs d'événements
function setupEventListeners() {
    // Navigation marketplaces
    marketplaceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            marketplaceButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSource = btn.dataset.source;
            currentPage = 1;
            marketplaceTitle.textContent = `Produits ${getMarketplaceName(currentSource)}`;
            loadProducts();
        });
    });
    
    // Filtre catégorie
    categoryFilter.addEventListener('change', () => {
        currentCategory = categoryFilter.value;
        currentPage = 1;
        loadProducts();
    });
    
    // Recherche
    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value;
        currentPage = 1;
        loadProducts();
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value;
            currentPage = 1;
            loadProducts();
        }
    });
    
    // Conversion ZND
    convertBtn.addEventListener('click', convertToZND);
    
    // Simulation d'achat
    btnBuy.addEventListener('click', simulatePurchase);
    
    // Connexion wallet (simulation)
    btnConnect.addEventListener('click', () => {
        alert('🦊 Fonctionnalité wallet en développement!\nDans le MVP réel, MetaMask ou WalletConnect sera intégré.');
        document.getElementById('zndBalance').textContent = '2,845.75';
    });
}

// Charger les produits
async function loadProducts() {
    try {
        // Afficher un indicateur de chargement
        productsGrid.innerHTML = '<div class="loading">Chargement des produits...</div>';
        
        // Appeler l'API backend
        const response = await fetch(
            `/api/products?source=${currentSource}&category=${currentCategory}&page=${currentPage}&q=${encodeURIComponent(currentSearch)}`
        );
        
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.data);
            displayPagination(data.page, data.totalPages);
        } else {
            throw new Error('Erreur API');
        }
    } catch (error) {
        productsGrid.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Impossible de charger les produits. Utilisation des données de démo.</p>
                ${generateMockProducts()}
            </div>
        `;
        displayPagination(1, 5);
    }
}

// Afficher les produits
function displayProducts(products) {
    if (products.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">Aucun produit trouvé. Essayez une autre recherche.</div>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.title}" class="product-img">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">${product.price} ${product.currency}</div>
                <div class="product-currency">${getCurrencySymbol(product.currency)}</div>
                <button class="btn-view" onclick="showProductDetail('${product.id}')">
                    <i class="fas fa-eye"></i> Voir détails
                </button>
            </div>
        </div>
    `).join('');
}

// Générer des produits fictifs (fallback)
function generateMockProducts() {
    const products = Array.from({ length: 8 }, (_, i) => ({
        title: `Produit ${currentSource} ${i + 1}`,
        price: (Math.random() * 100 + 10).toFixed(2),
        currency: currentSource === '1688' ? 'CNY' : currentSource === 'wildberries' ? 'RUB' : 'USD',
        image: `https://picsum.photos/300/200?random=${i + currentPage}`
    }));
    
    return products.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.title}" class="product-img">
            <div class="product-info">
                <h3 class="product-title">${p.title}</h3>
                <div class="product-price">${p.price} ${p.currency}</div>
            </div>
        </div>
    `).join('');
}

// Afficher la pagination
function displayPagination(current, total) {
    let html = '';
    
    // Bouton précédent
    if (current > 1) {
        html += `<button class="page-btn" onclick="changePage(${current - 1})"><i class="fas fa-chevron-left"></i></button>`;
    }
    
    // Pages
    for (let i = 1; i <= Math.min(total, 5); i++) {
        html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    // Bouton suivant
    if (current < total) {
        html += `<button class="page-btn" onclick="changePage(${current + 1})"><i class="fas fa-chevron-right"></i></button>`;
    }
    
    pagination.innerHTML = html;
}

// Changer de page
function changePage(page) {
    currentPage = page;
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Convertir en ZND
async function convertToZND() {
    const amount = parseFloat(convertAmount.value);
    const currency = convertCurrency.value;
    
    if (!amount || amount <= 0) {
        alert('Veuillez entrer un montant valide');
        return;
    }
    
    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, fromCurrency: currency })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('originalAmount').textContent = 
                `${data.original.amount} ${data.original.currency}`;
            document.getElementById('zndAmount').textContent = 
                `${data.converted.amount} ZND`;
            document.getElementById('feeAmount').textContent = 
                `${data.fee.amount} ZND`;
            document.getElementById('totalAmount').textContent = 
                `${data.total.amount} ZND`;
            
            // Pré-remplir le bouton d'achat
            btnBuy.innerHTML = `<i class="fas fa-bolt"></i> Acheter maintenant (${data.total.amount} ZND)`;
        }
    } catch (error) {
        alert('Erreur de conversion. Utilisation des taux de démo.');
        
        // Fallback avec calcul local
        const rates = { 'USD': 2.5, 'EUR': 2.7, 'RUB': 0.025, 'CNY': 0.35 };
        const rate = rates[currency] || 1;
        const znd = (amount * rate).toFixed(2);
        const fee = (znd * 0.005).toFixed(4);
        const total = (parseFloat(znd) + parseFloat(fee)).toFixed(2);
        
        document.getElementById('originalAmount').textContent = `${amount} ${currency}`;
        document.getElementById('zndAmount').textContent = `${znd} ZND`;
        document.getElementById('feeAmount').textContent = `${fee} ZND`;
        document.getElementById('totalAmount').textContent = `${total} ZND`;
        
        btnBuy.innerHTML = `<i class="fas fa-bolt"></i> Acheter maintenant (${total} ZND)`;
    }
}

// Simuler un achat
function simulatePurchase() {
    const total = document.getElementById('totalAmount').textContent;
    
    if (total === '- ZND') {
        alert('Veuillez d\'abord convertir un montant en ZND.');
        return;
    }
    
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal">
                <h2><i class="fas fa-rocket"></i> Fonctionnalité en développement!</h2>
                <p>Dans le MVP complet, vous pourrez:</p>
                <ul>
                    <li><i class="fas fa-check"></i> Connecter votre wallet crypto (MetaMask, etc.)</li>
                    <li><i class="fas fa-check"></i> Payer ${total} directement en ZND</li>
                    <li><i class="fas fa-check"></i> Suivre votre commande en temps réel</li>
                    <li><i class="fas fa-check"></i> Recevoir le produit à votre adresse</li>
                </ul>
                <p><strong>Prochaine étape:</strong> Intégration avec une vraie API de marketplace et un système de paiement crypto.</p>
                <button onclick="closeModal()" class="btn-connect">Fermer</button>
            </div>
        </div>
    `;
    
    // Ajouter le modal au document
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHtml;
    document.body.appendChild(modalDiv);
    
    // Ajouter des styles pour le modal
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .modal {
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .modal h2 {
            color: #4361ee;
            margin-bottom: 20px;
        }
        .modal ul {
            margin: 20px 0;
            padding-left: 20px;
        }
        .modal li {
            margin-bottom: 10px;
            color: #495057;
        }
        .modal li i {
            color: #4cc9f0;
            margin-right: 10px;
        }
    `;
    document.head.appendChild(style);
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

// Voir détails produit
function showProductDetail(productId) {
    alert(`📦 Détails du produit: ${productId}\n\nDans le MVP complet, cette page affichera:\n• Toutes les images du produit\n• Description complète\n• Avis clients\n• Options de livraison\n• Calcul exact du prix en ZND`);
    
    // Simuler la conversion pour ce produit
    const randomPrice = (Math.random() * 100 + 10).toFixed(2);
    convertAmount.value = randomPrice;
    convertCurrency.value = currentSource === '1688' ? 'CNY' : 
                           currentSource === 'wildberries' ? 'RUB' : 'USD';
    convertToZND();
}

// Utilitaires
function getMarketplaceName(source) {
    const names = {
        '1688': '1688.com',
        'wildberries': 'Wildberries',
        'ozon': 'Ozon',
        'amazon': 'Amazon'
    };
    return names[source] || source;
}

function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'RUB': '₽',
        'CNY': '¥',
        'ZND': 'ZND'
    };
    return symbols[currency] || currency;
}
