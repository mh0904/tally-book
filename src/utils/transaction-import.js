import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const DATE_FORMAT = 'YYYY-MM-DD'

export const IMPORT_ACCEPT =
  '.json,.xls,.xlsx,.csv,application/json,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const getFileName = (file) => String(file?.name || '').toLowerCase()

export const isJsonFile = (file) =>
  file?.type === 'application/json' || getFileName(file).endsWith('.json')

export const isExcelFile = (file) =>
  getFileName(file).endsWith('.xlsx') || getFileName(file).endsWith('.xls')

export const isCsvFile = (file) => getFileName(file).endsWith('.csv')

export const isImportFile = (file) =>
  isJsonFile(file) || isExcelFile(file) || isCsvFile(file)

const normalizeSheetDate = (value) => {
  if (!value) {
    return ''
  }

  if (value instanceof Date) {
    return dayjs(value).format(DATE_FORMAT)
  }

  if (typeof value === 'number') {
    const parsedDate = XLSX.SSF.parse_date_code(value)

    if (parsedDate) {
      return dayjs(
        `${parsedDate.y}-${String(parsedDate.m).padStart(2, '0')}-${String(
          parsedDate.d
        ).padStart(2, '0')}`
      ).format(DATE_FORMAT)
    }
  }

  return String(value).trim()
}

const createImportDataFromSheet = (sheetData) => {
  return sheetData.reduce((formattedData, item) => {
    if (item.ID === 'ID' || item.ID === undefined) {
      return formattedData
    }

    const date = normalizeSheetDate(item['日期'])

    if (!date) {
      return formattedData
    }

    const monthKey = date.slice(0, 7)

    if (!formattedData[monthKey]) {
      formattedData[monthKey] = { transactions: [] }
    }

    formattedData[monthKey].transactions.push({
      id: item.ID,
      date,
      type: item['类型'],
      classification: item['分类'],
      amount: item['金额'],
      describe: item['描述'],
    })

    return formattedData
  }, {})
}

const parseSheetData = (content, readType) => {
  const workbook = XLSX.read(content, { type: readType })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const sheetData = XLSX.utils.sheet_to_json(worksheet)

  return createImportDataFromSheet(sheetData)
}

export const readImportFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('文件读取失败'))

    if (isJsonFile(file)) {
      reader.onload = (event) => {
        try {
          resolve(JSON.parse(event.target?.result || '{}'))
        } catch (error) {
          reject(new Error('JSON 文件格式错误'))
        }
      }
      reader.readAsText(file)
      return
    }

    if (isCsvFile(file)) {
      reader.onload = (event) => {
        try {
          resolve(parseSheetData(event.target?.result || '', 'string'))
        } catch (error) {
          reject(new Error('CSV 文件格式错误'))
        }
      }
      reader.readAsText(file)
      return
    }

    reader.onload = (event) => {
      try {
        resolve(parseSheetData(event.target?.result, 'array'))
      } catch (error) {
        reject(new Error('Excel 文件格式错误'))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

export const hasImportItems = (data) => {
  return Object.values(data || {}).some(
    (monthData) =>
      Array.isArray(monthData?.transactions) && monthData.transactions.length
  )
}
