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
} from "antd";
import {
    UndoOutlined,
    EditOutlined,
    FolderOpenOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Option } = Select;

const TransactionManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");
    const API_URL = "http://localhost:8000/api";

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Ensure the API loads the new relationship: paymentOption.
            setTransactions(response.data.data || response.data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            message.error("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

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
        } catch (error) {
            message.error("Failed to restore transaction");
        }
    };

    const columns = [
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

        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<FolderOpenOutlined />}
                        onClick={() => handleArchive(record.id)}
                    >
                        Archive
                    </Button>
                    <Button
                        type="link"
                        icon={<UndoOutlined />}
                        onClick={() => handleRestore(record.id)}
                    >
                        Restore
                    </Button>
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
                                // We don’t allow editing payment option manually.
                            });
                            setEditModalVisible(true);
                        }}
                    >
                        Update
                    </Button>
                </Space>
            ),
        },
    ];

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
                    <Table
                        columns={columns}
                        dataSource={transactions}
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
        </Layout>
    );
};

export default TransactionManagement;
