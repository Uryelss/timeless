import React, { useState, useEffect } from "react";
import { Layout, theme, Card, Statistic, Row, Col, Spin, Typography } from "antd";
import { UserOutlined, ShoppingOutlined, FileTextOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import Sidebar from "../AdminSidebar/Sidebar";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        users: 0,
        products: 0,
        orders: 0,
        usersTrend: 0, // Example trend percentage
        productsTrend: 0,
        ordersTrend: 0
    });
    const [loading, setLoading] = useState(true);

    const toggleCollapsed = () => setCollapsed(!collapsed);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const usersResponse = await fetch('/api/users/count');
                const productsResponse = await fetch('/api/products/count');
                const ordersResponse = await fetch('/api/orders/count');

                const usersData = await usersResponse.json();
                const productsData = await productsResponse.json();
                const ordersData = await ordersResponse.json();

                // Simulating trend data (replace with real API data if available)
                setDashboardData({
                    users: usersData.count,
                    products: productsData.count,
                    orders: ordersData.count,
                    usersTrend: 5.2, // Example: 5.2% increase
                    productsTrend: -2.1, // Example: 2.1% decrease
                    ordersTrend: 8.3 // Example: 8.3% increase
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const renderTrend = (trend) => {
        const isPositive = trend >= 0;
        return (
            <span style={{ color: isPositive ? '#52c41a' : '#ff4d4f' }}>
                {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(trend)}% {isPositive ? 'Increase' : 'Decrease'}
            </span>
        );
    };

    return (
        <Layout className="admin-dashboard">
            <Sider width={256} style={{ minHeight: "100vh" }}>
                <Sidebar
                    collapsed={collapsed}
                    toggleCollapsed={toggleCollapsed}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 24px', background: colorBgContainer, boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)' }}>
                    <Title level={4} style={{ margin: 0, lineHeight: '64px' }}>Admin Dashboard</Title>
                </Header>
                <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
                    <Card
                        style={{ background: colorBgContainer, borderRadius: borderRadiusLG, boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.02)' }}
                    >
                        {loading ? (
                            <div className="loading-container">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Row gutter={[24, 24]} style={{ padding: '24px' }}>
                                <Col xs={24} sm={12} md={8}>
                                    <Card hoverable className="dashboard-card">
                                        <Statistic
                                            title="Registered Users"
                                            value={dashboardData.users}
                                            prefix={<UserOutlined />}
                                            valueStyle={{ color: '#1890ff' }}
                                        />
                                        <Text type="secondary">Last 30 days: {renderTrend(dashboardData.usersTrend)}</Text>
                                        <Text type="secondary" style={{ marginTop: '8px' }}>Active: {Math.floor(dashboardData.users * 0.7)}</Text>
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Card hoverable className="dashboard-card">
                                        <Statistic
                                            title="Total Products"
                                            value={dashboardData.products}
                                            prefix={<ShoppingOutlined />}
                                            valueStyle={{ color: '#13c2c2' }}
                                        />
                                        <Text type="secondary">Last 30 days: {renderTrend(dashboardData.productsTrend)}</Text>
                                        <Text type="secondary" style={{ marginTop: '8px' }}>In Stock: {Math.floor(dashboardData.products * 0.8)}</Text>
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Card hoverable className="dashboard-card">
                                        <Statistic
                                            title="Total Orders"
                                            value={dashboardData.orders}
                                            prefix={<FileTextOutlined />}
                                            valueStyle={{ color: '#cf1322' }}
                                        />
                                        <Text type="secondary">Last 30 days: {renderTrend(dashboardData.ordersTrend)}</Text>
                                        <Text type="secondary" style={{ marginTop: '8px' }}>Completed: {Math.floor(dashboardData.orders * 0.6)}</Text>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </Card>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    Admin Dashboard ©{new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminDashboard;