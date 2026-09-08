import dayjs from 'dayjs'
import { DATE_FORMAT } from './book-stats'

const stripEmptyFields = (source) =>
  Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined)
  )

export const parseAmountItems = (text = '') => {
  const regex = /([^0-9.元]+?)(\d+\.?\d*)元/g
  const items = []
  let match

  while ((match = regex.exec(text)) !== null) {
    const describe = match[1].replace(/[，。、,]/g, '').trim()
    const amount = Number(match[2])

    if (describe && Number.isFinite(amount)) {
      items.push({ amount, describe })
    }
  }

  return items
}

export const formatChineseMonthDay = (dateText, year) => {
  const monthMatch = String(dateText || '').match(/(\d+)月/)
  const dayMatch = String(dateText || '').match(/(\d+)号/)

  if (!monthMatch || !dayMatch) {
    return ''
  }

  const month = monthMatch[1].padStart(2, '0')
  const day = dayMatch[1].padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const createBatchTransactions = (values, batchMode) => {
  const commonFields = stripEmptyFields({
    account: values.account,
    member: values.member,
    merchant: values.merchant,
    project: values.project,
    type: values.type,
  })

  if (batchMode === 'oddDaysBatch') {
    const date = dayjs(values.date).format(DATE_FORMAT)

    return parseAmountItems(values.oddDaysBatchDescribe).map((item) => ({
      ...item,
      ...commonFields,
      date,
    }))
  }

  const year = dayjs(values.year).format('YYYY')
  const dateGroupRegex = /(\d+月\d+号)([\s\S]*?)(?=\d+月\d+号|$)/g
  const transactions = []
  let dateGroupMatch

  while (
    (dateGroupMatch = dateGroupRegex.exec(values.severalDaysBatchDescribe)) !==
    null
  ) {
    const date = formatChineseMonthDay(dateGroupMatch[1], year)

    if (!date) {
      continue
    }

    parseAmountItems(dateGroupMatch[2]).forEach((item) => {
      transactions.push({
        ...item,
        ...commonFields,
        date,
      })
    })
  }

  return transactions
}

export const createSingleTransaction = (values, fallbackDescribe) => {
  const {
    mode,
    oddDaysBatchDescribe,
    severalDaysBatchDescribe,
    year,
    ...payload
  } = values

  return {
    ...payload,
    date: dayjs(values.date).format(DATE_FORMAT),
    describe: payload.describe || fallbackDescribe,
  }
}
