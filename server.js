require('dotenv').config();
const express = require('express');
const axios = require('axios');
const db = require('./db');
const app = express();

const API_URL = process.env.API_URL;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

// Accueil
app.get('/', (req, res) => {
    res.render('accueil');
});

// Liste des objets
app.get('/items', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}magic-items`);
        res.render('index', { items: response.data.results });
    } catch (err) {
        res.status(500).send("Erreur lors de la récupération des items");
    }
});

// Détail d'un objet
app.get('/item/:index', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}magic-items/${req.params.index}`);
        res.render('item', { item: response.data });
    } catch (err) {
        res.status(404).send("Objet non trouvé");
    }
});
// Page des favoris
app.get('/favorites', async (req, res) => {
    try {
        const favoriteIndexes = await db.getFavorites();
        
        // On récupère les détails de chaque item favori en parallèle
        const favoriteDetails = await Promise.all(
            favoriteIndexes.map(async (index) => {
                const response = await axios.get(`${API_URL}magic-items/${index}`);
                return response.data;
            })
        );

        res.render('favorites', { items: favoriteDetails });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la récupération des favoris");
    }
});

// API Favoris (Simulation)
app.post('/api/favorites/:index', async (req, res) => {
    const success = await db.addFavorite(req.params.index);
    res.json({ success });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Serveur prêt : http://localhost:${PORT}`));