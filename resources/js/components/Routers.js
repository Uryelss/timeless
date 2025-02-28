import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./USERS/Register";
import Login from "./USERS/Login";
import PrivateRoute from "./USERS/PrivateRoute";

import AdminDashboard from "./AdminPage/Dashboard";
import AdminSettings from "./AdminPage/AdminSettings";
import ProductManagement from "./AdminPage/ProductManagement";
import InventoryManagement from "./AdminPage/InventoryManagement";

import Homepage from "./UserPage/Homepage";

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/Register" element={<Register />} />
                <Route path="/Login" element={<Login />} />

                {/* Private Routes - Only Logged-in Users */}
                <Route
                    path="/Homepage"
                    element={
                        <PrivateRoute allowedRoles={["user", "admin"]}>
                            <Homepage />
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
            </Routes>
        </Router>
    );
};

if (document.getElementById("root")) {
    ReactDOM.render(<App />, document.getElementById("root"));
}
