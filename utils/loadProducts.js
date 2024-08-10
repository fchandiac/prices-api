const fs = require("fs").promises;
const path = require("path");
const Excel = require("exceljs");

const productsDir = path.join(__dirname, "..", "public", "products");
const productsJsonPath = path.join(__dirname, "..", "public", "data", "products.json");

const findFirstExcelFile = async (dirPath) => {
  try {
    const files = await fs.readdir(dirPath);
    const excelFiles = files.filter(file => file.endsWith('.xlsx'));
    if (excelFiles.length === 0) {
      return null;
    }
    return path.join(dirPath, excelFiles[0]);
  } catch (err) {
    console.error('Error finding Excel files:', err);
    throw err;
  }
};

async function readExcelFilesAndUpdateJsonProducts() {
  let allData = [];
  try {
    // Clear the JSON file before updating it
    await fs.writeFile(productsJsonPath, JSON.stringify([], null, 2));
    console.log("The JSON file has been emptied.");

    // Find the first Excel file in the directory
    const filePath = await findFirstExcelFile(productsDir);

    if (!filePath) {
      console.log('No Excel files found.');
      return;
    }

    console.log("Excel file found:", filePath);

    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filePath);
    console.log("Excel file read successfully.");

    const worksheet = workbook.worksheets[0];
    const headers = worksheet.getRow(1).values.slice(1, 19); // Column A (1) to R (18)

    // Process rows in the Excel file
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const item = {};
      headers.forEach((header, index) => {
        item[header] = row.getCell(index + 1).value;
      });

      allData.push(item);
    });

    // Write updated data to the JSON file
    await fs.writeFile(productsJsonPath, JSON.stringify(allData, null, 2));
    console.log("Data updated in the JSON file.");

  } catch (err) {
    console.error("Error reading or updating product data:", err);
    throw err;
  } 

  return allData;
}

module.exports = { readExcelFilesAndUpdateJsonProducts };


