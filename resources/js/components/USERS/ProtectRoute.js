import React from "react";
import { Navigate } from "react-router-dom";

// Protected route guard component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const userRole = localStorage.getItem("role"); // Get role from localStorage
    const token = localStorage.getItem("token"); // Get token from localStorage

    if (!token) {
        // If there's no token, redirect to login
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(userRole)) {
        // If the user doesn't have the required role, redirect to Homepage
        return <Navigate to="/Homepage" />;
    }

    // If authenticated and role is valid, render children (protected content)
    return children;
};

export default ProtectedRoute;
