import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
    const userRole = localStorage.getItem("role"); // Get role from localStorage
    const token = localStorage.getItem("token"); // Get token from localStorage

    console.log("User Role:", userRole); // Debugging output
    console.log("Token:", token); // Debugging output

    if (!token) {
        console.warn("No token found. Redirecting to login.");
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        console.warn(
            `Unauthorized role (${userRole}). Redirecting to homepage.`
        );
        return <Navigate to="/Homepage" />;
    }

    return children;
};

export default PrivateRoute;
