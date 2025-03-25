import axios from "axios";
import React, { useState, useEffect } from "react";
import {
    Layout,
    Menu,
    Dropdown,
    Badge,
    Avatar,
    Button,
    notification,
} from "antd";
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
    const [readNotifications, setReadNotifications] = useState([]); // New state to track read notifications

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Fetch profile when token is available
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

    // Listen for profile updates
    useEffect(() => {
        const handleProfileUpdated = (e) => {
            setProfile(e.detail);
            setAvatarKey((prev) => prev + 1);
        };

        window.addEventListener("profileUpdated", handleProfileUpdated);
        return () => {
            window.removeEventListener("profileUpdated", handleProfileUpdated);
        };
    }, []);

    // Listen for cart updates and update badge count
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
        return () => {
            window.removeEventListener("cartUpdated", updateCartCount);
        };
    }, []);

    // Fetch orders when token is available
    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    // Function to fetch orders from API
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

            // Only count "Order Placed" (pending) notifications that are unread
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

    // Listen for order-related events
    useEffect(() => {
        const handleOrderPlaced = (e) => {
            const order = e.detail;
            fetchOrders(); // Refresh orders to include the new one
        };

        const handleOrderStatusUpdate = (e) => {
            fetchOrders(); // Refresh orders on status update
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

    // Mark notification as read and navigate to tracking page
    const markAsReadAndNavigate = (orderId) => {
        if (!readNotifications.includes(orderId)) {
            setReadNotifications((prev) => [...prev, orderId]);
            setNotificationCount((prev) => Math.max(0, prev - 1)); // Decrease count, ensure it doesn't go below 0
        }
        navigate(`/order-tracking/${orderId}`);
    };

    const avatarSrc =
        profile && profile.profile_image
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
            {orders.length > 0 ? (
                orders
                    .filter(
                        (order) =>
                            order.order_status.toLowerCase() === "pending"
                    ) // Only show "Order Placed" (pending status)
                    .slice(0, 3) // Limit to 3 notifications
                    .map((order) => {
                        const product = order.order_details?.[0]?.product || {};
                        return (
                            <Menu.Item
                                key={order.id}
                                onClick={() => markAsReadAndNavigate(order.id)} // Mark as read and navigate
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
                                            Your order ({order.id}) was
                                            submitted. Thanks for Shopping with
                                            Timeless!
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
                                        onError={(e) => {
                                            e.target.src =
                                                "/images/default-product.png";
                                        }}
                                    />
                                </div>
                            </Menu.Item>
                        );
                    })
            ) : (
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
