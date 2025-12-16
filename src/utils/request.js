import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api', // 与代理配置的前缀一致（对应后端接口地址）
  timeout: 5000, // 请求超时时间（5秒）
  headers: {
    'Content-Type': 'application/json', // 默认请求头
    Accept: 'application/json',
  },
  transformRequest: [(data) => JSON.stringify(data)],
})

// 请求拦截器（发送请求前处理）
request.interceptors.request.use(
  (config) => {
    console.log('请求体:', config.data)
    // 可在此添加 token 等公共参数
    // 例如：config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config
  },
  (error) => {
    // 请求错误处理
    console.error('请求拦截错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器（接收响应后处理）
request.interceptors.response.use(
  (response) => {
    // 只返回响应体中的 data 部分
    return response.data
  },
  (error) => {
    // 统一错误处理
    let errorMsg = '请求失败，请稍后重试'
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 404:
          errorMsg = '接口不存在'
          break
        case 500:
          errorMsg = '服务器内部错误'
          break
        case 400:
          errorMsg = '请求参数错误'
          break
        default:
          errorMsg = `请求错误（${error.response.status}）`
      }
    } else if (error.request) {
      // 请求已发送但无响应
      errorMsg = '网络异常，无法连接服务器'
    }
    console.error('响应错误：', errorMsg)
    alert(errorMsg) // 可根据需求替换为 UI 组件提示
    return Promise.reject(error)
  }
)

export default request
