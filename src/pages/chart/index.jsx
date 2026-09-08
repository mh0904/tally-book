import React, { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Empty, Segmented, Spin } from 'antd'
import { Line, Pie } from '@ant-design/charts'
import {
  AppstoreOutlined,
  ExportOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getAllTransactions } from '../../api/transactions'
import {
  formatAmount,
  getDailyStats,
  getExpenseStats,
  getIncomeStats,
  summarizeTransactions,
} from '../../utils/book-stats'
import './index.less'

const reportTabs = ['基础统计', '分类', '账户', '成员', '项目', '商家']
const defaultMonth = '2025-09'
const chartColors = ['#ff9a3d', '#f58220', '#64c6c6', '#819cff', '#fb7185']

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
    { date: item.day, type: '收入', value: item.income },
    { date: item.day, type: '支出', value: item.expense },
  ])

const Chart = ({ transactionCategoryField }) => {
  const [activeTab, setActiveTab] = useState(reportTabs[0])
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)
  const [transactionData, setTransactionData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      setLoading(true)

      try {
        const res = await getAllTransactions({ month: selectedMonth })

        if (mounted) {
          setTransactionData(Array.isArray(res.data) ? res.data : [])
        }
      } catch (error) {
        if (mounted) {
          setTransactionData([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [selectedMonth])

  const getCategoryLabel = useMemo(
    () => getCategoryLabelGetter(transactionCategoryField),
    [transactionCategoryField]
  )
  const summary = useMemo(
    () => summarizeTransactions(transactionData),
    [transactionData]
  )
  const expenseStats = useMemo(
    () => getExpenseStats(transactionData, getCategoryLabel),
    [getCategoryLabel, transactionData]
  )
  const incomeStats = useMemo(
    () => getIncomeStats(transactionData, getCategoryLabel),
    [getCategoryLabel, transactionData]
  )
  const dailyStats = useMemo(
    () => getDailyStats(transactionData, selectedMonth),
    [selectedMonth, transactionData]
  )
  const pieConfig = useMemo(
    () => ({
      data: expenseStats,
      angleField: 'amount',
      colorField: 'label',
      height: 270,
      radius: 0.78,
      scale: {
        color: {
          range: chartColors,
        },
      },
      legend: false,
      label: false,
      tooltip: {
        items: [
          {
            field: 'amount',
            name: '支出',
            valueFormatter: (value) => `¥${formatAmount(value)}`,
          },
        ],
      },
    }),
    [expenseStats]
  )
  const lineConfig = useMemo(
    () => ({
      data: createTrendData(dailyStats),
      xField: 'date',
      yField: 'value',
      colorField: 'type',
      height: 310,
      scale: {
        color: {
          range: ['#ef5b3f', '#64c6c6'],
        },
      },
      smooth: true,
      legend: {
        position: 'top',
      },
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

  const changeYear = (step) => {
    setSelectedMonth((month) => dayjs(`${month}-01`).add(step, 'year').format('YYYY-MM'))
  }

  return (
    <div className="report-page">
      <div className="report-tabs-bar">
        <Segmented
          className="report-tabs"
          onChange={setActiveTab}
          options={reportTabs}
          value={activeTab}
        />
        <Button icon={<AppstoreOutlined />}>报表库</Button>
      </div>

      <div className="report-toolbar">
        <h2>{activeTab}</h2>
        <div className="report-toolbar-actions">
          <Button icon={<LeftOutlined />} onClick={() => changeYear(-1)} />
          <DatePicker
            allowClear={false}
            onChange={(value) => setSelectedMonth(value.format('YYYY-MM'))}
            picker="month"
            value={dayjs(`${selectedMonth}-01`)}
          />
          <Button icon={<RightOutlined />} onClick={() => changeYear(1)} />
          <Button icon={<ExportOutlined />}>生成图片</Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <section className="report-grid">
          <div className="report-left">
            <div className="report-asset-card">
              <div>
                <span>账本流水统计</span>
                <em>结余</em>
                <strong>{formatAmount(summary.balance)}</strong>
                <p>
                  总收入 {formatAmount(summary.income)}
                  <i />
                  总支出 {formatAmount(summary.expense)}
                </p>
              </div>
              <footer>
                <span>记账里程碑</span>
                <b>记账笔数 {summary.count}</b>
              </footer>
            </div>

            <div className="report-card page-panel">
              <div className="report-card-heading">
                <h3>支出分布</h3>
              </div>
              <div className="report-rank-list">
                {expenseStats.length ? (
                  expenseStats.slice(0, 6).map((item, index) => (
                    <div className="report-rank-row" key={item.key}>
                      <span>{index + 1}</span>
                      <strong>{item.label}</strong>
                      <em>{(item.percent * 100).toFixed(2)}%</em>
                      <b>{formatAmount(item.amount)}</b>
                      <i style={{ width: `${Math.max(item.percent * 100, 6)}%` }} />
                    </div>
                  ))
                ) : (
                  <Empty description="暂无支出数据" />
                )}
              </div>
            </div>

            <div className="report-card page-panel">
              <div className="report-card-heading">
                <h3>资产类账户统计</h3>
                <span>资产 {formatAmount(summary.balance)}</span>
              </div>
              {expenseStats.length ? (
                <Pie {...pieConfig} />
              ) : (
                <Empty description="暂无分类数据" />
              )}
            </div>
          </div>

          <div className="report-right">
            <div className="report-card page-panel">
              <div className="report-card-heading">
                <h3>收入来源</h3>
              </div>
              <div className="report-source-list">
                {incomeStats.length ? (
                  incomeStats.slice(0, 5).map((item, index) => (
                    <div className="report-source-row" key={item.key}>
                      <span>{index + 1}</span>
                      <strong>{item.label}</strong>
                      <b>{formatAmount(item.amount)}</b>
                    </div>
                  ))
                ) : (
                  <Empty description="暂无收入数据" />
                )}
              </div>
            </div>

            <div className="report-card trend-card page-panel">
              <div className="report-card-heading">
                <h3>月度收支趋势</h3>
                <span>{selectedMonth}</span>
              </div>
              <Line {...lineConfig} />
            </div>
          </div>
        </section>
      </Spin>
    </div>
  )
}

export default Chart
