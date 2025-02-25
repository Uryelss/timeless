import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./USERS/Register";
import Login from "./USERS/Login";
import ProtectedRoute from "./USERS/ProtectRoute"; // Correct import for ProtectedRoute

import AdminDashboard from "./AdminPage/Dashboard";
import AdminSettings from "./AdminPAge/AdminSettings";

import UserPage from "./UserPage/Homepage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/Register" element={<Register />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Homepage" element={<UserPage />} />

                {/* Protect Admin Dashboard */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Protect Admin Settings */}
                <Route
                    path="/admin-settings"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminSettings />
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
