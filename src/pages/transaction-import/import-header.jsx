import { Button } from 'antd'
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons'

const ImportHeader = ({ disabled, importing, onBack, onImport }) => {
  return (
    <header className="transaction-import-header">
      <div className="transaction-import-title">
        <button
          aria-label="返回流水"
          className="transaction-import-back"
          onClick={onBack}
          type="button"
        >
          <ArrowLeftOutlined />
        </button>
        <strong>数据导入</strong>
      </div>
      <Button
        className="transaction-import-submit"
        disabled={disabled}
        icon={<UploadOutlined />}
        loading={importing}
        onClick={onImport}
        type="primary"
      >
        导入记录
      </Button>
    </header>
  )
}

export default ImportHeader
