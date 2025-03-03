import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = () => {
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // ✅ Dropdown toggle state

    const handleLogout = () => {
        axios
            .post(
                "http://localhost:8000/api/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/login");
            })
            .catch((error) => {
                console.error("Logout failed:", error);
                alert("Failed to logout.");
            });
    };

    return (
        <div className="sidebar">
            <div className="menu-title">MENU</div>

            <div
                className="menu-item"
                onClick={() => navigate("/Admin-dashboard")}
            >
                <i className="fa-solid fa-chart-line"></i>
                <span>Dashboard</span>
            </div>

            <div
                className="menu-item"
                onClick={() => navigate("/Admin-product")}
            >
                <i className="fa-solid fa-cart-shopping"></i>
                <span>Product</span>
            </div>

            <div className="menu-item" onClick={() => navigate("/Admin-order")}>
                <i className="fa-solid fa-bag-shopping"></i>
                <span>Order</span>
            </div>

            <div className="menu-item" onClick={() => navigate("/admin-user")}>
                <i className="fa-solid fa-user"></i>
                <span>User</span>
            </div>

            <div
                className="menu-item"
                onClick={() => navigate("/admin-customer")}
            >
                <i className="fa-solid fa-users"></i>
                <span>Customer</span>
            </div>

            <div
                className="menu-item"
                onClick={() => navigate("/admin-inventory")}
            >
                <i className="fa-solid fa-box-open"></i>
                <span>Inventory</span>
            </div>

            <div className="tools-title">TOOLS</div>

            {/* ✅ Admin Settings with Dropdown */}
            <div
                className="menu-item"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
                <i className="fa-solid fa-gears"></i>
                <span>Admin Settings</span>
                <i
                    className={`fa-solid ${
                        isSettingsOpen ? "fa-chevron-up" : "fa-chevron-down"
                    }`}
                    style={{ marginLeft: "auto" }}
                ></i>
            </div>

            {isSettingsOpen && (
                <div className="submenu">
                    <div
                        className="submenu-item"
                        onClick={() => navigate("/admin-settings")}
                    >
                        <i className="fa-solid fa-cog"></i>
                        <span>Sub Category</span>
                    </div>
                    <div
                        className="submenu-item"
                        onClick={() => navigate("/admin-profile")}
                    >
                        <i className="fa-solid fa-user-circle"></i>
                        <span>Profile</span>
                    </div>
                </div>
            )}

            {/* ✅ Logout Button */}
            <div className="menu-item logout-btn" onClick={handleLogout}>
                <i className="fa-solid fa-sign-out-alt"></i>
                <span>Logout</span>
            </div>
        </div>
    );
};

export default Sidebar;
