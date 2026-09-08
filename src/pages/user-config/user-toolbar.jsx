import { Link } from 'react-router-dom'
import { Button, Checkbox, Space } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'

const UserToolbar = ({
  onAdd,
  onReset,
  onShowHiddenChange,
  saving,
  showHidden,
}) => {
  return (
    <div className="user-config-toolbar">
      <Space wrap>
        <Button
          disabled={saving}
          icon={<PlusOutlined />}
          onClick={onAdd}
          type="primary"
        >
          邀请
        </Button>
        <Link to="/role-config">
          <Button>角色管理</Button>
        </Link>
        <Checkbox
          checked={showHidden}
          onChange={(event) => onShowHiddenChange(event.target.checked)}
        >
          显示已隐藏的成员
        </Checkbox>
        <Button disabled={saving} icon={<ReloadOutlined />} onClick={onReset}>
          重置
        </Button>
      </Space>
    </div>
  )
}

export default UserToolbar
