import React, { useState } from "react";
import {
    PieChartOutlined,
    AppstoreOutlined,
    DesktopOutlined,
    ContainerOutlined,
    UserOutlined,
    ShopOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Layout, Button, Menu, theme } from "antd";

const { Header, Content, Footer, Sider } = Layout;

const menuItems = [
    {
        key: "dashboard",
        icon: <PieChartOutlined />,
        label: "DASHBOARD",
    },
    {
        key: "product",
        icon: <AppstoreOutlined />,
        label: "PRODUCT",
    },
    {
        key: "order",
        icon: <DesktopOutlined />,
        label: "ORDER",
    },
    {
        key: "customer",
        icon: <ContainerOutlined />,
        label: "CUSTOMER",
    },
    {
        key: "user",
        icon: <UserOutlined />,
        label: "USER",
    },
    {
        key: "inventory",
        icon: <ShopOutlined />,
        label: "INVENTORY",
    },
    {
        key: "adminSettings",
        icon: <SettingOutlined />,
        label: "ADMIN SETTINGS",
        children: [
            { key: "profileSettings", label: "Profile Settings" },
            { key: "systemSettings", label: "System Settings" },
        ],
    },
];

const AdminDashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const toggleCollapsed = () => setCollapsed(!collapsed);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
            <Sider width={256} style={{ minHeight: "100vh" }}>
                <div
                    style={{
                        padding: "16px",
                        textAlign: "center",
                        background: "#001529",
                    }}
                >
                    <Button
                        type="primary"
                        onClick={toggleCollapsed}
                        style={{ marginBottom: 16 }}
                    >
                        {collapsed ? (
                            <MenuUnfoldOutlined />
                        ) : (
                            <MenuFoldOutlined />
                        )}
                    </Button>
                </div>
                <Menu
                    defaultSelectedKeys={["dashboard"]}
                    defaultOpenKeys={["adminSettings"]}
                    mode="inline"
                    theme="dark"
                    inlineCollapsed={collapsed}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
                    <div
                        style={{
                            padding: 24,
                            textAlign: "center",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        Content Area
                    </div>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    Admin Dashboard ©{new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminDashboard;
