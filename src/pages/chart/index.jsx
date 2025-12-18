import React, { useState, useEffect } from "react";
import { Pie, Column } from "@ant-design/charts";
import { getAllTransactions } from "../../utils/transactions";
import { transactionCategoryField } from "../../constants/fields";
import "./index.less";

const Chart = () => {
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
  }, [selectedMonth]);

  // 处理图表数据
  const processChartData = (data) => {
    // 按分类统计支出
    const categoryStats = data
      .filter((item) => item.type === "支出" && !isNaN(parseFloat(item.amount)))
      .reduce((acc, item) => {
        const category = item.classification || "其他";
        const amount = parseFloat(item.amount);
        acc[category] = (acc[category] || 0) + (isNaN(amount) ? 0 : amount);
        return acc;
      }, {});

    // 计算总支出
    const totalExpense = Object.values(categoryStats).reduce(
      (sum, value) => sum + value,
      0
    );

    // 转换为饼图所需格式并计算百分比
    const pieData = Object.entries(categoryStats)
      .filter(([category]) => category && category.trim() !== "") // 过滤掉空字符串或undefined的分类
      .map(([category, value]) => ({
        type: category || "未知分类", // 确保type字段有默认值
        value: typeof value === "number" ? value : 0, // 确保value字段是数字
        percentage: totalExpense > 0 ? value / totalExpense : 0,
      }));

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
        text: "value",
      },
      legend: {
        position: "right",
        formatter: (name) => name, 
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
    const columnData = Object.values(dailyExpenseStats).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    
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
      tooltip: {
        showMarkers: false,
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
              {pieConfig?.data?.length > 0 ? (
                <Pie {...pieConfig} />
              ) : (
                <div className="no-data">本月暂无支出数据</div>
              )}
            </div>
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
