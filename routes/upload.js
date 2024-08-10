const express = require("express");
const router = express.Router();
const createMulterConfig = require("../utils/multerConfig"); // Ajusta la ruta según sea necesario
const path = require("path");
const fs = require("fs").promises;

// Función para eliminar todos los archivos de un directorio
const clearDirectory = async (directoryPath) => {
  try {
    const files = await fs.readdir(directoryPath);
    const deletePromises = files.map((file) => fs.unlink(path.join(directoryPath, file)));
    await Promise.all(deletePromises);
  } catch (err) {
    throw new Error(`Failed to clear directory: ${err.message}`);
  }
};

// Ruta para limpiar la carpeta "products"
router.post('/clear/products', async (req, res) => {
  try {
    const productsDir = path.join(__dirname, "..", "public", "products");
    console.log("Directorio de productos:", productsDir);

    // Limpiar todos los archivos en la carpeta "products"
    await clearDirectory(productsDir);

    res.status(200).json({
      message: "Carpeta products limpiada con éxito.",
    });
  } catch (err) {
    console.error("Error al limpiar la carpeta:", err);
    res.status(500).json({ message: "Error al limpiar la carpeta products.", error: err.message });
  }
});

// Ruta para subir archivos a la carpeta "prices"
router.post(
  "/upload/prices",
  createMulterConfig("prices").single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se ha subido ningún archivo." });
      }
      res.status(200).json({
        message: "Archivo subido y procesado con éxito en la carpeta prices.",
      });
    } catch (err) {
      console.error("Error al procesar el archivo:", err);
      res.status(500).json({ message: "Error al procesar el archivo.", error: err.message });
    }
  }
);

// Ruta para subir archivos a la carpeta "products"
router.post(
  "/upload/products",
  createMulterConfig("products").single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se ha subido ningún archivo." });
      }

      res.status(200).json({
        message: "Archivo subido y procesado con éxito en la carpeta products.",
      });
    } catch (err) {
      console.error("Error al procesar el archivo:", err);
      res.status(500).json({ message: "Error al procesar el archivo.", error: err.message });
    }
  }
);

module.exports = router;
