import React, { useState, useMemo } from "react";
import {
    Layout,
    theme,
    Card,
    Button,
    Table,
    Row,
    Col,
    Menu,
    Modal,
    Statistic,
    Typography,
} from "antd";
import {
    DashboardOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    TeamOutlined,
    DatabaseOutlined,
    SettingOutlined,
    ProfileOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    StarOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
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
import { logout } from "../../AccessPage/Auth";

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

// Sidebar menu items
const sidebarItems = [
    {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: "Dashboard",
        path: "/dashboard",
    },
    {
        key: "product",
        icon: <ShoppingOutlined />,
        label: "Product",
        path: "/products",
    },
    {
        key: "order",
        icon: <ShoppingCartOutlined />,
        label: "Order",
        path: "/orders",
    },
    {
        key: "customer",
        icon: <UserOutlined />,
        label: "Customer",
        path: "/customers",
    },
    { key: "user", icon: <TeamOutlined />, label: "User", path: "/users" },
    {
        key: "inventory",
        icon: <DatabaseOutlined />,
        label: "Inventory",
        path: "/inventory",
    },
    {
        key: "reviews",
        icon: <StarOutlined />,
        label: "Reviews",
        path: "/Reviews",
    },
    {
        key: "transaction",
        icon: <CreditCardOutlined />,
        label: "Transaction",
        path: "/Transactions",
    },
    {
        key: "admin-settings",
        icon: <SettingOutlined />,
        label: "Admin Settings",
        children: [
            {
                key: "admin-profile",
                icon: <ProfileOutlined />,
                label: "Admin Profile",
                path: "/admin-profile",
            },
            {
                key: "sub-category",
                icon: <SettingOutlined />,
                label: "Sub Category",
                path: "/sub-category",
            },
        ],
    },
];

// Original Sidebar Component (unchanged)
const Sidebar = ({ collapsed, toggleCollapsed }) => {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleMenuClick = ({ key }) => {
        const item = findItemByKey(sidebarItems, key);
        if (item && item.path) navigate(item.path);
    };

    const findItemByKey = (menuItems, key) => {
        for (let item of menuItems) {
            if (item.key === key) return item;
            if (item.children) {
                const child = findItemByKey(item.children, key);
                if (child) return child;
            }
        }
        return null;
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            logout();
        }, 1000);
    };

    return (
        <div className="sidebar-container" style={{ height: "100%" }}>
            <Button
                type="primary"
                onClick={toggleCollapsed}
                style={{ margin: "16px" }}
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <Menu
                defaultSelectedKeys={["dashboard"]}
                mode="inline"
                theme="dark"
                inlineCollapsed={collapsed}
                items={sidebarItems}
                onClick={handleMenuClick}
                style={{ borderRight: 0, flex: 1 }}
            />
            <div className="logout-container" style={{ padding: "16px" }}>
                <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{ color: "white", width: "100%" }}
                >
                    {!collapsed && "Log Out"}
                </Button>
            </div>
            <Modal
                visible={isLoggingOut}
                footer={null}
                closable={false}
                maskClosable={false}
                centered
                bodyStyle={{ textAlign: "center", padding: "20px" }}
            >
                <p>Redirecting you to login page...</p>
            </Modal>
        </div>
    );
};

