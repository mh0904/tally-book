import React from 'react'
import { Button, Upload, message } from 'antd'
import {
  ArrowLeftOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { importTransactions } from '../../api/transactions'
import './index.less'

const DATE_FORMAT = 'YYYY-MM-DD'
const IMPORT_ACCEPT =
  '.json,.xls,.xlsx,.csv,application/json,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const getFileName = (file) => String(file?.name || '').toLowerCase()

const getIsJsonFile = (file) =>
  file?.type === 'application/json' || getFileName(file).endsWith('.json')

const getIsExcelFile = (file) =>
  getFileName(file).endsWith('.xlsx') || getFileName(file).endsWith('.xls')

const getIsCsvFile = (file) => getFileName(file).endsWith('.csv')

const normalizeExcelDate = (value) => {
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

    const date = normalizeExcelDate(item['日期'])

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

const readImportFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('文件读取失败'))

    if (getIsJsonFile(file)) {
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

    if (getIsCsvFile(file)) {
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

const getHasImportItems = (data) => {
  return Object.values(data || {}).some(
    (monthData) =>
      Array.isArray(monthData?.transactions) && monthData.transactions.length
  )
}

const TransactionImport = ({ onImported }) => {
  const navigate = useNavigate()
  const [importFile, setImportFile] = React.useState(null)
  const [importing, setImporting] = React.useState(false)
  const importStep = importing ? 2 : importFile ? 1 : 0

  const handleBack = () => {
    navigate('/transactions')
  }

  const handleFileUpload = (file) => {
    if (!getIsJsonFile(file) && !getIsExcelFile(file) && !getIsCsvFile(file)) {
      message.error('请选择 JSON、Excel 或 CSV 文件')
      return false
    }

    setImportFile(file)
    return false
  }

  const handleImport = async () => {
    if (!importFile) {
      message.error('请选择要导入的文件')
      return
    }

    setImporting(true)

    try {
      const importData = await readImportFile(importFile)

      if (
        !importData ||
        typeof importData !== 'object' ||
        Array.isArray(importData) ||
        !getHasImportItems(importData)
      ) {
        throw new Error('没有读取到可导入的数据')
      }

      const response = await importTransactions(importData)

      if (response.code !== 200) {
        throw new Error(response.msg || '数据导入失败')
      }

      message.success(response.msg || '导入成功')
      setImportFile(null)
      onImported?.()
    } catch (error) {
      message.error(error?.message || '数据导入失败')
    } finally {
      setImporting(false)
    }
  }

  return (
    <section className="transaction-import page-panel">
      <header className="transaction-import-header">
        <div className="transaction-import-title">
          <button
            aria-label="返回流水"
            className="transaction-import-back"
            onClick={handleBack}
            type="button"
          >
            <ArrowLeftOutlined />
          </button>
          <strong>数据导入</strong>
        </div>
        <Button
          className="transaction-import-submit"
          disabled={!importFile}
          icon={<UploadOutlined />}
          loading={importing}
          onClick={handleImport}
          type="primary"
        >
          导入记录
        </Button>
      </header>

      <div className="transaction-import-body">
        <div className="transaction-import-steps">
          {['上传文件', '校验数据', '导入数据'].map((item, index) => (
            <div
              className={[
                'transaction-import-step',
                importStep >= index ? 'active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={item}
            >
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>

        <div className="transaction-import-content">
          <aside className="transaction-import-label">
            <strong>文件导入：</strong>
          </aside>

          <section className="transaction-import-card">
            <Upload.Dragger
              accept={IMPORT_ACCEPT}
              beforeUpload={handleFileUpload}
              fileList={
                importFile
                  ? [
                      {
                        uid: importFile.uid || importFile.name,
                        name: importFile.name,
                        status: 'done',
                      },
                    ]
                  : []
              }
              maxCount={1}
              onRemove={() => {
                setImportFile(null)
                return true
              }}
            >
              <p className="transaction-import-icon">
                <InboxOutlined />
              </p>
              <p className="transaction-import-main-text">
                将文件拖到此处，或点击上传
              </p>
              <p className="transaction-import-sub-text">
                支持 JSON、Excel 和 CSV 格式文件
              </p>
            </Upload.Dragger>

            {importFile && (
              <p className="transaction-import-file">
                已选择：{importFile.name}
              </p>
            )}

            <ul className="transaction-import-rules">
              <li>Excel / CSV 字段需包含 ID、日期、类型、分类、金额、描述。</li>
              <li>JSON 需保持导出的月份分组结构。</li>
              <li>导入成功后会自动刷新流水数据。</li>
            </ul>
          </section>
        </div>
      </div>
    </section>
  )
}

export default TransactionImport
