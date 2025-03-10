import React, { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Badge, Avatar, Button } from "antd";
import {
    HomeOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    BellOutlined,
    MenuOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Header: AntHeader } = Layout;

const Header = () => {
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
    const navigate = useNavigate();

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/user", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const fetchCartCount = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/cart/count", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setCartCount(response.data.count);
        } catch (error) {
            console.error("Error fetching cart count:", error);
        }
    };

    const fetchNotificationCount = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/notifications/count", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setNotificationCount(response.data.count);
        } catch (error) {
            console.error("Error fetching notification count:", error);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchCartCount();
        fetchNotificationCount();
    }, []);

    const categoriesMenu = (
        <Menu className="white-dropdown">
            <Menu.Item key="luxury-watches">Luxury Watches</Menu.Item>
            <Menu.Item key="fashion-watches">Fashion Watches</Menu.Item>
            <Menu.Item key="smart-watches">Smart Watches</Menu.Item>
        </Menu>
    );

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleProfileClick = () => {
        navigate("/profile");
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const userMenu = (
        <Menu className="white-dropdown">
            <Menu.Item key="profile" onClick={handleProfileClick}>
                Profile
            </Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    const toggleMobileMenu = () => {
        setIsMobileMenuVisible(!isMobileMenuVisible);
    };

    return (
        <AntHeader className="header">
            <div className="logo">
                <img src="/images/logo.png" alt="Logo" />
            </div>

            <Button className="mobile-menu-button" onClick={toggleMobileMenu}>
                <MenuOutlined />
            </Button>

            <Menu
                theme="light"
                mode="horizontal"
                defaultSelectedKeys={["home"]}
                className={`nav-menu ${isMobileMenuVisible ? "visible" : ""}`}
            >
                <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => handleNavigation("/")}>
                    Home
                </Menu.Item>
                <Menu.Item key="about" onClick={() => handleNavigation("/aboutus")}>
                    About Us
                </Menu.Item>
                <Menu.Item key="collection" onClick={() => handleNavigation("/collection")}>
                    Collection
                </Menu.Item>
                <Dropdown overlay={categoriesMenu} placement="bottomLeft">
                    <Menu.Item key="categories">Categories</Menu.Item>
                </Dropdown>
            </Menu>

            <div className="header-icons">
                <Badge count={notificationCount} className="icon-badge">
                    <BellOutlined className="icon" />
                </Badge>
                <Badge count={cartCount} className="icon-badge">
                    <ShoppingCartOutlined className="icon" />
                </Badge>
                <Dropdown overlay={userMenu} trigger={["click"]}>
                    <div className="user-avatar">
                        <Avatar src={user?.avatar} icon={<UserOutlined />} />
                        <span className="username">{user?.name}</span>
                    </div>
                </Dropdown>
            </div>
        </AntHeader>
    );
};

export default Header;