// Main Dashboard Component
const AdminDashboard = () => {
    const [COLLAPSED, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const toggleCollapsed = () => setCollapsed((prev) => !prev);

    // Chart Configuration
    const chartData = useMemo(
        () => ({
            labels: ["Jan", "Feb", "Mar", "Apr"],
            datasets: [
                {
                    label: "Sales Revenue",
                    data: [4000, 3000, 2000, 2500],
                    backgroundColor: "rgba(46, 204, 113, 0.8)",
                    borderColor: "#27ae60",
                    borderWidth: 1,
                    borderRadius: 4,
                    maxBarThickness: 50,
                },
            ],
        }),
        []
    );

    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top", labels: { font: { size: 14 } } },
                title: {
                    display: true,
                    text: "Sales Revenue Overview",
                    font: { size: 16 },
                },
                tooltip: {
                    callbacks: {
                        label: ({ raw }) => `$${raw.toLocaleString()}`,
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Revenue ($)",
                        font: { size: 12 },
                    },
                    ticks: {
                        callback: (value) => `$${value.toLocaleString()}`,
                        stepSize: 1000,
                    },
                },
                x: {
                    title: { display: true, text: "Month", font: { size: 12 } },
                },
            },
        }),
        []
    );

    // Stats Data
    const statsData = [
        { title: "Total Orders", value: 150, color: "#2ecc71" },
        { title: "Delivered Orders", value: 120, color: "#3498db" },
        { title: "Pending Orders", value: 25, color: "#e67e22" },
        { title: "Canceled Orders", value: 5, color: "#e74c3c" },
        { title: "Total Amount", value: "$50,000", color: "#2ecc71" },
        { title: "Delivered Amount", value: "$40,000", color: "#3498db" },
        { title: "Pending Amount", value: "$8,000", color: "#e67e22" },
        { title: "Cancel Amount", value: "$2,000", color: "#e74c3c" },
        { title: "New Users", value: 45, color: "#9b59b6" },
    ];

    // Table Configurations
    const tableConfigs = {
        topProducts: {
            columns: [
                {
                    title: "Image",
                    dataIndex: "image",
                    key: "image",
                    width: 100,
                    render: (image) => (
                        <img
                            src={image}
                            alt="Product"
                            style={{
                                width: 60,
                                height: 60,
                                objectFit: "cover",
                            }}
                        />
                    ),
                },
                { title: "Name", dataIndex: "name", key: "name", width: 180 },
                {
                    title: "Category",
                    dataIndex: "category",
                    key: "category",
                    width: 120,
                },
                {
                    title: "Price",
                    dataIndex: "price",
                    key: "price",
                    width: 100,
                    render: (price) => `$${price.toLocaleString()}`,
                    sorter: (a, b) => a.price - b.price,
                },

                {
                    title: "Sold",
                    dataIndex: "sold",
                    key: "sold",
                    width: 80,
                    sorter: (a, b) => a.sold - b.sold,
                },
            ],
            data: [
                {
                    key: "1",
                    image: "https://via.placeholder.com/60",
                    name: "Watch Model 1",
                    category: "Watches",
                    price: 2000,

                    sold: 5,
                },
                {
                    key: "2",
                    image: "https://via.placeholder.com/60",
                    name: "Watch Model 2",
                    category: "Watches",
                    price: 3000,

                    sold: 3,
                },
                {
                    key: "3",
                    image: "https://via.placeholder.com/60",
                    name: "Watch Model 3",
                    category: "Watches",
                    price: 2500,

                    sold: 4,
                },
            ],
        },
        recentOrders: {
            columns: [
                {
                    title: "Customer",
                    dataIndex: "customerName",
                    key: "customerName",
                    width: 150,
                },
                {
                    title: "Amount",
                    dataIndex: "totalAmount",
                    key: "totalAmount",
                    width: 120,
                    render: (amount) => `$${amount.toLocaleString()}`,
                    sorter: (a, b) => a.totalAmount - b.totalAmount,
                },
                {
                    title: "Payment",
                    dataIndex: "paymentMethod",
                    key: "paymentMethod",
                    width: 120,
                },
                {
                    title: "Status",
                    dataIndex: "orderStatus",
                    key: "orderStatus",
                    width: 100,
                    filters: [
                        { text: "Pending", value: "Pending" },
                        { text: "Delivered", value: "Delivered" },
                    ],
                    onFilter: (value, record) => record.orderStatus === value,
                },
                {
                    title: "Date",
                    dataIndex: "dateOrdered",
                    key: "dateOrdered",
                    width: 120,
                },
            ],
            data: [
                {
                    key: "1",
                    customerName: "John Doe",
                    totalAmount: 2000,
                    paymentMethod: "Credit Card",
                    orderStatus: "Pending",
                    dateOrdered: "03/01/2025",
                },
            ],
        },
        productOverview: {
            columns: [
                { title: "Name", dataIndex: "name", key: "name", width: 150 },
                {
                    title: "Category",
                    dataIndex: "category",
                    key: "category",
                    width: 120,
                },
                {
                    title: "Price",
                    dataIndex: "price",
                    key: "price",
                    width: 100,
                    render: (price) => `$${price.toLocaleString()}`,
                    sorter: (a, b) => a.price - b.price,
                },
                {
                    title: "Stock",
                    dataIndex: "stock",
                    key: "stock",
                    width: 100,
                    sorter: (a, b) => a.stock - b.stock,
                },
                {
                    title: "Sold",
                    dataIndex: "sold",
                    key: "sold",
                    width: 100,
                    sorter: (a, b) => a.sold - b.sold,
                },
                {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    width: 100,
                    filters: [
                        { text: "In Stock", value: "In Stock" },
                        { text: "Out of Stock", value: "Out of Stock" },
                    ],
                    onFilter: (value, record) => record.status === value,
                },
            ],
            data: [
                {
                    key: "1",
                    name: "Watch Model 1",
                    category: "Watches",
                    price: 2000,
                    stock: 5,
                    sold: 5,
                    status: "In Stock",
                },
                {
                    key: "2",
                    name: "Watch Model 2",
                    category: "Watches",
                    price: 3000,
                    stock: 3,
                    sold: 3,
                    status: "In Stock",
                },
            ],
        },
    };

    return (
        <>
            <style>
                {`
                    .dashboard-container {
                        min-height: 100vh;
                        background: ${colorBgContainer};
                    }
                    .stats-card {
                        transition: all 0.3s;
                        border-radius: ${borderRadiusLG}px;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                    }
                    .stats-card:hover {
                        box-shadow: 0 4px 8px rgba(0,0,0,0.08);
                    }
                    .ant-table-tbody > tr > td {
                        padding: 12px !important;
                    }
                    .chart-container {
                        height: 400px;
                        padding: 16px;
                    }
                    .table-card {
                        margin-bottom: 24px;
                    }
                    .ant-statistic-title {
                        color: #595959;
                        font-size: 14px;
                    }
                    .ant-statistic-content {
                        font-size: 24px;
                        font-weight: 500;
                    }
                `}
            </style>
            <Layout className="dashboard-container">
                <Sider width={256} style={{ minHeight: "100vh" }}>
                    <Sidebar
                        collapsed={COLLAPSED}
                        toggleCollapsed={toggleCollapsed}
                    />
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
                        {/* Stats Section */}
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
                                            borderStyle: "solid",
                                            borderWidth: "0px",
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

                        {/* Sales Revenue Chart */}
                        <Card
                            title="Sales Revenue"
                            className="table-card"
                            bordered={false}
                        >
                            <div className="chart-container">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </Card>

                        {/* Top Products Table */}
                        <Card
                            title="Top Products"
                            className="table-card"
                            bordered={false}
                        >
                            <Table
                                columns={tableConfigs.topProducts.columns}
                                dataSource={tableConfigs.topProducts.data}
                                pagination={false}
                                size="middle"
                                scroll={{ x: "max-content" }}
                                bordered
                            />
                        </Card>

                        {/* Recent Orders Table */}
                        <Card
                            title="Recent Orders"
                            className="table-card"
                            bordered={false}
                        >
                            <Table
                                columns={tableConfigs.recentOrders.columns}
                                dataSource={tableConfigs.recentOrders.data}
                                pagination={{ pageSize: 5 }}
                                scroll={{ x: 800 }}
                                bordered
                            />
                        </Card>

                        {/* Product Overview Table */}
                        <Card title="Product Overview" bordered={false}>
                            <Table
                                columns={tableConfigs.productOverview.columns}
                                dataSource={tableConfigs.productOverview.data}
                                pagination={{ pageSize: 5 }}
                                scroll={{ x: 800 }}
                                bordered
                            />
                        </Card>
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
        </>
    );
};

export default AdminDashboard;
