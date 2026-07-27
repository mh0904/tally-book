import React, { useState, useEffect } from "react";
import { Pie, Column } from "@ant-design/charts";
import { getAllTransactions } from "../../api/transactions";
import "./index.less";

const roundAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0;
};

const formatAmount = (value) => roundAmount(value).toFixed(2);
const formatCurrencyAmount = (value) => `¥${formatAmount(value)}`;
const formatPercent = (value) => `${((Number(value) || 0) * 100).toFixed(1)}%`;
const uncategorizedExpense = "未分类";

const getExpenseCategoryOptions = (data, transactionCategoryField) => {
  const categoryOptions = Array.isArray(transactionCategoryField?.options)
    ? transactionCategoryField.options
    : [];
  const expenseOptions = categoryOptions.filter(
    (item) => item.type !== "收入"
  );
  const optionValues = new Set(expenseOptions.map((item) => item.value));
  const extraOptions = Array.from(
    new Set(
      data
        .filter((item) => item.type === "支出")
        .map((item) => item.classification)
        .filter((category) => category && !optionValues.has(category))
    )
  ).map((category) => ({ value: category, label: category }));

  return [...expenseOptions, ...extraOptions];
};

const Chart = ({ transactionCategoryField }) => {
  const [transactionData, setTransactionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("2025-09"); // 默认显示当前月份
  const [pieConfig, setPieConfig] = useState({});
  const [columnConfig, setColumnConfig] = useState({});

  // 获取所有交易数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAllTransactions({ month: selectedMonth });
        const data = res.data || []; // 正确提取交易数据数组
        setTransactionData(data);
        processChartData(data);
      } catch (error) {
        console.error("获取数据失败:", error);
        setTransactionData([]);
        processChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth, transactionCategoryField]);

  // 处理图表数据
  const processChartData = (data) => {
    const expenseCategoryOptions = getExpenseCategoryOptions(
      data,
      transactionCategoryField
    );

    // 按分类统计支出
    const initialCategoryStats = expenseCategoryOptions.reduce((acc, item) => {
      acc[item.value] = 0;
      return acc;
    }, {});
    const categoryStats = data
      .filter((item) => item.type === "支出" && !isNaN(parseFloat(item.amount)))
      .reduce((acc, item) => {
        const category =
          item.classification ||
          expenseCategoryOptions.find((option) => option.isDefault)?.value ||
          expenseCategoryOptions[0]?.value ||
          uncategorizedExpense;
        const amount = parseFloat(item.amount);
        acc[category] = (acc[category] || 0) + (isNaN(amount) ? 0 : amount);
        return acc;
      }, initialCategoryStats);

    // 计算总支出
    const totalExpense = Object.values(categoryStats).reduce(
      (sum, value) => sum + value,
      0
    );

    // 转换为饼图所需格式并计算百分比
    const pieData = expenseCategoryOptions.map((category) => {
      const value = categoryStats[category.value] || 0;
      return {
        type: category.label || category.value || "未知分类",
        category: category.value,
        value: roundAmount(value),
        amountLabel: formatAmount(value),
        percentage: totalExpense > 0 ? value / totalExpense : 0,
      };
    });

    // 设置饼图配置
    setPieConfig({
      data: pieData,
      angleField: "value",
      colorField: "type",
      radius: 0.8,
      label: {
        style: {
          fontSize: 12,
        },
        text: "amountLabel",
      },
      legend: {
        position: "right",
        formatter: (name) => name, 
      },
      tooltip: {
        items: [
          { field: "value", name: "金额", valueFormatter: formatCurrencyAmount },
          { field: "percentage", name: "占比", valueFormatter: formatPercent },
        ],
      },
      interactions: [{ type: "pie-legend-active" }, { type: "element-active" }],
    });

    // 按日期统计支出
    const dailyExpenseStats = data
      .filter((item) => item.type === "支出" && !isNaN(parseFloat(item.amount)))
      .reduce((acc, item) => {
        const date = item.date;
        const amount = parseFloat(item.amount);
        if (!acc[date]) {
          acc[date] = { date, 支出: 0 };
        }
        acc[date]["支出"] += isNaN(amount) ? 0 : amount;
        return acc;
      }, {});

    // 转换为柱状图所需格式
    const columnData = Object.values(dailyExpenseStats)
      .map((item) => ({
        ...item,
        支出: roundAmount(item["支出"]),
        amountLabel: formatAmount(item["支出"]),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // 设置柱状图配置
    setColumnConfig({
      data: columnData,
      xField: "date",
      yField: "支出",
      colorField: "支出",
      legend: {
        position: "top",
      },
      xAxis: {
        type: "cat",
        label: {
          autoHide: true,
          autoRotate: false,
        },
      },
      yAxis: {
        label: {
          formatter: formatAmount,
        },
      },
      tooltip: {
        showMarkers: false,
        items: [
          { field: "支出", name: "支出", valueFormatter: formatCurrencyAmount },
        ],
      },
      label: {
        position: "top",
        text: "amountLabel",
      },
      columnStyle: {
        radius: [4, 4, 0, 0],
      },
    });
  };

  // 生成月份选择器选项
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    // 生成最近6个月的选项
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthStr = date.toISOString().slice(0, 7);
      options.push({
        value: monthStr,
        label: monthStr,
      });
    }
    return options;
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>账单分析</h3>
        <div className="month-selector">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {generateMonthOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="charts-wrapper">
          <div className="chart-item">
            <h2>支出分类占比</h2>
            <div className="chart-content">
              {pieConfig?.data?.some((item) => item.value > 0) ? (
                <Pie {...pieConfig} />
              ) : (
                <div className="no-data">本月暂无支出数据</div>
              )}
            </div>
            {pieConfig?.data?.length > 0 && (
              <div className="category-breakdown">
                {pieConfig.data.map((item) => (
                  <div className="category-breakdown-item" key={item.category}>
                    <span className="category-name">{item.type}</span>
                    <span className="category-amount">
                      {formatCurrencyAmount(item.value)}
                    </span>
                    <span className="category-percent">
                      {formatPercent(item.percentage)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chart-item">
            <h2>每日支出趋势</h2>
            <div className="chart-content">
              {columnConfig?.data?.length > 0 ? (
                <Column {...columnConfig} />
              ) : (
                <div className="no-data">本月暂无支出数据</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chart;
