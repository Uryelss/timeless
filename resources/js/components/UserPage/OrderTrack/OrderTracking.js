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
  Timeline,
} from "antd";
import {
  LeftOutlined,
  FileTextOutlined,
  DollarOutlined,
  TruckOutlined,
  DownloadOutlined,
  StarOutlined,
  CloseOutlined,
  EyeOutlined,
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
  const [isConfirmReceiptLoading, setIsConfirmReceiptLoading] = useState(false);
  const [isTrackingModalVisible, setIsTrackingModalVisible] = useState(false);
  const [trackingDetails, setTrackingDetails] = useState([]);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { orderId } = useParams();
  const baseUrl = "http://localhost:8000";

  const fakeLocations = [
    "Manila Sorting Facility, Philippines",
    "Cebu Distribution Center, Philippines",
    "Davao Logistics Hub, Philippines",
    "Quezon City Warehouse, Philippines",
  ];

  const fetchOrderDetails = async (retry = false) => {
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
        order_details: orderData.order_details || orderData.orderDetails || [],
        total_amount: orderData.total_amount || 0,
        created_at: orderData.created_at || null,
        payment_confirmed_at: orderData.payment_confirmed_at || null,
        shipped_at: orderData.shipped_at || null,
        delivered_at: orderData.delivered_at || null,
        completed_at: orderData.completed_at || null,
        cancelled_at: orderData.cancelled_at || null,
        cancel_reason: orderData.cancel_reason || "",
        updated_at: orderData.updated_at || null,
        courier: orderData.courier || null,
      };
      setOrder(transformedOrder);
    } catch (error) {
      console.error("Error fetching order details:", error.response?.data || error);
      if (!retry) {
        console.warn("Retrying fetchOrderDetails...");
        setTimeout(() => fetchOrderDetails(true), 1000);
      } else {
        message.error(
          "Error fetching order details: " +
            (error.response?.data?.message || error.message || "Unknown error")
        );
        navigate("/user-shipped");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsername = async () => {
    if (!token) {
      message.error("Please log in to view your username.");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.get(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(res.data.username);
    } catch (error) {
      console.error("Error fetching username:", error.response?.data || error);
      if (error.response?.status === 401) {
        message.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        message.error("Server error fetching username.");
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
    const defaultTransferMethod = "Cash"; // Default transfer method
    setIsConfirmReceiptLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/orders/${orderId}/confirm-receipt`,
        { transfer_method: defaultTransferMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Order receipt confirmed successfully");
      fetchOrderDetails();
    } catch (error) {
      console.error("Error confirming receipt:", error.response?.data || error);
      message.error(
        "Failed to confirm receipt: " +
          (error.response?.data?.error || "Unknown error")
      );
    } finally {
      setIsConfirmReceiptLoading(false);
    }
  };

  const handleTrackOrder = async () => {
    if (!order?.shipping?.tracking_number) {
      message.warning("No tracking number available for this order.");
      return;
    }
    setIsTrackingModalVisible(true);
    setIsTrackingLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/orders/${orderId}/track`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let trackingData = res.data || [];

      if (order?.courier?.name) {
        trackingData.unshift({
          status: `Assigned to ${order.courier.name}`,
          location: "N/A",
          timestamp: order.created_at || new Date().toISOString(),
        });
      }

      if (trackingData.length === 0 && order?.shipping?.shipping_status_id >= 1) {
        trackingData = [
          {
            status: "Order Placed",
            location: fakeLocations[0],
            timestamp:
              order.created_at || new Date(Date.now() - 86400000).toISOString(),
          },
        ];
        if (order?.shipping?.shipping_status_id >= 2) {
          trackingData.push({
            status: "Payment Info Confirmed",
            location: fakeLocations[0],
            timestamp:
              order.payment_confirmed_at ||
              order.updated_at ||
              new Date(Date.now() - 43200000).toISOString(),
          });
        }
        if (order?.shipping?.shipping_status_id >= 3) {
          trackingData.push({
            status: "Shipped",
            location: fakeLocations[1],
            timestamp: order.shipped_at || new Date().toISOString(),
          });
        }
        if (order?.shipping?.shipping_status_id >= 4) {
          const userAddress = formatAddress(order.shipping?.address) || "N/A";
          trackingData.push({
            status: "Delivered",
            location: userAddress,
            timestamp: order.delivered_at || new Date().toISOString(),
          });
        }
      }
      setTrackingDetails(trackingData);
      if (trackingData.length === 0) {
        message.info("No tracking updates available yet.");
      }
    } catch (error) {
      console.error("Error fetching tracking details:", error.response?.data || error);
      let fallbackData = [
        {
          status: order?.courier?.name ? `Assigned to ${order.courier.name}` : "Order Placed",
          location: fakeLocations[0],
          timestamp: order?.created_at || new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      if (order?.shipping?.shipping_status_id >= 2) {
        fallbackData.push({
          status: "Payment Info Confirmed",
          location: fakeLocations[0],
          timestamp:
            order?.payment_confirmed_at ||
            order?.updated_at ||
            new Date(Date.now() - 43200000).toISOString(),
        });
      }
      if (order?.shipping?.shipping_status_id >= 3) {
        fallbackData.push({
          status: "Shipped",
          location: fakeLocations[1],
          timestamp: order?.shipped_at || new Date().toISOString(),
        });
      }
      if (order?.shipping?.shipping_status_id >= 4) {
        const userAddress = formatAddress(order.shipping?.address) || "N/A";
        fallbackData.push({
          status: "Delivered",
          location: userAddress,
          timestamp: order?.delivered_at || new Date().toISOString(),
        });
      }
      setTrackingDetails(fallbackData);
    } finally {
      setIsTrackingLoading(false);
    }
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
      navigate("/my-purchase");
    } catch (error) {
      console.error("Error cancelling order:", error.response?.data || error);
      const errorData = error.response?.data || {};
      if (errorData.error === "You can only cancel your own orders") {
        message.error("You can only cancel your own orders.");
      } else if (errorData.error === "Order cannot be canceled at this stage") {
        message.error("This order cannot be canceled at its current stage.");
      } else if (errorData.error === "Order not found") {
        message.error("Order not found.");
      } else if (errorData.error === "Validation failed") {
        message.error(errorData.messages?.reason?.[0] || "Invalid cancellation reason.");
      } else {
        message.error(
          "Failed to cancel order: " +
            (errorData.error || error.message || "Unknown error")
        );
      }
    } finally {
      setIsCancelLoading(false);
    }
  };

  const getTimelineItems = (order) => {
    const shippingStatusId = order?.shipping?.shipping_status_id || 1;
    const timestamps = {
      placed: order?.created_at || null,
      paymentConfirmed: order?.payment_confirmed_at || order?.updated_at || null,
      shipped: order?.shipped_at || null,
      delivered: order?.delivered_at || null,
      completed: order?.completed_at || null,
      cancelled: order?.cancelled_at || order?.updated_at || null,
    };

    const formatTimestamp = (timestamp) => {
      if (!timestamp || isNaN(new Date(timestamp).getTime())) {
        return "Awaiting";
      }
      const date = new Date(timestamp);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const timeline = [
      {
        label: "Order Placed",
        timestamp: formatTimestamp(timestamps.placed),
        completed: shippingStatusId >= 1,
        icon: <FileTextOutlined />,
      },
      {
        label: "Payment Info Confirmed",
        timestamp: formatTimestamp(timestamps.paymentConfirmed),
        completed: shippingStatusId >= 2,
        icon: <DollarOutlined />,
      },
      {
        label: "Shipped",
        timestamp: formatTimestamp(timestamps.shipped),
        completed: shippingStatusId >= 3,
        icon: <TruckOutlined />,
      },
      {
        label: "Delivered",
        timestamp: formatTimestamp(timestamps.delivered),
        completed: shippingStatusId >= 4,
        icon: <DownloadOutlined />,
      },
      {
        label: "Completed",
        timestamp: formatTimestamp(timestamps.completed),
        completed: shippingStatusId === 6,
        icon: <StarOutlined />,
      },
      {
        label: "Cancelled" + (order.cancel_reason ? " - " + order.cancel_reason : ""),
        timestamp: formatTimestamp(timestamps.cancelled),
        completed: shippingStatusId === 5,
        icon: <CloseOutlined />,
      },
    ];

    if (shippingStatusId === 5) {
      return timeline.filter(
        (step) => step.completed || step.label.startsWith("Cancelled")
      );
    }
    return timeline.filter((step) => step.label !== "Cancelled" || step.completed);
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
            <Title level={2}>TRACKING ORDER</Title>
          </div>

          {loading ? (
            <Text className="loading-text">Loading order tracking...</Text>
          ) : order ? (
            <div className="main-content">
              <Card className="timeline-card">
                <Title level={4}>Order Timeline</Title>
                <div className="horizontal-timeline">
                  {getTimelineItems(order).map((step, index) => (
                    <div
                      key={index}
                      className={`timeline-step ${step.completed ? "completed" : ""}`}
                    >
                      <div className="icon-circle">{step.icon}</div>
                      <Text strong className="step-label">
                        {step.label}
                      </Text>
                      <br />
                      <Text type="secondary" className="step-timestamp">
                        {step.timestamp}
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="action-buttons-card">
                <div className="action-buttons">
                  <Button
                    className="primary-btn"
                    onClick={handleTrackOrder}
                    icon={<EyeOutlined />}
                    disabled={!order?.shipping?.tracking_number}
                  >
                    Track Order
                  </Button>
                  {order?.shipping?.shipping_status_id !== 5 &&
                    [1, 2].includes(order?.shipping?.shipping_status_id) && (
                      <Button
                        className="danger-btn"
                        icon={<CloseOutlined />}
                        onClick={() => setIsCancelModalVisible(true)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  {order?.shipping?.shipping_status_id !== 5 &&
                    order?.shipping?.shipping_status_id === 4 && (
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
                {order.order_details && order.order_details.length > 0 ? (
                  <>
                    <div className="order-summary">
                      <Text>Order Date: {formatDate(order.order_date)}</Text>
                      <Text>
                        Status: {order.shipping?.shipping_status?.name || "N/A"}
                      </Text>
                    </div>
                    {order.order_details.map((detail) => (
                      <div key={detail.id} className="order-item">
                        <Image
                          src={
                            detail.product?.main_image
                              ? `${baseUrl}/storage/${detail.product.main_image}`
                              : "https://via.placeholder.com/80"
                          }
                          alt={detail.product?.product_name || "Product"}
                          className="item-image"
                          fallback="https://via.placeholder.com/80"
                          width={80}
                        />
                        <div className="item-info">
                          <Text strong>
                            {detail.product?.product_name || "Unknown Product"}
                          </Text>
                          <Text>Quantity: {detail.quantity}</Text>
                          <Text>
                            Subtotal: ₱{" "}
                            {detail.price
                              ? (detail.price * detail.quantity).toLocaleString()
                              : "N/A"}
                          </Text>
                        </div>
                      </div>
                    ))}
                    <Text strong>
                      Total Amount: ₱{parseFloat(order.total_amount || 0).toLocaleString()}
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
                    Courier: {order.courier?.name || "Not Assigned Yet"}
                  </Text>
                  <Text block>Username: {username || "N/A"}</Text>
                  <Text block>
                    Address: {formatAddress(order.shipping?.address) || "Not Available"}
                  </Text>
                  <Text block>
                    Phone: {order.shipping?.address?.phone || "Not Available"}
                  </Text>
                  <Text block>
                    Tracking Number: {order.shipping?.tracking_number || "Not Available"}
                  </Text>
                  <Text block>
                    Shipping Method: {order.shipping?.shipping_method?.name || "N/A"}
                  </Text>
                </div>
              </Card>
            </div>
          ) : (
            <Text className="no-tracking">No order tracking available.</Text>
          )}

          <Modal
            title={`Cancel Order ${orderId}`}
            open={isCancelModalVisible}
            onCancel={() => setIsCancelModalVisible(false)}
            footer={[
              <Button
                key="cancel"
                onClick={() => setIsCancelModalVisible(false)}
                disabled={isCancelLoading}
                className="modal-back-btn"
              >
                Back
              </Button>,
              <Button
                key="confirm"
                type="primary"
                danger
                onClick={handleCancelOrder}
                loading={isCancelLoading}
                className="modal-cancel-btn"
              >
                Cancel Order
              </Button>,
            ]}
            className="cancel-modal"
            width={450}
            centered
          >
            <div
              style={{
                flexDirection: "column",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Text strong className="cancel-modal-title">
                Why are you cancelling this order?
              </Text>
              <Text type="secondary" className="modal-description">
                Please select a reason below. Note that cancelling will affect all items in
                this order and cannot be undone.
              </Text>
            </div>
            <div className="cancel-modal-content">
              <Radio.Group
                onChange={(e) => setCancelReason(e.target.value)}
                value={cancelReason}
                className="cancel-reasons"
              >
                <Space
                  direction="vertical"
                  className="cancel-reasons-space"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    flexDirection: "column",
                  }}
                >
                  <Radio value="Need to change delivery address">
                    Need to change delivery address
                  </Radio>
                  <Radio value="Need to modify order (size, quantity, etc)">
                    Need to modify order (size, quantity, etc)
                  </Radio>
                  <Radio value="Payment process too troublesome">
                    Payment process too troublesome
                  </Radio>
                  <Radio value="Don’t want to buy anymore">Don’t want to buy anymore</Radio>
                  <Radio value="Others">Others</Radio>
                </Space>
              </Radio.Group>
            </div>
          </Modal>

          <Modal
            title={`Tracking Details - Order #${orderId}`}
            open={isTrackingModalVisible}
            onCancel={() => setIsTrackingModalVisible(false)}
            footer={[
              <Button
                key="close"
                onClick={() => setIsTrackingModalVisible(false)}
              >
                Close
              </Button>,
            ]}
            className="tracking-modal"
          >
            {isTrackingLoading ? (
              <Text>Loading tracking details...</Text>
            ) : trackingDetails.length > 0 ? (
              <Timeline>
                {trackingDetails.map((event, index) => (
                  <Timeline.Item key={index}>
                    <Text strong>{event.status}</Text>
                    <br />
                    <Text type="secondary">Location: {event.location || "N/A"}</Text>
                    <br />
                    <Text type="secondary">{formatDate(event.timestamp)}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Text>No tracking updates available.</Text>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default OrderTracking;