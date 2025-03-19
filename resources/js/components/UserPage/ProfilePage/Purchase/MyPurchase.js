import React, { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Button, message, Pagination } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";

const { Content } = Layout;

const MyPurchases = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const pageSize = 10;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const baseUrl = "http://localhost:8000"; // Adjust if your backend URL differs

    const fetchOrders = async (page = 1) => {
        if (!token) {
            message.error("No token found, please log in.");
            return;
        }
        try {
            const res = await axios.get(
                `http://localhost:8000/api/my-purchases?page=${page}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setOrders(res.data.data);
            setTotalOrders(res.data.total);
            setCurrentPage(res.data.current_page);
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error("Error fetching orders");
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

    const handleViewDetails = (orderId) => {
        navigate(`/order/${orderId}`);
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

                    {orders.length === 0 ? (
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
                                            Total: ${order.total_amount} | Status:{" "}
                                            {order.order_status
                                                .charAt(0)
                                                .toUpperCase() +
                                                order.order_status.slice(1)}
                                        </p>
                                        <div style={{ marginTop: 5 }}>
                                            {order.order_details.map((detail) => (
                                                <div
                                                    key={detail.id}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        marginBottom: 10,
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            detail.product?.image
                                                                ? `${baseUrl}${detail.product.image}`
                                                                : "https://via.placeholder.com/50"
                                                        }
                                                        alt={
                                                            detail.product?.product_name ||
                                                            "Product"
                                                        }
                                                        style={{
                                                            width: 50,
                                                            height: 50,
                                                            objectFit: "cover",
                                                            marginRight: 10,
                                                            borderRadius: 4,
                                                        }}
                                                    />
                                                    <div>
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
                                                            Qty: {detail.quantity} | Price: $
                                                            {detail.price}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Button
                                            type="link"
                                            onClick={() =>
                                                handleViewDetails(order.id)
                                            }
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
        </Layout>
    );
};

export default MyPurchases;