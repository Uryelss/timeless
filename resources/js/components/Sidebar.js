import React, { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
    const [showBrand, setShowBrand] = useState(false);

    return (
        <div className="sidebar">
            <h3 className="menu-title">Menu</h3>
            <ul className="sidebar-menu">
                <li>
                    <Link to="/dashboard">
                        <i className="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/products">
                        <i className="fas fa-shopping-cart"></i>
                        <span>Product</span>
                    </Link>
                </li>
                <li>
                    <Link to="/orders">
                        <i className="fas fa-shopping-bag"></i>
                        <span>Order</span>
                    </Link>
                </li>
                <li>
                    <Link to="/customers">
                        <i className="fas fa-users"></i>
                        <span>Customer</span>
                    </Link>
                </li>
                <li>
                    <Link to="/users">
                        <i className="fas fa-user"></i>
                        <span>User</span>
                    </Link>
                </li>
                <li>
                    <Link to="/inventory">
                        <i className="fas fa-box"></i>
                        <span>Inventory</span>
                    </Link>
                </li>
            </ul>

            <div className="sidebar-tools">
                <h3 className="tools-title">Tools</h3>
                <div
                    className="dropdown"
                    onClick={() => setShowBrand(!showBrand)}
                >
                    <div className="dropdown-header">
                        <i className="fas fa-cog"></i>
                        <span>Admin Settings</span>
                        <i class="fa-solid fa-caret-down"></i>
                    </div>
                    {showBrand && <div className="brand-name">BRAND</div>}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
