import axios from "axios";
import React, { useState, useEffect } from "react";
import { flushSync } from "react-dom"; // Added import
import { Layout, Menu, Dropdown, Badge, Avatar, Button } from "antd";
import {
    ShoppingCartOutlined,
    BellOutlined,
    MenuOutlined,
    UserOutlined,
    ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header: AntHeader } = Layout;

const Header = () => {
    const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
    const [profile, setProfile] = useState(null);
    const [avatarKey, setAvatarKey] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [orders, setOrders] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [readNotifications, setReadNotifications] = useState([]);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const storedReadNotifications =
            localStorage.getItem("readNotifications");
        if (storedReadNotifications) {
            setReadNotifications(JSON.parse(storedReadNotifications));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            "readNotifications",
            JSON.stringify(readNotifications)
        );
    }, [readNotifications]);

    useEffect(() => {
        if (token) {
            axios
                .get("http://localhost:8000/api/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => setProfile(res.data))
                .catch((err) => console.error("Error fetching profile:", err));
        }
    }, [token]);

    useEffect(() => {
        const handleProfileUpdated = (e) => {
            setProfile(e.detail);
            setAvatarKey((prev) => prev + 1);
        };
        window.addEventListener("profileUpdated", handleProfileUpdated);
        return () =>
            window.removeEventListener("profileUpdated", handleProfileUpdated);
    }, []);

    useEffect(() => {
        const updateCartCount = () => {
            const storedCart = localStorage.getItem("cart");
            if (storedCart) {
                try {
                    const items = JSON.parse(storedCart);
                    setCartCount(Array.isArray(items) ? items.length : 0);
                } catch (e) {
                    setCartCount(0);
                }
            } else {
                setCartCount(0);
            }
        };
        updateCartCount();
        window.addEventListener("cartUpdated", updateCartCount);
        return () => window.removeEventListener("cartUpdated", updateCartCount);
    }, []);

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token, readNotifications]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/my-purchases",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const orderData = response.data.data || response.data;
            const allOrders = Array.isArray(orderData) ? orderData : [];
            setOrders(allOrders);
            const placedOrders = allOrders.filter(
                (order) =>
                    order.order_status.toLowerCase() === "pending" &&
                    !readNotifications.includes(order.id)
            );
            setNotificationCount(placedOrders.length);
        } catch (err) {
            console.error(
                "Error fetching orders:",
                err.response?.data || err.message
            );
            setOrders([]);
            setNotificationCount(0);
        }
    };

    useEffect(() => {
        const handleOrderPlaced = () => fetchOrders();
        const handleOrderStatusUpdate = () => fetchOrders();
        window.addEventListener("orderPlaced", handleOrderPlaced);
        window.addEventListener("orderStatusUpdated", handleOrderStatusUpdate);
        return () => {
            window.removeEventListener("orderPlaced", handleOrderPlaced);
            window.removeEventListener(
                "orderStatusUpdated",
                handleOrderStatusUpdate
            );
        };
    }, []);

    const markAsReadAndNavigate = (orderId) => {
        if (!readNotifications.includes(orderId)) {
            flushSync(() => {
                // Added flushSync
                setReadNotifications((prev) => [...prev, orderId]);
                setNotificationCount((prev) => Math.max(0, prev - 1));
            });
        }
        navigate(`/order-tracking/${orderId}`);
    };

    const avatarSrc = profile?.profile_image
        ? `${profile.profile_image}?${new Date().getTime()}`
        : "/images/default-avatar.png";
    const username = profile ? profile.username : "Guest";

    const categoriesMenu = (
        <Menu className="white-dropdown">
            <Menu.Item key="luxury-watches">Luxury Watches</Menu.Item>
            <Menu.Item key="fashion-watches">Fashion Watches</Menu.Item>
            <Menu.Item key="smart-watches">Smart Watches</Menu.Item>
        </Menu>
    );

    const notificationsMenu = (
        <Menu className="white-dropdown" style={{ width: 350 }}>
            {orders
                .filter(
                    (order) =>
                        order.order_status.toLowerCase() === "pending" &&
                        !readNotifications.includes(order.id)
                )
                .slice(0, 3)
                .map((order) => {
                    const product = order.order_details?.[0]?.product || {};
                    return (
                        <Menu.Item
                            key={order.id}
                            onClick={() => markAsReadAndNavigate(order.id)}
                            style={{
                                height: "auto",
                                padding: "10px",
                                cursor: "pointer",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <ShoppingOutlined
                                    style={{
                                        fontSize: "20px",
                                        marginRight: "10px",
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "bold" }}>
                                        Order Placed
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#888",
                                        }}
                                    >
                                        Your order ({order.id}) was submitted.
                                        Thanks for Shopping with Timeless!
                                    </div>
                                </div>
                                <img
                                    src={
                                        product.main_image
                                            ? `http://localhost:8000/storage/${product.main_image}`
                                            : "/images/default-product.png"
                                    }
                                    alt={product.product_name || "Product"}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        objectFit: "cover",
                                        borderRadius: 4,
                                    }}
                                    onError={(e) =>
                                        (e.target.src =
                                            "/images/default-product.png")
                                    }
                                />
                            </div>
                        </Menu.Item>
                    );
                })}
            {orders.filter(
                (order) =>
                    order.order_status.toLowerCase() === "pending" &&
                    !readNotifications.includes(order.id)
            ).length === 0 && (
                <Menu.Item key="no-notif">No new notifications</Menu.Item>
            )}
            <Menu.Item
                key="view-all"
                style={{ textAlign: "center" }}
                onClick={() => navigate("/user-purchase")}
            >
                View All Orders
            </Menu.Item>
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
        localStorage.removeItem("readNotifications");
        window.location.replace("/login");
    };

    const handleProfileClick = () => navigate("/user-profile");

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

    const toggleMobileMenu = () => setIsMobileMenuVisible(!isMobileMenuVisible);

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuVisible(false);
    };

    const handleMenuClick = (e) => {
        e.domEvent.preventDefault();
        handleNavigation(e.item.props.path);
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
                className={`nav-menu ${isMobileMenuVisible ? "visible" : ""}`}
                selectedKeys={[]}
                onClick={handleMenuClick}
            >
                <Menu.Item key="home" path="/user-home">
                    Home
                </Menu.Item>
                <Menu.Item key="about" path="/aboutus">
                    About Us
                </Menu.Item>
                <Menu.Item key="collection" path="/user-collection">
                    Collection
                </Menu.Item>
                <Dropdown overlay={categoriesMenu} placement="bottomLeft">
                    <Menu.Item key="categories">Categories</Menu.Item>
                </Dropdown>
            </Menu>
            <div className="header-icons">
                <Dropdown overlay={notificationsMenu} trigger={["click"]}>
                    <Badge count={notificationCount} className="icon-badge">
                        <BellOutlined
                            style={{ fontSize: "24px", cursor: "pointer" }}
                            className="icon"
                        />
                    </Badge>
                </Dropdown>
                <Badge count={cartCount} className="icon-badge">
                    <ShoppingCartOutlined
                        style={{ fontSize: "24px", cursor: "pointer" }}
                        className="icon"
                        onClick={() => navigate("/user-cart")}
                    />
                </Badge>
                <Dropdown overlay={userMenu} trigger={["click"]}>
                    <div className="user-avatar">
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
