const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const findFirstExcelFile = (dirPath) => {
  const files = fs.readdirSync(dirPath)
  const excelFiles = files.filter(file => file.endsWith('.xlsx'))
  if (excelFiles.length === 0) {
    throw new Error('No se encontraron archivos Excel en el directorio.')
  }
  return path.join(dirPath, excelFiles[0])
}

const readExcelFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`El archivo ${filePath} no existe.`)
  }

  // Lee el archivo Excel
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0] // Obtén la primera hoja
  const worksheet = workbook.Sheets[sheetName]

  // Convierte la hoja a JSON
  return XLSX.utils.sheet_to_json(worksheet, { header: 1 })
}

const readExcelPricesFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`El archivo ${filePath} no existe.`)
  }

  // Lee el archivo Excel
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0] // Obtén la primera hoja
  const worksheet = workbook.Sheets[sheetName]

  // Convierte la hoja a JSON, ignorando la fila de encabezados
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).slice(1)

  // Convierte cada fila al formato deseado
  return jsonData.map(([code, commerce, price]) => ({
    code,
    commerce,
    price,
    date: new Date().toISOString() // Asigna la fecha actual
  }))
}

const saveAllExcelPricesAsJson = (inputDir, outputFile) => {
  const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.xlsx'))

  if (files.length === 0) {
    throw new Error(`No se encontraron archivos Excel en la carpeta ${inputDir}.`)
  }

  const allData = files.reduce((acc, file) => {
    const filePath = path.join(inputDir, file)
    const data = readExcelPricesFile(filePath)
    return acc.concat(data) // Agrega los datos del archivo al array acumulador
  }, [])

  // Guarda el JSON en el archivo especificado
  const outputDir = path.dirname(outputFile)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2), 'utf-8')
  
  console.log(`Datos guardados exitosamente en ${outputFile}`)
}

module.exports = { findFirstExcelFile, readExcelFile, readExcelPricesFile, saveAllExcelPricesAsJson }
