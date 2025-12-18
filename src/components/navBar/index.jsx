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
    title: '日志',
    link: '/transactions',
  },
  {
    title: '图表',
    link: '/chart',
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
