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
} from "@ant-design/icons";
import { Button, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const items = [
    {
        key: "dashboard",
        icon: <DashboardOutlined style={{ color: "white" }} />,
        label: "Dashboard",
        path: "/dashboard",
    },
    {
        key: "product",
        icon: <ShoppingOutlined style={{ color: "white" }} />,
        label: "Product",
        path: "/products",
    },
    {
        key: "order",
        icon: <ShoppingCartOutlined style={{ color: "white" }} />,
        label: "Order",
        path: "/orders",
    },
    {
        key: "customer",
        icon: <UserOutlined style={{ color: "white" }} />,
        label: "Customer",
        path: "/customers",
    },
    {
        key: "user",
        icon: <TeamOutlined style={{ color: "white" }} />,
        label: "User",
        path: "/users",
    },
    {
        key: "inventory",
        icon: <DatabaseOutlined style={{ color: "white" }} />,
        label: "Inventory",
        path: "/inventory",
    },
    {
        key: "admin-settings",
        icon: <SettingOutlined style={{ color: "white" }} />,
        label: "Admin Settings",
        children: [
            {
                key: "admin-profile",
                icon: <ProfileOutlined style={{ color: "white" }} />,
                label: "Admin Profile",
                path: "/admin-profile",
            },
            {
                key: "sub-category",
                icon: <SettingOutlined style={{ color: "white" }} />,
                label: "Sub Category",
                path: "/sub-category",
            },
        ],
    },
];

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedKey, setSelectedKey] = useState("");

    useEffect(() => {
        const currentItem = items.flatMap(item => item.children ? [item, ...item.children] : item)
            .find(item => item.path === location.pathname);
        setSelectedKey(currentItem ? currentItem.key : "");
    }, [location.pathname]);

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
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div
            className="sidebar-container"
            style={{ 
                height: "100vh", 
                overflow: "auto", 
                backgroundColor: "#297982" 
            }}
        >
            <Button
                type="primary"
                onClick={toggleCollapsed}
                style={{ 
                    margin: "16px", 
                    backgroundColor: "#297982", 
                    borderColor: "#297982",
                    color: "white"  // Ensure button text is white
                }}
            >
                {collapsed ? 
                    <MenuUnfoldOutlined style={{ color: "white" }} /> : 
                    <MenuFoldOutlined style={{ color: "white" }} />
                }
            </Button>
            <Menu
                selectedKeys={[selectedKey]}
                mode="inline"
                inlineCollapsed={collapsed}
                items={items}
                onClick={handleMenuClick}
                style={{ 
                    borderRight: 0, 
                    backgroundColor: "#297982", 
                    color: "white"  // Base text color
                }}
                theme="dark"  // Keep dark theme for consistency
                className="custom-menu"  // Added for custom styling
            />
            <div className="logout-container" style={{ padding: "16px" }}>
                <Button
                    type="text"
                    icon={<LogoutOutlined style={{ color: "white" }} />}
                    onClick={handleLogout}
                    className="logout-button"
                    style={{ 
                        color: "white",
                        backgroundColor: "transparent",  // Ensure no background interference
                        border: "none"  // Remove any border
                    }}
                >
                    {!collapsed && "Log Out"}
                </Button>
            </div>
        </div>
    );
};

// Add custom CSS to ensure all menu items are white
const styles = `
    .custom-menu .ant-menu-item,
    .custom-menu .ant-menu-submenu-title,
    .custom-menu .ant-menu-item-selected,
    .custom-menu .ant-menu-submenu-selected {
        color: white !important;
    }
    .custom-menu .ant-menu-item:hover,
    .custom-menu .ant-menu-submenu-title:hover {
        color: white !important;
        background-color: rgba(255, 255, 255, 0.1) !important; // Slight highlight on hover
    }
    .custom-menu .ant-menu-item-selected {
        background-color: rgba(255, 255, 255, 0.2) !important; // Selected item highlight
    }
`;

// Inject styles into the document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Sidebar;