import React, { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Badge, Avatar, Button } from "antd";
import {
    HomeOutlined,
    ShoppingCartOutlined,
    BellOutlined,
    MenuOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const { Header: AntHeader } = Layout;

const Header = () => {
    const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");

    // Fetch the profile from /api/profile
    useEffect(() => {
        if (token) {
            axios
                .get("http://localhost:8000/api/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    setProfile(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching profile:", err);
                });
        }
    }, [token]);

    // Use profile data for dynamic avatar and username
    const avatarSrc =
        profile && profile.profile_image
            ? profile.profile_image
            : "/images/default-avatar.png";
    const username = profile ? profile.username : "Guest";

    // Categories dropdown menu
    const categoriesMenu = (
        <Menu className="white-dropdown">
            <Menu.Item key="luxury-watches" onClick={() => handleNavigation("/collection")}>Luxury Watches</Menu.Item>
            <Menu.Item key="fashion-watches" onClick={() => handleNavigation("/collection")}>Fashion Watches</Menu.Item>
            <Menu.Item key="smart-watches" onClick={() => handleNavigation("/collection")}>Smart Watches</Menu.Item>
        </Menu>
    );

    // Logout function using API logout endpoint (Passport)
    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:8000/api/logout",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("API logout error:", err);
        }
        localStorage.removeItem("token");
        window.location.replace("/login");
    };

    const handleProfileClick = () => {
        navigate("/user-profile");
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuVisible(false);
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

    // ✅ Fixed: Ensures correct active menu selection
    const getSelectedKey = () => {
        switch (location.pathname) {
            case "/homepage":
                return "home";
            case "/aboutus":
                return "about";
            case "/collection":
                return "collection";
            default:
                return "";
        }
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
                selectedKeys={[getSelectedKey()]}
                className={`nav-menu ${isMobileMenuVisible ? "visible" : ""}`}
            >
                <Menu.Item
                    key="home"
                    icon={<HomeOutlined style={{ fontSize: "24px" }} />}
                    onClick={() => handleNavigation("/homepage")} // ✅ Fixed: Navigates to the correct homepage
                >
                    Home
                </Menu.Item>
                <Menu.Item
                    key="about"
                    onClick={() => handleNavigation("/aboutus")} // ✅ Fixed
                >
                    About Us
                </Menu.Item>
                <Menu.Item
                    key="collection"
                    onClick={() => handleNavigation("/collection")} // ✅ Fixed
                >
                    Collection
                </Menu.Item>
                <Dropdown overlay={categoriesMenu} placement="bottomLeft">
                    <Menu.Item key="categories">Categories</Menu.Item>
                </Dropdown>
            </Menu>
            <div className="header-icons">
                <Badge count={0} className="icon-badge">
                    <BellOutlined
                        style={{ fontSize: "24px" }}
                        className="icon"
                    />
                </Badge>
                <Badge count={0} className="icon-badge">
                    <ShoppingCartOutlined
                        style={{ fontSize: "24px" }}
                        className="icon"
                    />
                </Badge>
                <Dropdown overlay={userMenu} trigger={["click"]}>
                    <div className="user-avatar">
                        <Avatar
                            src={avatarSrc}
                            size={40}
                            shape="circle"
                            icon={!avatarSrc && <UserOutlined />}
                        />
                        <span className="username">{username}</span>
                    </div>
                </Dropdown>
            </div>
        </AntHeader>
    );
};

export default Header;
