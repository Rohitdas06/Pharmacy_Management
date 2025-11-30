const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { reorderTableIDs } = require('./utils');

// GET all medicines
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM medicines ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single medicine by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM medicines WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Add new medicine
router.post('/', async (req, res) => {
    try {
        const { name, type, stock, price, expiry_date } = req.body;

        // Validation
        if (!name || !type || stock === undefined || !price || !expiry_date) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const [result] = await db.query(
            'INSERT INTO medicines (name, type, stock, price, expiry_date) VALUES (?, ?, ?, ?, ?)',
            [name, type, stock, price, expiry_date]
        );

        res.status(201).json({
            message: 'Medicine added successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Update medicine
router.put('/:id', async (req, res) => {
    try {
        const { name, type, stock, price, expiry_date } = req.body;
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE medicines SET name = ?, type = ?, stock = ?, price = ?, expiry_date = ? WHERE id = ?',
            [name, type, stock, price, expiry_date, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medicine not found' });
        }

        res.json({ message: 'Medicine updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE medicine
router.delete('/:id', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // Delete the medicine
        const [result] = await connection.query('DELETE FROM medicines WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Medicine not found' });
        }

        // Reorder IDs to be sequential
        await reorderTableIDs('medicines', connection);

        await connection.commit();
        res.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// GET - Search medicines by name or type
router.get('/search/:query', async (req, res) => {
    try {
        const searchQuery = `%${req.params.query}%`;
        const [rows] = await db.query(
            'SELECT * FROM medicines WHERE name LIKE ? OR type LIKE ?',
            [searchQuery, searchQuery]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
