// multerConfig.js
const multer = require('multer');
const path = require('path');

// Función para crear una configuración de multer con almacenamiento personalizado
const createMulterConfig = (destinationFolder) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Directorio donde se almacenarán los archivos subidos
      cb(null, path.join(__dirname, "..", "public", destinationFolder));
    },
    filename: (req, file, cb) => {
      // Establecer el nombre del archivo subido
      cb(null, file.originalname);
    }
  });

  // Filtrar archivos para permitir solo archivos Excel
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel'), false);
    }
  };

  return multer({ storage, fileFilter });
};

module.exports = createMulterConfig;
