import React, { useState } from "react";
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
} from "@ant-design/icons";
import { Button, Menu } from "antd";
import { useNavigate } from "react-router-dom";

const items = [
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
    {
        key: "user",
        icon: <TeamOutlined />,
        label: "User",
        path: "/users",
    },
    {
        key: "inventory",
        icon: <DatabaseOutlined />,
        label: "Inventory",
        path: "/inventory",
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

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const handleMenuClick = ({ key }) => {
        const item = findItemByKey(items, key);
        if (item && item.path) {
            navigate(item.path);
        }
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
        localStorage.removeItem("token"); // Clear token on logout
        navigate("/login");
    };

    return (
        <div
            className="sidebar-container"
            style={{ height: "100vh", overflow: "auto" }}
        >
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
                items={items}
                onClick={handleMenuClick}
                style={{ borderRight: 0 }}
            />
            <div className="logout-container">
                <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    className="logout-button"
                >
                    {!collapsed && "Log Out"}
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
