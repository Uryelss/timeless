import axios from "axios";
import React, { useState, useEffect } from "react";
import { flushSync } from "react-dom";
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
    const [notifications, setNotifications] = useState([]);
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
        // Recalculate unread count when readNotifications changes
        setNotificationCount(
            notifications.filter(
                (n) => !readNotifications.includes(`${n.id}-${n.type}`)
            ).length
        );
    }, [readNotifications, notifications]);

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
    }, [token]);

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

            // Generate notifications based on order status
            const newNotifications = allOrders.flatMap((order) => {
                const status = order.order_status.toLowerCase();
                const trackingNumber =
                    order.shipping?.tracking_number || "Not Available";
                const notifs = [];

                if (status === "pending") {
                    notifs.push({
                        id: order.id,
                        type: "confirmation",
                        message: `Thank you for your order! Your order #${order.id} has been successfully placed.`,
                        image: order.order_details?.[0]?.product?.main_image
                            ? `http://localhost:8000/storage/${order.order_details[0].product.main_image}`
                            : "/images/default-product.png",
                        timestamp: order.created_at || new Date().toISOString(),
                    });
                    notifs.push({
                        id: order.id,
                        type: "processing",
                        message: `Your order #${order.id} is being prepared for shipment.`,
                        image: order.order_details?.[0]?.product?.main_image
                            ? `http://localhost:8000/storage/${order.order_details[0].product.main_image}`
                            : "/images/default-product.png",
                        timestamp:
                            order.payment_confirmed_at ||
                            new Date().toISOString(),
                    });
                } else if (status === "shipped") {
                    notifs.push({
                        id: order.id,
                        type: "shipped",
                        message: `Good news! Your order #${order.id} has been shipped. Track your package here: ${trackingNumber}.`,
                        image: order.order_details?.[0]?.product?.main_image
                            ? `http://localhost:8000/storage/${order.order_details[0].product.main_image}`
                            : "/images/default-product.png",
                        timestamp: order.shipped_at || new Date().toISOString(),
                    });
                } else if (status === "delivered") {
                    notifs.push({
                        id: order.id,
                        type: "out-for-delivery",
                        message: `Your order #${order.id} is out for delivery and should arrive today.`,
                        image: order.order_details?.[0]?.product?.main_image
                            ? `http://localhost:8000/storage/${order.order_details[0].product.main_image}`
                            : "/images/default-product.png",
                        timestamp:
                            order.delivered_at || new Date().toISOString(),
                    });
                } else if (status === "completed") {
                    notifs.push({
                        id: order.id,
                        type: "delivered",
                        message: `Your order #${order.id} has been delivered. We hope you enjoy your purchase!`,
                        image: order.order_details?.[0]?.product?.main_image
                            ? `http://localhost:8000/storage/${order.order_details[0].product.main_image}`
                            : "/images/default-product.png",
                        timestamp:
                            order.completed_at || new Date().toISOString(),
                    });
                } else if (status === "cancelled") {
                    notifs.push({
                        id: order.id,
                        type: "cancelled",
                        message: `Your order #${order.id} has been cancelled.`,
                        image: order.order_details?.[0]?.product?.main_image
                            ? `http://localhost:8000/storage/${order.order_details[0].product.main_image}`
                            : "/images/default-product.png",
                        timestamp: new Date().toISOString(),
                    });
                }
                return notifs;
            });

            // Append new notifications without overwriting existing ones
            setNotifications((prev) => {
                const merged = [...prev];
                newNotifications.forEach((newNotif) => {
                    const existingIndex = merged.findIndex(
                        (n) => n.id === newNotif.id && n.type === newNotif.type
                    );
                    if (existingIndex === -1) {
                        merged.push(newNotif);
                    } else {
                        // Update timestamp if the notification already exists
                        merged[existingIndex].timestamp = newNotif.timestamp;
                    }
                });
                return merged.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );
            });

            // Update unread count
            setNotificationCount(
                newNotifications.filter(
                    (n) => !readNotifications.includes(`${n.id}-${n.type}`)
                ).length
            );
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
        const handleOrderPlaced = () => {
            console.log("Order placed event received");
            fetchOrders();
        };
        const handleOrderStatusUpdate = () => {
            console.log("Order status updated event received");
            fetchOrders();
        };
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

    const markAsReadAndNavigate = (notifId, notifType) => {
        const notifKey = `${notifId}-${notifType}`;
        if (!readNotifications.includes(notifKey)) {
            flushSync(() => {
                setReadNotifications((prev) => [...prev, notifKey]);
                setNotificationCount((prev) => Math.max(0, prev - 1));
            });
        }
        navigate(`/order-tracking/${notifId}`);
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
            {notifications.length > 0 ? (
                notifications.slice(0, 5).map((notif) => {
                    const isRead = readNotifications.includes(
                        `${notif.id}-${notif.type}`
                    );
                    return (
                        <Menu.Item
                            key={`${notif.id}-${notif.type}`}
                            onClick={() =>
                                markAsReadAndNavigate(notif.id, notif.type)
                            }
                            style={{
                                height: "auto",
                                padding: "10px",
                                cursor: "pointer",
                                backgroundColor: isRead ? "#f5f5f5" : "#fff",
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
                                    <div
                                        style={{
                                            fontWeight: isRead
                                                ? "normal"
                                                : "bold",
                                        }}
                                    >
                                        {notif.type
                                            .replace(/-/g, " ")
                                            .replace(/\b\w/g, (c) =>
                                                c.toUpperCase()
                                            )}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#888",
                                        }}
                                    >
                                        {notif.message}
                                    </div>
                                </div>
                                <img
                                    src={notif.image}
                                    alt="Product"
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
                })
            ) : (
                <Menu.Item key="no-notif">No notifications</Menu.Item>
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
