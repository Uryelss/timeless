import React, { useState, useEffect } from "react";
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
    TruckOutlined, // Add icon for couriers
} from "@ant-design/icons";
import { Button, Menu, Modal } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../AccessPage/Auth";
import ShopNowButton from "../AdminSidebar/ShopNow";

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
    // NEW: Add Courier menu item
    {
        key: "courier",
        icon: <TruckOutlined />,
        label: "Courier",
        path: "/couriers",
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

// Rest of the Sidebar component remains the same
const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedKey, setSelectedKey] = useState("");

    useEffect(() => {
        const findMatchingItem = (menuItems, pathname) => {
            for (let item of menuItems) {
                if (item.path === pathname) {
                    return item.key;
                }
                if (item.children) {
                    const childKey = findMatchingItem(item.children, pathname);
                    if (childKey) return childKey;
                }
            }
            return "";
        };

        const key = findMatchingItem(items, location.pathname);
        setSelectedKey(key);
    }, [location.pathname]);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const handleMenuClick = ({ key }) => {
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

        const item = findItemByKey(items, key);
        if (item && item.path) {
            navigate(item.path);
        }
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            logout();
        }, 1000);
    };

    return (
        <div
            className="sidebar-container"
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <div>
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
            </div>
            <div
                className="sidebar-footer"
                style={{
                    padding: "16px",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div style={{ marginBottom: "16px" }}>
                    <ShopNowButton />
                </div>
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