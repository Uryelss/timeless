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
    Row,
    Col,
    Image,
    Typography,
    Avatar,
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
const { Title, Text } = Typography;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [archivedOrders, setArchivedOrders] = useState([]);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
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
        setSelectedOrder(record);
        setOpenViewModal(true);
    };

    const renderOrderDetails = () => {
        if (!selectedOrder) return null;

        const { order_details, shipping, profile } = selectedOrder;
        const subtotal =
            order_details?.reduce(
                (sum, detail) => sum + detail.quantity * detail.price,
                0
            ) || 0;
        const deliveryCharge = shipping?.shipping_total_amount || 0;
        const totalAmount =
            selectedOrder.total_amount || subtotal + deliveryCharge;

        return (
            <Row gutter={[16, 16]}>
                {/* Order Summary */}
                <Col span={24}>
                    <Title level={4}>Order Summary</Title>
                    {order_details?.map((detail) => (
                        <Row
                            key={detail.id}
                            style={{ marginBottom: 16, alignItems: "center" }}
                        >
                            <Col span={4}>
                                <Image
                                    src={
                                        detail.product?.main_image
                                            ? `http://localhost:8000/storage/${detail.product.main_image}`
                                            : "https://via.placeholder.com/50"
                                    }
                                    width={50}
                                    preview={false}
                                />
                            </Col>
                            <Col span={8}>
                                <Text>
                                    {detail.product?.product_name || "Unknown"}
                                </Text>
                            </Col>
                            <Col span={4}>
                                <Text>Qty: {detail.quantity}</Text>
                            </Col>
                            <Col span={4}>
                                <Text>
                                    ₱{parseFloat(detail.price).toLocaleString()}
                                </Text>
                            </Col>
                            <Col span={4}>
                                <Text>
                                    ₱
                                    {(
                                        detail.quantity * detail.price
                                    ).toLocaleString()}
                                </Text>
                            </Col>
                        </Row>
                    ))}
                    <div style={{ textAlign: "right", marginTop: 16 }}>
                        <Text>Sub Total: ₱{subtotal.toLocaleString()}</Text>
                        <br />
                        <Text>
                            Delivery Charge: ₱
                            {parseFloat(deliveryCharge).toLocaleString()}
                        </Text>
                        <br />
                        <Text strong>
                            Total Amount: ₱
                            {parseFloat(totalAmount).toLocaleString()}
                        </Text>
                    </div>
                </Col>

                {/* Customer Details */}
                <Col span={24}>
                    <Title level={4}>Customer Details</Title>
                    <Row align="middle">
                        <Col span={4}>
                            <Avatar
                                src={
                                    profile?.profile_image ||
                                    "https://via.placeholder.com/50"
                                }
                                size={50}
                            />
                        </Col>
                        <Col span={20}>
                            <Text strong>Username: </Text>
                            <Text>{profile?.user?.username || "N/A"}</Text>
                            <br />
                            <Text strong>Email: </Text>
                            <Text>{profile?.user?.email || "N/A"}</Text>
                            <br />
                            <Text strong>Phone: </Text>
                            <Text>{profile?.phone || "N/A"}</Text>
                        </Col>
                    </Row>
                </Col>

                {/* Payment Information */}
                <Col span={24}>
                    <Title level={4}>Payment Information</Title>
                    <Text>
                        {shipping?.payment_method?.name ||
                            "Unknown Payment Method"}
                    </Text>
                </Col>
            </Row>
        );
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
            <Modal
                title={`Order #${selectedOrder?.id || ""} Details`}
                open={openViewModal}
                onCancel={() => setOpenViewModal(false)}
                footer={[
                    <Button key="close" onClick={() => setOpenViewModal(false)}>
                        Close
                    </Button>,
                ]}
                width={800}
            >
                {renderOrderDetails()}
            </Modal>
        </Layout>
    );
};

export default OrderManagement;
