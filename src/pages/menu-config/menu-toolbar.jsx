import { Button, Space } from 'antd'
import {
  BranchesOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

const MenuToolbar = ({
  draftMenu,
  onAddChild,
  onAddParent,
  onReset,
  saving,
  selectedInfo,
  selectedMenu,
}) => {
  return (
    <div className="menu-config-toolbar">
      <Space wrap>
        <Button disabled={saving} icon={<PlusOutlined />} onClick={onAddParent}>
          父级
        </Button>
        <Button
          disabled={
            saving ||
            Boolean(draftMenu) ||
            !selectedMenu ||
            selectedInfo?.depth !== 0
          }
          icon={<BranchesOutlined />}
          onClick={onAddChild}
          type="primary"
        >
          子级
        </Button>
        <Button disabled={saving} icon={<ReloadOutlined />} onClick={onReset}>
          重置
        </Button>
      </Space>
    </div>
  )
}

export default MenuToolbar
