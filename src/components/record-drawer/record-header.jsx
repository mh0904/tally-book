import { Button, Space } from 'antd'
import { CloseOutlined, UploadOutlined } from '@ant-design/icons'
import { ENTRY_TABS } from './record-options'

const RecordHeader = ({ entryMode, onClose, onEntryModeChange, onImport }) => {
  return (
    <header className="record-header">
      <div className="record-entry-tabs">
        {ENTRY_TABS.map((item) => (
          <button
            className={entryMode === item.key ? 'active' : ''}
            key={item.key}
            onClick={() => onEntryModeChange(item.key)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <Space>
        <Button
          className="record-import-trigger"
          icon={<UploadOutlined />}
          onClick={onImport}
          type="default"
        >
          导入
        </Button>
        <Button
          aria-label="关闭"
          className="record-close"
          icon={<CloseOutlined />}
          onClick={onClose}
          type="text"
        />
      </Space>
    </header>
  )
}

export default RecordHeader
