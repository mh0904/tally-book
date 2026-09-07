import { Link } from 'react-router-dom'
import {
  CalendarOutlined,
  CompassOutlined,
  PieChartOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import './index.less'

const discoverItems = [
  {
    title: '月度账单',
    desc: '按月份查看收入、支出和结余',
    path: '/bill-calendar',
    icon: <CalendarOutlined />,
  },
  {
    title: '支出趋势',
    desc: '快速查看分类占比和趋势变化',
    path: '/chart',
    icon: <PieChartOutlined />,
  },
  {
    title: '账单明细',
    desc: '回到流水列表筛选具体记录',
    path: '/transactions',
    icon: <UnorderedListOutlined />,
  },
]

const Discover = () => (
  <div className="discover-page">
    <section className="discover-hero">
      <span className="discover-hero-icon">
        <CompassOutlined />
      </span>
      <div>
        <h2>发现</h2>
        <p>把常用账本视图放在这里，移动端查看更顺手。</p>
      </div>
    </section>

    <section className="discover-list">
      {discoverItems.map((item) => (
        <Link className="discover-item" key={item.path} to={item.path}>
          <span className="discover-item-icon">{item.icon}</span>
          <span>
            <strong>{item.title}</strong>
            <em>{item.desc}</em>
          </span>
        </Link>
      ))}
    </section>
  </div>
)

export default Discover
