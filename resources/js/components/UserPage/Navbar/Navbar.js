import axios from "axios";
import React, { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Badge, Avatar, Button, notification } from "antd";
import { ShoppingCartOutlined, BellOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header: AntHeader } = Layout;

const Header = () => {
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:8000/api/profile", { headers: { Authorization: `Bearer ${token}` } })
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
    return () => window.removeEventListener("profileUpdated", handleProfileUpdated);
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
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/my-purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orderData = response.data.data || response.data;
      const allOrders = Array.isArray(orderData) ? orderData : [];
      setOrders(allOrders);
      const activeOrders = allOrders.filter((order) => order.order_status.toLowerCase() !== "completed");
      setNotificationCount(activeOrders.length);
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data || err.message);
      setOrders([]);
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    const handleOrderPlaced = (e) => {
      const order = e.detail;
      const productName = order?.order_details?.[0]?.product?.product_name || "Unknown Product";
      notification.success({
        message: "Order Placed",
        description: `You've ordered ${productName}`,
        placement: "topRight",
        duration: 3,
      });
      fetchOrders();
    };

    const handleOrderStatusUpdate = (e) => {
      const order = e.detail;
      const productName = order?.order_details?.[0]?.product?.product_name || "Unknown Product";
      if (order.order_status.toLowerCase() === "shipped") {
        notification.info({
          message: "Order Shipped",
          description: `Admin has shipped your product: ${productName}`,
          placement: "topRight",
          duration: 3,
        });
      }
      fetchOrders();
    };

    window.addEventListener("orderPlaced", handleOrderPlaced);
    window.addEventListener("orderStatusUpdated", handleOrderStatusUpdate);
    return () => {
      window.removeEventListener("orderPlaced", handleOrderPlaced);
      window.removeEventListener("orderStatusUpdated", handleOrderStatusUpdate);
    };
  }, []);

  const avatarSrc = profile?.profile_image ? `${profile.profile_image}?${new Date().getTime()}` : "/images/default-avatar.png";
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
        orders.slice(0, 3).map((order) => {
          const product = order.order_details?.[0]?.product || {};
          return (
            <Menu.Item
              key={order.id}
              onClick={() => navigate(`/order-tracking/${order.id}`)}
              style={{ height: "auto", padding: "10px", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={product.main_image ? `http://localhost:8000/storage/${product.main_image}` : "/images/default-product.png"}
                  alt={product.product_name || "Product"}
                  style={{ width: 50, height: 50, objectFit: "cover", marginRight: 10, borderRadius: 4 }}
                  onError={(e) => (e.target.src = "/images/default-product.png")}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold" }}>{product.product_name || "Unnamed Product"}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {order.order_status} - {new Date(order.order_date).toLocaleString()}
                  </div>
                </div>
              </div>
            </Menu.Item>
          );
        })
      ) : (
        <Menu.Item key="no-notif">No new notifications</Menu.Item>
      )}
      <Menu.Item key="view-all" style={{ textAlign: "center" }} onClick={() => navigate("/user-purchase")}>
        View All Orders
      </Menu.Item>
    </Menu>
  );

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8000/api/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error("API logout error:", err);
    }
    localStorage.removeItem("token");
    window.location.replace("/login");
  };

  const handleProfileClick = () => navigate("/user-profile");

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuVisible(false);
  };

  const userMenu = (
    <Menu className="white-dropdown">
      <Menu.Item key="profile" onClick={handleProfileClick}>Profile</Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>Logout</Menu.Item>
    </Menu>
  );

  const toggleMobileMenu = () => setIsMobileMenuVisible(!isMobileMenuVisible);

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
        <Menu.Item key="home" path="/user-home">Home</Menu.Item>
        <Menu.Item key="about" path="/aboutus">About Us</Menu.Item>
        <Menu.Item key="collection" path="/user-collection">Collection</Menu.Item>
        <Dropdown overlay={categoriesMenu} placement="bottomLeft">
          <Menu.Item key="categories">Categories</Menu.Item>
        </Dropdown>
      </Menu>
      <div className="header-icons">
        <Dropdown overlay={notificationsMenu} trigger={["click"]}>
          <Badge count={notificationCount} className="icon-badge">
            <BellOutlined style={{ fontSize: "24px", cursor: "pointer" }} className="icon" />
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
            <Avatar key={avatarKey} src={avatarSrc} size={40} shape="circle" icon={!avatarSrc && <UserOutlined />} />
            <span className="username">{username}</span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;