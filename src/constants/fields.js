// 记录方式
export const recordMode = {
  label: '记录方式',
  key: 'mode',
  options: [
    { value: 'severalDaysBatch', label: '多日批量' },
    { value: 'oddDaysBatch', label: '单日批量' },
    { value: 'single', label: '单条记录' },
  ],
  defaultValue: 'batch',
  description: '增加批量记录，提升效率',
}

// 交易类型字段
export const transactionTypeField = {
  key: 'type',
  label: '交易类型',
  options: [
    { value: '收入', label: '收入' },
    { value: '支出', label: '支出' },
  ],
  defaultValue: '支出',
  description: '区分交易是收入还是支出',
}

// 金额字段（带约束的数值字段）
export const amountField = {
  key: 'amount',
  label: '交易金额',
  type: 'number', // 输入类型
  min: 0.01, // 最小值
  max: 999999.99, // 最大值
  precision: 2, // 保留2位小数
  unit: '元', // 单位
  description: '交易的具体金额，支持两位小数',
}
