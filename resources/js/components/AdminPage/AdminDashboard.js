import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../AdminLayout/Sidebar"; // Re-import Sidebar
import TopProducts from "../Dashboard/TopProducts";
import SaleRevenue from "../Dashboard/SaleRevenue";
import RecentOrders from "../Dashboard/RecentOrders";
import ProductOverview from "../Dashboard/ProductOverview";
import Footer from "../UserHomePage/Footer";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Temporarily disable role check for debugging
    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <Sidebar />

            {/* Dashboard Content */}
            <div className="dashboard-content">
                {/* Stats Buttons Section */}
                <div className="stats-grid">
                    <button className="stat-button">TOTAL ORDERS</button>
                    <button className="stat-button">DELIVERED ORDERS</button>
                    <button className="stat-button">PENDING ORDERS</button>
                    <button className="stat-button">CANCELED ORDERS</button>
                    <button className="stat-button">TOTAL AMOUNT</button>
                    <button className="stat-button">DELIVERED AMOUNT</button>
                    <button className="stat-button">
                        PENDING ORDERS AMOUNT
                    </button>
                    <button className="stat-button">
                        CANCEL ORDERS AMOUNT
                    </button>
                    <button className="stat-button">NEW USER</button>
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                    {/* Sale Revenue Chart */}
                    <div className="chart-card">
                        <h3>Sale Revenue</h3>
                        <SaleRevenue />
                    </div>

                    {/* Top Products */}
                    <div className="products-card">
                        <h3>Top Products</h3>
                        <TopProducts />
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="orders-table">
                    <h3>Recent Orders</h3>
                    <RecentOrders />
                </div>

                {/* Product Overview Table */}
                <div className="products-table">
                    <h3>Product Overview</h3>
                    <ProductOverview />
                </div>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default AdminDashboard;
