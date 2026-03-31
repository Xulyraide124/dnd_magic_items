require('dotenv').config();
const { Pool } = require('pg');

const isSupabase = process.env.DATABASE_URL.includes('supabase.co');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isSupabase ? { rejectUnauthorized: false } : false
});

const init = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS favorites (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            item_index VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, item_index)
        );
    `);
    console.log("✅ Tables prêtes");
};

init().catch(console.error);

module.exports = {
    // USERS
    createUser: async (username, passwordHash) => {
        const result = await pool.query(
            `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username`,
            [username, passwordHash]
        );
        return result.rows[0];
    },

    getUserByUsername: async (username) => {
        const result = await pool.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );
        return result.rows[0] || null;
    },

    getUserById: async (id) => {
        const result = await pool.query(
            `SELECT id, username FROM users WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    },

    // FAVORITES
    addFavorite: async (userId, itemIndex) => {
        try {
            await pool.query(
                `INSERT INTO favorites (user_id, item_index) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [userId, itemIndex]
            );
            return true;
        } catch (err) {
            console.error("Erreur addFavorite:", err);
            return false;
        }
    },

    getFavorites: async (userId) => {
        const result = await pool.query(
            `SELECT item_index FROM favorites WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows.map(r => r.item_index);
    },

    removeFavorite: async (userId, itemIndex) => {
        await pool.query(
            `DELETE FROM favorites WHERE user_id = $1 AND item_index = $2`,
            [userId, itemIndex]
        );
        return true;
    }
};