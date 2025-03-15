import React, { useState, useEffect } from "react";
import {
    Layout,
    Table,
    Space,
    Button,
    Modal,
    Select,
    Input,
    message,
} from "antd";
import {
    EditOutlined,
    FolderOpenOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Option } = Select;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [archivedOrders, setArchivedOrders] = useState([]);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const API_URL = "http://localhost:8000/api/orders";

    const fetchOrders = () => {
        axios
            .get(API_URL, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                console.log("API Response:", res.data); // Debug
                const transformedOrders = res.data.map((order) => ({
                    ...order,
                    order_date: order.order_date || order.created_at,
                    shipping: order.shipping || {}, // Ensure shipping is an object
                }));
                setOrders(
                    transformedOrders.filter((order) => !order.deleted_at)
                );
                setArchivedOrders(
                    transformedOrders.filter((order) => order.deleted_at)
                );
            })
            .catch((err) => {
                message.error("Error fetching orders");
                console.error(err.response?.data || err);
            });
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const mainColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <EditOutlined onClick={() => handleEdit(record)} />
                    <FolderOpenOutlined onClick={() => handleArchive(record)} />
                    <EyeOutlined onClick={() => handleView(record)} />
                </Space>
            ),
        },
        { title: "Order ID", dataIndex: "id", key: "id" },
        {
            title: "Customer Name",
            key: "customer_name",
            render: (record) =>
                record.profile
                    ? `${record.profile.first_name || ""} ${
                          record.profile.last_name || ""
                      }`
                    : "N/A",
        },
        {
            title: "Items",
            key: "items",
            render: (record) =>
                record.order_details?.length
                    ? record.order_details
                          .map(
                              (detail) =>
                                  detail.product?.product_name || "Unknown"
                          )
                          .join(", ")
                    : "No items",
        },
        {
            title: "Priority",
            key: "priority",
            render: (record) => record.shipping?.shipping_method?.name || "N/A",
        },
        {
            title: "Order Status",
            dataIndex: "order_status",
            key: "order_status",
            render: (status) => status || "N/A",
        },
        {
            title: "Total Amount",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (amount) =>
                `₱${amount ? parseFloat(amount).toLocaleString() : "0"}`,
        },
        {
            title: "Order Date",
            dataIndex: "order_date",
            key: "order_date",
            render: (date) => date || "N/A",
        },
    ];

    const archiveColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Button type="link" onClick={() => handleRestore(record.id)}>
                    Restore
                </Button>
            ),
        },
        ...mainColumns.slice(1),
    ];

    const handleEdit = (record) => {
        setSelectedOrder(record);
        setOpenEditModal(true);
    };

    const handleArchive = (record) => {
        Modal.confirm({
            title: "Are you sure you want to archive this order?",
            onOk: () => {
                axios
                    .post(
                        `${API_URL}/${record.id}/archive`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        }
                    )
                    .then(() => {
                        message.success("Order archived successfully");
                        fetchOrders();
                    })
                    .catch((err) => {
                        message.error("Failed to archive order");
                        console.error(err);
                    });
            },
        });
    };

    const handleRestore = (id) => {
        axios
            .post(
                `${API_URL}/${id}/restore`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                message.success("Order restored successfully");
                fetchOrders();
            })
            .catch((err) => {
                message.error("Failed to restore order");
                console.error(err);
            });
    };

    const handleUpdate = () => {
        axios
            .put(
                `${API_URL}/${selectedOrder.id}`,
                {
                    order_status: selectedOrder.order_status,
                    shipping: {
                        tracking_number:
                            selectedOrder.shipping.tracking_number || null,
                        shipping_status_id:
                            selectedOrder.shipping.shipping_status_id || 1,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                message.success("Order updated successfully");
                setOpenEditModal(false);
                fetchOrders();
            })
            .catch((err) => {
                message.error("Failed to update order");
                console.error(err);
            });
    };

    const handleView = (record) => {
        Modal.info({
            title: `Order #${record.id} Details`,
            content: (
                <div>
                    <p>
                        Customer: {record.profile?.first_name || ""}{" "}
                        {record.profile?.last_name || ""}
                    </p>
                    <p>
                        Items:{" "}
                        {record.order_details
                            ?.map((d) => d.product?.product_name || "Unknown")
                            .join(", ") || "No items"}
                    </p>
                    <p>
                        Total: ₱
                        {record.total_amount
                            ? parseFloat(record.total_amount).toLocaleString()
                            : "0"}
                    </p>
                    <p>Status: {record.order_status || "N/A"}</p>
                </div>
            ),
        });
    };

    return (
        <Layout>
            <Sider width={256} style={{ minHeight: "100vh" }}>
                <Sidebar />
            </Sider>
            <Layout>
                <Header style={{ background: "#fff", padding: "0 24px" }}>
                    ORDER MANAGEMENT
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    <Button
                        type="default"
                        onClick={() => setOpenArchiveModal(true)}
                        style={{ marginBottom: 16 }}
                    >
                        Archived Orders
                    </Button>
                    <Table
                        columns={mainColumns}
                        dataSource={orders}
                        rowKey="id"
                        scroll={{ x: 1200 }}
                    />
                </Content>
            </Layout>
            <Modal
                title="Archived Orders"
                open={openArchiveModal}
                onCancel={() => setOpenArchiveModal(false)}
                width={1200}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setOpenArchiveModal(false)}
                    >
                        Close
                    </Button>,
                ]}
            >
                <Table
                    columns={archiveColumns}
                    dataSource={archivedOrders}
                    rowKey="id"
                />
            </Modal>
            <Modal
                title="Edit Order"
                open={openEditModal}
                onCancel={() => setOpenEditModal(false)}
                onOk={handleUpdate}
            >
                {selectedOrder && (
                    <div>
                        <p>Order ID: {selectedOrder.id}</p>
                        <Select
                            value={selectedOrder.order_status}
                            onChange={(value) =>
                                setSelectedOrder({
                                    ...selectedOrder,
                                    order_status: value,
                                })
                            }
                            style={{ width: "100%", marginBottom: 16 }}
                        >
                            <Option value="pending">Pending</Option>
                            <Option value="completed">Completed</Option>
                            <Option value="cancelled">Cancelled</Option>
                            <Option value="processing">Processing</Option>
                        </Select>
                        <Input
                            value={
                                selectedOrder.shipping?.tracking_number || ""
                            }
                            onChange={(e) =>
                                setSelectedOrder({
                                    ...selectedOrder,
                                    shipping: {
                                        ...selectedOrder.shipping,
                                        tracking_number: e.target.value,
                                    },
                                })
                            }
                            placeholder="Tracking Number"
                        />
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default OrderManagement;
