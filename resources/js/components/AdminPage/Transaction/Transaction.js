import React, { useEffect, useState } from "react";
import {
    Layout,
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    message,
    Checkbox,
    Row,
} from "antd";
import {
    UndoOutlined,
    EditOutlined,
    FolderOpenOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar"; // Adjust path as needed
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { Search } = Input;

const TransactionManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [archivedTransactions, setArchivedTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectAllActive, setSelectAllActive] = useState(false);
    const [selectedActiveTransactions, setSelectedActiveTransactions] = useState([]);
    const [selectAllArchived, setSelectAllArchived] = useState(false);
    const [selectedArchivedTransactions, setSelectedArchivedTransactions] = useState([]);
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");
    const API_URL = "http://localhost:8000/api/transactions";

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Fetched transactions:", response.data);
            const transformedTransactions = response.data.map((transaction) => ({
                ...transaction,
                selected: false,
            }));
            setTransactions(transformedTransactions.filter((t) => !t.deleted_at));
            setArchivedTransactions(transformedTransactions.filter((t) => t.deleted_at));
            if (transformedTransactions.length === 0) {
                message.info("No transactions found.");
            }
        } catch (error) {
            console.error("Error fetching transactions:", error.response?.data || error);
            message.error("Failed to fetch transactions: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleActiveCheckboxChange = (transactionId) => {
        const updatedTransactions = transactions.map((t) =>
            t.id === transactionId ? { ...t, selected: !t.selected } : t
        );
        setTransactions(updatedTransactions);
        setSelectedActiveTransactions(updatedTransactions.filter((t) => t.selected).map((t) => t.id));
        setSelectAllActive(updatedTransactions.every((t) => t.selected));
    };

    const handleSelectAllActiveChange = (e) => {
        const checked = e.target.checked;
        setSelectAllActive(checked);
        const updatedTransactions = transactions.map((t) => ({ ...t, selected: checked }));
        setTransactions(updatedTransactions);
        setSelectedActiveTransactions(checked ? updatedTransactions.map((t) => t.id) : []);
    };

    const handleArchiveAll = () => {
        if (selectedActiveTransactions.length === 0) {
            message.warning("Please select at least one transaction to archive");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedActiveTransactions.length} selected transaction(s)?`,
            onOk: () => {
                Promise.all(
                    selectedActiveTransactions.map((id) =>
                        axios.post(`${API_URL}/${id}/archive`, {}, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                    )
                )
                    .then(() => {
                        message.success("Selected transactions archived successfully");
                        fetchTransactions();
                        setSelectedActiveTransactions([]);
                        setSelectAllActive(false);
                    })
                    .catch(() => message.error("Failed to archive some transactions"));
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    const handleArchivedCheckboxChange = (transactionId) => {
        const updatedArchived = archivedTransactions.map((t) =>
            t.id === transactionId ? { ...t, selected: !t.selected } : t
        );
        setArchivedTransactions(updatedArchived);
        setSelectedArchivedTransactions(updatedArchived.filter((t) => t.selected).map((t) => t.id));
        setSelectAllArchived(updatedArchived.every((t) => t.selected));
    };

    const handleSelectAllArchivedChange = (e) => {
        const checked = e.target.checked;
        setSelectAllArchived(checked);
        const updatedArchived = archivedTransactions.map((t) => ({ ...t, selected: checked }));
        setArchivedTransactions(updatedArchived);
        setSelectedArchivedTransactions(checked ? updatedArchived.map((t) => t.id) : []);
    };

    const handleRestoreAll = () => {
        if (selectedArchivedTransactions.length === 0) {
            message.warning("Please select at least one transaction to restore");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to restore ${selectedArchivedTransactions.length} selected transaction(s)?`,
            onOk: () => {
                Promise.all(
                    selectedArchivedTransactions.map((id) =>
                        axios.post(`${API_URL}/${id}/restore`, {}, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                    )
                )
                    .then(() => {
                        message.success("Selected transactions restored successfully");
                        fetchTransactions();
                        setSelectedArchivedTransactions([]);
                        setSelectAllArchived(false);
                    })
                    .catch(() => message.error("Failed to restore some transactions"));
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    const handleUpdate = async (values) => {
        try {
            await axios.put(`${API_URL}/${editingTransaction.id}`, values, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("Transaction updated successfully. Order status may have been updated to 'processing'.");
            setEditModalVisible(false);
            setEditingTransaction(null);
            fetchTransactions();
        } catch (error) {
            console.error("Error updating transaction:", error.response?.data || error);
            message.error("Failed to update transaction");
        }
    };

    const handleArchive = (record) => {
        Modal.confirm({
            title: "Are you sure you want to archive this transaction?",
            onOk: () => {
                axios
                    .post(`${API_URL}/${record.id}/archive`, {}, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then(() => {
                        message.success("Transaction archived successfully");
                        fetchTransactions();
                    })
                    .catch(() => message.error("Failed to archive transaction"));
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    const handleRestore = (id) => {
        axios
            .post(`${API_URL}/${id}/restore`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                message.success("Transaction restored successfully");
                fetchTransactions();
            })
            .catch(() => message.error("Failed to restore transaction"));
    };

    const mainColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Checkbox
                        checked={record.selected}
                        onChange={() => handleActiveCheckboxChange(record.id)}
                    />
                    <Button type="link" onClick={() => handleArchive(record)}>
                        <FolderOpenOutlined />
                    </Button>
                    <Button type="link" onClick={() => {
                        setEditingTransaction(record);
                        form.setFieldsValue({
                            payment_method_id: record.payment_method?.id || null,
                            payment_status_id: record.payment_status?.id || null,
                            transaction_status: record.transaction_status,
                            payment_option: record.payment_option,
                        });
                        setEditModalVisible(true);
                    }}>
                        <EditOutlined />
                    </Button>
                </Space>
            ),
        },
        {
            title: "Customer Name",
            key: "customerName",
            render: (_, record) => record.profile?.customer_name || "N/A",
        },
        {
            title: "Total Amount",
            key: "totalAmount",
            render: (_, record) => record.order
                ? `₱${parseFloat(record.order.total_amount).toLocaleString()}`
                : "N/A",
        },
        {
            title: "Payment Method",
            key: "paymentMethod",
            render: (_, record) => record.payment_method?.name || "N/A",
        },
        {
            title: "Payment Status",
            key: "paymentStatus",
            render: (_, record) => record.payment_status?.name || "N/A",
        },
        {
            title: "Transaction Status",
            dataIndex: "transaction_status",
            key: "transaction_status",
        },
        {
            title: "Payment Option",
            dataIndex: "payment_option",
            key: "payment_option",
            render: (text) => text || "-",
        },
    ];

    const archiveColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Checkbox
                        checked={record.selected}
                        onChange={() => handleArchivedCheckboxChange(record.id)}
                    />
                    <Button type="link" onClick={() => handleRestore(record.id)}>
                        <UndoOutlined style={{ fontSize: "18px" }} />
                    </Button>
                </Space>
            ),
        },
        ...mainColumns.slice(1),
    ];

    const filteredTransactions = transactions.filter((t) => {
        const lowerSearch = searchText.toLowerCase();
        return (
            t.id.toString().includes(lowerSearch) ||
            (t.profile?.customer_name || "").toLowerCase().includes(lowerSearch) ||
            (t.payment_method?.name || "").toLowerCase().includes(lowerSearch) ||
            (t.payment_status?.name || "").toLowerCase().includes(lowerSearch) ||
            (t.transaction_status || "").toLowerCase().includes(lowerSearch) ||
            (t.payment_option || "").toLowerCase().includes(lowerSearch)
        );
    });

    const filteredArchivedTransactions = archivedTransactions.filter((t) => {
        const lowerSearch = searchText.toLowerCase();
        return (
            t.id.toString().includes(lowerSearch) ||
            (t.profile?.customer_name || "").toLowerCase().includes(lowerSearch) ||
            (t.payment_method?.name || "").toLowerCase().includes(lowerSearch) ||
            (t.payment_status?.name || "").toLowerCase().includes(lowerSearch) ||
            (t.transaction_status || "").toLowerCase().includes(lowerSearch) ||
            (t.payment_option || "").toLowerCase().includes(lowerSearch)
        );
    });

    return (
        <Layout>
            <Sider width={256} style={{ minHeight: "100vh" }}>
                <Sidebar />
            </Sider>
            <Layout>
                <Header style={{ background: "#fff", padding: "0 24px" }}>
                    TRANSACTION MANAGEMENT
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                        <Space>
                            <Search
                                placeholder="Search transactions by ID, customer, method, status, or option"
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 300 }}
                            />
                            <Checkbox checked={selectAllActive} onChange={handleSelectAllActiveChange}>
                                Select All
                            </Checkbox>
                            {(selectAllActive || selectedActiveTransactions.length > 0) && (
                                <Button type="link" onClick={handleArchiveAll}>
                                    <FolderOpenOutlined style={{ fontSize: "18px" }} />
                                    {selectedActiveTransactions.length > 0 && ` (${selectedActiveTransactions.length})`}
                                </Button>
                            )}
                        </Space>
                        <Button type="default" onClick={() => setOpenArchiveModal(true)}>
                            Archived Transactions
                        </Button>
                    </Row>
                    <Table
                        columns={mainColumns}
                        dataSource={filteredTransactions}
                        rowKey="id"
                        loading={loading}
                        scroll={{ x: 1200 }}
                    />
                </Content>
            </Layout>

            <Modal
                title="Archived Transactions"
                open={openArchiveModal}
                onCancel={() => setOpenArchiveModal(false)}
                width={1200}
                footer={[]}
            >
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    <Checkbox
                        checked={selectAllArchived}
                        onChange={handleSelectAllArchivedChange}
                        style={{ marginRight: 16 }}
                    >
                        Select All
                    </Checkbox>
                    {(selectAllArchived || selectedArchivedTransactions.length > 0) && (
                        <Button type="link" onClick={handleRestoreAll}>
                            <UndoOutlined style={{ fontSize: "18px" }} />
                            Restore
                            {selectedArchivedTransactions.length > 0 && ` (${selectedArchivedTransactions.length})`}
                        </Button>
                    )}
                </div>
                <Table
                    columns={archiveColumns}
                    dataSource={filteredArchivedTransactions}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                />
            </Modal>

            <Modal
                title="Update Transaction"
                visible={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setEditingTransaction(null);
                }}
                footer={[
                    <Button key="cancel" onClick={() => setEditModalVisible(false)} style={{ width: "131px" }}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => form.submit()} style={{ width: "131px" }}>
                        Update Transaction
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item
                        label="Payment Method"
                        name="payment_method_id"
                        rules={[{ required: true, message: "Please select payment method" }]}
                    >
                        <Select>
                            <Option value={1}>Cash on Delivery</Option>
                            <Option value={2}>Credit Card</Option>
                            <Option value={3}>Digital Wallet</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Payment Status"
                        name="payment_status_id"
                        rules={[{ required: true, message: "Please select payment status" }]}
                    >
                        <Select>
                            <Option value={1}>Pending</Option>
                            <Option value={2}>Completed</Option>
                            <Option value={3}>Failed</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Transaction Status"
                        name="transaction_status"
                        rules={[{ required: true, message: "Please select transaction status" }]}
                    >
                        <Select>
                            <Option value="Completed">Completed</Option>
                            <Option value="Cancelled">Cancelled</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Payment Option (if applicable)" name="payment_option">
                        <Input placeholder="e.g., G-Cash, PayMaya, Master Visa Card" />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default TransactionManagement;