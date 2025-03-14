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

    // A separate state just to force React to re-render the Avatar
    const [avatarKey, setAvatarKey] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");

    // Fetch the profile from /api/profile when we have a token
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

    // Listen for "profileUpdated" custom event and update the header
    useEffect(() => {
        const handleProfileUpdated = (e) => {
            // e.detail contains the updated profile from the UserProfile component
            setProfile(e.detail);

            // Increment avatarKey to force a re-render of the <Avatar>
            setAvatarKey((prev) => prev + 1);
        };

        window.addEventListener("profileUpdated", handleProfileUpdated);
        return () => {
            window.removeEventListener("profileUpdated", handleProfileUpdated);
        };
    }, []);

    // Build the avatar source, appending a timestamp to bust the cache
    const avatarSrc =
        profile && profile.profile_image
            ? profile.profile_image + "?" + new Date().getTime()
            : "/images/default-avatar.png";

    const username = profile ? profile.username : "Guest";

    const categoriesMenu = (
        <Menu className="white-dropdown">
            <Menu.Item key="luxury-watches">Luxury Watches</Menu.Item>
            <Menu.Item key="fashion-watches">Fashion Watches</Menu.Item>
            <Menu.Item key="smart-watches">Smart Watches</Menu.Item>
        </Menu>
    );

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
        navigate("/user-Profile");
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

    const getSelectedKey = () => {
        switch (location.pathname) {
            case "/user-home":
                return "home";
            case "/aboutus":
                return "about";
            case "/user-collection":
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
                    onClick={() => handleNavigation("/user-home")}
                >
                    Home
                </Menu.Item>
                <Menu.Item
                    key="about"
                    onClick={() => handleNavigation("/aboutus")}
                >
                    About Us
                </Menu.Item>
                <Menu.Item
                    key="collection"
                    onClick={() => handleNavigation("/user-collection")}
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
                        {/* Use avatarKey as the "key" prop to force re-render when it changes */}
                        <Avatar
                            key={avatarKey}
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
