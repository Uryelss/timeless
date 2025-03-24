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
    Checkbox,
    Row,
    Col,
    Image,
    Typography,
    Avatar,
    Descriptions,
    Form,
} from "antd";
import {
    EditOutlined,
    FolderOpenOutlined,
    EyeOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [archivedOrders, setArchivedOrders] = useState([]);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [selectAllActive, setSelectAllActive] = useState(false);
    const [selectedActiveOrders, setSelectedActiveOrders] = useState([]);
    const [selectAllArchived, setSelectAllArchived] = useState(false);
    const [selectedArchivedOrders, setSelectedArchivedOrders] = useState([]);

    const [form] = Form.useForm();
    const API_URL = "http://localhost:8000/api/orders";
    const token = localStorage.getItem("token");

    // Fetch orders from the backend
    const fetchOrders = () => {
        axios
            .get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                console.log("API Response:", res.data); // Debug
                const transformed = res.data.map((order) => ({
                    ...order,
                    order_date: order.order_date || order.created_at,
                    shipping: order.shipping || {},
                    selected: false, // Initialize selected state
                }));
                setOrders(transformed.filter((order) => !order.deleted_at));
                setArchivedOrders(
                    transformed.filter((order) => order.deleted_at)
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

    // Handlers for active orders
    const handleActiveCheckboxChange = (orderId) => {
        const updated = orders.map((order) =>
            order.id === orderId
                ? { ...order, selected: !order.selected }
                : order
        );
        setOrders(updated);
        setSelectedActiveOrders(
            updated.filter((o) => o.selected).map((o) => o.id)
        );
        setSelectAllActive(updated.every((o) => o.selected));
    };

    const handleSelectAllActiveChange = (e) => {
        const checked = e.target.checked;
        setSelectAllActive(checked);
        const updated = orders.map((order) => ({
            ...order,
            selected: checked,
        }));
        setOrders(updated);
        setSelectedActiveOrders(checked ? updated.map((o) => o.id) : []);
    };

    const handleArchiveAll = () => {
        if (selectedActiveOrders.length === 0) {
            message.warning("Please select at least one order to archive");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedActiveOrders.length} selected order(s)?`,
            onOk: () => {
                Promise.all(
                    selectedActiveOrders.map((id) =>
                        axios.post(
                            `${API_URL}/${id}/archive`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    )
                )
                    .then(() => {
                        message.success(
                            "Selected orders archived successfully"
                        );
                        fetchOrders();
                        setSelectedActiveOrders([]);
                        setSelectAllActive(false);
                    })
                    .catch(() =>
                        message.error("Failed to archive some orders")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Handlers for archived orders
    const handleArchivedCheckboxChange = (orderId) => {
        const updated = archivedOrders.map((order) =>
            order.id === orderId
                ? { ...order, selected: !order.selected }
                : order
        );
        setArchivedOrders(updated);
        setSelectedArchivedOrders(
            updated.filter((o) => o.selected).map((o) => o.id)
        );
        setSelectAllArchived(updated.every((o) => o.selected));
    };

    const handleSelectAllArchivedChange = (e) => {
        const checked = e.target.checked;
        setSelectAllArchived(checked);
        const updated = archivedOrders.map((order) => ({
            ...order,
            selected: checked,
        }));
        setArchivedOrders(updated);
        setSelectedArchivedOrders(checked ? updated.map((o) => o.id) : []);
    };

    const handleRestoreAll = () => {
        if (selectedArchivedOrders.length === 0) {
            message.warning("Please select at least one order to restore");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to restore ${selectedArchivedOrders.length} selected order(s)?`,
            onOk: () => {
                Promise.all(
                    selectedArchivedOrders.map((id) =>
                        axios.post(
                            `${API_URL}/${id}/restore`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    )
                )
                    .then(() => {
                        message.success(
                            "Selected orders restored successfully"
                        );
                        fetchOrders();
                        setSelectedArchivedOrders([]);
                        setSelectAllArchived(false);
                    })
                    .catch(() =>
                        message.error("Failed to restore some orders")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Define table columns for active orders
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
                    <EditOutlined
                        onClick={() => {
                            setSelectedOrder(record);
                            // Pre-fill the edit form with current order status
                            form.setFieldsValue({
                                order_status: record.order_status,
                            });
                            setOpenEditModal(true);
                        }}
                    />
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
            title: "Shipping Status",
            key: "shipping_status",
            render: (record) => record.shipping?.shipping_status?.name || "N/A",
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

    // Define table columns for archived orders
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
                    <Button
                        type="link"
                        onClick={() => handleRestore(record.id)}
                    >
                        <UndoOutlined style={{ fontSize: "18px" }} />
                    </Button>
                </Space>
            ),
        },
        ...mainColumns.slice(1),
    ];

    // Archive a single order
    const handleArchive = (record) => {
        Modal.confirm({
            title: "Are you sure you want to archive this order?",
            onOk: () => {
                axios
                    .post(
                        `${API_URL}/${record.id}/archive`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
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
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Restore a single order
    const handleRestore = (id) => {
        axios
            .post(
                `${API_URL}/${id}/restore`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
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

    // Update order: send updated order_status and shipping info.
    // Tracking number is auto‑generated by the backend if needed.
    const handleUpdate = () => {
        axios
            .put(
                `${API_URL}/${selectedOrder.id}`,
                {
                    order_status: selectedOrder.order_status,
                    shipping: {
                        tracking_number:
                            selectedOrder.shipping?.tracking_number || null,
                        shipping_status_id:
                            selectedOrder.shipping?.shipping_status_id || 1,
                    },
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then(() => {
                message.success("Order updated successfully");
                setOpenEditModal(false);
                fetchOrders();
            })
            .catch((err) => {
                message.error(
                    "Failed to update order: " +
                        (err.response?.data?.message || "Unknown error")
                );
                console.error(err);
            });
    };

    // When clicking the eye icon, open the view modal with full order details.
    const handleView = (record) => {
        setSelectedOrder(record);
        setOpenViewModal(true);
    };

    // Render full order details (including user avatar and product images).
    const renderOrderDetails = () => {
        if (!selectedOrder) return null;
        const items =
            selectedOrder.order_details || selectedOrder.orderDetails || [];
        const { shipping, profile } = selectedOrder;
        const subtotal = items.reduce(
            (sum, detail) => sum + detail.quantity * detail.price,
            0
        );
        const deliveryCharge = shipping?.shipping_total_amount || 0;
        const totalAmount =
            selectedOrder.total_amount || subtotal + deliveryCharge;
        return (
            <div style={{ padding: "16px" }}>
                <Title level={4} style={{ marginBottom: "16px" }}>
                    Order Summary
                </Title>
                <p>Order Date: {selectedOrder.order_date || "N/A"}</p>
                <p>
                    Subtotal: ₱{subtotal.toLocaleString()} | Delivery: ₱
                    {deliveryCharge.toLocaleString()} | Total: ₱
                    {totalAmount.toLocaleString()}
                </p>
                <Title level={4} style={{ margin: "24px 0 16px" }}>
                    Customer Details
                </Title>
                <Row align="middle" gutter={[16, 16]}>
                    <Col>
                        <Avatar
                            src={
                                profile?.profile_image ||
                                "https://via.placeholder.com/50"
                            }
                            size={50}
                        />
                    </Col>
                    <Col>
                        <Text>
                            {profile?.first_name || ""}{" "}
                            {profile?.last_name || ""} <br />
                            {profile?.user?.email || "N/A"}
                        </Text>
                    </Col>
                </Row>
                <Title level={4} style={{ margin: "24px 0 16px" }}>
                    Shipping Information
                </Title>
                <p>
                    Shipping Status: {shipping?.shipping_status?.name || "N/A"}{" "}
                    <br />
                    Tracking Number:{" "}
                    {shipping?.tracking_number || "Not Available"} <br />
                    Payment Method: {shipping?.payment_method?.name ||
                        "N/A"}{" "}
                    <br />
                    Shipping Method: {shipping?.shipping_method?.name || "N/A"}
                </p>
                <Title level={4} style={{ margin: "24px 0 16px" }}>
                    Items
                </Title>
                {items.length > 0 ? (
                    <ul>
                        {items.map((detail) => (
                            <li key={detail.id} style={{ marginBottom: "8px" }}>
                                <Image
                                    src={
                                        detail.product?.main_image
                                            ? `http://localhost:8000/storage/${detail.product.main_image}`
                                            : "https://via.placeholder.com/50"
                                    }
                                    width={50}
                                    style={{ marginRight: "8px" }}
                                    preview={false}
                                />
                                {detail.product?.product_name || "Unknown"} –
                                Quantity: {detail.quantity} – Price: ₱
                                {parseFloat(detail.price).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No items</p>
                )}
            </div>
        );
    };

    const filteredOrders = orders.filter((order) => {
        const lowerSearch = searchText.toLowerCase();
        return (
            order.id.toString().includes(lowerSearch) ||
            (order.profile &&
                `${order.profile.first_name || ""} ${
                    order.profile.last_name || ""
                }`
                    .toLowerCase()
                    .includes(lowerSearch)) ||
            (order.order_status?.toLowerCase() || "").includes(lowerSearch)
        );
    });

    const filteredArchivedOrders = archivedOrders.filter((order) => {
        const lowerSearch = searchText.toLowerCase();
        return (
            order.id.toString().includes(lowerSearch) ||
            (order.profile &&
                `${order.profile.first_name || ""} ${
                    order.profile.last_name || ""
                }`
                    .toLowerCase()
                    .includes(lowerSearch)) ||
            (order.order_status?.toLowerCase() || "").includes(lowerSearch)
        );
    });

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
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        <Search
                            placeholder="Search orders by ID, customer, or status"
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300, marginRight: 16 }}
                        />
                        <Button
                            type="default"
                            onClick={() => setOpenArchiveModal(true)}
                        >
                            Archived Orders
                        </Button>
                    </div>
                    <Table
                        columns={mainColumns}
                        dataSource={filteredOrders}
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
                footer={[]}
            >
                <Table
                    columns={archiveColumns}
                    dataSource={filteredArchivedOrders}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                />
            </Modal>
            <Modal
                title="Edit Order"
                open={openEditModal}
                onCancel={() => setOpenEditModal(false)}
                onOk={handleUpdate}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setOpenEditModal(false)}
                        style={{ width: "131px" }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        onClick={handleUpdate}
                        style={{ width: "131px" }}
                    >
                        Update Order
                    </Button>,
                ]}
            >
                {selectedOrder && (
                    <div>
                        <p>Order ID: {selectedOrder.id}</p>
                        <Select
                            value={
                                selectedOrder.shipping?.shipping_status_id || 1
                            }
                            onChange={(value) =>
                                setSelectedOrder({
                                    ...selectedOrder,
                                    shipping: {
                                        ...selectedOrder.shipping,
                                        shipping_status_id: value,
                                    },
                                })
                            }
                            style={{ width: "100%", marginBottom: 16 }}
                        >
                            <Option value={1}>Order Placed</Option>
                            <Option value={2}>Payment Info Confirmed</Option>
                            <Option value={3}>Shipped</Option>
                            <Option value={4}>Delivered</Option>
                            <Option value={5}>Cancelled</Option>
                            <Option value={6}>Completed</Option>
                        </Select>
                        {/* Tracking number input is removed to enforce auto‑generation on backend */}
                    </div>
                )}
            </Modal>
            <Modal
                title={`Order #${selectedOrder?.id || ""} Details`}
                open={openViewModal}
                onCancel={() => setOpenViewModal(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setOpenViewModal(false)}
                        style={{
                            width: "131px",
                            backgroundColor: "#f5222d",
                            color: "#fff",
                        }}
                    >
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
