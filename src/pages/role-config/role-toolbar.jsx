import { Button, Space } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'

const RoleToolbar = ({ onAdd, onReset, saving }) => {
  return (
    <div className="role-config-toolbar">
      <Space wrap>
        <Button
          disabled={saving}
          icon={<PlusOutlined />}
          onClick={onAdd}
          type="primary"
        >
          新增
        </Button>
        <Button disabled={saving} icon={<ReloadOutlined />} onClick={onReset}>
          重置
        </Button>
      </Space>
    </div>
  )
}

export default RoleToolbar
