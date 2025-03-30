import React, { useState, useEffect, useMemo } from "react";
import {
    Layout,
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Spin,
    theme,
} from "antd";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
} from "chart.js";
import Sidebar from "../AdminSidebar/Sidebar";
import TopProducts from "./TopProduct";
import RecentOrders from "./RecentOrder";
import CustomerReview from "./CustomerReview";
import { useNavigate } from "react-router-dom";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ChartTitle,
    Tooltip,
    Legend
);

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const formatPeso = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "₱0";
    return (
        "₱" +
        num.toLocaleString("en-PH", {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        })
    );
};

const AdminDashboard = () => {
    const [statsData, setStatsData] = useState([]);
    const [todayChartData, setTodayChartData] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const authToken = localStorage.getItem("token");

    useEffect(() => {
        Promise.all([
            fetch("http://localhost:8000/api/orders", {
                headers: { Authorization: `Bearer ${authToken}` },
            }).then((res) => res.json()),
            fetch("http://localhost:8000/api/products", {
                headers: { Authorization: `Bearer ${authToken}` },
            }).then((res) => res.json()),
            fetch("http://localhost:8000/api/customers", {
                headers: { Authorization: `Bearer ${authToken}` },
            }).then((res) => res.json()),
        ])
            .then(([orders, products, customers]) => {
                const totalOrders = orders.length;
                const completedOrders = orders.filter(
                    (o) => o.order_status === "completed"
                );
                const cancelledOrders = orders.filter(
                    (o) => o.order_status === "cancelled"
                );
                const totalEarnings = completedOrders.reduce(
                    (sum, order) => sum + Number(order.total_amount || 0),
                    0
                );
                const cancelAmount = cancelledOrders.reduce(
                    (sum, order) => sum + Number(order.total_amount || 0),
                    0
                );
                const usersCount = customers.length;
                const totalProducts = products.length;

                setStatsData([
                    {
                        title: "Total Orders",
                        value: totalOrders,
                        color: "#2ecc71",
                    },
                    {
                        title: "Completed Orders",
                        value: completedOrders.length,
                        color: "#00a8ff",
                    },
                    {
                        title: "Canceled Orders",
                        value: cancelledOrders.length,
                        color: "#e74c3c",
                    },
                    {
                        title: "Total Earnings",
                        value: formatPeso(totalEarnings),
                        color: "#2ecc71",
                    },
                    {
                        title: "Cancel Amount",
                        value: formatPeso(cancelAmount),
                        color: "#e74c3c",
                    },
                    { title: "New Users", value: usersCount, color: "#9b59b6" },
                    {
                        title: "Total Products",
                        value: totalProducts,
                        color: "#f39c12",
                    },
                ]);

                const now = new Date();
                const todayString = now.toISOString().slice(0, 10);
                const currentHour = now.getHours();
                const hourlyRevenue = new Array(currentHour + 1).fill(0);
                orders.forEach((order) => {
                    if (
                        order.order_date &&
                        order.order_date.startsWith(todayString)
                    ) {
                        const orderDate = new Date(order.order_date);
                        const orderHour = orderDate.getHours();
                        if (orderHour <= currentHour) {
                            hourlyRevenue[orderHour] += Number(
                                order.total_amount || 0
                            );
                        }
                    }
                });
                const labels = [];
                for (let h = 0; h <= currentHour; h++) {
                    labels.push(`${h}:00`);
                }
                setTodayChartData({
                    labels,
                    datasets: [
                        {
                            label: "Sales Revenue (Today)",
                            data: hourlyRevenue,
                            backgroundColor: "rgba(46, 204, 113, 0.8)",
                            borderColor: "#27ae60",
                            borderWidth: 1,
                            borderRadius: 4,
                            maxBarThickness: 50,
                        },
                    ],
                });

                setLoadingStats(false);
            })
            .catch((err) => {
                console.error("Error loading dashboard data:", err);
                setLoadingStats(false);
            });
    }, [authToken]);

    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top", labels: { font: { size: 14 } } },
                title: {
                    display: true,
                    text: "Sales Revenue Overview (Today)",
                    font: { size: 16 },
                },
                tooltip: {
                    callbacks: {
                        label: ({ raw }) => formatPeso(raw),
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Revenue (Peso)",
                        font: { size: 12 },
                    },
                    ticks: {
                        callback: (value) => formatPeso(value),
                        stepSize: 1000,
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Hour of Day",
                        font: { size: 12 },
                    },
                },
            },
        }),
        []
    );

    return (
        <Layout style={{ minHeight: "100vh", background: colorBgContainer }}>
            <Sider width={256} style={{ minHeight: "100vh" }}>
                <Sidebar />
            </Sider>
            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Title level={3} style={{ margin: 0 }}>
                        Analysis Report
                    </Title>
                </Header>
                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {loadingStats ? (
                        <Spin tip="Loading dashboard statistics..." />
                    ) : (
                        <Row
                            gutter={[16, 16]}
                            style={{ marginBottom: 24, alignItems: "center" }}
                        >
                            {statsData.map((stat) => (
                                <Col
                                    xs={24}
                                    sm={12}
                                    md={8}
                                    lg={6}
                                    key={stat.title}
                                >
                                    <Card
                                        className="stats-card"
                                        bordered={false}
                                        style={{
                                            background: "#fff",
                                            width: "200px",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Statistic
                                            title={stat.title}
                                            value={stat.value}
                                            valueStyle={{ color: stat.color }}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                    <Card
                        title="Sales Revenue (Today)"
                        bordered={false}
                        style={{ marginBottom: 24 }}
                    >
                        <div style={{ height: 400, padding: 16 }}>
                            {todayChartData ? (
                                <Bar
                                    data={todayChartData}
                                    options={chartOptions}
                                />
                            ) : (
                                <Spin tip="Loading chart data..." />
                            )}
                        </div>
                    </Card>
                    <TopProducts />
                    <RecentOrders />
                    <CustomerReview />
                </Content>
                <Footer
                    style={{
                        textAlign: "center",
                        background: colorBgContainer,
                    }}
                >
                    Admin Dashboard ©{new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminDashboard;
