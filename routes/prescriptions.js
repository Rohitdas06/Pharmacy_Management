const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all prescriptions with patient and medicine details
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.id,
                p.quantity,
                p.date,
                pat.name as patient_name,
                pat.age as patient_age,
                pat.phone as patient_phone,
                m.name as medicine_name,
                m.type as medicine_type,
                m.price as medicine_price
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.id
            JOIN medicines m ON p.medicine_id = m.id
            ORDER BY p.date DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET prescriptions for a specific patient
router.get('/patient/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.id,
                p.quantity,
                p.date,
                m.name as medicine_name,
                m.type as medicine_type,
                m.price as medicine_price
            FROM prescriptions p
            JOIN medicines m ON p.medicine_id = m.id
            WHERE p.patient_id = ?
            ORDER BY p.date DESC
        `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Create new prescription (with automatic stock reduction)
router.post('/', async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { patient_id, medicine_id, quantity, date } = req.body;

        // Validation
        if (!patient_id || !medicine_id || !quantity || !date) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0' });
        }

        // Start transaction
        await connection.beginTransaction();

        // Check if medicine exists and has sufficient stock
        const [medicines] = await connection.query(
            'SELECT id, name, stock FROM medicines WHERE id = ?',
            [medicine_id]
        );

        if (medicines.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Medicine not found' });
        }

        const medicine = medicines[0];

        if (medicine.stock < quantity) {
            await connection.rollback();
            return res.status(400).json({
                error: 'Insufficient stock',
                available: medicine.stock,
                requested: quantity
            });
        }

        // Check if patient exists
        const [patients] = await connection.query(
            'SELECT id FROM patients WHERE id = ?',
            [patient_id]
        );

        if (patients.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Create prescription
        const [prescriptionResult] = await connection.query(
            'INSERT INTO prescriptions (patient_id, medicine_id, quantity, date) VALUES (?, ?, ?, ?)',
            [patient_id, medicine_id, quantity, date]
        );

        // Reduce stock
        await connection.query(
            'UPDATE medicines SET stock = stock - ? WHERE id = ?',
            [quantity, medicine_id]
        );

        // Commit transaction
        await connection.commit();

        res.status(201).json({
            message: 'Prescription created successfully',
            id: prescriptionResult.insertId,
            stock_remaining: medicine.stock - quantity
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
