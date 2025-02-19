import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link } from "react-router-dom";

<Link to="/admin/products">Products</Link>;

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="main-content">
                <Navbar />
                <div className="content">{children}</div>
                <Footer />
            </div>
        </div>
    );
};

export default AdminLayout;
