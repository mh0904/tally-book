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

// 交易分类字段（扩展功能，可选）
export const transactionCategoryField = {
  key: 'category',
  label: '交易分类',
  options: [
    { value: '工资', label: '工资', type: '收入', sort: 1 },
    { value: '奖金', label: '奖金', type: '收入', sort: 2 },
    { value: '兼职收入', label: '兼职收入', type: '收入', sort: 3 },
    { value: '理财收益', label: '理财收益', type: '收入', sort: 4 },
    { value: '红包收入', label: '红包收入', type: '收入', sort: 5 },
    { value: '报销收入', label: '报销收入', type: '收入', sort: 6 },
    { value: '其他收入', label: '其他收入', type: '收入', sort: 7 },
    { value: '餐饮', label: '餐饮', type: '支出', sort: 101 },
    { value: '购物', label: '购物', type: '支出', sort: 102 },
    { value: '交通', label: '交通', type: '支出', sort: 103 },
    { value: '住房', label: '住房', type: '支出', sort: 104 },
    { value: '水电燃气', label: '水电燃气', type: '支出', sort: 105 },
    { value: '通讯网络', label: '通讯网络', type: '支出', sort: 106 },
    { value: '医疗健康', label: '医疗健康', type: '支出', sort: 107 },
    { value: '教育学习', label: '教育学习', type: '支出', sort: 108 },
    { value: '娱乐休闲', label: '娱乐休闲', type: '支出', sort: 109 },
    { value: '旅行出行', label: '旅行出行', type: '支出', sort: 110 },
    { value: '日用百货', label: '日用百货', type: '支出', sort: 111 },
    { value: '服饰美容', label: '服饰美容', type: '支出', sort: 112 },
    { value: '数码电器', label: '数码电器', type: '支出', sort: 113 },
    { value: '运动健身', label: '运动健身', type: '支出', sort: 114 },
    { value: '人情礼金', label: '人情礼金', type: '支出', sort: 115 },
    { value: '育儿亲子', label: '育儿亲子', type: '支出', sort: 116 },
    { value: '保险', label: '保险', type: '支出', sort: 117 },
    { value: '车辆', label: '车辆', type: '支出', sort: 118 },
    { value: '订阅会员', label: '订阅会员', type: '支出', sort: 119 },
    { value: '办公', label: '办公', type: '支出', sort: 120 },
    { value: '维修维护', label: '维修维护', type: '支出', sort: 121 },
    { value: '税费手续费', label: '税费手续费', type: '支出', sort: 122 },
    { value: '其他', label: '其他', type: '支出', sort: 999 },
  ],
  defaultValue: '其他',
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
