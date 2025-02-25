import React from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Routes,
    Route, // Use Route directly here from React Router
} from "react-router-dom";

import Register from "./USERS/Register";
import Login from "./USERS/Login";
import ProtectedRoute from "./USERS/ProtectRoute"; // Correct import for ProtectedRoute

import AdminDashboard from "./AdminPage/Dashboard";
import UserPage from "./UserPage/Homepage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/Register" element={<Register />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Homepage" element={<UserPage />} />

                {/* Use ProtectedRoute for the admin-dashboard */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
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
