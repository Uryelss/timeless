import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();

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

            <div className="menu-item" onClick={() => navigate("/customers")}>
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

            <div
                className="menu-item"
                onClick={() => navigate("/admin-settings")}
            >
                <i className="fa-solid fa-gears"></i>
                <span>Admin Settings</span>
            </div>
        </div>
    );
};

export default Sidebar;
