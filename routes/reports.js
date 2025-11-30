const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET expired medicines
router.get('/expired', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM medicines 
            WHERE expiry_date < CURDATE()
            ORDER BY expiry_date DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET medicines expiring soon (within 30 days)
router.get('/expiring-soon', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM medicines 
            WHERE expiry_date >= CURDATE() 
            AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            ORDER BY expiry_date ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET low stock medicines (stock < 10)
router.get('/low-stock', async (req, res) => {
    try {
        const threshold = req.query.threshold || 10;
        const [rows] = await db.query(`
            SELECT * FROM medicines 
            WHERE stock < ?
            ORDER BY stock ASC
        `, [threshold]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET dashboard summary
router.get('/dashboard', async (req, res) => {
    try {
        const [totalMedicines] = await db.query('SELECT COUNT(*) as count FROM medicines');
        const [totalPatients] = await db.query('SELECT COUNT(*) as count FROM patients');
        const [totalPrescriptions] = await db.query('SELECT COUNT(*) as count FROM prescriptions');
        const [expiredCount] = await db.query('SELECT COUNT(*) as count FROM medicines WHERE expiry_date < CURDATE()');
        const [lowStockCount] = await db.query('SELECT COUNT(*) as count FROM medicines WHERE stock < 10');
        const [expiringSoonCount] = await db.query(`
            SELECT COUNT(*) as count FROM medicines 
            WHERE expiry_date >= CURDATE() 
            AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        `);

        res.json({
            total_medicines: totalMedicines[0].count,
            total_patients: totalPatients[0].count,
            total_prescriptions: totalPrescriptions[0].count,
            expired_medicines: expiredCount[0].count,
            low_stock_medicines: lowStockCount[0].count,
            expiring_soon: expiringSoonCount[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
