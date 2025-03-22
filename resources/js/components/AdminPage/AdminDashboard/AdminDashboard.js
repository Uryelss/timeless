import React, { useState, useEffect } from "react";
import { Layout, Card, Row, Col, Statistic, message, Spin, Button } from "antd";
import {
    UserOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    TruckOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar"; // Adjust path as needed
import axios from "axios";

const { Header, Content, Sider } = Layout;

const DashboardManagement = () => {
    const [loading, setLoading] = useState({
        users: false,
        completedOrders: false, // Changed from productsSold
        totalOrders: false,
        ordersShipped: false,
    });
    const [usersCount, setUsersCount] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0); // Changed from productsSold
    const [totalOrders, setTotalOrders] = useState(0);
    const [ordersShipped, setOrdersShipped] = useState(0);
    const token = localStorage.getItem("token");
    const BASE_URL = "http://localhost:8000/api";

    const fetchDashboardData = async () => {
        if (!token) {
            message.error("No authentication token found. Please log in.");
            return;
        }

        const endpoints = [
            { url: `${BASE_URL}/users/count`, setter: setUsersCount, key: "users", field: "count" },
            { url: `${BASE_URL}/orders/completed/count`, setter: setCompletedOrders, key: "completedOrders", field: "count" }, // Updated endpoint
            { url: `${BASE_URL}/orders/count`, setter: setTotalOrders, key: "totalOrders", field: "count" },
            { url: `${BASE_URL}/orders/shipped/count`, setter: setOrdersShipped, key: "ordersShipped", field: "count" },
        ];

        setLoading((prev) => ({
            users: true,
            completedOrders: true,
            totalOrders: true,
            ordersShipped: true,
        }));

        for (const { url, setter, key, field } of endpoints) {
            try {
                setLoading((prev) => ({ ...prev, [key]: true }));
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setter(response.data[field] || 0);
            } catch (error) {
                console.error(`Error fetching ${url}:`, error.response?.data || error.message);
                message.error(`Failed to load ${key.replace(/([A-Z])/g, " $1").toLowerCase()}.`);
                setter(0);
            } finally {
                setLoading((prev) => ({ ...prev, [key]: false }));
            }
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={256}>
                <Sidebar />
            </Sider>
            <Layout>
                <Header style={{ background: "#fff", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>DASHBOARD MANAGEMENT</span>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchDashboardData}
                        loading={Object.values(loading).some((val) => val)}
                    >
                        Refresh
                    </Button>
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                {loading.users ? (
                                    <Spin tip="Loading..." />
                                ) : (
                                    <Statistic
                                        title="Total Users"
                                        value={usersCount}
                                        prefix={<UserOutlined />}
                                        valueStyle={{ color: "#3f8600" }}
                                    />
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                {loading.completedOrders ? (
                                    <Spin tip="Loading..." />
                                ) : (
                                    <Statistic
                                        title="Products Sold" // Optionally change to "Completed Orders"
                                        value={completedOrders}
                                        prefix={<ShoppingOutlined />}
                                        valueStyle={{ color: "#cf1322" }}
                                    />
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                {loading.totalOrders ? (
                                    <Spin tip="Loading..." />
                                ) : (
                                    <Statistic
                                        title="Total Orders"
                                        value={totalOrders}
                                        prefix={<ShoppingCartOutlined />}
                                        valueStyle={{ color: "#1890ff" }}
                                    />
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                {loading.ordersShipped ? (
                                    <Spin tip="Loading..." />
                                ) : (
                                    <Statistic
                                        title="Orders Shipped"
                                        value={ordersShipped}
                                        prefix={<TruckOutlined />}
                                        valueStyle={{ color: "#faad14" }}
                                    />
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardManagement;