require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const API_URL = process.env.API_URL;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// ROUTE 1 : La liste complète
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}magic-items`);
        res.render('index', { items: response.data.results });
    } catch (err) {
        res.status(500).send("Erreur API : " + err.message);
    }
});

// ROUTE 2 : Détails d'un objet (Description)
app.get('/item/:index', async (req, res) => {
    try {
        const itemIndex = req.params.index;
        const response = await axios.get(`${API_URL}magic-items/${itemIndex}`);
        res.render('item', { item: response.data });
    } catch (err) {
        res.status(404).send("Objet non trouvé");
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Lancé sur http://localhost:${PORT}`));