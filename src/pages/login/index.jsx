import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input, message } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import './index.less'

const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD = 'admin'

const Login = ({ onLogin }) => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = location.state?.from?.pathname || '/'

  const handleFinish = (values) => {
    if (
      values.username === DEFAULT_USERNAME &&
      values.password === DEFAULT_PASSWORD
    ) {
      onLogin(values.username)
      message.success('登录成功')
      navigate(fromPath, { replace: true })
      return
    }

    message.error('账号或密码错误')
    form.setFieldsValue({ password: '' })
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <div className="login-mark">T</div>
          <div>
            <h1>Tally Book</h1>
            <span>账本后台</span>
          </div>
        </div>

        <Form
          autoComplete="off"
          className="login-form"
          form={form}
          initialValues={{ username: DEFAULT_USERNAME }}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input
              autoFocus
              placeholder="admin"
              prefix={<UserOutlined />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              placeholder="admin"
              prefix={<LockOutlined />}
              size="large"
            />
          </Form.Item>

          <Button block htmlType="submit" size="large" type="primary">
            登录
          </Button>
        </Form>
      </section>
    </main>
  )
}

export default Login
