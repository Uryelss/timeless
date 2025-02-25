import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./USERS/Register";
import Login from "./USERS/Login";
import ProtectedRoute from "./USERS/ProtectRoute";

import AdminDashboard from "./AdminPage/Dashboard";
import AdminSettings from "./AdminPage/AdminSettings";
import ProductManagement from "./AdminPage/ProductManagement";

import Homepage from "./UserPage/Homepage"; // ✅ Import correctly

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/Register" element={<Register />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Homepage" element={<Homepage />} />{" "}
                {/* ✅ Fix: Replace UserPage with Homepage */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin-settings"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminSettings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/product-management"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <ProductManagement />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

if (document.getElementById("root")) {
    ReactDOM.render(<App />, document.getElementById("root"));
}
