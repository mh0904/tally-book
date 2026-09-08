import dayjs from 'dayjs'

export const DATE_FORMAT = 'YYYY-MM-DD'
export const MONTH_FORMAT = 'YYYY-MM'

export const roundAmount = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0
}

export const formatAmount = (value) => roundAmount(value).toFixed(2)

export const getTransactionAmount = (transaction) =>
  roundAmount(transaction?.amount || 0)

export const summarizeTransactions = (transactions = []) => {
  const summary = transactions.reduce(
    (acc, transaction) => {
      const amount = getTransactionAmount(transaction)

      if (transaction.type === '收入') {
        acc.income += amount
      } else {
        acc.expense += amount
      }

      acc.count += 1
      return acc
    },
    { balance: 0, count: 0, expense: 0, income: 0 }
  )

  summary.income = roundAmount(summary.income)
  summary.expense = roundAmount(summary.expense)
  summary.balance = roundAmount(summary.income - summary.expense)
  return summary
}

export const getLatestTransactionDate = (transactions = []) => {
  const dates = transactions
    .map((transaction) => transaction.date)
    .filter(Boolean)
    .sort()
  const latest = dates[dates.length - 1]

  return latest || dayjs().format(DATE_FORMAT)
}

export const filterTransactionsByDay = (transactions = [], date) =>
  transactions.filter((transaction) => transaction.date === date)

export const filterTransactionsByMonth = (transactions = [], month) =>
  transactions.filter((transaction) => transaction.date?.startsWith(month))

export const filterTransactionsByYear = (transactions = [], year) =>
  transactions.filter((transaction) => transaction.date?.startsWith(year))

export const getPeriodSummaries = (transactions = [], baseDate) => {
  const currentDate = dayjs(baseDate || getLatestTransactionDate(transactions))
  const dayKey = currentDate.format(DATE_FORMAT)
  const monthKey = currentDate.format(MONTH_FORMAT)
  const yearKey = currentDate.format('YYYY')

  return {
    baseDate: dayKey,
    monthKey,
    today: summarizeTransactions(filterTransactionsByDay(transactions, dayKey)),
    month: summarizeTransactions(filterTransactionsByMonth(transactions, monthKey)),
    year: summarizeTransactions(filterTransactionsByYear(transactions, yearKey)),
  }
}

export const getCategoryStats = (
  transactions = [],
  type = '支出',
  getCategoryLabel = (value) => value || '未分类'
) => {
  const total = transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + getTransactionAmount(transaction), 0)
  const categoryMap = transactions
    .filter((transaction) => transaction.type === type)
    .reduce((acc, transaction) => {
      const key = transaction.classification || '未分类'
      const current = acc.get(key) || {
        amount: 0,
        count: 0,
        key,
        label: getCategoryLabel(key),
        percent: 0,
      }

      current.amount += getTransactionAmount(transaction)
      current.count += 1
      acc.set(key, current)
      return acc
    }, new Map())

  return Array.from(categoryMap.values())
    .map((item) => ({
      ...item,
      amount: roundAmount(item.amount),
      percent: total > 0 ? item.amount / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export const getIncomeStats = (transactions = [], getCategoryLabel) =>
  getCategoryStats(transactions, '收入', getCategoryLabel)

export const getExpenseStats = (transactions = [], getCategoryLabel) =>
  getCategoryStats(transactions, '支出', getCategoryLabel)

export const getDailyStats = (transactions = [], monthKey) => {
  const month = dayjs(`${monthKey}-01`)
  const dayCount = month.daysInMonth()
  const statsByDate = transactions.reduce((acc, transaction) => {
    if (!transaction.date?.startsWith(monthKey)) {
      return acc
    }

    const current = acc.get(transaction.date) || {
      date: transaction.date,
      expense: 0,
      income: 0,
    }
    const amount = getTransactionAmount(transaction)

    if (transaction.type === '收入') {
      current.income += amount
    } else {
      current.expense += amount
    }

    acc.set(transaction.date, current)
    return acc
  }, new Map())

  return Array.from({ length: dayCount }, (_, index) => {
    const date = month.date(index + 1).format(DATE_FORMAT)
    const current = statsByDate.get(date) || { date, expense: 0, income: 0 }

    return {
      date,
      day: dayjs(date).format('MM.DD'),
      expense: roundAmount(current.expense),
      income: roundAmount(current.income),
    }
  })
}

export const groupTransactionsByMonth = (transactions = []) => {
  const monthMap = transactions.reduce((acc, transaction) => {
    const monthKey = transaction.date?.slice(0, 7)

    if (!monthKey) {
      return acc
    }

    if (!acc.has(monthKey)) {
      acc.set(monthKey, [])
    }

    acc.get(monthKey).push(transaction)
    return acc
  }, new Map())

  return Array.from(monthMap.entries())
    .map(([monthKey, items]) => ({
      ...summarizeTransactions(items),
      items,
      monthKey,
      year: monthKey.slice(0, 4),
    }))
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
}
