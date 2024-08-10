const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const { getAllProducts, getFilteredProducts } = require("../db");
const {
  readExcelFilesAndUpdateJsonProducts,
} = require("../utils/loadProducts");

// Ruta del archivo JSON
const jsonPath = path.join(process.cwd(), "public", "data", "products.json");

// Endpoint para obtener todos los productos
router.get("/products/findAll", (req, res) => {
  getAllProducts((err, products) => {
    if (err) {
      res.status(500).json({ error: "Error fetching products" });
    } else {
      res.json(products);
    }
  });
});

router.get("/products/load", (req, res) => {
  readExcelFilesAndUpdateJsonProducts()
    .then((products) => {
      res.status(200).json({ message: "Products loaded successfully" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Error loading products", message: error.message });
    });
});

// router.post("/products/filter", (req, res) => {
//   const { hasPrices, page = 1, limit = 10, nameFilter, codeFilter, familyFilter } = req.body;
//   // console.log('hasPrices:', hasPrices);

//   getFilteredProducts({ hasPrices, nameFilter, codeFilter, familyFilter }, (err, products, totalPages) => {
//       if (err) {
//           res.status(500).json({ error: "Error fetching filtered products" });
//       } else {
//           res.json({ products, totalPages });
//       }
//   });
// });

router.post("/products/filter", (req, res) => {
  const { hasPrices, page = 1, limit = 10, nameFilter, codeFilter, familyFilter } = req.body;
  
  // Obtener todos los productos filtrados
  getFilteredProducts({ hasPrices, nameFilter, codeFilter, familyFilter }, (err, allProducts) => {
      if (err) {
          res.status(500).json({ error: "Error fetching filtered products" });
          return;
      }

      // Calcular el total de páginas
      const totalCount = allProducts.length;
      const totalPages = Math.ceil(totalCount / limit);

      // Obtener los productos de la página actual
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const products = allProducts.slice(startIndex, endIndex);

      res.json({
          products,
          totalPages,
          totalCount
      });
  });
});




module.exports = router;
