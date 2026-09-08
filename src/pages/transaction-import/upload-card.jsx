import { Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { IMPORT_ACCEPT } from '../../utils/transaction-import'

const createFileList = (file) => {
  if (!file) {
    return []
  }

  return [
    {
      uid: file.uid || file.name,
      name: file.name,
      status: 'done',
    },
  ]
}

const UploadCard = ({ file, onFileRemove, onFileUpload }) => {
  return (
    <div className="transaction-import-content">
      <aside className="transaction-import-label">
        <strong>文件导入：</strong>
      </aside>

      <section className="transaction-import-card">
        <Upload.Dragger
          accept={IMPORT_ACCEPT}
          beforeUpload={onFileUpload}
          fileList={createFileList(file)}
          maxCount={1}
          onRemove={onFileRemove}
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

        {file && (
          <p className="transaction-import-file">已选择：{file.name}</p>
        )}

        <ul className="transaction-import-rules">
          <li>Excel / CSV 字段需包含 ID、日期、类型、分类、金额、描述。</li>
          <li>JSON 需保持导出的月份分组结构。</li>
          <li>导入成功后会自动刷新流水数据。</li>
        </ul>
      </section>
    </div>
  )
}

export default UploadCard
