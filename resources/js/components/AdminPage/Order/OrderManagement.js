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
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [selectAllActive, setSelectAllActive] = useState(false);
    const [selectedActiveOrders, setSelectedActiveOrders] = useState([]);
    const [isAssigningCourier, setIsAssigningCourier] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState("");

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
                                shipping_status_id:
                                    record.shipping?.shipping_status_id || 1,
                            });
                            setTrackingNumber(record.shipping?.tracking_number || "");
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

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            const shippingStatusId = values.shipping_status_id || 1;
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

            setIsAssigningCourier(true);
            try {
                await axios.put(
                    `${API_URL}/${selectedOrder.id}`,
                    {
                        order_status: updatedOrderStatus,
                        shipping: {
                            tracking_number: trackingNumber || null,
                            shipping_status_id: shippingStatusId,
                        },
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (shippingStatusId === 3) {
                    try {
                        await axios.post(
                            `${API_URL}/${selectedOrder.id}/assign-courier-auto`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        message.success(
                            "Order updated and courier assigned successfully"
                        );
                    } catch (error) {
                        message.error(
                            "Failed to assign courier: " +
                                (error.response?.data?.error ||
                                    "Unknown error")
                        );
                    }
                } else {
                    message.success("Order updated successfully");
                }

                setOpenEditModal(false);
                fetchOrders();
                window.dispatchEvent(new Event("orderStatusUpdated"));
            } catch (err) {
                message.error(
                    "Failed to update order: " +
                        (err.response?.data?.message || "Unknown error")
                );
                console.error(err);
            } finally {
                setIsAssigningCourier(false);
            }
        } catch (err) {
            message.error("Please fill in all required fields");
        }
    };

    const handleView = (record) => {
        setSelectedOrder(record);
        setOpenViewModal(true);
    };

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
                                <Descriptions.Item label="Courier">
                                    {selectedOrder.courier?.name || "Not Assigned"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Payment Method">
                                    {shipping?.payment_method?.name || "N/A"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Shipping Method">
                                    {shipping?.shipping_method?.name || "NogradA"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
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

    const generateTrackingNumber = () => {
        return `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`;
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
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        <Search
                            placeholder="Search orders..."
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 200 }}
                        />
                        <Space>
                            <Button
                                onClick={() => setOpenArchiveModal(true)}
                                disabled={selectedActiveOrders.length === 0}
                            >
                                Archive Selected
                            </Button>
                        </Space>
                    </div>
                    <Checkbox
                        checked={selectAllActive}
                        onChange={handleSelectAllActiveChange}
                        style={{ marginBottom: 8 }}
                    >
                        Select All Active Orders
                    </Checkbox>
                    <Table
                        columns={mainColumns}
                        dataSource={filteredOrders}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                    <Modal
                        title="Edit Order"
                        open={openEditModal}
                        onCancel={() => setOpenEditModal(false)}
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
                                loading={isAssigningCourier}
                                disabled={isAssigningCourier}
                            >
                                Update Order
                            </Button>,
                        ]}
                    >
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="shipping_status_id"
                                label="Shipping Status"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a status",
                                    },
                                ]}
                            >
                                <Select
                                    onChange={(value) => {
                                        setSelectedOrder({
                                            ...selectedOrder,
                                            shipping: {
                                                ...selectedOrder.shipping,
                                                shipping_status_id: value,
                                            },
                                        });
                                        if (value === 1) {
                                            setTrackingNumber(generateTrackingNumber());
                                        } else {
                                            setTrackingNumber(selectedOrder.shipping?.tracking_number || "");
                                        }
                                    }}
                                >
                                    <Option value={1}>Order Placed</Option>
                                    <Option value={2}>
                                        Payment Info Confirmed
                                    </Option>
                                    <Option value={3}>Shipped</Option>
                                    <Option value={4}>Delivered</Option>
                                    <Option value={5}>Cancelled</Option>
                                    <Option value={6}>Completed</Option>
                                </Select>
                            </Form.Item>
                            {trackingNumber && (
                                <Form.Item label="Tracking Number">
                                    <Text>{trackingNumber}</Text>
                                </Form.Item>
                            )}
                        </Form>
                    </Modal>
                    <Modal
                        title="Order Details"
                        open={openViewModal}
                        onCancel={() => setOpenViewModal(false)}
                        footer={[
                            <Button
                                key="close"
                                onClick={() => setOpenViewModal(false)}
                            >
                                Close
                            </Button>,
                        ]}
                        width={1000}
                    >
                        {renderOrderDetails()}
                    </Modal>
                    <Modal
                        title="Confirm Archive"
                        open={openArchiveModal}
                        onOk={handleArchiveAll}
                        onCancel={() => setOpenArchiveModal(false)}
                        okButtonProps={{ style: { width: "80px" } }}
                        cancelButtonProps={{ style: { width: "80px" } }}
                    >
                        <p>
                            Are you sure you want to archive{" "}
                            {selectedActiveOrders.length} selected order(s)?
                        </p>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
};

export default OrderManagement;