// src/components/Navbar.js
import { Link } from 'react-router-dom'
import './index.less'
import { useNavigate } from 'react-router-dom'

let linkList = [
  {
    title: '首页',
    link: '/',
  },
  {
    title: '记账记录',
    link: '/transactions',
  },
  {
    title: '添加记录',
    link: '/add',
  },
]

const Navbar = () => {
  const navigate = useNavigate()
  const jumpChange = (item) => {
    navigate(item.link)
  }
  return (
    <nav className="nav-bar">
      {linkList.map((item) => {
        const isActive = location.pathname === item.link
        return (
          <span
            className={isActive ? 'active' : ''}
            onClick={() => jumpChange(item)}
            key={item.link}
          >
            {item.title}
          </span>
        )
      })}
    </nav>
  )
}
export default Navbar
