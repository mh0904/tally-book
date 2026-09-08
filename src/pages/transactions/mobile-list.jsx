import { Empty } from 'antd'

const TransactionMobileList = ({
  formatAmount,
  getCategoryLabel,
  getTypeLabel,
  onDelete,
  onEdit,
  totalAmount,
  transactions,
}) => {
  return (
    <section className="transaction-mobile-list" aria-label="交易滚动列表">
      <div className="mobile-list-summary">
        <span>共 {transactions.length} 条</span>
        <strong>￥{formatAmount(totalAmount)}</strong>
      </div>

      {transactions.length ? (
        <div className="mobile-record-list">
          {transactions.map((item) => {
            const categoryLabel = getCategoryLabel(item.classification)
            const typeLabel = getTypeLabel(item.type)
            const isIncome = typeLabel === '收入'

            return (
              <article
                className={[
                  'mobile-record-item',
                  isIncome ? 'income' : 'expense',
                ].join(' ')}
                key={item.id}
              >
                <span className="mobile-record-icon">
                  {categoryLabel.slice(0, 1)}
                </span>
                <div className="mobile-record-main">
                  <div className="mobile-record-title">
                    <strong>{item.describe || '未填写描述'}</strong>
                    <span>{item.date}</span>
                  </div>
                  <div className="mobile-record-meta">
                    <span>{categoryLabel}</span>
                    <span>{typeLabel}</span>
                  </div>
                </div>
                <div className="mobile-record-side">
                  <strong>
                    {isIncome ? '+' : '-'}￥{formatAmount(item.amount)}
                  </strong>
                  <div className="mobile-record-actions">
                    <button type="button" onClick={() => onEdit(item)}>
                      编辑
                    </button>
                    <button type="button" onClick={() => onDelete(item)}>
                      删除
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <Empty className="mobile-record-empty" description="暂无交易记录" />
      )}
    </section>
  )
}

export default TransactionMobileList
