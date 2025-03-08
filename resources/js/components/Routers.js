import React from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";

import AdminDashboard from "./AdminPage/AdminDashboard/AdminDashboard";
import ProductManagement from "./AdminPage/Product/ProductManagement";
import OrderManagement from "./AdminPage/Order/OrderManagement";
import UserManagement from "./AdminPage/User/UserManagement";
import InventoryManagement from "./AdminPage/Inventory/InventoryManagement";
import AdminProfile from "./AdminPage/AdminSettings/AdminProfile";
import SubCategory from "./AdminPage/AdminSettings/SubCategory";
import CustomerManagement from "./AdminPage/Customer/CustomerManagement";
import AdminSettings from "./AdminPage/AdminSettings/AdminSettings";

// Auth pages
import Register from "./AccessPage/RegisterPage/Register";
import Login from "./AccessPage/LoginPage/Login";

// User page (for role 'user')
import UserHome from "./UserPage/UserHome/HomePage";

// Protected route for Admin users
const AdminRoute = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || !user || user.role?.name !== "admin") {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

// Protected route for Regular users
const UserRoute = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || !user || user.role?.name !== "user") {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

export default function Routers() {
    return (
        <Router>
            <Routes>
                {/* Authentication Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Admin Protected Routes */}
                <Route element={<AdminRoute />}>
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route path="/products" element={<ProductManagement />} />
                    <Route path="/orders" element={<OrderManagement />} />
                    <Route path="/customers" element={<CustomerManagement />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route
                        path="/inventory"
                        element={<InventoryManagement />}
                    />
                    <Route path="/admin-profile" element={<AdminProfile />} />
                    <Route path="/sub-category" element={<SubCategory />} />
                </Route>

                {/* User Protected Routes */}
                <Route element={<UserRoute />}>
                    <Route path="/user-home" element={<UserHome />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

const rootElement = document.getElementById("root");
if (rootElement) {
    ReactDOM.render(<Routers />, rootElement);
}
