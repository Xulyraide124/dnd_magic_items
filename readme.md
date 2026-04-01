# ⚔️ L'Archive des Reliques — DnD Magic Items

Application web permettant d'explorer les objets magiques de Donjons & Dragons 5e édition (SRD 2014), avec système d'authentification par token JWT et gestion de favoris personnalisés.

---

## 🚀 Démo

> Déployé sur Render : [https://dnd-magic-items.onrender.com](https://dnd-magic-items.onrender.com)

---

## ✨ Fonctionnalités

- 📜 Liste complète des objets magiques DnD 5e (SRD 2014)
- 🔍 Recherche en temps réel par nom
- 🖼️ Images et descriptions complètes de chaque objet
- 🏷️ Badges de rareté colorés (Common, Uncommon, Rare, Very Rare, Legendary, Artifact)
- 🔀 Affichage des variantes d'objets
- ⭐ Système de favoris personnalisés par utilisateur
- 🔐 Authentification JWT (token valable 2 jours)
- 👤 Inscription / Connexion / Déconnexion

---

## 🛠️ Stack technique

| Composant | Technologie |
|---|---|
| Backend | Node.js + Express |
| Templating | EJS |
| Base de données | PostgreSQL (Supabase en prod, Docker en local) |
| Auth | JWT + bcrypt + cookie-parser |
| API DnD | [dnd5eapi.co](https://www.dnd5eapi.co/api/2014/) |
| Déploiement | Render |
| Style | CSS custom (MedievalSharp + EB Garamond) |

---

## 📁 Structure du projet

```
dnd_magic_items/
│   .env                    # Variables d'environnement (non commité)
│   .gitignore
│   db.js                   # Connexion PostgreSQL + requêtes
│   package.json
│   server.js               # Serveur Express + routes
│   docker-compose.yml      # PostgreSQL local pour le développement
│
├───middleware/
│       auth.js             # Middleware vérification JWT
│
├───public/
│       style.css           # CSS global (thème médiéval)
│
└───views/
        accueil.ejs         # Page d'accueil
        index.ejs           # Liste des objets
        item.ejs            # Détail d'un objet
        favorites.ejs       # Favoris de l'utilisateur
        login.ejs           # Connexion
        register.ejs        # Inscription
```

---

## ⚙️ Installation locale

### Prérequis

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Cloner le projet

```bash
git clone https://github.com/Xulyraide124/dnd_magic_items.git
cd dnd_magic_items
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine :

```dotenv
API_URL=https://www.dnd5eapi.co/api/2014/
DATABASE_URL=postgresql://magic_user:dnd_magic_items@localhost:5432/mage
SESSION_SECRET=donjons_et_dragons_secret_key
```

### 4. Lancer la base de données (Docker)

```bash
docker-compose up -d
```

### 5. Lancer le serveur

```bash
npm start
```

L'application est disponible sur **http://localhost:3000**

> Les tables `users` et `favorites` sont créées automatiquement au premier démarrage.

---

## ☁️ Déploiement (Render + Supabase)

### Base de données — Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans **Settings → Database → Connection pooling**
3. Copier l'URI (port 6543)

### Serveur — Render

1. Connecter le repo GitHub sur [render.com](https://render.com)
2. Créer un **Web Service** avec :
   - **Build command** : `npm install`
   - **Start command** : `npm start`
3. Ajouter les variables d'environnement dans **Environment** :

| Variable | Valeur |
|---|---|
| `API_URL` | `https://www.dnd5eapi.co/api/2014/` |
| `DATABASE_URL` | `postgresql://postgres.xxx:[MDP]@aws-x.pooler.supabase.com:6543/postgres` |
| `SESSION_SECRET` | une clé secrète aléatoire |

---

## 🔐 Authentification

- À l'inscription, le mot de passe est hashé avec **bcrypt** (12 rounds)
- Un token **JWT** est généré et stocké dans un cookie `httpOnly` (expire après **2 jours**)
- Toutes les routes `/items`, `/item/:id`, `/favorites` sont protégées
- Si le token est expiré ou absent → redirection automatique vers `/login`

---

## 📡 API utilisée

[D&D 5e SRD API](https://www.dnd5eapi.co/) — édition 2014

| Endpoint | Description |
|---|---|
| `GET /api/2014/magic-items` | Liste de tous les objets magiques |
| `GET /api/2014/magic-items/:index` | Détail d'un objet (image, desc, rareté, variantes) |

---

## 🗄️ Schéma de base de données

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_index VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, item_index)
);
```

---

## 📜 Licence

Projet réalisé dans le cadre du cursus **Ynov** — YBoost.  
Les données DnD sont issues du SRD 5.1 sous licence [Creative Commons CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).