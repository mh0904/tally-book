import { Avatar, Button, Tag } from 'antd'
import {
  LogoutOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons'
import './index.less'

const Profile = ({
  avatarColor,
  avatarText,
  currentRole,
  onLogout,
  userName,
}) => (
  <div className="profile-page">
    <section className="profile-card">
      <Avatar
        className="profile-avatar"
        size={64}
        style={{ backgroundColor: avatarColor }}
      >
        {avatarText}
      </Avatar>
      <div className="profile-info">
        <h2>{userName}</h2>
        <Tag color={currentRole?.id === 'admin' ? 'gold' : 'blue'}>
          {currentRole?.name || '未加载角色'}
        </Tag>
      </div>
    </section>

    <section className="profile-list">
      <div className="profile-list-item">
        <span className="profile-list-icon">
          <UserOutlined />
        </span>
        <span>
          <strong>个人中心</strong>
          <em>查看当前登录账号信息</em>
        </span>
      </div>
      <div className="profile-list-item">
        <span className="profile-list-icon">
          <SafetyOutlined />
        </span>
        <span>
          <strong>角色权限</strong>
          <em>{currentRole?.description || '当前账号权限信息'}</em>
        </span>
      </div>
    </section>

    <Button
      block
      className="profile-logout"
      danger
      icon={<LogoutOutlined />}
      onClick={onLogout}
      size="large"
    >
      退出
    </Button>
  </div>
)

export default Profile
