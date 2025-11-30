const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { reorderTableIDs } = require('./utils');

// GET all patients
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM patients ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single patient by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Add new patient
router.post('/', async (req, res) => {
    try {
        const { name, age, phone } = req.body;

        // Validation
        if (!name || age === undefined || age === null || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate age range (must be more than 0 and less than or equal to 100)
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum <= 0 || ageNum > 100) {
            return res.status(400).json({ error: 'Age must be more than 0 and less than or equal to 100' });
        }

        const [result] = await db.query(
            'INSERT INTO patients (name, age, phone) VALUES (?, ?, ?)',
            [name, ageNum, phone]
        );

        res.status(201).json({
            message: 'Patient added successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Update patient
router.put('/:id', async (req, res) => {
    try {
        const { name, age, phone } = req.body;
        const { id } = req.params;

        // Validation
        if (!name || age === undefined || age === null || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate age range (must be more than 0 and less than or equal to 100)
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum <= 0 || ageNum > 100) {
            return res.status(400).json({ error: 'Age must be more than 0 and less than or equal to 100' });
        }

        const [result] = await db.query(
            'UPDATE patients SET name = ?, age = ?, phone = ? WHERE id = ?',
            [name, ageNum, phone, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json({ message: 'Patient updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE patient
router.delete('/:id', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // Delete the patient (CASCADE will delete related prescriptions)
        const [result] = await connection.query('DELETE FROM patients WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Reorder IDs to be sequential (prescriptions will be updated automatically via foreign key mapping)
        await reorderTableIDs('patients', connection);

        await connection.commit();
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
