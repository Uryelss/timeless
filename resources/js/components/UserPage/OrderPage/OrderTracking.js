import React, { useState } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Modal,
    message,
    Radio,
    Typography,
} from "antd";
import Navbar from "../Navbar/Navbar";

const { Title } = Typography;

const OrderTracking = () => {
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [isTrackVisible, setIsTrackVisible] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");

    // Static order data
    const staticOrder = {
        orderId: "12345",
        status: "shipped", // Static status: can be "ordered", "shipped", or "delivered"
        estimatedDelivery: "Between Mon, Mar 24 - Wed, Mar 26",
        deliveredTo: {
            name: "SHREK",
            phone: "09123456789",
            address: "Far Far Away, Butuan City, Agusan Del Norte",
        },
        trackingHistory: [
            { time: "09:00:00", location: "Order placed successfully" },
            { time: "10:30:00", location: "(Paranaque DC) Parcel picked up" },
            { time: "14:15:00", location: "(Butuan DC) Parcel in transit" },
        ],
        cartItems: [
            {
                id: 1,
                productName: "Swamp Slime Shirt",
                size: "M",
                quantity: 2,
                price: 500,
                image: "https://via.placeholder.com/80", // Static placeholder image
            },
            {
                id: 2,
                productName: "Ogre Boots",
                size: "L",
                quantity: 1,
                price: 1200,
                image: "https://via.placeholder.com/80", // Static placeholder image
            },
        ],
        total: 2200, // 2 * 500 + 1200
    };

    // Static status for timeline
    const getStatusStep = () => {
        switch (staticOrder.status.toLowerCase()) {
            case "ordered":
                return { ordered: true, shipped: false, delivered: false };
            case "shipped":
                return { ordered: true, shipped: true, delivered: false };
            case "delivered":
                return { ordered: true, shipped: true, delivered: true };
            default:
                return { ordered: false, shipped: false, delivered: false };
        }
    };

    const status = getStatusStep();

    // Handle cancel order modal
    const showCancelModal = () => {
        setIsCancelModalVisible(true);
    };

    const handleCancel = () => {
        setIsCancelModalVisible(false);
        setSelectedReason("");
    };

    const handleConfirmCancel = () => {
        if (selectedReason) {
            message.success(`Order cancelled. Reason: ${selectedReason}`);
            setIsCancelModalVisible(false);
            setSelectedReason("");
        } else {
            message.warning("Please select a cancellation reason.");
        }
    };

    // Handle track order modal
    const showTrack = () => {
        setIsTrackVisible(true);
    };

    const handleTrackCancel = () => {
        setIsTrackVisible(false);
    };

    return (
        <div>
            <Navbar />
            <div
                style={{
                    padding: "20px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                <Title
                    level={1}
                    style={{ textAlign: "center", marginBottom: "20px" }}
                >
                    ORDER TRACKING
                </Title>
                <Row gutter={16}>
                    <Col xs={24} md={16}>
                        {/* Tracking Status Card */}
                        <Card
                            title="TRACKING STATUS"
                            style={{ marginBottom: "20px" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                }}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        flex: 1,
                                        minWidth: "100px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            backgroundColor: status.ordered
                                                ? "#00A65A"
                                                : "#d9d9d9",
                                            margin: "0 auto 5px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <span style={{ color: "#fff" }}>✓</span>
                                    </div>
                                    <p>ORDERED</p>
                                </div>
                                <div
                                    style={{
                                        width: "20%",
                                        height: 2,
                                        backgroundColor: status.shipped
                                            ? "#00A65A"
                                            : "#d9d9d9",
                                        alignSelf: "center",
                                    }}
                                />
                                <div
                                    style={{
                                        textAlign: "center",
                                        flex: 1,
                                        minWidth: "100px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            backgroundColor: status.shipped
                                                ? "#00A65A"
                                                : "#d9d9d9",
                                            margin: "0 auto 5px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <span style={{ color: "#fff" }}>✓</span>
                                    </div>
                                    <p>SHIPPED</p>
                                </div>
                                <div
                                    style={{
                                        width: "20%",
                                        height: 2,
                                        backgroundColor: status.delivered
                                            ? "#00A65A"
                                            : "#d9d9d9",
                                        alignSelf: "center",
                                    }}
                                />
                                <div
                                    style={{
                                        textAlign: "center",
                                        flex: 1,
                                        minWidth: "100px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            backgroundColor: status.delivered
                                                ? "#00A65A"
                                                : "#d9d9d9",
                                            margin: "0 auto 5px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <span style={{ color: "#fff" }}>✓</span>
                                    </div>
                                    <p>DELIVERED</p>
                                </div>
                            </div>
                        </Card>

                        {/* Order Details Card */}
                        <Card
                            title="ORDER DETAILS"
                            style={{ marginBottom: "20px" }}
                        >
                            <p>
                                <strong>Order ID:</strong> {staticOrder.orderId}
                            </p>
                            <p>
                                <strong>Estimated Delivery:</strong>{" "}
                                {staticOrder.estimatedDelivery}
                            </p>
                            <p>
                                <strong>Delivered To:</strong>
                            </p>
                            <p>{staticOrder.deliveredTo.name}</p>
                            <p>{staticOrder.deliveredTo.phone}</p>
                            <p>{staticOrder.deliveredTo.address}</p>
                        </Card>

                        {/* Action Buttons */}
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                            }}
                        >
                            <Button
                                type="primary"
                                style={{
                                    backgroundColor: "#00A65A",
                                    borderColor: "#00A65A",
                                    width: "100%",
                                    maxWidth: "200px",
                                    height: "40px",
                                }}
                                onClick={showTrack}
                            >
                                TRACK ORDER
                            </Button>
                            <Button
                                type="primary"
                                style={{
                                    backgroundColor: "#00A65A",
                                    borderColor: "#00A65A",
                                    width: "100%",
                                    maxWidth: "200px",
                                    height: "40px",
                                }}
                                onClick={showCancelModal}
                                disabled={staticOrder.status === "delivered"}
                            >
                                CANCEL ORDER
                            </Button>
                        </div>
                    </Col>

                    {/* Order Items Card */}
                    <Col xs={24} md={8}>
                        <Card title="ORDER ITEMS">
                            {staticOrder.cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: "flex",
                                        marginBottom: "20px",
                                        alignItems: "center",
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.productName}
                                        style={{
                                            width: "80px",
                                            marginRight: "10px",
                                        }}
                                    />
                                    <div>
                                        <p style={{ margin: 0 }}>
                                            {item.productName}
                                        </p>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "12px",
                                            }}
                                        >
                                            {item.size}
                                        </p>
                                        <p style={{ margin: 0 }}>
                                            Quantity: {item.quantity}
                                        </p>
                                        <p style={{ margin: 0 }}>
                                            Total: ₱
                                            {(
                                                item.price * item.quantity
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div
                                style={{
                                    borderTop: "1px solid #e8e8e8",
                                    paddingTop: "10px",
                                    textAlign: "right",
                                }}
                            >
                                <p>
                                    Total: ₱{staticOrder.total.toLocaleString()}
                                </p>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Cancel Order Modal */}
                <Modal
                    title="CANCEL ORDER"
                    visible={isCancelModalVisible}
                    onOk={handleConfirmCancel}
                    onCancel={handleCancel}
                    okText="CONFIRM"
                    cancelText="CANCEL"
                    okButtonProps={{
                        style: {
                            backgroundColor: "#00A65A",
                            borderColor: "#00A65A",
                        },
                    }}
                    cancelButtonProps={{ style: { borderColor: "#00A65A" } }}
                >
                    <p>
                        Please select a cancellation reason. Note that this will
                        cancel all items in the order and cannot be undone.
                    </p>
                    <Radio.Group
                        onChange={(e) => setSelectedReason(e.target.value)}
                        value={selectedReason}
                    >
                        <Radio value="Need to change delivery address">
                            Need to change delivery address
                        </Radio>
                        <br />
                        <Radio value="Need to modify order (size, quantity, etc)">
                            Need to modify order (size, quantity, etc)
                        </Radio>
                        <br />
                        <Radio value="Payment process too troublesome">
                            Payment process too troublesome
                        </Radio>
                        <br />
                        <Radio value="Don't want to buy anymore">
                            Don’t want to buy anymore
                        </Radio>
                        <br />
                        <Radio value="Others">Others</Radio>
                    </Radio.Group>
                </Modal>

                {/* Track Order Modal */}
                <Modal
                    title="TRACKING DETAILS"
                    visible={isTrackVisible}
                    onCancel={handleTrackCancel}
                    footer={null}
                    width={400}
                >
                    <div style={{ textAlign: "left" }}>
                        {staticOrder.trackingHistory.map((entry, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: 10,
                                }}
                            >
                                <span
                                    style={{
                                        marginRight: 10,
                                        color: "#00A65A",
                                        minWidth: "80px",
                                    }}
                                >
                                    {entry.time}
                                </span>
                                <span>{entry.location}</span>
                            </div>
                        ))}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default OrderTracking;