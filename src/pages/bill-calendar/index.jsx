import React from 'react'
import {
  Button,
  Calendar,
  Empty,
  List,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  FileTextOutlined,
  LeftOutlined,
  RightOutlined,
  RiseOutlined,
  FallOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getAllTransactions } from '../../api/transactions'
import { transactionTypeField } from '../../constants/fields'
import './index.less'

const { Text } = Typography
const DATE_FORMAT = 'YYYY-MM-DD'
const MONTH_FORMAT = 'YYYY-MM'
const INCOME_TYPE = transactionTypeField.options[0]?.value

const createEmptySummary = (date) => ({
  date,
  items: [],
  totalAmount: 0,
  totalExpense: 0,
  totalIncome: 0,
})

const formatAmount = (value) => Number(value || 0).toFixed(2)

const getCategoryLabel = (value, transactionCategoryField) => {
  const categoryOptions = Array.isArray(transactionCategoryField?.options)
    ? transactionCategoryField.options
    : []

  return (
    categoryOptions.find((item) => item.value === value)?.label ||
    value ||
    '未分类'
  )
}

const isIncomeTransaction = (item) => item.type === INCOME_TYPE

const BillCalendar = ({ transactionCategoryField }) => {
  const [loading, setLoading] = React.useState(false)
  const [transactions, setTransactions] = React.useState([])
  const [selectedDate, setSelectedDate] = React.useState(dayjs())

  const selectedMonthKey = React.useMemo(
    () => selectedDate.format(MONTH_FORMAT),
    [selectedDate]
  )
  const selectedMonth = React.useMemo(() => dayjs(selectedMonthKey), [
    selectedMonthKey,
  ])

  const fetchCalendarBills = React.useCallback(async (month) => {
    setLoading(true)

    try {
      const { code, data, msg } = await getAllTransactions({
        month: month.format(MONTH_FORMAT),
      })

      if (code !== 200) {
        throw new Error(msg || '账单数据加载失败')
      }

      setTransactions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('获取账单日历失败:', error)
      message.error(error.message || '获取账单数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCalendarBills(selectedMonth)
  }, [fetchCalendarBills, selectedMonth])

  const dailySummaryMap = React.useMemo(() => {
    return transactions.reduce((summaryMap, item) => {
      const date = item.date

      if (!date) {
        return summaryMap
      }

      if (!summaryMap[date]) {
        summaryMap[date] = createEmptySummary(date)
      }

      const amount = Number(item.amount || 0)
      summaryMap[date].items.push(item)
      summaryMap[date].totalAmount += amount

      if (isIncomeTransaction(item)) {
        summaryMap[date].totalIncome += amount
      } else {
        summaryMap[date].totalExpense += amount
      }

      return summaryMap
    }, {})
  }, [transactions])

  const monthSummary = React.useMemo(() => {
    return transactions.reduce(
      (summary, item) => {
        const amount = Number(item.amount || 0)

        if (isIncomeTransaction(item)) {
          summary.totalIncome += amount
        } else {
          summary.totalExpense += amount
        }

        summary.totalAmount += amount
        summary.count += 1
        return summary
      },
      {
        count: 0,
        totalAmount: 0,
        totalExpense: 0,
        totalIncome: 0,
      }
    )
  }, [transactions])

  const selectedDateKey = selectedDate.format(DATE_FORMAT)
  const selectedSummary =
    dailySummaryMap[selectedDateKey] || createEmptySummary(selectedDateKey)
  const summaryCards = [
    {
      className: 'income',
      icon: <RiseOutlined />,
      label: '本月收入',
      value: `+${formatAmount(monthSummary.totalIncome)}`,
    },
    {
      className: 'expense',
      icon: <FallOutlined />,
      label: '本月支出',
      value: `-${formatAmount(monthSummary.totalExpense)}`,
    },
    {
      className: 'count',
      icon: <FileTextOutlined />,
      label: '账单笔数',
      value: monthSummary.count,
    },
    {
      className: 'total',
      icon: <WalletOutlined />,
      label: '本月总额',
      value: formatAmount(monthSummary.totalAmount),
    },
  ]
  const sortedSelectedItems = React.useMemo(
    () =>
      [...selectedSummary.items].sort(
        (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)
      ),
    [selectedSummary.items]
  )

  const handlePanelChange = (date) => {
    setSelectedDate(date)
  }

  const handleSelect = (date) => {
    setSelectedDate(date)
  }

  const renderCalendarHeader = ({ value, onChange }) => {
    const changeCalendarDate = (amount, unit) => {
      const nextDate = value.add(amount, unit)
      onChange(nextDate)
      setSelectedDate(nextDate)
    }

    return (
      <div className="calendar-custom-header">
        <Space size={6}>
          <Button
            icon={<DoubleLeftOutlined />}
            onClick={() => changeCalendarDate(-1, 'year')}
            title="上一年"
            type="text"
          />
          <Button
            icon={<LeftOutlined />}
            onClick={() => changeCalendarDate(-1, 'month')}
            title="上一月"
            type="text"
          />
        </Space>
        <strong>{value.format('YYYY年MM月')}</strong>
        <Space size={6}>
          <Button
            icon={<RightOutlined />}
            onClick={() => changeCalendarDate(1, 'month')}
            title="下一月"
            type="text"
          />
          <Button
            icon={<DoubleRightOutlined />}
            onClick={() => changeCalendarDate(1, 'year')}
            title="下一年"
            type="text"
          />
        </Space>
      </div>
    )
  }

  const renderDateCell = (date, info) => {
    if (info.type !== 'date') {
      return info.originNode
    }

    const dateKey = date.format(DATE_FORMAT)
    const summary = dailySummaryMap[dateKey]
    const isSelected = date.isSame(selectedDate, 'day')
    const isToday = date.isSame(dayjs(), 'day')
    const isCurrentMonth = date.isSame(selectedMonth, 'month')

    return (
      <div
        className={[
          'calendar-day-cell',
          isSelected ? 'selected' : '',
          isToday ? 'today' : '',
          !isCurrentMonth ? 'muted' : '',
          summary?.items.length ? 'has-bills' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="calendar-day-top">
          <span>{date.date()}</span>
          {summary?.items.length > 0 && (
            <Tag className="calendar-day-count" color="blue">
              {summary.items.length}笔
            </Tag>
          )}
        </div>
        {summary ? (
          <div className="calendar-day-money">
            <strong>{formatAmount(summary.totalAmount)}</strong>
          </div>
        ) : (
          <span className="calendar-day-empty">无记录</span>
        )}
      </div>
    )
  }

  return (
    <div className="bill-calendar-page">
      <div className="bill-calendar-summary">
        {summaryCards.map((item) => (
          <section
            className={['summary-item', 'page-panel', item.className]
              .filter(Boolean)
              .join(' ')}
            key={item.label}
          >
            <span className="summary-icon">{item.icon}</span>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          </section>
        ))}
      </div>

      <Spin spinning={loading}>
        <div className="bill-calendar-layout">
          <section className="bill-calendar-board page-panel">
            <Calendar
              cellRender={renderDateCell}
              fullscreen
              headerRender={renderCalendarHeader}
              onPanelChange={handlePanelChange}
              onSelect={handleSelect}
              value={selectedDate}
            />
          </section>

          <aside className="bill-day-detail page-panel">
            <div className="detail-heading">
              <div>
                <h3>{selectedDate.format('YYYY年MM月DD日')}</h3>
                <span>{selectedDate.format('dddd')}</span>
              </div>
              <Tag color={selectedSummary.items.length ? 'blue' : 'default'}>
                {selectedSummary.items.length} 笔
              </Tag>
            </div>

            <div className="detail-total">
              <div>
                <span>总额</span>
                <strong>{formatAmount(selectedSummary.totalAmount)}</strong>
              </div>
              <div>
                <span>收入</span>
                <strong className="income">
                  +{formatAmount(selectedSummary.totalIncome)}
                </strong>
              </div>
              <div>
                <span>支出</span>
                <strong className="expense">
                  -{formatAmount(selectedSummary.totalExpense)}
                </strong>
              </div>
            </div>

            {sortedSelectedItems.length ? (
              <List
                className="bill-detail-list"
                dataSource={sortedSelectedItems}
                renderItem={(item) => {
                  const income = isIncomeTransaction(item)

                  return (
                    <List.Item className="bill-detail-item">
                      <div className="detail-item-main">
                        <Tag color={income ? 'success' : 'error'}>
                          {getCategoryLabel(
                            item.classification,
                            transactionCategoryField
                          )}
                        </Tag>
                        <div>
                          <Text strong>{item.describe || '未填写描述'}</Text>
                          <span>{income ? '收入' : '支出'}</span>
                        </div>
                      </div>
                      <Text
                        className={income ? 'income-text' : 'expense-text'}
                        strong
                      >
                        {income ? '+' : '-'}
                        {formatAmount(item.amount)}
                      </Text>
                    </List.Item>
                  )
                }}
              />
            ) : (
              <Empty description="当天暂无账单" />
            )}
          </aside>
        </div>
      </Spin>
    </div>
  )
}

export default BillCalendar
