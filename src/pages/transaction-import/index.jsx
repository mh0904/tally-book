import React from 'react'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { importTransactions } from '../../api/transactions'
import {
  hasImportItems,
  isImportFile,
  readImportFile,
} from '../../utils/transaction-import'
import ImportHeader from './import-header'
import ImportSteps from './import-steps'
import UploadCard from './upload-card'
import './index.less'

const TransactionImport = ({ onImported }) => {
  const navigate = useNavigate()
  const [importFile, setImportFile] = React.useState(null)
  const [importing, setImporting] = React.useState(false)
  const importStep = importing ? 2 : importFile ? 1 : 0

  const handleBack = () => {
    navigate('/transactions')
  }

  const handleFileUpload = (file) => {
    if (!isImportFile(file)) {
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
        !hasImportItems(importData)
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
      <ImportHeader
        disabled={!importFile}
        importing={importing}
        onBack={handleBack}
        onImport={handleImport}
      />

      <div className="transaction-import-body">
        <ImportSteps activeStep={importStep} />
        <UploadCard
          file={importFile}
          onFileRemove={() => {
            setImportFile(null)
            return true
          }}
          onFileUpload={handleFileUpload}
        />
      </div>
    </section>
  )
}

export default TransactionImport
