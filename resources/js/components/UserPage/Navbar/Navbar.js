import axios from "axios";
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

const { Header: AntHeader } = Layout;

const Header = () => {
    const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
    const [profile, setProfile] = useState(null);
    const [avatarKey, setAvatarKey] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [orders, setOrders] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
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
            const response = await axios.get("http://localhost:8000/api/my-purchases", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Fetched orders from my-purchases:", response.data);
            const orderData = response.data.data || response.data; // Handle paginated or non-paginated response
            setOrders(Array.isArray(orderData) ? orderData : []);
            setNotificationCount(Array.isArray(orderData) ? orderData.length : 0); // Update notification count
        } catch (err) {
            console.error("Error fetching orders:", err.response?.data || err.message);
            setOrders([]);
            setNotificationCount(0);
        }
    };

    // Listen for order placement events and update notification count
    useEffect(() => {
        const handleOrderPlaced = () => {
            console.log("Order placed event triggered");
            fetchOrders(); // Refetch orders when a new order is placed
        };

        window.addEventListener("orderPlaced", handleOrderPlaced);
        return () => {
            window.removeEventListener("orderPlaced", handleOrderPlaced);
        };
    }, []);

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

    // Notification dropdown menu with clickable order IDs
    const notificationsMenu = (
        <Menu className="white-dropdown" style={{ width: 350 }}>
            {orders.length > 0 ? (
                orders.slice(0, 3).map((order) => {
                    const product = order.order_details?.[0]?.product || {}; // Adjusted to order_details
                    console.log("Rendering order:", order);
                    return (
                        <Menu.Item
                            key={order.id}
                            onClick={() => navigate(`/order-tracking/${order.id}`)} // Navigate to OrderTracking
                            style={{ height: "auto", padding: "10px", cursor: "pointer" }}
                        >
                            <div style={{ display: "flex", alignItems: "center" }}>
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
                                        marginRight: 10,
                                        borderRadius: 4,
                                    }}
                                    onError={(e) => {
                                        e.target.src = "/images/default-product.png";
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "bold" }}>
                                        Order #{order.id} - {product.product_name || "Unnamed Product"}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#555" }}>
                                        {product.description || "No description available"}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#888" }}>
                                        {order.order_status} -{" "}
                                        {new Date(order.order_date).toLocaleString()}
                                    </div>
                                </div>
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
                onClick={() => navigate("/user-purchase")} // Navigate to MyPurchase page
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
        navigate("/user-profile"); // Fixed capitalization to match your routes
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