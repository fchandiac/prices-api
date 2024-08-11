const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { getAllPrices, getUniqueCommerces, getPricesByProductCode, initializeDatabase } = require('../db');
const { readExcelFilesAndUpdateJsonPrices } = require('../utils/loadPrices');

// Ruta para agregar un nuevo elemento al JSON
router.post("/prices/addItem", (req, res) => {
    const { code, commerce, price } = req.body;
    const filePath = path.join(__dirname, '..', 'public', 'data', 'prices.json');

    if (!code || !commerce || !price) {
        console.log('Faltan parámetros requeridos');
        return res.status(400).json({ message: 'Faltan parámetros requeridos' });
       
    }
    const codeStr = code.toString();

    const newItem = {
        codeStr,
        commerce,
        price,
        date: new Date().toISOString() // Fecha actual en formato ISO
    };

    console.log('Nuevo elemento:', newItem);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.log('Error al leer el archivo');
            return res.status(500).json({ message: 'Error al leer el archivo' });
        }

        let prices;
        try {
            prices = JSON.parse(data);
            if (!Array.isArray(prices)) {
                console.log('Formato de archivo JSON inválido');
                return res.status(500).json({ message: 'Formato de archivo JSON inválido' });

            }
        } catch (parseErr) {
            console.log('Error al parsear el archivo JSON');
            return res.status(500).json({ message: 'Error al parsear el archivo JSON' });
        }

        // Agrega el nuevo elemento al array de precios
        prices.push(newItem);

        fs.writeFile(filePath, JSON.stringify(prices, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error al escribir en el archivo' });
            }
            res.status(200).json({ message: 'Elemento agregado correctamente', data: newItem });
        });
    });
});

// Endpoint para obtener todos los precios
router.get('/prices/findAll', (req, res) => {
    getAllPrices((err, prices) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching prices.', error: err.message });
        }
        res.status(200).json(prices);
    });
});

router.get('/prices/commerces', (req, res) => {
    getUniqueCommerces((err, commerces) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching commerces.', error: err.message });
        }
        res.status(200).json(commerces);
    });
});

router.get('/prices/load', (req, res) => {

    readExcelFilesAndUpdateJsonPrices()
        .then((prices) => {
            res.status(200).json({ message: 'Prices loaded successfully' });
            
            initializeDatabase((err) => {
                if (err) {
                    console.error('Database initialization failed.');
                } else {
                    console.log('Database initialized successfully.');
                }
            }
            );
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error loading prices', message: error.message });
        });
})


router.post('/prices/findAllByProduct', (req, res) => {
    const { id_mcodbarra } = req.body;
    // console.log('id_mcodbarra:', id_mcodbarra);



    if (!id_mcodbarra) {
        return res.status(400).json({ error: 'The id_mcodbarra field is required.' });
    }

    getPricesByProductCode(id_mcodbarra, (err, prices) => {
        if (err) {
            console.error('Error fetching prices:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (prices.length === 0) {
            return res.status(404).json({ message: 'No prices found for the given product code.' });
        }

        res.json(prices);
    });
});



module.exports = router;
