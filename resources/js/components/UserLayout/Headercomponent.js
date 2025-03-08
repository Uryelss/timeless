import React from "react";
import { Link } from "react-router-dom";
import { Layout, Menu, Input, Badge, Avatar, Dropdown } from "antd";
import { BellOutlined, ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Search } = Input;

const HeaderComponent = () => {
  // Dropdown Menu for Avatar
  const avatarMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <Link to="/logout">Logout</Link>
      </Menu.Item>
    </Menu>
  );

  // Navigation Menu Items
  const navItems = [
    { key: "1", label: <Link to="/Homepage">Home</Link> },
    { key: "2", label: <Link to="/aboutus">About</Link> },
    { key: "3", label: <Link to="/collection">Collections</Link> },
    { key: "4", label: <Link to="/categories">Categories</Link> },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        background: "white",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Logo Image */}
      <img
        src="/images/logo.png"
        alt="Logo"
        style={{ height: "40px", marginRight: "24px" }}
      />
      <Menu
        theme="light"
        mode="horizontal"
        defaultSelectedKeys={["2"]}
        items={navItems}
        style={{ flex: 1, minWidth: 0 }}
      />
      {/* Search Bar */}
      <Search
        placeholder="Search products..."
        onSearch={(value) => console.log(value)} // Replace with your search handler
        enterButton
        style={{ width: "300px", marginRight: "24px" }}
      />
      {/* Notification Icon */}
      <Badge count={""} style={{ marginRight: "24px" }}>
        <BellOutlined style={{ color: "black", fontSize: "20px" }} />
      </Badge>
      {/* Cart Icon */}
      <Badge count={""} style={{ marginRight: "24px" }}>
        <ShoppingCartOutlined style={{ color: "black", fontSize: "20px" }} />
      </Badge>
      {/* Avatar Icon with Dropdown */}
      <Dropdown overlay={avatarMenu} trigger={["click"]}>
        <Avatar
          icon={<UserOutlined />}
          style={{ backgroundColor: "#87d068", cursor: "pointer" }}
        />
      </Dropdown>
    </Header>
  );
};

export default HeaderComponent;