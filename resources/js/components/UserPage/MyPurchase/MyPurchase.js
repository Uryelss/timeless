import React, { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Tabs, Input, Button, message } from "antd";
import Navbar from "../Navbar/Navbar";
import { SearchOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { TabPane } = Tabs;

const MyPurchase = () => {
    const [orders, setOrders] = useState({
        all: [],
        toPay: [],
        toShip: [],
        toReceive: [],
        completed: [],
        cancelled: [],
        returnRefund: [],
    });
    const [activeTab, setActiveTab] = useState("all");
    const token = localStorage.getItem("token");

    // Fetch orders from the API
    const fetchOrders = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Categorize orders by status
            const categorizedOrders = {
                all: res.data,
                toPay: res.data.filter((order) => order.status === "to_pay"),
                toShip: res.data.filter((order) => order.status === "to_ship"),
                toReceive: res.data.filter((order) => order.status === "to_receive"),
                completed: res.data.filter((order) => order.status === "completed"),
                cancelled: res.data.filter((order) => order.status === "cancelled"),
                returnRefund: res.data.filter((order) => order.status === "return_refunded"),
            };
            setOrders(categorizedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error("Error fetching orders");
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        } else {
            message.error("No token found, please log in.");
        }
    }, [token]);

    // Handle tab change
    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    // Render orders for a specific tab
    const renderOrders = (tabOrders) => {
        if (tabOrders.length === 0) {
            return (
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <img
                        src="https://via.placeholder.com/100?text=No+Orders"
                        alt="No Orders"
                        style={{ marginBottom: 10 }}
                    />
                    <p>{activeTab === "returnRefund" ? "You do not have any Return/Refund case." : "No orders yet"}</p>
                </div>
            );
        }

        return tabOrders.map((order) => (
            <div
                key={order.id}
                style={{
                    borderBottom: "1px solid #f0f0f0",
                    padding: "15px 0",
                    marginBottom: 10,
                }}
            >
                {/* Shop Info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: 10, fontWeight: "bold" }}>{order.shop_name}</span>
                        <Button type="primary" danger size="small">
                            Chat
                        </Button>
                        <Button type="default" size="small" style={{ marginLeft: 10 }}>
                            View Shop
                        </Button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", color: "#ff4d4f" }}>
                        {order.status === "to_receive" && (
                            <>
                                <span style={{ marginRight: 10, color: "#00c4b4" }}>
                                    Parcel has departed from sorting facility
                                </span>
                                <span>TO RECEIVE</span>
                            </>
                        )}
                        {order.status === "completed" && <span>COMPLETED</span>}
                        {order.status === "cancelled" && <span>CANCELLED</span>}
                    </div>
                </div>

                {/* Order Items */}
                {order.items.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginTop: 15,
                        }}
                    >
                        <img
                            src={item.image || "https://via.placeholder.com/80"}
                            alt={item.name}
                            style={{ width: 80, height: 80, marginRight: 15 }}
                        />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: "bold" }}>{item.name}</p>
                            {item.variation && <p style={{ margin: 0, color: "#666" }}>Variation: {item.variation}</p>}
                            <p style={{ margin: 0, color: "#666" }}>x{item.quantity}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, color: "#ff4d4f" }}>₱{item.price}</p>
                            {item.original_price && (
                                <p style={{ margin: 0, color: "#999", textDecoration: "line-through" }}>
                                    ₱{item.original_price}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {/* Order Total and Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 15 }}>
                    <div>
                        {order.status === "to_receive" && (
                            <p style={{ margin: 0, color: "#666" }}>
                                Confirm receipt after you've checked the received items and made payment
                            </p>
                        )}
                        {order.status === "cancelled" && (
                            <p style={{ margin: 0, color: "#666" }}>Cancelled by you</p>
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <p style={{ margin: 0, marginRight: 15, fontWeight: "bold" }}>
                            Order Total: ₱{order.total}
                        </p>
                        {order.status === "to_receive" && (
                            <Button type="primary" danger>
                                Contact Seller
                            </Button>
                        )}
                        {(order.status === "completed" || order.status === "cancelled") && (
                            <>
                                <Button type="primary" danger style={{ marginRight: 10 }}>
                                    Buy Again
                                </Button>
                                {order.status === "cancelled" && (
                                    <Button type="default" style={{ marginRight: 10 }}>
                                        View Cancellation Details
                                    </Button>
                                )}
                                <Button type="default">Contact Seller</Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        ));
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
                    <Tabs
                        defaultActiveKey="all"
                        onChange={handleTabChange}
                        tabBarStyle={{ borderBottom: "1px solid #f0f0f0" }}
                    >
                        <TabPane tab="ALL" key="all" />
                        <TabPane tab="To Pay" key="toPay" />
                        <TabPane tab="To Ship" key="toShip" />
                        <TabPane tab={`To Receive (${orders.toReceive.length})`} key="toReceive" />
                        <TabPane tab="Completed" key="completed" />
                        <TabPane tab="Cancelled" key="cancelled" />
                        <TabPane tab="Return/Refund" key="returnRefund" />
                    </Tabs>

                    {/* Search Bar */}
                    <Input
                        placeholder="You can search by Seller Name, Order ID or Product name"
                        prefix={<SearchOutlined />}
                        style={{ margin: "10px 0", borderRadius: 4 }}
                    />

                    {/* Shop Safe Banner */}
                    {activeTab === "toReceive" && (
                        <div
                            style={{
                                backgroundColor: "#fffbe6",
                                padding: 10,
                                borderRadius: 4,
                                marginBottom: 15,
                            }}
                        >
                            <span style={{ color: "#faad14", marginRight: 5 }}>SHOP SAFE WITH SHOPEE</span>
                            <span style={{ color: "#666" }}>
                                Beware of scammers! Always double-check if the airway bill matches your order details in the Shopee app.
                            </span>
                        </div>
                    )}

                    {/* Render Orders */}
                    {renderOrders(orders[activeTab])}
                </div>
            </Content>
        </Layout>
    );
};

export default MyPurchase;