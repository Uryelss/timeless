import React from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { key: "profile", label: "PROFILE", path: "/user-Profile" },
        { key: "mypurchase", label: "MY PURCHASE", path: "/user-purchase" }, // Adjust if needed
        { key: "addresses", label: "ADDRESSES", path: "/user-address" },
    ];

    // Determine selected key based on current pathname
    let selectedKey = "profile"; // default selection
    menuItems.forEach((item) => {
        if (location.pathname.toLowerCase().includes(item.path.toLowerCase())) {
            selectedKey = item.key;
        }
    });

    const handleMenuClick = ({ key }) => {
        const item = menuItems.find((itm) => itm.key === key);
        if (item && item.path) {
            navigate(item.path);
        }
    };

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
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={handleMenuClick}
                    style={{
                        height: "100%",
                        borderRight: 0,
                        paddingTop: "20px",
                    }}
                >
                    {menuItems.map((item) => (
                        <Menu.Item key={item.key}>{item.label}</Menu.Item>
                    ))}
                </Menu>
                <div
                    className="collapse-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </div>
            </div>
        </Sider>
    );
};

export default Sidebar;
