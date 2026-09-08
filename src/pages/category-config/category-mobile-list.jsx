import { Button, Empty, Popconfirm, Switch, Tag } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

const CategoryMobileList = ({
  activeType,
  categories,
  onDefaultChange,
  onDelete,
  onEdit,
  onStatusChange,
  saving,
}) => {
  return (
    <section className="category-mobile-list" aria-label="分类滚动列表">
      <div className="category-mobile-summary">
        <span>{activeType}分类</span>
        <strong>{categories.length} 项</strong>
      </div>

      {categories.length ? (
        <div className="category-mobile-scroll">
          {categories.map((record) => (
            <article
              className={[
                'category-mobile-item',
                record.enabled === false ? 'is-hidden' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={record.value}
            >
              <span className="category-icon">
                {String(record.label || record.value).slice(0, 1)}
              </span>
              <div className="category-mobile-main">
                <div className="category-mobile-title">
                  <strong>{record.label}</strong>
                  <Tag color={record.type === '收入' ? 'success' : 'orange'}>
                    {record.type}
                  </Tag>
                </div>
                <div className="category-mobile-meta">
                  <span>{record.value}</span>
                  <span>排序 {record.sort}</span>
                </div>
                <div className="category-mobile-keywords">
                  {record.keywords?.length
                    ? record.keywords.slice(0, 4).join('、')
                    : '无关键词'}
                </div>
              </div>
              <div className="category-mobile-side">
                <Switch
                  checked={record.enabled !== false}
                  checkedChildren="启用"
                  disabled={saving}
                  onChange={(checked) => onStatusChange(record, checked)}
                  size="small"
                  unCheckedChildren="停用"
                />
                <Switch
                  checked={record.isDefault}
                  checkedChildren="默认"
                  disabled={record.enabled === false || saving}
                  onChange={(checked) => onDefaultChange(record, checked)}
                  size="small"
                  unCheckedChildren="默认"
                />
              </div>
              <div className="category-mobile-actions">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                  size="small"
                  type="text"
                >
                  编辑
                </Button>
                <Popconfirm
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                  okText="删除"
                  onConfirm={() => onDelete(record)}
                  title="确认删除该分类？"
                >
                  <Button danger icon={<DeleteOutlined />} size="small" type="text">
                    删除
                  </Button>
                </Popconfirm>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty className="category-mobile-empty" description="暂无分类" />
      )}
    </section>
  )
}

export default CategoryMobileList
