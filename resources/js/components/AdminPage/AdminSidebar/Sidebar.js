import React, { useState, useMemo } from "react";
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
import { Button, Menu, Modal } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../AccessPage/Auth";

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

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

    // Compute the selected key based on the current path
    const selectedKey = useMemo(() => {
        const findSelectedKey = (menuItems, pathname) => {
            for (let item of menuItems) {
                if (item.path === pathname) return item.key;
                if (item.children) {
                    const childKey = findSelectedKey(item.children, pathname);
                    if (childKey) return childKey;
                }
            }
            return null;
        };
        return findSelectedKey(items, location.pathname) || "dashboard";
    }, [location.pathname]);

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            logout();
        }, 1000);
    };

    return (
        <div className="sidebar-container">
            <Button
                type="primary"
                onClick={toggleCollapsed}
                style={{ margin: "16px" }}
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <Menu
                selectedKeys={[selectedKey]}
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

export default Sidebar;