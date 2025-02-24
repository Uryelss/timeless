import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./LoginPage/Login";
import Register from "./RegisterPage/Register";

//ADMIN PAGE
import AdminDashboard from "./AdminPage/AdminDashboard";
import User from "./AdminPage/User";
import Order from "./AdminPage/Order";
import Products from "./AdminPage/Product";

//sample for checkout
import Checkout from "./checkout";

//homepage
import Home from "./UserHomePage/HomePage";
import Collection from "./UserHomePage/Collection";
import LoginLayout from "./LoginPage/LoginLayout";


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/collection" element={<Collection />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/Admin-dashboard" element={<AdminDashboard />} />
                <Route path="/Admin-user" element={<User />} />
                <Route path="/Admin-order" element={<Order />} />
                <Route path="/sample" element={<Checkout />} />
                <Route path="/Admin-product" element={<Products />} />
                <Route path="/loginsample" element={<LoginLayout />} />
            </Routes>
        </Router>
    );
};

if (document.getElementById("root")) {
    ReactDOM.render(<App />, document.getElementById("root"));
}
