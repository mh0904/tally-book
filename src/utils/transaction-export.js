import * as XLSX from 'xlsx'

const COLUMN_WIDTHS = [
  { wch: 20 },
  { wch: 15 },
  { wch: 10 },
  { wch: 15 },
  { wch: 15 },
  { wch: 50 },
]

const mapTransactionsToSheetRows = (transactions) =>
  transactions.map((item) => ({
    ID: item.id,
    日期: item.date,
    类型: item.type,
    分类: item.classification,
    金额: item.amount,
    描述: item.describe,
  }))

const centerCells = (worksheet) => {
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  const centerAlignment = {
    alignment: {
      horizontal: 'center',
      vertical: 'center',
    },
  }

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let column = range.s.c; column <= range.e.c; column += 1) {
      const cellAddress = XLSX.utils.encode_cell({ c: column, r: row })

      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { v: '' }
      }

      worksheet[cellAddress].s = centerAlignment
    }
  }
}

export const downloadTransactions = (transactions) => {
  const worksheet = XLSX.utils.json_to_sheet(
    mapTransactionsToSheetRows(transactions)
  )
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, '交易记录')
  worksheet['!cols'] = COLUMN_WIDTHS
  centerCells(worksheet)

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
