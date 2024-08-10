const express = require('express');
const router = express.Router();
const { resetPricesTable, resetProductsTable } = require('../db');

// Endpoint para reiniciar la base de datos y recargar prices.json
router.get('/db/reset', async (req, res) => {
    try {
        await resetProductsTable();
        await resetPricesTable();
        res.status(200).json({ message: 'Database tables reset successfully.' });
    } catch (error) {
        console.error('Failed to reset database tables:', error);
        res.status(500).json({ message: 'Failed to reset database tables.', error: error.message });
    }
});


module.exports = router;


module.exports = router;
