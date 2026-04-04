import React, { useState, useEffect, useCallback } from "react";
import { List, Card, Tag, Typography, message, DatePicker, Empty, Spin } from "antd";
import dayjs from "dayjs";
import { getAllTransactions } from "../../utils/transactions";
import { transactionCategoryField } from "../../constants/fields";
import "./index.less";

const { Text, Title } = Typography;
const { MonthPicker } = DatePicker;

const DailyBills = () => {
  const [loading, setLoading] = useState(false);
  const [groupedData, setGroupedData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [expandedDates, setExpandedDates] = useState([]); // 存储已展开的日期

  const fetchDailyBills = useCallback(async (month) => {
    setLoading(true);
    try {
      const monthStr = month.format("YYYY-MM");
      const { code, data } = await getAllTransactions({ month: monthStr });
      if (code === 200 && Array.isArray(data)) {
        // 按日期分组
        const groups = data.reduce((acc, item) => {
          const date = item.date;
          if (!acc[date]) {
            acc[date] = {
              date,
              items: [],
              totalIncome: 0,
              totalExpense: 0,
            };
          }
          acc[date].items.push(item);
          const amount = parseFloat(item.amount) || 0;
          if (item.type === "收入") {
            acc[date].totalIncome += amount;
          } else {
            acc[date].totalExpense += amount;
          }
          return acc;
        }, {});

        // 转换为数组并按日期降序排列
        const sortedGroups = Object.values(groups).sort((a, b) => 
          dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
        );
        setGroupedData(sortedGroups);
      }
    } catch (error) {
      console.error("获取每日账单失败:", error);
      message.error("获取数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyBills(selectedMonth);
  }, [selectedMonth, fetchDailyBills]);

  const handleMonthChange = (date) => {
    if (date) {
      setSelectedMonth(date);
    }
  };

  const toggleExpand = (date) => {
    setExpandedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date) 
        : [...prev, date]
    );
  };

  const getCategoryLabel = (value) => {
    return transactionCategoryField.options.find(item => item.value === value)?.label || value;
  };

  return (
    <div className="daily-bills-container">
      <div className="daily-bills-header">
        <Title level={4}>每日账单</Title>
        <MonthPicker 
          value={selectedMonth} 
          onChange={handleMonthChange} 
          allowClear={false}
          placeholder="选择月份"
        />
      </div>

      <Spin spinning={loading}>
        {groupedData.length > 0 ? (
          <div className="daily-bills-list">
            {groupedData.map((group) => {
              const isExpanded = expandedDates.includes(group.date);
              return (
                <Card 
                  key={group.date} 
                  className={`daily-card ${isExpanded ? 'expanded' : ''}`}
                  title={
                    <div className="card-title" onClick={() => toggleExpand(group.date)}>
                      <div className="title-left">
                        <Text strong>{group.date}</Text>
                        <span className={`expand-icon ${isExpanded ? 'active' : ''}`}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                      <div className="card-summary">
                        {group.totalIncome > 0 && (
                          <Text type="success" className="summary-item">
                            收: +{group.totalIncome.toFixed(2)}
                          </Text>
                        )}
                        {group.totalExpense > 0 && (
                          <Text type="danger" className="summary-item">
                            支: -{group.totalExpense.toFixed(2)}
                          </Text>
                        )}
                      </div>
                    </div>
                  }
                >
                  {isExpanded && (
                    <List
                      itemLayout="horizontal"
                      dataSource={group.items}
                      renderItem={(item) => (
                        <List.Item className="bill-item">
                          <div className="bill-item-left">
                            <Tag color={item.type === '收入' ? 'success' : 'error'}>
                              {getCategoryLabel(item.classification)}
                            </Tag>
                            <Text>{item.describe}</Text>
                          </div>
                          <div className="bill-item-right">
                            <Text strong className={item.type === '收入' ? 'income-text' : 'expense-text'}>
                              {item.type === '收入' ? '+' : '-'}{parseFloat(item.amount).toFixed(2)}
                            </Text>
                          </div>
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          !loading && <Empty description="暂无账单数据" />
        )}
      </Spin>
    </div>
  );
};

export default DailyBills;
