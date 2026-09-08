import dayjs from 'dayjs'
import { Empty } from 'antd'

const TransactionLedger = ({
  activeMonth,
  formatAmount,
  getCategoryLabel,
  getTypeLabel,
  groupedTransactions,
  monthGroups,
  onDelete,
  onEdit,
  onMonthSelect,
  summary,
  transactions,
}) => {
  return (
    <section className="transaction-ledger page-panel">
      <aside className="ledger-months">
        <div className="ledger-month-filter">
          <strong>汇总：</strong>
          <span>月</span>
        </div>
        {monthGroups.length ? (
          monthGroups.map((group) => (
            <button
              className={[
                'ledger-month-item',
                group.monthKey === activeMonth ? 'active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={group.monthKey}
              onClick={() => onMonthSelect(group.monthKey)}
              type="button"
            >
              <span>{Number(group.monthKey.slice(5))}月</span>
              <em>结余 {formatAmount(group.balance)}</em>
              <small>
                收入 {formatAmount(group.income)}　支出{' '}
                {formatAmount(group.expense)}
              </small>
            </button>
          ))
        ) : (
          <Empty description="暂无月份" />
        )}
      </aside>

      <section className="ledger-records">
        <div className="ledger-header">
          <div>
            <strong>流水列表</strong>
            <span>结余 {formatAmount(summary.balance)}</span>
            <span className="income">收入 {formatAmount(summary.income)}</span>
            <span className="expense">支出 {formatAmount(summary.expense)}</span>
          </div>
          <span>{transactions.length} 笔</span>
        </div>

        <div className="ledger-table-head">
          <span>分类</span>
          <span>金额</span>
          <span>账户</span>
          <span>成员</span>
          <span>时间</span>
          <span>备注</span>
          <span>操作</span>
        </div>

        <div className="ledger-scroll">
          {transactions.length ? (
            Object.entries(groupedTransactions).map(([date, items]) => (
              <div className="ledger-date-group" key={date}>
                <div className="ledger-date-title">
                  {dayjs(date).format('M月D日 dddd')}
                </div>
                {items.map((item) => {
                  const categoryLabel = getCategoryLabel(item.classification)
                  const typeLabel = getTypeLabel(item.type)
                  const isIncome = typeLabel === '收入'

                  return (
                    <article className="ledger-row" key={item.id}>
                      <div className="ledger-category">
                        <span>{categoryLabel.slice(0, 1)}</span>
                        <strong>{categoryLabel}</strong>
                      </div>
                      <b className={isIncome ? 'income' : 'expense'}>
                        {formatAmount(item.amount)}
                      </b>
                      <span>{isIncome ? '收入账户' : '现金'}</span>
                      <span>管理员</span>
                      <span>{item.date}</span>
                      <span>{item.describe || '-'}</span>
                      <div className="ledger-actions">
                        <button type="button" onClick={() => onEdit(item)}>
                          编辑
                        </button>
                        <button type="button" onClick={() => onDelete(item)}>
                          删除
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ))
          ) : (
            <Empty className="ledger-empty" description="暂无交易记录" />
          )}
        </div>
      </section>
    </section>
  )
}

export default TransactionLedger
