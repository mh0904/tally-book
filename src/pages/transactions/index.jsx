import { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn"; // 导入中文本地化插件

dayjs.locale("zh-cn"); // 全局使用中文本地化
import { Form, message } from "antd";
import { transactionTypeField } from "../../constants/fields";
import "./index.less";
import {
  addTransactions,
  batchAddTransactions,
  getAllTransactions,
  updateTransactions,
  deleteTransactions,
} from "../../api/transactions";
import {
  DATE_FORMAT,
  formatAmount,
  groupTransactionsByMonth,
  summarizeTransactions,
} from "../../utils/book-stats";
import { TRANSACTION_UPDATED_EVENT } from "../../constants/events";
import useMediaQuery from "../../hooks/use-media-query";
import useTransactionCategories from "../../hooks/use-transaction-categories";
import {
  createBatchTransactions,
  createSingleTransaction,
} from "../../utils/transaction-batch";
import { downloadTransactions } from "../../utils/transaction-export";
import TransactionEditorModal from "./editor-modal";
import TransactionLedger from "./ledger-list";
import TransactionMobileList from "./mobile-list";
import TransactionSearchForm from "./search-form";

const dateFormat = DATE_FORMAT;
const MOBILE_LIST_QUERY = "(max-width: 56.25em)";

const Transactions = ({ transactionCategoryField }) => {
  const [transactions, setTransactions] = useState([]);
  const isMobileList = useMediaQuery(MOBILE_LIST_QUERY);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [form] = Form.useForm(); // 用于新增/编辑 Modal 的表单
  const [searchForm] = Form.useForm(); // 用于查询的表单
  const mode = Form.useWatch("mode", form);
  const transactionType = Form.useWatch("type", form);
  const searchTransactionType = Form.useWatch("type", searchForm);
  const [searchParams, setSearchParams] = useState({});
  const {
    activeCategoryOptions: formCategoryOptions,
    getCategoryLabel,
    getCategoryOptionsByType,
    getDefaultCategoryValue,
  } = useTransactionCategories(transactionCategoryField, transactionType);
  const defaultCategoryValue = getDefaultCategoryValue();
  const searchCategoryOptions = useMemo(
    () => getCategoryOptionsByType(searchTransactionType),
    [getCategoryOptionsByType, searchTransactionType]
  );
  const getTypeLabel = (value) =>
    transactionTypeField.options.find((item) => item.value === value)?.label ||
    value ||
    "未知";
  const totalAmount = useMemo(
    () =>
      transactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [transactions]
  );
  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
      ),
    [transactions]
  );
  const monthGroups = useMemo(
    () => groupTransactionsByMonth(transactions),
    [transactions]
  );
  const activeMonth =
    searchParams.month || monthGroups[0]?.monthKey || dayjs().format("YYYY-MM");
  const hasSearchParams = Object.keys(searchParams).length > 0;
  const desktopTransactions = useMemo(
    () =>
      hasSearchParams
        ? sortedTransactions
        : sortedTransactions.filter((item) => item.date?.startsWith(activeMonth)),
    [activeMonth, hasSearchParams, sortedTransactions]
  );
  const viewSummary = useMemo(
    () => summarizeTransactions(desktopTransactions),
    [desktopTransactions]
  );
  const groupedTransactions = useMemo(
    () =>
      desktopTransactions.reduce((groups, item) => {
        if (!groups[item.date]) {
          groups[item.date] = [];
        }

        groups[item.date].push(item);
        return groups;
      }, {}),
    [desktopTransactions]
  );

  // 列表筛选
  const fetchTransactions = useCallback(async (params) => {
    try {
      const { code, data } = await getAllTransactions(params);
      if (code === 200) {
        // 确保data是数组类型
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
      message.error(error);
    }
  }, []);

  // 初始加载和查询
  useEffect(() => {
    // 设置默认日期范围为最近一个月
    // const endDate = dayjs(); // 当前日期
    // const startDate = endDate.subtract(1, 'month'); // 一个月前
    // 设置搜索表单的默认值
    // searchForm.setFieldsValue({
    //   dateRange: [startDate, endDate]
    // });
    
    // 更新搜索参数并获取数据
    // const defaultParams = {
    //   startDate: startDate.format(dateFormat),
    //   endDate: endDate.format(dateFormat)
    // };
    // setSearchParams(defaultParams);
    fetchTransactions(searchParams)
  }, [fetchTransactions, searchParams]);

  useEffect(() => {
    const handleTransactionsUpdated = () => {
      fetchTransactions(searchParams);
    };

    window.addEventListener(
      TRANSACTION_UPDATED_EVENT,
      handleTransactionsUpdated
    );

    return () => {
      window.removeEventListener(
        TRANSACTION_UPDATED_EVENT,
        handleTransactionsUpdated
      );
    };
  }, [fetchTransactions, searchParams]);

  // 查询操作
  const onSearch = async (values) => {
    const { dateRange, ...restValues } = values;
    let params = { ...restValues };
    if (dateRange && dateRange.length === 2) {
      // 格式化日期范围
      params.startDate = dateRange[0]
        ? dateRange[0].format(dateFormat)
        : undefined;
      params.endDate = dateRange[1]
        ? dateRange[1].format(dateFormat)
        : undefined;
    }
    // 排除值为 undefined 或空的字段
    Object.keys(params).forEach((key) => {
      if (
        params[key] === undefined ||
        params[key] === null ||
        params[key] === ""
      ) {
        delete params[key];
      }
    });
    setSearchParams(params);
  };

  // 重置查询
  const onReset = () => {
    searchForm.resetFields();
    setSearchParams({}); // 重置查询参数，触发 useEffect 重新获取数据
  };

  // 保存
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };

  const handleModeChange = (e) => {
    form.setFieldsValue({
      mode: e.target.value,
    });
  };

  const validateMessages = {
    required: "${label} is required!",
    types: {
      email: "${label} is not a valid email!",
      number: "${label} is not a valid number!",
    },
    number: {
      range: "${label} must be between ${min} and ${max}",
    },
  };

  // 新增或者编辑一条记录
  const openEditor = (value) => {
    setOpen(true);
    if (value === "add") {
      setModalTitle("新增");
      form.resetFields();
      form.setFieldsValue({
        mode: "severalDaysBatch",
        id: "",
        date: dayjs(dayjs(), dateFormat),
        type: transactionTypeField.defaultValue,
        classification: defaultCategoryValue,
      });
    } else {
      setModalTitle("编辑");
      form.setFieldsValue({
        ...value,
        id: value.id,
        mode: "single",
        date: dayjs(value.date),
      });
    }
  };

  // 提交表单
  const handleEditorSubmit = async () => {
    setConfirmLoading(true);
    try {
      await form.validateFields(); // 确保表单验证通过
      let values = form.getFieldsValue();

      if (mode === "oddDaysBatch" || mode === "severalDaysBatch") {
        const params = createBatchTransactions(values, mode);

        if (!params.length) {
          message.warning("没有识别到可保存的账单");
          return;
        }

        const res = await batchAddTransactions(params);

        if (res.code === 200) {
          await fetchTransactions(searchParams); // 刷新列表
        }
      }

      // 单条数据的处理
      if (mode === "single") {
        const payload = createSingleTransaction(values);

        if (modalTitle === "新增") {
          let res = await addTransactions(payload);
          if (res.code === 200) {
            await fetchTransactions(searchParams); // 刷新列表
          }
        }
        if (modalTitle === "编辑") {
          let res = await updateTransactions(values.id, payload);
          if (res.code === 200) {
            await fetchTransactions(searchParams); // 刷新列表
          }
        }
      }
    } catch (error) {
      console.log("表单提交失败或接口调用错误:", error);
    } finally {
      setConfirmLoading(false);
      setOpen(false);
    }
  };

  // 取消提交表单
  const handleEditorCancel = () => {
    setOpen(false);
  };

  // 数据删除
  const handleDelete = async (item) => {
    try {
      let res = await deleteTransactions(item.id);
      if (res.code === 200) {
        await fetchTransactions(searchParams); // 刷新列表
      }
    } catch (error) {
      console.log("删除失败:", error);
    }
  };

  // 导出数据函数
  const handleExport = async () => {
    try {
      if (transactions.length === 0) {
        message.info("没有数据可以导出");
        return;
      }

      downloadTransactions(transactions);
      message.success("数据导出成功");
    } catch (error) {
      console.error("导出数据失败:", error);
      message.error("数据导出失败");
    }
  };

  return (
    <div className="transaction">
      <TransactionSearchForm
        categoryOptions={searchCategoryOptions}
        dateFormat={dateFormat}
        form={searchForm}
        onExport={handleExport}
        onReset={onReset}
        onSearch={onSearch}
        typeOptions={transactionTypeField.options}
      />

      {isMobileList ? (
        <TransactionMobileList
          formatAmount={formatAmount}
          getCategoryLabel={getCategoryLabel}
          getTypeLabel={getTypeLabel}
          onDelete={handleDelete}
          onEdit={openEditor}
          totalAmount={totalAmount}
          transactions={sortedTransactions}
        />
      ) : (
        <TransactionLedger
          activeMonth={activeMonth}
          formatAmount={formatAmount}
          getCategoryLabel={getCategoryLabel}
          getTypeLabel={getTypeLabel}
          groupedTransactions={groupedTransactions}
          monthGroups={monthGroups}
          onDelete={handleDelete}
          onEdit={openEditor}
          onMonthSelect={(monthKey) => {
            searchForm.resetFields();
            setSearchParams({ month: monthKey });
          }}
          summary={viewSummary}
          transactions={desktopTransactions}
        />
      )}

      <TransactionEditorModal
        categoryOptions={formCategoryOptions}
        confirmLoading={confirmLoading}
        dateFormat={dateFormat}
        defaultCategoryValue={defaultCategoryValue}
        form={form}
        layout={layout}
        mode={mode}
        onCancel={handleEditorCancel}
        onModeChange={handleModeChange}
        onSubmit={handleEditorSubmit}
        onTypeChange={(nextType) => {
          form.setFieldsValue({
            classification: getDefaultCategoryValue(nextType),
          });
        }}
        title={modalTitle}
        validateMessages={validateMessages}
        visible={open}
      />
    </div>
  );
};
export default Transactions;
