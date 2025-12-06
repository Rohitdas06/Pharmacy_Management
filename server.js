const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Import routes
const medicinesRoutes = require('./routes/medicines');
const patientsRoutes = require('./routes/patients');
const prescriptionsRoutes = require('./routes/prescriptions');
const reportsRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');

const { authenticateToken } = require('./middleware/auth');

// Use routes
app.use('/api/auth', authRoutes); // Public routes

// Protected routes
app.use('/api/medicines', authenticateToken, medicinesRoutes);
app.use('/api/patients', authenticateToken, patientsRoutes);
app.use('/api/prescriptions', authenticateToken, prescriptionsRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);


// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Pharmacy Management System API',
        version: '2.0.0',
        endpoints: {
            auth: '/api/auth',
            medicines: '/api/medicines',
            patients: '/api/patients',
            prescriptions: '/api/prescriptions',
            reports: '/api/reports'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
});
