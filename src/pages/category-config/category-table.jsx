import { Button, Popconfirm, Space, Switch, Table, Tag } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

const renderCategoryName = (value, record) => (
  <div className="category-name-cell">
    <span className="category-icon">
      {String(value || record.value).slice(0, 1)}
    </span>
    <div>
      <strong>{value}</strong>
      <span>{record.value}</span>
    </div>
  </div>
)

const renderKeywords = (keywords = []) => (
  <Space size={[4, 4]} wrap>
    {keywords.length ? (
      keywords.slice(0, 4).map((keyword) => (
        <Tag className="keyword-tag" key={keyword}>
          {keyword}
        </Tag>
      ))
    ) : (
      <span className="category-muted">无</span>
    )}
    {keywords.length > 4 && (
      <Tag className="keyword-tag">+{keywords.length - 4}</Tag>
    )}
  </Space>
)

const CategoryTable = ({
  categories,
  onDefaultChange,
  onDelete,
  onEdit,
  onStatusChange,
  saving,
}) => {
  const columns = [
    {
      title: '分类名称',
      dataIndex: 'label',
      render: renderCategoryName,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      render: (value) => (
        <Tag color={value === '收入' ? 'success' : 'orange'}>{value}</Tag>
      ),
    },
    {
      title: '关键词',
      dataIndex: 'keywords',
      render: renderKeywords,
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      width: 90,
      render: (value, record) => (
        <Switch
          checked={value}
          disabled={record.enabled === false || saving}
          onChange={(checked) => onDefaultChange(record, checked)}
          size="small"
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      width: 100,
      render: (value, record) => (
        <Switch
          checked={value !== false}
          checkedChildren="启用"
          disabled={saving}
          onChange={(checked) => onStatusChange(record, checked)}
          size="small"
          unCheckedChildren="停用"
        />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size={8}>
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
        </Space>
      ),
    },
  ]

  return (
    <Table
      className="category-config-table"
      columns={columns}
      dataSource={categories}
      pagination={false}
      rowClassName={(record) => (record.enabled === false ? 'is-hidden' : '')}
      rowKey="value"
      scroll={{ x: 860, y: 520 }}
    />
  )
}

export default CategoryTable
