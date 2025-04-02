import React from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import AppLayout from "./AppLayout"; // Import the layout component
import { getUserRole, isAuthenticated } from "./AccessPage/Auth";

// Admin pages
import AdminDashboard from "./AdminPage/AdminDashboard/AdminDashboard";
import ProductManagement from "./AdminPage/Product/ProductManagement";
import OrderManagement from "./AdminPage/Order/OrderManagement";
import UserManagement from "./AdminPage/User/UserManagement";
import InventoryManagement from "./AdminPage/Inventory/InventoryManagement";
import AdminProfile from "./AdminPage/AdminSettings/AdminProfile";
import SubCategory from "./AdminPage/AdminSettings/SubCategory";
import CustomerManagement from "./AdminPage/Customer/CustomerManagement";
import TransactionManagement from "./AdminPage/Transaction/Transaction";
// Auth pages
import Register from "./AccessPage/RegisterPage/Register";
import Login from "./AccessPage/LoginPage/Login";
// User pages
import UserHome from "./UserPage/UserHome/HomePage";
import Collection from "./UserPage/CollectionPage/Collection";
import CategoryCollection from "./UserPage/CollectionPage/CategoryCollection";
import UserProfile from "./UserPage/ProfilePage/Profile";
import ProductOverview from "./UserPage/ProductOverview/Productview";
import AboutUs from "./UserPage/AboutUsPage/Aboutus";
import CartPage from "./UserPage/CartPage/Cart";
import OrderCheckout from "./UserPage/Checkout/Checkout";
import OrderTracking from "./UserPage/OrderTrack/OrderTracking";
import MyPurchase from "./UserPage/ProfilePage/MyPurchase/MyPurchase";
import MyAddress from "./UserPage/ProfilePage/Address/MyAddress";
// Single route protection component
import PrivateRoute from "./PrivateRoute";
import ReviewsManagement from "./AdminPage/AdminReview/Reviews";

function Routers() {
    return (
        <Router>
            <AppLayout>
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/login"
                        element={
                            isAuthenticated() ? (
                                <Navigate
                                    to={
                                        getUserRole() === "admin"
                                            ? "/dashboard"
                                            : "/user-home"
                                    }
                                    replace
                                />
                            ) : (
                                <Login />
                            )
                        }
                    />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/logout"
                        element={<PrivateRoute isLogout={true} />}
                    />

                    {/* Admin Protected Routes */}
                    <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                        <Route path="/dashboard" element={<AdminDashboard />} />
                        <Route
                            path="/products"
                            element={<ProductManagement />}
                        />
                        <Route path="/orders" element={<OrderManagement />} />
                        <Route
                            path="/customers"
                            element={<CustomerManagement />}
                        />
                        <Route path="/users" element={<UserManagement />} />
                        <Route
                            path="/Reviews"
                            element={<ReviewsManagement />}
                        />
                        <Route
                            path="/Transactions"
                            element={<TransactionManagement />}
                        />
                        <Route
                            path="/inventory"
                            element={<InventoryManagement />}
                        />
                        <Route
                            path="/admin-profile"
                            element={<AdminProfile />}
                        />
                        <Route path="/sub-category" element={<SubCategory />} />
                    </Route>

                    {/* User Protected Routes */}
                    <Route element={<PrivateRoute allowedRoles={["user"]} />}>
                        <Route path="/user-home" element={<UserHome />} />
                        <Route
                            path="/user-collection"
                            element={<Collection />}
                        />
                        <Route
                            path="/user-category/:category"
                            element={<CategoryCollection />}
                        />
                        <Route path="/user-profile" element={<UserProfile />} />
                        <Route
                            path="/product/:id"
                            element={<ProductOverview />}
                        />
                        <Route path="/AboutUs" element={<AboutUs />} />
                        <Route path="/user-cart" element={<CartPage />} />
                        <Route
                            path="/user-checkout"
                            element={<OrderCheckout />}
                        />
                        <Route path="/user-Address" element={<MyAddress />} />
                        <Route
                            path="/order-tracking/:orderId"
                            element={<OrderTracking />}
                        />
                        <Route path="/user-purchase" element={<MyPurchase />} />
                    </Route>

                    {/* Catch-all redirect */}
                    <Route
                        path="*"
                        element={<PrivateRoute allowedRoles={[]} />}
                    />
                </Routes>
            </AppLayout>
        </Router>
    );
}

const rootElement = document.getElementById("root");
if (rootElement) {
    ReactDOM.render(<Routers />, rootElement);
}

export default Routers;
