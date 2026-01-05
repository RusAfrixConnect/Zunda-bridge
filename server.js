const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Route pour récupérer les produits (proxy API)
app.get('/api/products', async (req, res) => {
  const { source, category, page = 1 } = req.query;
  
  // URL API factices pour la démo
  const mockApis = {
    'wildberries': 'https://wb-mock-api.com/products',
    '1688': 'https://alibaba-mock-api.com/items',
    'ozon': 'https://ozon-mock-api.com/listings',
    'amazon': 'https://amazon-mock-api.com/entries'
  };
  
  try {
    // En production: décommenter pour appeler une vraie API
    // const response = await axios.get(mockApis[source], { params: { page, category } });
    
    // Données factices pour le prototype
    const mockProducts = Array.from({ length: 12 }, (_, i) => ({
      id: `${source}_${(page-1)*12 + i + 1}`,
      title: `Produit ${source} ${(page-1)*12 + i + 1}`,
      price: (Math.random() * 100 + 10).toFixed(2),
      currency: source === '1688' ? 'CNY' : source === 'wildberries' ? 'RUB' : 'USD',
      image: `https://picsum.photos/300/200?random=${i}`,
      source: source,
      link: `https://${source}.com/product/${i}`
    }));
    
    res.json({
      success: true,
      data: mockProducts,
      page: parseInt(page),
      totalPages: 5
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'API error' });
  }
});

// Route pour le simulateur de conversion ZND
app.post('/api/convert', (req, res) => {
  const { amount, fromCurrency } = req.body;
  
  // Taux de change fictifs pour la démo
  const rates = {
    'USD': 2.5,  // 1 USD = 2.5 ZND
    'EUR': 2.7,  // 1 EUR = 2.7 ZND
    'RUB': 0.025, // 1 RUB = 0.025 ZND
    'CNY': 0.35  // 1 CNY = 0.35 ZND
  };
  
  const rate = rates[fromCurrency] || 1;
  const zndAmount = (amount * rate).toFixed(2);
  const fee = (zndAmount * 0.005).toFixed(4); // 0.5% de frais en ZND
  
  res.json({
    success: true,
    original: { amount, currency: fromCurrency },
    converted: { amount: zndAmount, currency: 'ZND' },
    fee: { amount: fee, currency: 'ZND' },
    total: { amount: (parseFloat(zndAmount) + parseFloat(fee)).toFixed(2), currency: 'ZND' },
    rate: rate
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`📁 Fichiers statiques servis depuis /public`);
});
