import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="sidebar">
            <div className="menu-title">MENU</div>

            <div className="menu-item" onClick={() => navigate("/dashboard")}>
                <i className="fa-solid fa-chart-line"></i> Dashboard
            </div>

            <div
                className="menu-item"
                onClick={() =>
                    (window.location.href =
                        "http://localhost:8000/Admin-product")
                }
            >
                <i className="fa-solid fa-cart-shopping"></i> Product
            </div>

            <div
                className="menu-item"
                onClick={() =>
                    (window.location.href = "http://localhost:8000/Admin-order")
                }
            >
                <i className="fa-solid fa-bag-shopping"></i> Order
            </div>

            <div
                className="menu-item"
                onClick={() =>
                    (window.location.href = "http://localhost:8000/Admin-user")
                }
            >
                <i className="fa-solid fa-user"></i> User
            </div>

            <div className="menu-item" onClick={() => navigate("/customers")}>
                <i className="fa-solid fa-users"></i> Customer
            </div>

            <div className="menu-item" onClick={() => navigate("/inventory")}>
                <i className="fa-solid fa-box-open"></i> Inventory
            </div>

            <div className="tools-title">TOOLS</div>

            <div className="dropdown" onClick={() => setIsOpen(!isOpen)}>
                <span>
                    <i className="fa-solid fa-caret-down"></i> Admin Settings
                </span>
            </div>

            <div className={`submenu ${isOpen ? "open" : ""}`}>
                <div
                    className="submenu-item"
                    onClick={() => navigate("/brand")}
                >
                    Brand
                </div>
                <div
                    className="submenu-item"
                    onClick={() => navigate("/movement")}
                >
                    Movement
                </div>
                <div
                    className="submenu-item"
                    onClick={() => navigate("/strap-material")}
                >
                    Strap Material
                </div>
                <div
                    className="submenu-item"
                    onClick={() => navigate("/gender")}
                >
                    Gender
                </div>
                <div className="submenu-item" onClick={() => navigate("/size")}>
                    Size
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
