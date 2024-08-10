const fs = require('fs').promises;
const path = require('path');
const xlsx = require('xlsx');
const moment = require('moment');

const pricesDir = path.join(__dirname, '..', 'public', 'prices');
const pricesJsonPath = path.join(__dirname, '..', 'public', 'data', 'prices.json');

// Base date in Excel (30-Dec-1899)
const EXCEL_BASE_DATE = moment('1899-12-30');

async function readExcelFilesAndUpdateJsonPrices() {
    try {
        // Vaciar el archivo JSON existente
        await fs.writeFile(pricesJsonPath, JSON.stringify([], null, 2));

        // Leer todos los archivos en la carpeta de precios
        const files = await fs.readdir(pricesDir);

        // Filtrar los archivos para obtener solo los .xlsx
        const excelFiles = files.filter(file => path.extname(file).toLowerCase() === '.xlsx');

        let allData = [];

        // Procesar cada archivo Excel
        for (const file of excelFiles) {
            const filePath = path.join(pricesDir, file);
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0]; // Solo usa la primera hoja
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);

            jsonData.forEach(item => {
                const formattedItem = {
                    code: String(item.code || '').replace(/^(\d+)([^\d]*)$/, '$1'), // Eliminar notación científica si existe
                    commerce: String(item.commerce || '').trim(),
                    price: parseInt(item.price, 10) || 0,
                    date: formatDate(item.date || ''),
                };

                allData.push(formattedItem);
            });
        }

        // Escribir los datos actualizados en el archivo JSON
        await fs.writeFile(pricesJsonPath, JSON.stringify(allData, null, 2));

        return allData;
    } catch (err) {
        console.error('Error reading or updating prices data:', err);
        throw err;
    }
}

function formatDate(dateNum) {
    if (typeof dateNum === 'number') {
        // Convertir el número de serie de Excel en una fecha
        const date = EXCEL_BASE_DATE.clone().add(Math.floor(dateNum), 'days');
        return date.format('DD-MM-YYYY');
    }
    console.error('Invalid date format:', dateNum);
    return ''; // O una fecha por defecto si prefieres
}

module.exports = { readExcelFilesAndUpdateJsonPrices };
