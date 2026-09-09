import React from 'react'
import { Link } from 'react-router-dom'
import { Line } from '@ant-design/charts'
import {
  CalendarOutlined,
  CreditCardOutlined,
  EyeOutlined,
  PieChartOutlined,
  TagsOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { getAllTransactions } from '../../api/transactions'
import { TRANSACTION_UPDATED_EVENT } from '../../constants/events'
import {
  formatAmount,
  getDailyStats,
  getExpenseStats,
  getLatestTransactionDate,
  getPeriodSummaries,
  summarizeTransactions,
} from '../../utils/book-stats'
import './index.less'

const quickLinks = [
  {
    title: '流水',
    desc: '录入、编辑、筛选账单',
    link: '/transactions',
    icon: <UnorderedListOutlined />,
  },
  {
    title: '报表',
    desc: '查看分类和日支出趋势',
    link: '/chart',
    icon: <PieChartOutlined />,
  },
  {
    title: '收支分类',
    desc: '维护分类标签和自动匹配关键词',
    link: '/category-config',
    icon: <TagsOutlined />,
  },
  {
    title: '成员管理',
    desc: '维护成员角色和菜单权限',
    link: '/user-config',
    icon: <TeamOutlined />,
  },
  {
    title: '账单日历',
    desc: '在日历中查看每天账单总额和明细',
    link: '/bill-calendar',
    icon: <CalendarOutlined />,
  },
]

const periodCards = [
  { key: 'today', icon: <CreditCardOutlined />, title: '今天' },
  { key: 'month', icon: <CalendarOutlined />, title: '本月' },
  { key: 'year', icon: <PieChartOutlined />, title: '本年' },
]

const getCategoryLabelGetter = (transactionCategoryField) => {
  const options = Array.isArray(transactionCategoryField?.options)
    ? transactionCategoryField.options
    : []
  const labelMap = new Map(
    options.map((item) => [item.value, item.label || item.value])
  )

  return (value) => labelMap.get(value) || value || '未分类'
}

const createTrendData = (dailyStats) =>
  dailyStats.flatMap((item) => [
    {
      date: item.day,
      type: '收入',
      value: item.income,
    },
    {
      date: item.day,
      type: '支出',
      value: item.expense,
    },
  ])

const Home = ({
  accessiblePaths = [],
  transactionCategoryField,
  users = [],
}) => {
  const [transactions, setTransactions] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const visibleQuickLinks = accessiblePaths.length
    ? quickLinks.filter((item) => accessiblePaths.includes(item.link))
    : quickLinks

  const fetchTransactions = React.useCallback(async () => {
    setLoading(true)

    try {
      const { code, data } = await getAllTransactions()

      if (code === 200) {
        setTransactions(Array.isArray(data) ? data : [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  React.useEffect(() => {
    window.addEventListener(TRANSACTION_UPDATED_EVENT, fetchTransactions)

    return () => {
      window.removeEventListener(TRANSACTION_UPDATED_EVENT, fetchTransactions)
    }
  }, [fetchTransactions])

  const getCategoryLabel = React.useMemo(
    () => getCategoryLabelGetter(transactionCategoryField),
    [transactionCategoryField]
  )
  const baseDate = React.useMemo(
    () => getLatestTransactionDate(transactions),
    [transactions]
  )
  const periodSummary = React.useMemo(
    () => getPeriodSummaries(transactions, baseDate),
    [baseDate, transactions]
  )
  const monthTransactions = React.useMemo(
    () =>
      transactions.filter((item) => item.date?.startsWith(periodSummary.monthKey)),
    [periodSummary.monthKey, transactions]
  )
  const dailyStats = React.useMemo(
    () => getDailyStats(transactions, periodSummary.monthKey),
    [periodSummary.monthKey, transactions]
  )
  const expenseRanking = React.useMemo(
    () => getExpenseStats(monthTransactions, getCategoryLabel).slice(0, 5),
    [getCategoryLabel, monthTransactions]
  )
  const memberStats = React.useMemo(() => {
    const summary = summarizeTransactions(monthTransactions)
    const activeMembers = users.filter((user) => user.enabled !== false)

    return activeMembers.map((user, index) => ({
      ...user,
      expense: index === 0 ? summary.expense : 0,
      income: index === 0 ? summary.income : 0,
    }))
  }, [monthTransactions, users])
  const trendConfig = React.useMemo(
    () => ({
      data: createTrendData(dailyStats),
      xField: 'date',
      yField: 'value',
      colorField: 'type',
      height: 320,
      scale: {
        color: {
          range: ['#ef5b3f', '#64c6c6'],
        },
      },
      legend: {
        position: 'top',
      },
      smooth: true,
      tooltip: {
        items: [
          {
            field: 'value',
            name: '金额',
            valueFormatter: (value) => `¥${formatAmount(value)}`,
          },
        ],
      },
    }),
    [dailyStats]
  )

  return (
    <div className="home-dashboard">
      <section className="home-hero-grid">
        <div className="asset-card">
          <div className="asset-card-bg" />
          <div className="asset-card-content">
            <span>净资产</span>
            <strong>{formatAmount(periodSummary.year.balance)}</strong>
            <div>
              <em>总资产 {formatAmount(periodSummary.year.income)}</em>
              <em>负债 {formatAmount(periodSummary.year.expense)}</em>
              <EyeOutlined />
            </div>
          </div>
        </div>

        <div className="period-panel page-panel">
          {periodCards.map((item) => {
            const summary = periodSummary[item.key]

            return (
              <div className="period-row" key={item.key}>
                <span className="period-icon">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <em>
                    {item.key === 'today'
                      ? periodSummary.baseDate
                      : item.key === 'month'
                        ? periodSummary.monthKey
                        : periodSummary.monthKey.slice(0, 4)}
                  </em>
                </div>
                <div className="period-amounts">
                  <span>
                    总收入 <b className="income">{formatAmount(summary.income)}</b>
                  </span>
                  <span>
                    总支出 <b className="expense">{formatAmount(summary.expense)}</b>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="home-main-grid">
        <div className="daily-card page-panel">
          <div className="home-card-heading">
            <h3>本月每日收支</h3>
            <span>{loading ? '加载中' : `${periodSummary.month.count} 笔记录`}</span>
          </div>
          <div className="daily-chart">
            <Line {...trendConfig} />
          </div>
        </div>

        <div className="home-side-stack">
          <div className="ranking-card page-panel">
            <div className="home-card-heading">
              <h3>本月各分类支出排行</h3>
              <span>
                记账笔数 {periodSummary.month.count}　总支出{' '}
                {formatAmount(periodSummary.month.expense)}
              </span>
            </div>
            <div className="ranking-list">
              {expenseRanking.length ? (
                expenseRanking.map((item, index) => (
                  <div className="ranking-row" key={item.key}>
                    <span className="ranking-index">{index + 1}</span>
                    <span className="ranking-icon">{item.label.slice(0, 1)}</span>
                    <div className="ranking-main">
                      <div>
                        <strong>{item.label}</strong>
                        <span>{(item.percent * 100).toFixed(2)}%</span>
                        <b>{formatAmount(item.amount)}</b>
                      </div>
                      <i style={{ width: `${Math.max(item.percent * 100, 6)}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="home-empty">本月暂无支出数据</p>
              )}
            </div>
          </div>

          <div className="member-card page-panel">
            <div className="home-card-heading">
              <h3>本月各成员收支</h3>
              <span>{memberStats.length} 位成员</span>
            </div>
            <div className="member-list">
              {memberStats.length ? (
                memberStats.map((member) => (
                  <div className="member-row" key={member.id}>
                    <span className="member-avatar">
                      {(member.name || member.username || '成').slice(0, 1)}
                    </span>
                    <div>
                      <strong>{member.name || member.username}</strong>
                      <em>{member.roleId || '成员'}</em>
                    </div>
                    <div className="member-amounts">
                      <span>收入 {formatAmount(member.income)}</span>
                      <span>支出 {formatAmount(member.expense)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="home-empty">暂无成员</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="home-quick-grid">
        {visibleQuickLinks.map((item) => (
          <Link
            className="home-quick-item page-panel"
            key={item.link}
            to={item.link}
          >
            <span className="home-quick-icon">{item.icon}</span>
            <strong>{item.title}</strong>
            <em>{item.desc}</em>
          </Link>
        ))}
      </section>

    </div>
  )
}

export default Home
