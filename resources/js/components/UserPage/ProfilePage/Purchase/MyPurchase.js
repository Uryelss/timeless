import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Layout,
    Button,
    message,
    Pagination,
    Modal,
    Typography,
    Image,
} from "antd";
import {
    LeftOutlined,
    FileTextOutlined, // For "Order Placed"
    DollarOutlined, // For "Payment Info Confirmed"
    TruckOutlined, // For "Order Shipped Out"
    DownloadOutlined, // For "To Receive"
    StarOutlined, // For "To Rate"
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";

const { Content } = Layout;
const { Text } = Typography;

const MyPurchases = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const baseUrl = "http://localhost:8000";

    const fetchOrders = async (page = 1) => {
        if (!token) {
            message.error("No token found, please log in.");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(
                `${baseUrl}/api/my-purchases?page=${page}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("Fetched Orders:", res.data.data); // Debug: Log API response
            const transformedOrders = res.data.data.map((order) => ({
                ...order,
                order_date: order.order_date || order.created_at,
                shipping: order.shipping || {},
                order_details: order.order_details || [],
                created_at: order.created_at || null,
                payment_confirmed_at: order.payment_confirmed_at || null,
                shipped_at: order.shipped_at || null,
                delivered_at: order.delivered_at || null,
                completed_at: order.completed_at || null,
            }));
            setOrders(transformedOrders.filter((order) => !order.deleted_at));
            setTotalOrders(res.data.total);
            setCurrentPage(res.data.current_page);
        } catch (error) {
            console.error("Error fetching orders:", error.response?.data || error);
            message.error("Error fetching orders: " + (error.response?.data?.error || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const handlePageChange = (page) => {
        fetchOrders(page);
    };

    const handleBackToProfile = () => {
        navigate("/user-profile");
    };

    const handleViewDetails = (order) => {
        console.log("Opening modal with order:", order); // Debug: Log selected order
        setSelectedOrder(order);
    };

    const handleCloseModal = () => {
        console.log("Closing modal, resetting selectedOrder"); // Debug: Confirm close
        setSelectedOrder(null);
    };

    const handleConfirmReceipt = async (orderId) => {
        try {
            await axios.post(
                `${baseUrl}/api/orders/${orderId}/confirm-receipt`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            message.success("Order receipt confirmed successfully");
            fetchOrders();
            setSelectedOrder(null);
        } catch (error) {
            console.error("Error confirming receipt:", error.response?.data || error);
            message.error("Failed to confirm receipt: " + (error.response?.data?.error || "Unknown error"));
        }
    };

    const getTimelineItems = (order) => {
        const status = order?.order_status?.toLowerCase() || "pending";
        const timestamps = {
            placed: order?.created_at || null,
            paymentConfirmed: order?.payment_confirmed_at || null,
            shipped: order?.shipped_at || null,
            delivered: order?.delivered_at || null,
            completed: order?.completed_at || null,
        };

        const formatTimestamp = (timestamp) => {
            if (!timestamp || isNaN(new Date(timestamp).getTime())) {
                return "Awaiting";
            }
            const date = new Date(timestamp);
            return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        };

        // Define status progression to match the image
        const statusOrder = ["pending", "processing", "shipped", "delivered", "completed"];
        const currentStatusIndex = statusOrder.indexOf(status);

        return [
            {
                label: "Order Placed",
                timestamp: formatTimestamp(timestamps.placed),
                completed: currentStatusIndex >= 0,
                icon: <FileTextOutlined />,
            },
            {
                label: "Payment Info Confirmed",
                timestamp: formatTimestamp(timestamps.paymentConfirmed),
                completed: currentStatusIndex >= 1,
                icon: <DollarOutlined />,
            },
            {
                label: "Order Shipped Out",
                timestamp: formatTimestamp(timestamps.shipped),
                completed: currentStatusIndex >= 2,
                icon: <TruckOutlined />,
            },
            {
                label: "To Receive",
                timestamp: formatTimestamp(timestamps.delivered),
                completed: currentStatusIndex >= 3,
                icon: <DownloadOutlined />,
            },
            {
                label: "To Rate",
                timestamp: formatTimestamp(timestamps.completed),
                completed: currentStatusIndex >= 4,
                icon: <StarOutlined />,
            },
        ];
    };

    const getOrderStatusMessage = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "Pending";
            case "processing":
                return "Processing";
            case "shipped":
                return "Shipped";
            case "delivered":
                return "Delivered";
            case "completed":
                return "Completed";
            case "cancelled":
                return "Cancelled";
            default:
                return status?.charAt(0).toUpperCase() + status?.slice(1) || "N/A";
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Navbar />
            <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
                <div
                    style={{
                        padding: 24,
                        minHeight: 360,
                        background: "#fff",
                        borderRadius: 8,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 20,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Button
                                type="link"
                                icon={<LeftOutlined />}
                                onClick={handleBackToProfile}
                                style={{ padding: 0, marginRight: 10 }}
                            >
                                Back to Profile
                            </Button>
                            <h1 style={{ margin: 0 }}>My Purchases</h1>
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading purchases...</p>
                    ) : orders.length === 0 ? (
                        <p>No purchases found.</p>
                    ) : (
                        <>
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    style={{
                                        borderBottom: "1px solid #ddd",
                                        padding: "10px 0",
                                        marginBottom: 10,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <div style={{ width: "100%" }}>
                                        <h3 style={{ margin: 0 }}>
                                            Order #{order.id}
                                        </h3>
                                        <p style={{ margin: "5px 0" }}>
                                            Total: ₱
                                            {order.total_amount
                                                ? parseFloat(order.total_amount).toLocaleString()
                                                : "0"}{" "}
                                            | Status:{" "}
                                            {getOrderStatusMessage(order.order_status)}
                                        </p>
                                        <p style={{ margin: "5px 0" }}>
                                            Order Date:{" "}
                                            {order.created_at
                                                ? new Date(order.created_at).toLocaleString("en-US", {
                                                      year: "numeric",
                                                      month: "short",
                                                      day: "numeric",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  })
                                                : "N/A"}
                                        </p>
                                        <p style={{ margin: "5px 0" }}>
                                            Shipping Method:{" "}
                                            {order.shipping?.shipping_method?.name || "N/A"}
                                        </p>
                                        <div style={{ marginTop: 5 }}>
                                            {order.order_details.map((detail) => (
                                                <div
                                                    key={detail.id}
                                                    style={{
                                                        marginBottom: 10,
                                                    }}
                                                >
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {detail.product?.product_name ||
                                                            "Unknown Product"}
                                                    </p>
                                                    <p
                                                        style={{
                                                            margin: "2px 0",
                                                            color: "#888",
                                                        }}
                                                    >
                                                        {detail.product?.description ||
                                                            "No description available"}
                                                    </p>
                                                    <p style={{ margin: 0 }}>
                                                        Qty: {detail.quantity} | Price: ₱
                                                        {parseFloat(detail.price).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Button
                                            type="link"
                                            onClick={() => handleViewDetails(order)}
                                            style={{
                                                padding: 0,
                                                color: "#ff4d4f",
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Pagination
                                current={currentPage}
                                total={totalOrders}
                                pageSize={pageSize}
                                onChange={handlePageChange}
                                style={{ marginTop: 20, textAlign: "center" }}
                            />
                        </>
                    )}
                </div>
            </Content>

            <Modal
                title={selectedOrder ? `Order #${selectedOrder.id} Details` : "Order Details"}
                open={!!selectedOrder}
                onCancel={handleCloseModal}
                footer={[
                    selectedOrder?.order_status?.toLowerCase() === "delivered" && (
                        <Button
                            key="confirm"
                            type="primary"
                            onClick={() => handleConfirmReceipt(selectedOrder.id)}
                        >
                            Confirm Receipt
                        </Button>
                    ),
                    <Button key="close" onClick={handleCloseModal}>
                        Close
                    </Button>,
                ]}
                width={1000} // Increased width to accommodate horizontal timeline
            >
                <div style={{ padding: "16px" }}>
                    {selectedOrder ? (
                        <>
                            <h3>Order Tracking</h3>
                            <div className="horizontal-timeline">
                                {getTimelineItems(selectedOrder).map((step, index) => (
                                    <div key={index} className="timeline-step">
                                        <div
                                            className="timeline-icon"
                                            style={{
                                                background: step.completed ? "#52c41a" : "#d9d9d9",
                                                color: step.completed ? "#fff" : "#000",
                                            }}
                                        >
                                            {step.icon}
                                        </div>
                                        <div className="timeline-content">
                                            <Text strong>{step.label}</Text>
                                            <br />
                                            <Text type="secondary">{step.timestamp}</Text>
                                        </div>
                                        {index < getTimelineItems(selectedOrder).length - 1 && (
                                            <div
                                                className="timeline-connector"
                                                style={{
                                                    background: step.completed ? "#52c41a" : "#d9d9d9",
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <h3>Shipping Information</h3>
                            <p>Tracking Number: {selectedOrder.shipping?.tracking_number || "Not Available"}</p>
                            <p>Shipping Method: {selectedOrder.shipping?.shipping_method?.name || "N/A"}</p>

                            <h3>Order Details</h3>
                            {selectedOrder.order_details && selectedOrder.order_details.length > 0 ? (
                                selectedOrder.order_details.map((detail) => (
                                    <div
                                        key={detail.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: 20,
                                        }}
                                    >
                                        <Image
                                            src={
                                                detail.product?.main_image
                                                    ? `${baseUrl}/storage/${detail.product.main_image}`
                                                    : "https://via.placeholder.com/50"
                                            }
                                            alt={detail.product?.product_name || "Product"}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                objectFit: "cover",
                                                marginRight: 10,
                                                borderRadius: 4,
                                            }}
                                            fallback="https://via.placeholder.com/50"
                                        />
                                        <div>
                                            <p style={{ margin: 0, fontWeight: "bold" }}>
                                                {detail.product?.product_name || "Unknown Product"}
                                            </p>
                                            <p style={{ margin: "2px 0", color: "#888" }}>
                                                {detail.product?.description || "No description available"}
                                            </p>
                                            <p style={{ margin: 0 }}>
                                                Qty: {detail.quantity} | Price: ₱
                                                {parseFloat(detail.price).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No order details available.</p>
                            )}
                        </>
                    ) : (
                        <p>No order selected.</p>
                    )}
                </div>
            </Modal>
        </Layout>
    );
};

export default MyPurchases;