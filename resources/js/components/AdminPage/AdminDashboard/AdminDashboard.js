import React, { useState } from "react";
import { Layout, theme } from "antd";
import Sidebar from "../AdminSidebar/Sidebar";

const { Header, Content, Footer, Sider } = Layout;

const AdminDashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const toggleCollapsed = () => setCollapsed(!collapsed);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
            <Sider width={256} style={{ minHeight: "100vh" }}>
                <Sidebar
                    collapsed={collapsed}
                    toggleCollapsed={toggleCollapsed}
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
