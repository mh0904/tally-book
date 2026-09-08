import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input, message } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import React from 'react'
import { login as loginUser } from '../../api/users'
import './index.less'

const DEFAULT_USERNAME = 'admin'

const Login = ({ onLogin }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = location.state?.from?.pathname || '/'

  const handleFinish = async (values) => {
    setLoading(true)

    try {
      const { code, data, msg } = await loginUser(values)

      if (code !== 200) {
        throw new Error(msg || '登录失败')
      }

      onLogin(data)
      message.success(msg || '登录成功')
      navigate(fromPath, { replace: true })
      return
    } catch (error) {
      message.error(error.message || '账号或密码错误')
      form.setFieldsValue({ password: '' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <div className="login-mark">考</div>
          <div>
            <h1>考拉记账</h1>
            <span>家庭账本后台</span>
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

          <Button
            block
            htmlType="submit"
            loading={loading}
            size="large"
            type="primary"
          >
            登录
          </Button>
        </Form>
      </section>
    </main>
  )
}

export default Login
