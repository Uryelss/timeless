import React from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Register from "./USERS/Register";
import Login from "./USERS/Login";
import PrivateRoute from "./USERS/PrivateRoute";

import AdminDashboard from "./AdminPage/Dashboard";
import AdminSettings from "./AdminPage/AdminSettings";
import ProductManagement from "./AdminPage/ProductManagement";
import InventoryManagement from "./AdminPage/InventoryManagement";
import AdminUserManagement from "./AdminPage/UserManagement";
import AdminCustomerManagement from "./AdminPage/CustomerManagement";

import Homepage from "./UserPage/Homepage";
import CollectionPage from "./UserPage/Collection";
import UserProfile from "./UserPage/UserProfile"; // ✅ Import UserProfile
import ProductOverview from "./UserPage/ProductOverview";

const App = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    return (
        <Router>
            <Routes>
                {/* Public Routes */}

                <Route
                    path="/register"
                    element={
                        !token ? (
                            <Register />
                        ) : (
                            <Navigate
                                to={
                                    role === "admin"
                                        ? "/admin-dashboard"
                                        : "/Homepage"
                                }
                            />
                        )
                    }
                />
                <Route
                    path="/login"
                    element={
                        !token ? (
                            <Login />
                        ) : (
                            <Navigate
                                to={
                                    role === "admin"
                                        ? "/admin-dashboard"
                                        : "/login"
                                }
                            />
                        )
                    }
                />

                {/* Private Routes - Only Logged-in Users */}
                <Route
                    path="/Homepage"
                    element={
                        <PrivateRoute allowedRoles={["user", "admin"]}>
                            <Homepage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/Collection"
                    element={
                        <PrivateRoute allowedRoles={["user", "admin"]}>
                            <CollectionPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/product/:id"
                    element={
                        <PrivateRoute allowedRoles={["user", "admin"]}>
                            <ProductOverview />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/Profile"
                    element={
                        <PrivateRoute allowedRoles={["user"]}>
                            <UserProfile /> {/* ✅ User Profile Page */}
                        </PrivateRoute>
                    }
                />

                {/* Admin Routes - Only Admins */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <PrivateRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin-settings"
                    element={
                        <PrivateRoute allowedRoles={["admin"]}>
                            <AdminSettings />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/Admin-product"
                    element={
                        <PrivateRoute allowedRoles={["admin"]}>
                            <ProductManagement />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin-inventory"
                    element={
                        <PrivateRoute allowedRoles={["admin"]}>
                            <InventoryManagement />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin-user"
                    element={
                        <PrivateRoute allowedRoles={["admin"]}>
                            <AdminUserManagement />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin-customer"
                    element={
                        <PrivateRoute allowedRoles={["admin"]}>
                            <AdminCustomerManagement />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

if (document.getElementById("root")) {
    ReactDOM.render(<App />, document.getElementById("root"));
}
