import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate(); // Initialize useNavigate

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            trigger={null}
            style={{
                background: "#fff",
                height: "80vh",
                width: collapsed ? "80px" : "200px",
                transition: "width 0.2s",
            }}
        >
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <Menu
                    theme="light"
                    defaultSelectedKeys={["1"]}
                    mode="inline"
                    style={{
                        height: "100%",
                        borderRight: 0,
                        paddingTop: "20px",
                    }}
                >
                    <Menu.Item key="1">PROFILE</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item key="2" onClick={() => navigate("/user-purchase")}>
                        MY PURCHASE
                    </Menu.Item>
                    <Menu.Item
                        key="3"
                        onClick={() => navigate("/user-address")}
                    >
                        ADDRESSES
                    </Menu.Item>
                </Menu>
                <div
                    style={{
                        textAlign: "center",
                        padding: "10px 0",
                        background: collapsed ? "transparent" : "#001529",
                        color: "#fff",
                        cursor: "pointer",
                    }}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? ">" : "<"}
                </div>
            </div>
        </Sider>
    );
};

export default Sidebar;
