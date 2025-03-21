import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Layout,
    Button,
    message,
    Typography,
    Image,
    Modal,
    Radio,
    Space,
    Card,
} from "antd";
import {
    LeftOutlined,
    FileTextOutlined,
    DollarOutlined,
    TruckOutlined,
    DownloadOutlined,
    StarOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

const { Content } = Layout;
const { Text, Title } = Typography;

const OrderTracking = () => {
    const [order, setOrder] = useState(null);
    const [username, setUsername] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelLoading, setIsCancelLoading] = useState(false);
    const [isConfirmReceiptLoading, setIsConfirmReceiptLoading] =
        useState(false);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const { orderId } = useParams();
    const baseUrl = "http://localhost:8000";

    const fetchOrderDetails = async () => {
        if (!token) {
            message.error("No token found, please log in.");
            navigate("/login");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(
                `${baseUrl}/api/my-purchases?order_id=${orderId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const orderData = res.data;

            if (!orderData || !orderData.id) {
                throw new Error("Order not found in response");
            }

            const transformedOrder = {
                ...orderData,
                order_date: orderData.order_date || orderData.created_at,
                shipping: orderData.shipping || {},
                order_details:
                    orderData.order_details || orderData.orderDetails || [],
                total_amount: orderData.total_amount || 0,
                created_at: orderData.created_at || null,
                payment_confirmed_at: orderData.payment_confirmed_at || null,
                shipped_at: orderData.shipped_at || null,
                delivered_at: orderData.delivered_at || null,
                completed_at: orderData.completed_at || null,
            };
            setOrder(transformedOrder);
        } catch (error) {
            console.error(
                "Error fetching order details:",
                error.response?.data || error
            );
            message.error(
                "Error fetching order details: " +
                    (error.response?.data?.message ||
                        error.message ||
                        "Unknown error")
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchUsername = async () => {
        if (!token) {
            console.log("No token found in localStorage");
            message.error("Please log in to view your username.");
            navigate("/login");
            return;
        }
        try {
            console.log("Fetching username with token:", token);
            const res = await axios.get(`${baseUrl}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Username response:", res.data);
            setUsername(res.data.username);
        } catch (error) {
            console.error(
                "Error fetching username:",
                error.response?.data || error
            );
            if (error.response?.status === 401) {
                message.error("Session expired. Please log in again.");
                localStorage.removeItem("token");
                navigate("/login");
            } else if (error.response?.status === 500) {
                message.error(
                    "Server error fetching username. Please try again later."
                );
            }
            setUsername("N/A");
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrderDetails();
            fetchUsername();
        }
    }, [orderId, token]);

    const handleBackToShipped = () => {
        navigate("/user-shipped");
    };

    const handleConfirmReceipt = async () => {
        setIsConfirmReceiptLoading(true);
        try {
            await axios.post(
                `${baseUrl}/api/orders/${orderId}/confirm-receipt`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success("Order receipt confirmed successfully");
            fetchOrderDetails();
        } catch (error) {
            console.error(
                "Error confirming receipt:",
                error.response?.data || error
            );
            message.error(
                "Failed to confirm receipt: " +
                    (error.response?.data?.error || "Unknown error")
            );
        } finally {
            setIsConfirmReceiptLoading(false);
        }
    };

    const handleTrackOrder = () => {
        message.info("Tracking order... (Feature not implemented yet)");
    };

    const handleCancelOrder = async () => {
        if (!cancelReason) {
            message.error("Please select a cancellation reason.");
            return;
        }
        setIsCancelLoading(true);
        try {
            await axios.post(
                `${baseUrl}/api/orders/${orderId}/cancel`,
                { reason: cancelReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success("Order cancelled successfully");
            setIsCancelModalVisible(false);
            setCancelReason("");
            fetchOrderDetails();
        } catch (error) {
            console.error(
                "Error cancelling order:",
                error.response?.data || error
            );
            message.error(
                "Failed to cancel order: " +
                    (error.response?.data?.error || "Unknown error")
            );
        } finally {
            setIsCancelLoading(false);
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
            return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
                .getDate()
                .toString()
                .padStart(
                    2,
                    "0"
                )}/${date.getFullYear()} ${date.getHours()}:${date
                .getMinutes()
                .toString()
                .padStart(2, "0")}`;
        };

        const statusOrder = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "completed",
        ];
        const currentStatusIndex = statusOrder.indexOf(status);

        return [
            {
                label: "Order Placed",
                timestamp: formatTimestamp(timestamps.placed),
                completed: currentStatusIndex >= 0,
                icon: <FileTextOutlined />,
            },
            {
                label: "Payment Confirmed",
                timestamp: formatTimestamp(timestamps.paymentConfirmed),
                completed: currentStatusIndex >= 1,
                icon: <DollarOutlined />,
            },
            {
                label: "Shipped",
                timestamp: formatTimestamp(timestamps.shipped),
                completed: currentStatusIndex >= 2,
                icon: <TruckOutlined />,
            },
            {
                label: "Delivered",
                timestamp: formatTimestamp(timestamps.delivered),
                completed: currentStatusIndex >= 3,
                icon: <DownloadOutlined />,
            },
            {
                label: "Completed",
                timestamp: formatTimestamp(timestamps.completed),
                completed: currentStatusIndex >= 4,
                icon: <StarOutlined />,
            },
        ];
    };

    const formatAddress = (address) => {
        if (!address) return "Not Available";
        const { street, barangay, city, state, postal_code, country } = address;
        return `${street}, ${barangay}, ${city}, ${state} ${postal_code}, ${country}`;
    };

    const formatDate = (timestamp) => {
        if (!timestamp || isNaN(new Date(timestamp).getTime())) {
            return "N/A";
        }
        const date = new Date(timestamp);
        return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
            .getDate()
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}`;
    };

    const productName =
        order?.order_details?.[0]?.product?.product_name || "Tracking";

    return (
        <Layout className="order-tracking">
            <Navbar />
            <Content>
                <div className="content-wrapper">
                    <div className="header-section">
                        <Button
                            type="link"
                            icon={<LeftOutlined />}
                            onClick={handleBackToShipped}
                        >
                            Back to Shipped Orders
                        </Button>
                        <Title level={2}>{productName}</Title>
                    </div>

                    {loading ? (
                        <Text className="loading-text">
                            Loading order tracking...
                        </Text>
                    ) : order ? (
                        <div className="main-content">
                            <Card className="timeline-card">
                                <Title level={4}>Order Timeline</Title>
                                <div className="horizontal-timeline">
                                    {getTimelineItems(order).map(
                                        (step, index) => (
                                            <div
                                                key={index}
                                                className={`timeline-step ${
                                                    step.completed
                                                        ? "completed"
                                                        : ""
                                                }`}
                                            >
                                                <div className="icon-circle">
                                                    {step.icon}
                                                </div>
                                                <Text
                                                    strong
                                                    className="step-label"
                                                >
                                                    {step.label}
                                                </Text>
                                                <br />
                                                <Text
                                                    type="secondary"
                                                    className="step-timestamp"
                                                >
                                                    {step.timestamp}
                                                </Text>
                                            </div>
                                        )
                                    )}
                                </div>
                            </Card>

                            <Card className="action-buttons-card">
                                <div className="action-buttons">
                                    <Button
                                        className="primary-btn"
                                        onClick={handleTrackOrder}
                                    >
                                        Track Order
                                    </Button>
                                    {[
                                        "pending",
                                        "processing",
                                        "shipped",
                                    ].includes(
                                        order.order_status?.toLowerCase()
                                    ) && (
                                        <Button
                                            className="danger-btn"
                                            icon={<CloseOutlined />}
                                            onClick={() =>
                                                setIsCancelModalVisible(true)
                                            }
                                        >
                                            Cancel Order
                                        </Button>
                                    )}
                                    {order.order_status?.toLowerCase() ===
                                        "delivered" && (
                                        <Button
                                            className="primary-btn"
                                            onClick={handleConfirmReceipt}
                                            loading={isConfirmReceiptLoading}
                                        >
                                            Confirm Receipt
                                        </Button>
                                    )}
                                </div>
                            </Card>

                            <Card className="order-details-card">
                                <Title level={4}>Order Details</Title>
                                {order.order_details &&
                                order.order_details.length > 0 ? (
                                    <>
                                        <div className="order-summary">
                                            <Text>
                                                Order Date:{" "}
                                                {formatDate(order.order_date)}
                                            </Text>
                                            <Text>
                                                Status:{" "}
                                                {order.order_status || "N/A"}
                                            </Text>
                                        </div>
                                        {order.order_details.map((detail) => (
                                            <div
                                                key={detail.id}
                                                className="order-item"
                                            >
                                                <Image
                                                    src={
                                                        detail.product
                                                            ?.main_image
                                                            ? `${baseUrl}/storage/${detail.product.main_image}`
                                                            : "https://via.placeholder.com/80"
                                                    }
                                                    alt={
                                                        detail.product
                                                            ?.product_name ||
                                                        "Product"
                                                    }
                                                    className="item-image"
                                                    fallback="https://via.placeholder.com/80"
                                                    width={80}
                                                />
                                                <div className="item-info">
                                                    <Text strong>
                                                        {detail.product
                                                            ?.product_name ||
                                                            "Unknown Product"}
                                                    </Text>
                                                    <Text>
                                                        Quantity:{" "}
                                                        {detail.quantity}
                                                    </Text>
                                                    <Text>
                                                        Subtotal: ₱
                                                        {detail.price
                                                            ? (
                                                                  detail.price *
                                                                  detail.quantity
                                                              ).toLocaleString()
                                                            : "N/A"}
                                                    </Text>
                                                </div>
                                            </div>
                                        ))}
                                        <Text strong>
                                            Total Amount: ₱
                                            {parseFloat(
                                                order.total_amount
                                            ).toLocaleString()}
                                        </Text>
                                    </>
                                ) : (
                                    <Text>No order details available.</Text>
                                )}
                            </Card>

                            <Card className="shipping-card">
                                <Title level={4}>Shipping Information</Title>
                                <div className="shipping-info">
                                    <Text block>
                                        Username: {username || "N/A"}
                                    </Text>
                                    <Text block>
                                        Address:{" "}
                                        {formatAddress(
                                            order.shipping?.address
                                        ) || "Not Available"}
                                    </Text>
                                    <Text block>
                                        Phone:{" "}
                                        {order.shipping?.address?.phone ||
                                            "Not Available"}
                                    </Text>
                                    <Text block>
                                        Tracking Number:{" "}
                                        {order.shipping?.tracking_number ||
                                            "Not Available"}
                                    </Text>
                                    <Text block>
                                        Shipping Method:{" "}
                                        {order.shipping?.shipping_method
                                            ?.name || "N/A"}
                                    </Text>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <Text className="no-tracking">
                            No order tracking available.
                        </Text>
                    )}

                    <Modal
                        title="Cancel Order"
                        open={isCancelModalVisible}
                        onCancel={() => setIsCancelModalVisible(false)}
                        footer={[
                            <Button
                                key="cancel"
                                onClick={() => setIsCancelModalVisible(false)}
                                disabled={isCancelLoading}
                            >
                                Cancel
                            </Button>,
                            <Button
                                key="confirm"
                                type="primary"
                                onClick={handleCancelOrder}
                                loading={isCancelLoading}
                            >
                                Confirm
                            </Button>,
                        ]}
                        className="cancel-modal"
                    >
                        <Text className="modal-description">
                            Please select a reason for cancelling your order.
                            Note that this action will cancel all items and
                            cannot be undone.
                        </Text>
                        <Radio.Group
                            onChange={(e) => setCancelReason(e.target.value)}
                            value={cancelReason}
                            className="cancel-reasons"
                        >
                            <Space direction="vertical">
                                <Radio value="Need to change delivery address">
                                    Need to change delivery address
                                </Radio>
                                <Radio value="Need to modify order (size, quantity, etc)">
                                    Need to modify order (size, quantity, etc)
                                </Radio>
                                <Radio value="Payment process too troublesome">
                                    Payment process too troublesome
                                </Radio>
                                <Radio value="Don't want to buy anymore">
                                    Don’t want to buy anymore
                                </Radio>
                                <Radio value="Others">Others</Radio>
                            </Space>
                        </Radio.Group>
                    </Modal>
                </div>
            </Content>
        </Layout>
    );
};

export default OrderTracking;
