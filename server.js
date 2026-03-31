require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const db = require('./db');
const authMiddleware = require('./middleware/auth');

const app = express();
const API_URL = process.env.API_URL;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── AUTH ────────────────────────────────────────────────

app.get('/register', (req, res) => res.render('register', { error: null }));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.render('register', { error: "Champs manquants" });

    try {
        const hash = await bcrypt.hash(password, 12);
        const user = await db.createUser(username, hash);
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.SESSION_SECRET,
            { expiresIn: '2d' }
        );
        res.cookie('token', token, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
        res.redirect('/items');
    } catch (err) {
        res.render('register', { error: "Nom d'utilisateur déjà pris" });
    }
});

app.get('/login', (req, res) => res.render('login', { error: null }));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.getUserByUsername(username);
    if (!user) return res.render('login', { error: "Utilisateur introuvable" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.render('login', { error: "Mot de passe incorrect" });

    const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.SESSION_SECRET,
        { expiresIn: '2d' }
    );
    res.cookie('token', token, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
    res.redirect('/items');
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// ─── PAGES ───────────────────────────────────────────────

app.get('/', (req, res) => res.render('accueil'));

app.get('/items', authMiddleware, async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}magic-items`);
        res.render('index', { items: response.data.results, user: req.user });
    } catch (err) {
        res.status(500).send("Erreur lors de la récupération des items");
    }
});

app.get('/item/:index', authMiddleware, async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}magic-items/${req.params.index}`);
        res.render('item', { item: response.data, user: req.user });
    } catch (err) {
        res.status(404).send("Objet non trouvé");
    }
});

app.get('/favorites', authMiddleware, async (req, res) => {
    try {
        const indexes = await db.getFavorites(req.user.id);
        const details = await Promise.all(
            indexes.map(i => axios.get(`${API_URL}magic-items/${i}`).then(r => r.data))
        );
        res.render('favorites', { items: details, user: req.user });
    } catch (err) {
        res.status(500).send("Erreur favoris");
    }
});

// ─── API ─────────────────────────────────────────────────

app.post('/api/favorites/:index', authMiddleware, async (req, res) => {
    const success = await db.addFavorite(req.user.id, req.params.index);
    res.json({ success });
});

app.delete('/api/favorites/:index', authMiddleware, async (req, res) => {
    const success = await db.removeFavorite(req.user.id, req.params.index);
    res.json({ success });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Serveur prêt : http://localhost:${PORT}`));