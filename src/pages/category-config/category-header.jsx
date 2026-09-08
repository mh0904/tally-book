import { Button, Space } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'

const CategoryHeader = ({ onAdd, onReset, saving }) => {
  return (
    <div className="category-config-header">
      <div>
        <h2>收支分类管理</h2>
        <span>维护分类、关键词、默认项和启用状态</span>
      </div>
      <Space wrap>
        <Button disabled={saving} icon={<ReloadOutlined />} onClick={onReset}>
          重置
        </Button>
        <Button
          disabled={saving}
          icon={<PlusOutlined />}
          onClick={onAdd}
          type="primary"
        >
          新增
        </Button>
      </Space>
    </div>
  )
}

export default CategoryHeader
