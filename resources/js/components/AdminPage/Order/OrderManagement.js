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
    Descriptions,
    Checkbox,
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
                    shipping: order.shipping || {},
                    selected: false, // Initialize selected state
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

    // Handlers for active orders
    const handleActiveCheckboxChange = (orderId) => {
        const updatedOrders = orders.map((order) =>
            order.id === orderId
                ? { ...order, selected: !order.selected }
                : order
        );
        setOrders(updatedOrders);
        setSelectedActiveOrders(
            updatedOrders.filter((o) => o.selected).map((o) => o.id)
        );
        const allSelected = updatedOrders.every((o) => o.selected);
        setSelectAllActive(allSelected);
    };

    const handleSelectAllActiveChange = (e) => {
        const checked = e.target.checked;
        setSelectAllActive(checked);
        const updatedOrders = orders.map((order) => ({
            ...order,
            selected: checked,
        }));
        setOrders(updatedOrders);
        setSelectedActiveOrders(checked ? updatedOrders.map((o) => o.id) : []);
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
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem(
                                        "token"
                                    )}`,
                                },
                            }
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
                    .catch((err) =>
                        message.error("Failed to archive some orders")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Handlers for archived orders
    const handleArchivedCheckboxChange = (orderId) => {
        const updatedArchived = archivedOrders.map((order) =>
            order.id === orderId
                ? { ...order, selected: !order.selected }
                : order
        );
        setArchivedOrders(updatedArchived);
        setSelectedArchivedOrders(
            updatedArchived.filter((o) => o.selected).map((o) => o.id)
        );
        const allSelected = updatedArchived.every((o) => o.selected);
        setSelectAllArchived(allSelected);
    };

    const handleSelectAllArchivedChange = (e) => {
        const checked = e.target.checked;
        setSelectAllArchived(checked);
        const updatedArchived = archivedOrders.map((order) => ({
            ...order,
            selected: checked,
        }));
        setArchivedOrders(updatedArchived);
        setSelectedArchivedOrders(
            checked ? updatedArchived.map((o) => o.id) : []
        );
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
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem(
                                        "token"
                                    )}`,
                                },
                            }
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
                    .catch((err) =>
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
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
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
            <div style={{ padding: "16px" }}>
                <Title level={4} style={{ marginBottom: "16px" }}>
                    Order Summary
                </Title>
                <Table
                    dataSource={order_details}
                    columns={[
                        {
                            title: "Product",
                            render: (detail) => (
                                <Space>
                                    <Image
                                        src={
                                            detail.product?.main_image
                                                ? `http://localhost:8000/storage/${detail.product.main_image}`
                                                : "https://via.placeholder.com/50"
                                        }
                                        width={50}
                                        preview={false}
                                    />
                                    <Text>
                                        {detail.product?.product_name ||
                                            "Unknown"}
                                    </Text>
                                </Space>
                            ),
                        },
                        {
                            title: "Quantity",
                            dataIndex: "quantity",
                            render: (qty) => qty || "N/A",
                        },
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
                    style={{ marginBottom: "16px" }}
                />
                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Sub Total">
                        ₱{subtotal.toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Delivery Charge">
                        ₱{parseFloat(deliveryCharge).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Amount">
                        <Text strong>
                            ₱{parseFloat(totalAmount).toLocaleString()}
                        </Text>
                    </Descriptions.Item>
                </Descriptions>

                <Title level={4} style={{ margin: "24px 0 16px" }}>
                    Customer Details
                </Title>
                <Row align="middle" gutter={[16, 16]}>
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
                        <Descriptions bordered size="small" column={1}>
                            <Descriptions.Item label="Username">
                                {profile?.user?.username || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {profile?.user?.email || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone">
                                {shipping?.address?.phone || "N/A"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>

                <Title level={4} style={{ margin: "24px 0 16px" }}>
                    Payment and Shipping
                </Title>
                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Payment Method">
                        {shipping?.payment_method?.name ||
                            "Unknown Payment Method"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Shipping Method">
                        {shipping?.shipping_method?.name || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tracking Number">
                        {shipping?.tracking_number || "Not Available"}
                    </Descriptions.Item>
                </Descriptions>
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
            order.order_status?.toLowerCase().includes(lowerSearch)
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
            order.order_status?.toLowerCase().includes(lowerSearch)
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
                            alignItems: "center",
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
                            >
                                Select All
                            </Checkbox>
                            {(selectAllActive ||
                                selectedActiveOrders.length > 0) && (
                                <Button
                                    type="link"
                                    onClick={handleArchiveAll}
                                    style={{ marginLeft: 8 }}
                                >
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />

                                    {selectedActiveOrders.length > 0 &&
                                        ` (${selectedActiveOrders.length})`}
                                </Button>
                            )}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                            }}
                        >
                            <Button
                                type="default"
                                onClick={() => setOpenArchiveModal(true)}
                            >
                                Archived Orders
                            </Button>
                        </div>
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
                            style={{ marginRight: 8 }}
                        >
                            <UndoOutlined style={{ fontSize: "18px" }} />
                            Restore
                            {selectedArchivedOrders.length > 0 &&
                                ` (${selectedArchivedOrders.length})`}
                        </Button>
                    )}
                </div>
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
