import React from "react";
import { Button } from "antd";

const UserHome = () => {
    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <div className="user-home">
            <h1>Welcome, User!</h1>
            <p>
                This is your homepage. Regular users cannot access the admin
                dashboard.
            </p>
            <Button type="primary" onClick={logout}>
                Logout
            </Button>
        </div>
    );
};

export default UserHome;
