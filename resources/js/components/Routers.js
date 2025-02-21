import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./LoginPage/Login";
import Register from "./RegisterPage/Register";

//ADMIN PAGE
import AdminDashboard from "./AdminPage/AdminDashboard";
import Products from "./AdminPage/Products";
import User from "./AdminPage/User";
import Order from "./AdminPage/Order";

//sample for checkout
import Checkout from "./checkout";

//homepage
import Home from "./UserHomePage/HomePage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/Admin-dashboard" element={<AdminDashboard />} />
                <Route path="/Admin-products" element={<Products />} />
                <Route path="/Admin-user" element={<User />} />
                <Route path="/Admin-order" element={<Order />} />
                <Route path="/sample" element={<Checkout />} />
                <Route path="/homepage" element={<Home />} />
            </Routes>
        </Router>
    );
};

if (document.getElementById("root")) {
    ReactDOM.render(<App />, document.getElementById("root"));
}
