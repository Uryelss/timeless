import React from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";

// Admin pages
import AdminDashboard from "./AdminPage/AdminDashboard/AdminDashboard";
import ProductManagement from "./AdminPage/Product/ProductManagement";
import OrderManagement from "./AdminPage/Order/OrderManagement";
import UserManagement from "./AdminPage/User/UserManagement";
import InventoryManagement from "./AdminPage/Inventory/InventoryManagement";
import AdminProfile from "./AdminPage/AdminSettings/AdminProfile";
import SubCategory from "./AdminPage/AdminSettings/SubCategory";
import CustomerManagement from "./AdminPage/Customer/CustomerManagement";

// Auth pages
import Register from "./AccessPage/RegisterPage/Register";
import Login from "./AccessPage/LoginPage/Login";

// User pages
import UserHome from "./UserPage/UserHome/HomePage";
import Collection from "./UserPage/CollectionPage/Collection";
import UserProfile from "./UserPage/ProfilePage/Profile";
import ProductOverview from "./UserPage/ProductOverview/Productview";

// Import helper functions from auth.js
import { isAuthenticated, hasRole } from "./AccessPage/Auth";
import AboutUs from "./UserPage/AboutUsPage/Aboutus";

// Unified PrivateRoute Component
const PrivateRoute = ({ allowedRoles }) => {
    // Redirect to login if the user is not authenticated
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    // Redirect if the user's role is not allowed
    if (!hasRole(allowedRoles)) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

function Routers() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Admin Protected Routes */}
                <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
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
                <Route element={<PrivateRoute allowedRoles={["user"]} />}>
                    <Route path="/user-home" element={<UserHome />} />
                    <Route path="/user-collection" element={<Collection />} />
                    <Route path="/user-profile" element={<UserProfile />} />
                    <Route path="/product/:id" element={<ProductOverview />} />
                    <Route path="/AboutUs" element={<AboutUs />} />
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
