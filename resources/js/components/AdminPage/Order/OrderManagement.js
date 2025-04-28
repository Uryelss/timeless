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

    const fetchOrders = () => {
        axios
            .get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const transformed = res.data.map((order) => ({
                    ...order,
                    order_date: order.order_date || order.created_at,
                    shipping: order.shipping || {},
                    selected: false,
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
                        icon={<UndoOutlined />}
                    />
                </Space>
            ),
        },
        ...mainColumns.slice(1),
    ];

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

    const handleUpdate = () => {
        const shippingStatusId =
            selectedOrder.shipping?.shipping_status_id || 1;
        let updatedOrderStatus;

        switch (shippingStatusId) {
            case 1:
                updatedOrderStatus = "pending";
                break;
            case 2:
                updatedOrderStatus = "pending";
                break;
            case 3:
                updatedOrderStatus = "shipped";
                break;
            case 4:
                updatedOrderStatus = "delivered";
                break;
            case 5:
                updatedOrderStatus = "cancelled";
                break;
            case 6:
                updatedOrderStatus = "completed";
                break;
            default:
                updatedOrderStatus = selectedOrder.order_status || "pending";
        }

        axios
            .put(
                `${API_URL}/${selectedOrder.id}`,
                {
                    order_status: updatedOrderStatus,
                    shipping: {
                        tracking_number:
                            selectedOrder.shipping?.tracking_number || null,
                        shipping_status_id: shippingStatusId,
                    },
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((response) => {
                message.success("Order updated successfully");
                setOpenEditModal(false);
                fetchOrders();
                window.dispatchEvent(new Event("orderStatusUpdated"));
            })
            .catch((err) => {
                message.error(
                    "Failed to update order: " +
                        (err.response?.data?.message || "Unknown error")
                );
                console.error(err);
            });
    };

    const handleView = (record) => {
        setSelectedOrder(record);
        setOpenViewModal(true);
    };

    const renderOrderDetails = () => {
        if (!selectedOrder) return null;
        const items =
            selectedOrder.order_details || selectedOrder.orderDetails || [];
        const { shipping, profile, courier } = selectedOrder;
        const subtotal = items.reduce(
            (sum, detail) => sum + detail.quantity * detail.price,
            0
        );
        const deliveryCharge = shipping?.shipping_total_amount || 0;
        const totalAmount =
            selectedOrder.total_amount || subtotal + deliveryCharge;
        const isShipped = [3, 4, 6].includes(shipping?.shipping_status_id);

        return (
            <div style={{ padding: "16px" }}>
                <Table
                    dataSource={items}
                    columns={[
                        {
                            title: "Item",
                            render: (detail) => (
                                <Space>
                                    <Image
                                        src={
                                            detail.product?.main_image
                                                ? `http://localhost:8000/storage/${detail.product.main_image}`
                                                : "https://via.placeholder.com/50"
                                        }
                                        width={40}
                                        preview={false}
                                    />
                                    <Text>
                                        {detail.product?.product_name ||
                                            "Unknown"}
                                    </Text>
                                </Space>
                            ),
                        },
                        { title: "Quantity", dataIndex: "quantity" },
                        {
                            title: "Price",
                            dataIndex: "price",
                            render: (price) =>
                                `₱${parseFloat(price).toLocaleString()}`,
                        },
                        {
                            title: "Total",
                            render: (detail) =>
                                `₱${(
                                    detail.quantity * detail.price
                                ).toLocaleString()}`,
                        },
                    ]}
                    pagination={false}
                    rowKey="id"
                    size="small"
                />
                <div style={{ marginTop: 16 }}>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Title level={5}>Order Summary</Title>
                            <Descriptions bordered size="small" column={1}>
                                <Descriptions.Item label="Order Date">
                                    {selectedOrder.order_date || "N/A"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Subtotal">
                                    ₱{subtotal.toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Delivery">
                                    ₱{deliveryCharge.toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Total">
                                    ₱{totalAmount.toLocaleString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col span={12}>
                            <Title level={5}>Customer Details</Title>
                            <Space direction="vertical" size="middle">
                                <Space>
                                    <Avatar
                                        src={
                                            profile?.profile_image ||
                                            "https://via.placeholder.com/50"
                                        }
                                        size={50}
                                    />
                                    <Descriptions
                                        bordered
                                        size="small"
                                        column={1}
                                        style={{ width: "100%" }}
                                    >
                                        <Descriptions.Item label="Name">
                                            {profile?.first_name || ""}{" "}
                                            {profile?.last_name || ""}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Email">
                                            {profile?.user?.email || "N/A"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Phone">
                                            {shipping?.address?.phone || "N/A"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Address">
                                            {shipping?.address?.full_address ||
                                                "N/A"}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Space>
                            </Space>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: 16 }}>
                        <Col span={24}>
                            <Title level={5}>Shipping Information</Title>
                            <Descriptions bordered size="small" column={1}>
                                <Descriptions.Item label="Shipping Status">
                                    {shipping?.shipping_status?.name || "N/A"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tracking Number">
                                    {shipping?.tracking_number ||
                                        "Not Available"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Payment Method">
                                    {shipping?.payment_method?.name || "N/A"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Shipping Method">
                                    {shipping?.shipping_method?.name || "N/A"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                    {isShipped && (
                        <Row style={{ marginTop: 16 }}>
                            <Col span={24}>
                                <Title level={5}>Courier Information</Title>
                                <Descriptions bordered size="small" column={1}>
                                    <Descriptions.Item label="Courier Name">
                                        {courier?.name || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phone">
                                        {courier?.phone || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Address">
                                        {courier?.address || "N/A"}
                                    </Descriptions.Item>
                                    {[4, 6].includes(shipping?.shipping_status_id) && (
                                        <Descriptions.Item label="Transfer Method">
                                            {courier?.transfer_method
                                                ? courier.transfer_method
                                                      .replace(/\b\w/g, (c) =>
                                                          c.toUpperCase()
                                                      )
                                                      .replace(
                                                          /Transferred/,
                                                          "Transfer"
                                                      )
                                                : "N/A"}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </Col>
                        </Row>
                    )}
                </div>
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
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Search
                                placeholder="Search orders by ID, customer, or status"
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 300, marginRight: 16 }}
                            />
                            <Checkbox
                                checked={selectAllActive}
                                onChange={handleSelectAllActiveChange}
                                style={{ marginRight: 16 }}
                            >
                                Select All
                            </Checkbox>
                            {(selectAllActive ||
                                selectedActiveOrders.length > 0) && (
                                <Button
                                    type="link"
                                    onClick={handleArchiveAll}
                                    icon={<FolderOpenOutlined />}
                                />
                            )}
                        </div>
                        <Button
                            type="default"
                            onClick={() => setOpenArchiveModal(true)}
                            style={{ width: "131px" }}
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
                        selectedArchivedOrders.length > 0) && (
                        <Button
                            type="link"
                            onClick={handleRestoreAll}
                            icon={<UndoOutlined />}
                        />
                    )}
                </div>
                <Table
                    columns={archiveColumns}
                    dataSource={filteredArchivedOrders}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                    pagination={false}
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
                    </div>
                )}
            </Modal>
            <Modal
                title="Order Details"
                centered
                open={openViewModal}
                onCancel={() => setOpenViewModal(false)}
                width={800}
                footer={[]}
            >
                {renderOrderDetails()}
            </Modal>
        </Layout>
    );
};

export default OrderManagement;