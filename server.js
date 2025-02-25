const express = require('express');
const mariadb = require('mariadb');

const app = express();
app.use(express.json());  // Enable JSON parsing for incoming requests

// Database connection pool
const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: 'dbuser',
    password: 'dbpassword',
    database: 'userdb',
    connectionLimit: 5
});

// Greeting route (from Task 1)
app.get('/greeting', (req, res) => {
    res.send('<h1>Hello World!</h1>');
});

// Endpoint 1: Register a new user
app.post('/register', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("INSERT INTO Users (username) VALUES (?)", [username]);
        res.json({ message: `User ${username} registered successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// Endpoint 2: Get list of all users
app.get('/list', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT username FROM Users");
        const users = rows.map(row => row.username);
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// Endpoint 3: Clear all users from database
app.post('/clear', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("DELETE FROM Users");
        res.json({ message: "All users deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});