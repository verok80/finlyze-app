import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Typography,
  Select,
  Table,
  Radio,
} from "antd";
import searchImg from "../../assets/search.svg";
import { unparse, parse } from "papaparse";
import { toast } from "react-toastify";
import { updateTransaction } from "../../services/transactionService";
import { deleteTransaction } from "../../services/transactionService";

const { Option } = Select;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

function TransactionsTable({ transactions, addTransaction, fetchTransactions, user }) {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");

  // Ensure transactions have keys
  const transactionsWithKeys = transactions.map((t, index) => ({
    ...t,
    key: index.toString(),
  }));

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ name: "", amount: "", tag: "", date: "", type: "", ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
  try {
    const row = await form.validateFields();
    const item = transactionsWithKeys.find((item) => item.key === key);

    console.log("About to save row:", row, "for item:", item);

    await updateTransaction(user.uid, item.id, row);

    setEditingKey("");
    toast.success("Transaction updated successfully");
    fetchTransactions();
  } catch (error) {
    console.error("Save failed:", error);
    toast.error(`Failed to update transaction: ${error.message}`);
  }
};
const handleDelete = async (record) => {
  try {
    if (!user || !user.uid || !record.id) {
      toast.error("Missing user or transaction ID");
      return;
    }

    await deleteTransaction(user.uid, record.id);
    toast.success("Transaction deleted successfully");
    fetchTransactions(); // refresh the list
  } catch (error) {
    console.error("Failed to delete:", error);
    toast.error("Failed to delete transaction");
  }
};


  const filteredTransactions = transactionsWithKeys.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      item.type.includes(typeFilter)
  );

  const sortedTransactions = filteredTransactions.sort((a, b) => {
    if (sortKey === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    } else {
      return 0;
    }
  });

  const exportCSV = () => {
    const csv = unparse({
      fields: ["name", "type", "tag", "date", "amount"],
      data: transactions,
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromCsv = (event) => {
    event.preventDefault();
    try {
      parse(event.target.files[0], {
        header: true,
        complete: async function (results) {
          for (const transaction of results.data) {
            const newTransaction = {
              ...transaction,
              amount: parseFloat(transaction.amount),
            };
            await addTransaction(newTransaction, true);
          }
          toast.success("All Transactions Added");
          fetchTransactions();
          event.target.value = null;
        },
      });
    } catch (e) {
      toast.error(e.message);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      editable: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      editable: true,
    },
    {
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
      editable: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      editable: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      editable: true,
    },


  {
  title: "Action",
  dataIndex: "action",
  render: (_, record) => {
    const editable = isEditing(record);

    return editable ? (
      <span>
        <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
          Save
        </Typography.Link>
        <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
          <a>Cancel</a>
        </Popconfirm>
      </span>
    ) : (
      <span style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Typography.Link
          disabled={editingKey !== ""}
          onClick={() => edit(record)}
        >
          Edit
        </Typography.Link>
        <Popconfirm
          title="Are you sure to delete this transaction?"
          onConfirm={() => handleDelete(record)}
          okText="Yes"
          cancelText="No"
        >
          <Typography.Link type="danger">Delete</Typography.Link>
        </Popconfirm>
      </span>
    );
  },
},
  ]

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "amount" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div style={{ width: "97%", padding: "0rem 2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div className="input-flex">
          <img src={searchImg} width="16" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
          />
        </div>

        <Select
          className="select-input"
          onChange={(value) => setTypeFilter(value)}
          value={typeFilter}
          placeholder="Filter"
          allowClear
        >
          <Option value="">All</Option>
          <Option value="income">Income</Option>
          <Option value="expense">Expense</Option>
        </Select>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <h2>My Transactions</h2>
          <Radio.Group
            className="input-radio"
            onChange={(e) => setSortKey(e.target.value)}
            value={sortKey}
          >
            <Radio.Button value="">No sort</Radio.Button>
            <Radio.Button value="date">Sort by Date</Radio.Button>
            <Radio.Button value="amount">Sort by Amount</Radio.Button>
          </Radio.Group>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              width: "400px",
              flexWrap: "wrap",
            }}
          >
            <button className="btn" onClick={exportCSV}>
              Export to CSV
            </button>
            <label htmlFor="file-csv" className="btn btn-blue">
              Import from CSV
            </label>
            <input
              id="file-csv"
              type="file"
              accept=".csv"
              required
              onChange={importFromCsv}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            dataSource={sortedTransactions}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{
              onChange: cancel,
            }}
          />
        </Form>
      </div>
    </div>
  );
}

export default TransactionsTable;
