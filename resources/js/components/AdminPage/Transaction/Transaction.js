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
} from "antd";
import {
    UndoOutlined,
    EditOutlined,
    FolderOpenOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAllActive, setSelectAllActive] = useState(false);
    const [selectedActiveTransactions, setSelectedActiveTransactions] =
        useState([]);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [selectedArchivedTransactions, setSelectedArchivedTransactions] =
        useState([]);
    const [selectAllArchived, setSelectAllArchived] = useState(false);
    const [form] = Form.useForm();

    const token = localStorage.getItem("token");
    const API_URL = "http://localhost:8000/api";

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = response.data.data || response.data;
            // add a "selected" field for checkbox management
            const updatedData = data.map((item) => ({
                ...item,
                selected: false,
            }));
            setTransactions(updatedData);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            message.error("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    };

    const fetchArchivedTransactions = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/transactions?archived=1`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = response.data.data || response.data;
            const updatedData = data.map((item) => ({
                ...item,
                selected: false,
            }));
            setArchivedTransactions(updatedData);
        } catch (error) {
            console.error("Error fetching archived transactions:", error);
            message.error("Failed to fetch archived transactions");
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        if (openArchiveModal) fetchArchivedTransactions();
    }, [openArchiveModal]);

    const handleUpdate = async (values) => {
        try {
            await axios.put(
                `${API_URL}/transactions/${editingTransaction.id}`,
                values,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            message.success("Transaction updated successfully");
            setEditModalVisible(false);
            setEditingTransaction(null);
            fetchTransactions();
        } catch (error) {
            message.error("Failed to update transaction");
        }
    };

    const handleArchive = async (id) => {
        try {
            await axios.post(
                `${API_URL}/transactions/${id}/archive`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            message.success("Transaction archived successfully");
            fetchTransactions();
        } catch (error) {
            message.error("Failed to archive transaction");
        }
    };

    const handleRestore = async (id) => {
        try {
            await axios.post(
                `${API_URL}/transactions/${id}/restore`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            message.success("Transaction restored successfully");
            fetchTransactions();
            fetchArchivedTransactions();
        } catch (error) {
            message.error("Failed to restore transaction");
        }
    };

    // Handlers for active transactions multi-select
    const handleActiveCheckboxChange = (id) => {
        const updatedTransactions = transactions.map((item) =>
            item.id === id ? { ...item, selected: !item.selected } : item
        );
        setTransactions(updatedTransactions);
        const selected = updatedTransactions
            .filter((item) => item.selected)
            .map((item) => item.id);
        setSelectedActiveTransactions(selected);
        setSelectAllActive(updatedTransactions.every((item) => item.selected));
    };

    const handleSelectAllActiveChange = (e) => {
        const checked = e.target.checked;
        setSelectAllActive(checked);
        const updatedTransactions = transactions.map((item) => ({
            ...item,
            selected: checked,
        }));
        setTransactions(updatedTransactions);
        setSelectedActiveTransactions(
            checked ? updatedTransactions.map((item) => item.id) : []
        );
    };

    const handleArchiveAll = () => {
        if (selectedActiveTransactions.length === 0) {
            message.warning(
                "Please select at least one transaction to archive"
            );
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedActiveTransactions.length} selected transaction(s)?`,
            onOk: () => {
                Promise.all(
                    selectedActiveTransactions.map((id) =>
                        axios.post(
                            `${API_URL}/transactions/${id}/archive`,
                            {},
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        )
                    )
                )
                    .then(() => {
                        message.success(
                            "Selected transactions archived successfully"
                        );
                        fetchTransactions();
                        setSelectedActiveTransactions([]);
                        setSelectAllActive(false);
                    })
                    .catch(() =>
                        message.error("Failed to archive some transactions")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Handlers for archived transactions multi-select
    const handleArchivedCheckboxChange = (id) => {
        const updatedArchived = archivedTransactions.map((item) =>
            item.id === id ? { ...item, selected: !item.selected } : item
        );
        setArchivedTransactions(updatedArchived);
        const selected = updatedArchived
            .filter((item) => item.selected)
            .map((item) => item.id);
        setSelectedArchivedTransactions(selected);
        setSelectAllArchived(updatedArchived.every((item) => item.selected));
    };

    const handleSelectAllArchivedChange = (e) => {
        const checked = e.target.checked;
        setSelectAllArchived(checked);
        const updatedArchived = archivedTransactions.map((item) => ({
            ...item,
            selected: checked,
        }));
        setArchivedTransactions(updatedArchived);
        setSelectedArchivedTransactions(
            checked ? updatedArchived.map((item) => item.id) : []
        );
    };

    const handleRestoreAll = () => {
        if (selectedArchivedTransactions.length === 0) {
            message.warning(
                "Please select at least one transaction to restore"
            );
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to restore ${selectedArchivedTransactions.length} selected transaction(s)?`,
            onOk: () => {
                Promise.all(
                    selectedArchivedTransactions.map((id) =>
                        axios.post(
                            `${API_URL}/transactions/${id}/restore`,
                            {},
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        )
                    )
                )
                    .then(() => {
                        message.success(
                            "Selected transactions restored successfully"
                        );
                        fetchArchivedTransactions();
                        fetchTransactions();
                        setSelectedArchivedTransactions([]);
                        setSelectAllArchived(false);
                    })
                    .catch(() =>
                        message.error("Failed to restore some transactions")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Active view: actions column contains only archive and update actions as icons.
    const activeColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Checkbox
                        checked={record.selected}
                        onChange={() => handleActiveCheckboxChange(record.id)}
                    />
                    <Button
                        type="link"
                        icon={<FolderOpenOutlined />}
                        onClick={() => handleArchive(record.id)}
                    />
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingTransaction(record);
                            form.setFieldsValue({
                                payment_method_id: record.payment_method
                                    ? record.payment_method.id
                                    : null,
                                payment_status_id: record.payment_status
                                    ? record.payment_status.id
                                    : null,
                                transaction_status: record.transaction_status,
                            });
                            setEditModalVisible(true);
                        }}
                    />
                </Space>
            ),
        },
        {
            title: "Customer Name",
            key: "customerName",
            render: (_, record) =>
                record.profile && record.profile.customer_name
                    ? record.profile.customer_name
                    : "N/A",
        },
        {
            title: "Total Amount",
            key: "totalAmount",
            render: (_, record) =>
                record.order
                    ? `$${parseFloat(record.order.total_amount).toFixed(2)}`
                    : "N/A",
        },
        {
            title: "Payment Method",
            key: "paymentMethod",
            render: (_, record) =>
                record.payment_method ? record.payment_method.name : "N/A",
        },
        {
            title: "Payment Status",
            key: "paymentStatus",
            render: (_, record) =>
                record.payment_status ? record.payment_status.name : "N/A",
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

    // Archived view: actions column now shows only the restore icon.
    const archivedColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Checkbox
                        checked={record.selected}
                        onChange={() => handleArchivedCheckboxChange(record.id)}
                    />
                    <Button
                        type="link"
                        icon={<UndoOutlined />}
                        onClick={() => handleRestore(record.id)}
                    />
                </Space>
            ),
        },
        ...activeColumns.slice(1),
    ];

    const filteredTransactions = transactions.filter((transaction) => {
        const name =
            transaction.profile && transaction.profile.customer_name
                ? transaction.profile.customer_name
                : "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredArchivedTransactions = archivedTransactions.filter(
        (transaction) => {
            const name =
                transaction.profile && transaction.profile.customer_name
                    ? transaction.profile.customer_name
                    : "";
            return name.toLowerCase().includes(searchQuery.toLowerCase());
        }
    );

    return (
        <Layout>
            <Sider width={256} style={{ minHeight: "100vh" }}>
                <Sidebar />
            </Sider>
            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        fontSize: "18px",
                        fontWeight: "bold",
                    }}
                >
                    TRANSACTION MANAGEMENT
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Search
                                placeholder="Search transactions"
                                onSearch={(value) => setSearchQuery(value)}
                                style={{ width: 300, marginRight: 16 }}
                            />
                            <Checkbox
                                checked={selectAllActive}
                                onChange={handleSelectAllActiveChange}
                                style={{ marginLeft: 16 }}
                            >
                                Select All
                            </Checkbox>
                            {(selectAllActive ||
                                selectedActiveTransactions.length > 0) && (
                                <Button
                                    type="link"
                                    onClick={handleArchiveAll}
                                    style={{ marginLeft: 8 }}
                                    icon={<FolderOpenOutlined />}
                                />
                            )}
                        </div>
                        <Button
                            type="default"
                            icon={<DeleteOutlined />}
                            onClick={() => setOpenArchiveModal(true)}
                            style={{ marginRight: 8, width: "131px" }}
                        >
                            Archived View
                        </Button>
                    </div>
                    <Table
                        columns={activeColumns}
                        dataSource={filteredTransactions}
                        rowKey="id"
                        loading={loading}
                    />
                </Content>
            </Layout>
            <Modal
                title="Update Transaction"
                visible={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setEditingTransaction(null);
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item
                        label="Payment Method"
                        name="payment_method_id"
                        rules={[
                            {
                                required: true,
                                message: "Please select payment method",
                            },
                        ]}
                    >
                        <Select>
                            <Option value="1">Cash on Delivery</Option>
                            <Option value="2">Credit Card</Option>
                            <Option value="3">Digital Wallet</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Payment Status"
                        name="payment_status_id"
                        rules={[
                            {
                                required: true,
                                message: "Please select payment status",
                            },
                        ]}
                    >
                        <Select>
                            <Option value="1">Pending</Option>
                            <Option value="2">Paid</Option>
                            <Option value="3">Failed</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Transaction Status"
                        name="transaction_status"
                        rules={[
                            {
                                required: true,
                                message: "Please select transaction status",
                            },
                        ]}
                    >
                        <Select>
                            <Option value="Pending">Pending</Option>
                            <Option value="Completed">Completed</Option>
                            <Option value="Cancelled">Cancelled</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ width: "100%" }}
                        >
                            Update Transaction
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Archived Transactions"
                centered
                open={openArchiveModal}
                onCancel={() => setOpenArchiveModal(false)}
                width={1200}
                footer={[]}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <Checkbox
                        checked={selectAllArchived}
                        onChange={handleSelectAllArchivedChange}
                        style={{ marginRight: 16 }}
                    >
                        Select All
                    </Checkbox>
                    {(selectAllArchived ||
                        selectedArchivedTransactions.length > 0) && (
                        <Button
                            type="link"
                            onClick={handleRestoreAll}
                            style={{ marginRight: 8 }}
                            icon={<UndoOutlined />}
                        />
                    )}
                </div>
                <Table
                    columns={archivedColumns}
                    dataSource={filteredArchivedTransactions}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1200 }}
                />
            </Modal>
        </Layout>
    );
};

export default TransactionManagement;
