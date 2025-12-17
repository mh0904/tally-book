import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn"; // 导入中文本地化插件

dayjs.locale("zh-cn"); // 全局使用中文本地化
import {
  Table,
  Space,
  Button,
  Form,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Radio,
  Modal,
  message,
  Upload,
} from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
const { RangePicker } = DatePicker;
import {
  recordMode,
  transactionTypeField,
  transactionCategoryField,
} from "../../constants/fields";
import "./index.less";
import {
  addTransactions,
  batchAddTransactions,
  getAllTransactions,
  updateTransactions,
  deleteTransactions,
  exportAllTransactions,
  importTransactions,
} from "../../utils/transactions";
const dateFormat = "YYYY-MM-DD";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [form] = Form.useForm(); // 用于新增/编辑 Modal 的表单
  const [searchForm] = Form.useForm(); // 用于查询的表单
  const mode = Form.useWatch("mode", form);
  const [searchParams, setSearchParams] = useState({});
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const columns = [
    {
      title: "日期",
      dataIndex: "date",
      defaultSortOrder: "descend",
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(), // 使用 dayjs 进行排序比较
    },
    {
      title: "描述",
      dataIndex: "describe",
    },
    {
      title: "金额",
      dataIndex: "amount",
      align: "center",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "分类",
      dataIndex: "classification",
      render: (value) => {
        const label = transactionCategoryField.options.find(
          (item) => item.value === value
        )?.label;
        return <span>{label}</span>;
      },
      align: "center",
    },
    {
      title: "交易类型",
      dataIndex: "type",
      render: (value) => {
        const label = transactionTypeField.options.find(
          (item) => item.value === value
        )?.label;
        return <span>{label}</span>;
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showModal(record)}>编辑</a>
          <a onClick={() => deleteList(record)}>删除</a>
        </Space>
      ),
    },
  ];

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

  const recordModeChange = (e) => {
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

  // 日期转换工具函数：将「x月x号」转为「YYYY-MM-DD」
  const formatDate = (dateStr,year) => {
    // 提取月份和日期（如：8月3号 → 月=8，日=3）
    const monthMatch = dateStr.match(/(\d+)月/);
    const dayMatch = dateStr.match(/(\d+)号/);
    if (!monthMatch || !dayMatch) return ""; // 异常日期返回空（可根据需求调整）
    // 补零：单数字月份/日期转为两位（如8→08，3→03）
    const month = monthMatch[1].padStart(2, "0");
    const day = dayMatch[1].padStart(2, "0");
    // 固定拼接2022年
    return `${year}-${month}-${day}`;
  };

  // 新增或者编辑一条记录
  const showModal = (value) => {
    setOpen(true);
    if (value === "add") {
      setModalTitle("新增");
      form.resetFields();
      form.setFieldsValue({
        mode: "severalDaysBatch",
        id: "",
        date: dayjs(dayjs(), dateFormat),
        type: transactionTypeField.defaultValue,
        classification: transactionCategoryField.defaultValue,
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
  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      await form.validateFields(); // 确保表单验证通过
      let values = form.getFieldsValue();
      const date = dayjs(values.date).format(dateFormat);

      // 单日批量记录的逻辑
      // 充电2.95元，电费86元，途虎141.14元，拼多多37.98元，洗衣液13.8元，南瓜4.45元，管道疏通4.455元，真空袋3.6元
      if (mode === "oddDaysBatch") {
        const regex = /([^0-9.元]+?)(\d+\.?\d*)元/g;
        let match;
        const params = [];
        while ((match = regex.exec(values.oddDaysBatchDescribe)) !== null) {
          const describe = match[1].replace(/[，。、]/g, "").trim();
          const amount = parseFloat(match[2]);
          params.push({
            describe,
            amount,
            date,
            type: values.type,
          });
        }
        let res = await batchAddTransactions(params);
        if (res.code === 200) {
          await fetchTransactions(searchParams); // 刷新列表
        }
      }

      // 多日批量记录的逻辑
      if (mode === "severalDaysBatch") {
        // 1. 匹配日期+对应消费项的正则（先拆分不同日期的消费组）
        const dateConsumeRegex = /(\d+月\d+号)([\s\S]*?)(?=\d+月\d+号|$)/g;
        // 2. 复用原消费项解析正则（解析单个消费项：描述+金额）
        const consumeItemRegex = /([^0-9.元]+?)(\d+\.?\d*)元/g;

        // 第一步：拆分每个日期对应的消费组
        let dateConsumeMatch;
        const params = [];
        while (
          (dateConsumeMatch = dateConsumeRegex.exec(
            values.severalDaysBatchDescribe
          )) !== null
        ) {
          const originalDate = dateConsumeMatch[1]; // 原始日期（如8月3号）
          const formattedDate = formatDate(originalDate, dayjs(values.year).format("YYYY")); // 转换为2022-08-03
          if (!formattedDate) continue; // 跳过解析失败的日期
          const consumeStr = dateConsumeMatch[2]; // 提取该日期下的所有消费项（如：充电2.95元，电费86元）
          // 第二步：解析当前日期下的每个消费项（复用原逻辑）
          let itemMatch;
          // 重置消费项正则的lastIndex（避免循环中正则匹配异常）
          consumeItemRegex.lastIndex = 0;
          while ((itemMatch = consumeItemRegex.exec(consumeStr)) !== null) {
            // 清洗描述（去掉标点、空格）
            const describe = itemMatch[1].replace(/[，。、]/g, "").trim();
            // 转换金额为数字
            const amount = parseFloat(itemMatch[2]);
            // 组装参数（date为当前解析的日期，替换原固定date）
            params.push({
              describe,
              amount,
              date: formattedDate,
              type: values.type,
            });
          }
        }
        let res = await batchAddTransactions(params);
        if (res.code === 200) {
          await fetchTransactions(searchParams); // 刷新列表
        }
      }

      // 单条数据的处理
      if (mode === "single") {
        if (modalTitle === "新增") {
          let res = await addTransactions({
            ...values,
            date,
          });
          if (res.code === 200) {
            await fetchTransactions(searchParams); // 刷新列表
          }
        }
        if (modalTitle === "编辑") {
          let res = await updateTransactions(values.id, {
            ...values,
            date,
          });
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
  const handleCancel = () => {
    setOpen(false);
  };

  // 数据删除
  const deleteList = async (item) => {
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
      // 使用当前查询到的数据（transactions状态）而不是调用API获取全部数据
      const allTransactions = transactions;

      // 检查是否有数据可导出
      if (allTransactions.length === 0) {
        message.info("没有数据可以导出");
        return;
      }

      // 准备Excel数据，将对象数组转换为适合Excel的格式
      const excelData = allTransactions.map((item) => ({
        ID: item.id,
        日期: item.date,
        类型: item.type,
        分类: item.classification,
        金额: item.amount,
        描述: item.describe,
      }));

      // 创建工作簿和工作表
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "交易记录");

      // 设置列宽
      worksheet["!cols"] = [
        { wch: 20 }, // ID列宽
        { wch: 15 }, // 日期列宽
        { wch: 10 }, // 类型列宽
        { wch: 15 }, // 分类列宽
        { wch: 15 }, // 金额列宽
        { wch: 50 }, // 描述列宽
      ];

      // 获取工作表中的范围
      const range = XLSX.utils.decode_range(worksheet["!ref"]);

      // 定义居中对齐样式
      const centerAlignment = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };

      // 为每个单元格应用居中样式
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { v: "" };
          }
          worksheet[cellAddress].s = centerAlignment;
        }
      }

      // 生成Excel文件并下载
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success("数据导出成功");
    } catch (error) {
      console.error("导出数据失败:", error);
      message.error("数据导出失败");
    }
  };

  //  导入数据模态框函数
  const handleImportModal = () => {
    setImportModalVisible(true);
  };

  // 处理文件上传
  const handleFileUpload = (file) => {
    const isJSON =
      file.type === "application/json" || file.name.endsWith(".json");
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (!isJSON && !isExcel) {
      message.error("请选择 JSON 或 Excel 文件");
      return false;
    }
    setImportFile(file);
    return false; // 返回 false 阻止自动上传
  };

  // 导入数据函数
  const handleImport = async () => {
    if (!importFile) {
      message.error("请选择要导入的文件");
      return;
    }

    try {
      const reader = new FileReader();
      // 处理Excel文件
      reader.readAsArrayBuffer(importFile);
      reader.onload = async (e) => {
        try {
          // 解析Excel文件
          const workbook = XLSX.read(e.target.result, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const excelData = XLSX.utils.sheet_to_json(worksheet);

          // 转换数据格式为后端期望的格式
          const formattedData = {};

          excelData.forEach((item) => {
            // 跳过表头行
            if (item["ID"] === "ID" || item["ID"] === undefined) return;

            // 提取月份
            const date = item["日期"];
            const monthKey = date.substring(0, 7); // 格式：YYYY-MM

            // 创建月份数据结构
            if (!formattedData[monthKey]) {
              formattedData[monthKey] = { transactions: [] };
            }

            // 添加交易记录
            formattedData[monthKey].transactions.push({
              id: item["ID"], // 包含ID字段，支持更新操作
              date: date,
              type: item["类型"],
              classification: item["分类"],
              amount: item["金额"],
              describe: item["描述"],
            });
          });

          // 发送到后端
          const response = await importTransactions(formattedData);
          if (response.code === 200) {
            message.success("数据导入成功");
            setImportModalVisible(false);
            setImportFile(null);
            // 清除筛选条件并刷新列表
            setSearchParams({});
          } else {
            message.error(`数据导入失败：${response.msg}`);
          }
        } catch (error) {
          console.error("解析 Excel 文件失败:", error);
          message.error("Excel 文件格式错误");
        }
      };
    } catch (error) {
      console.error("导入数据失败:", error);
      message.error("数据导入失败");
    }
  };

  // 关闭导入模态框
  const handleImportCancel = () => {
    setImportModalVisible(false);
    setImportFile(null);
  };

  return (
    <div className="transaction">
      {/* 查询表单区域 */}
      <Form
        form={searchForm}
        layout="inline"
        onFinish={onSearch}
        className="search-form-wrap"
        style={{ marginBottom: 16 }}
      >
        <Form.Item label="日期范围" name="dateRange">
          <RangePicker format={dateFormat} />
        </Form.Item>

        <Form.Item label="交易类型" name="type">
          <Select
            placeholder="请选择类型"
            allowClear
            style={{ width: 120 }}
            options={transactionTypeField.options}
          />
        </Form.Item>

        <Form.Item label="分类" name="classification">
          <Select
            placeholder="请选择分类"
            allowClear
            style={{ width: 120 }}
            options={transactionCategoryField.options}
          />
        </Form.Item>

        <Form.Item label="描述关键词" name="describe">
          <Input placeholder="请输入描述" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button htmlType="button" onClick={onReset}>
              重置
            </Button>
            <Button type="primary" onClick={() => showModal("add")}>
              新增
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出数据
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleImportModal}
            >
              导入数据
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 交易列表表格 */}
      <Table
        size="small"
        columns={columns}
        dataSource={transactions}
        bordered
        rowKey="id"
        footer={() => {
          // 计算当前查询列表的金额总额
          const totalAmount = transactions.reduce((sum, item) => sum + (item.amount || 0), 0);
          return (
            <div style={{ textAlign: 'center', fontWeight: 'bold', paddingRight: '30px' }}>
              总金额: ￥{totalAmount.toFixed(2)}
            </div>
          );
        }}
      />

      {/* 新增/编辑 Modal (保持不变) */}
      <Modal
        title={modalTitle}
        open={open}
        onOk={handleOk}
        width={700}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          {...layout}
          name="nest-messages"
          form={form}
          style={{ maxWidth: 700 }}
          validateMessages={validateMessages}
          initialValues={{
            mode: "single", // 默认单条
            year: dayjs(dayjs(), "YYYY"),
            date: dayjs(dayjs(), dateFormat),
            type: transactionTypeField.defaultValue,
            classification: transactionCategoryField.defaultValue,
          }}
        >
          {/* 使用一个隐藏的 Input，确保它被 Form 追踪 */}
          <Form.Item name="id" noStyle>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="mode"
            label="记录方式"
            wrapperCol={{ span: 10 }}
            rules={[{ required: true }]}
          >
            <Radio.Group
              block
              buttonStyle="solid"
              optionType="button"
              options={recordMode.options}
              onChange={recordModeChange}
              disabled={modalTitle === "编辑"} // 编辑时不能切换模式
            />
          </Form.Item>

          {mode !== "severalDaysBatch" && (
            <Form.Item name="date" label="日期" rules={[{ required: true }]}>
              <DatePicker format={dateFormat} />
            </Form.Item>
          )}

          {mode === "severalDaysBatch" && (
            <Form.Item name="year" label="年份" rules={[{ required: true }]}>
              <DatePicker picker="year" />
            </Form.Item>
          )}

          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Radio.Group
              options={transactionTypeField.options}
              style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
            />
          </Form.Item>

          {/* 单日批量模式的输入  && modalTitle === "新增" */}
          {mode === "oddDaysBatch" && (
            <Form.Item
              tooltip="格式:拼多多9.5元,牛奶17.8元"
              name="oddDaysBatchDescribe"
              label="描述"
              rules={[{ required: true, message: "请输入批量描述内容" }]}
            >
              <Input.TextArea
                autoSize={{ minRows: 5, maxRows: 10 }}
                placeholder="请输入批量描述,例如:拼多多9.5元,牛奶17.8元"
                maxLength={1000}
              />
            </Form.Item>
          )}

          {/* 多日批量模式的输入  && modalTitle === "新增" */}
          {mode === "severalDaysBatch" && (
            <Form.Item
              tooltip="格式:8月1号拼多多9.5元8月2号吸油棉4.9元"
              name="severalDaysBatchDescribe"
              label="描述"
              rules={[{ required: true, message: "请输入批量描述内容" }]}
            >
              <Input.TextArea
                autoSize={{ minRows: 10, maxRows: 10 }}
                placeholder="请输入多日批量描述,例如:8月1号拼多多9.5元8月2号吸油棉4.9元"
                maxLength={1000}
              />
            </Form.Item>
          )}

          {/* 单条模式或编辑模式的输入 */}
          {mode === "single" && (
            <Form.Item
              name="classification"
              label="分类"
              wrapperCol={{ span: 20 }}
              rules={[{ required: true, message: "请选择分类" }]}
            >
              <Radio.Group
                options={transactionCategoryField.options}
                style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
              />
            </Form.Item>
          )}

          {mode === "single" && (
            <Form.Item
              name="amount"
              label="金额"
              rules={[
                {
                  type: "number",
                  min: 0,
                  required: true,
                  message: "请输入金额",
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          )}

          {mode === "single" && (
            <Form.Item name="describe" label="描述">
              <Input.TextArea />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 导入数据模态框 */}
      <Modal
        title="导入数据"
        open={importModalVisible}
        onOk={handleImport}
        onCancel={handleImportCancel}
        okText="导入"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p>请选择要导入的 JSON 文件</p>
          <Upload
            beforeUpload={handleFileUpload}
            fileList={importFile ? [importFile] : []}
            onRemove={() => setImportFile(null)}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
        </div>
        {importFile && (
          <p style={{ marginTop: 8 }}>已选择文件：{importFile.name}</p>
        )}
      </Modal>
    </div>
  );
};
export default Transactions;
