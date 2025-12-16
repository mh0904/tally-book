// 记录方式
export const recordMode = {
  label: '记录方式',
  key: 'mode',
  options: [
    { value: 'batch', label: '批量记录' },
    { value: 'single', label: '单项记录' },
  ],
  defaultValue: 'batch',
  description: '增加批量记录，提升效率',
}

// 交易类型字段
export const transactionTypeField = {
  key: 'type',
  label: '交易类型',
  options: [
    { value: 'income', label: '收入' },
    { value: 'expense', label: '支出' },
  ],
  defaultValue: 'expense',
  description: '区分交易是收入还是支出',
}

// 交易分类字段（扩展功能，可选）
export const transactionCategoryField = {
  key: 'category',
  label: '交易分类',
  options: [
    { value: 'salary', label: '工资' },
    { value: 'food', label: '餐饮' },
    { value: 'shopping', label: '购物' },
    { value: 'transport', label: '交通' },
    { value: 'housing', label: '住房' },
    { value: 'other', label: '其他' },
  ],
  defaultValue: 'other',
  description: '交易的具体分类，便于统计',
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
