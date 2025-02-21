import React, { useState, useEffect } from "react";
import axios from "axios";

const OrderPage = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("/api/orders");
            console.log("Fetched Orders:", response.data); // Debugging Log
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const handleUpdate = async (id, status) => {
        await axios.put(`/api/orders/${id}`, { order_status: status });
        fetchOrders();
    };

    return (
        <div>
            <h2>Order Management</h2>
            <table>
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Items</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.customer_name}</td>
                            <td>{order.items.map((i) => i.item).join(", ")}</td>
                            <td>{order.priority}</td>
                            <td>{order.order_status}</td>
                            <td>${order.total_amount}</td>
                            <td>
                                <button
                                    onClick={() =>
                                        handleUpdate(order.id, "Confirmed")
                                    }
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() =>
                                        handleUpdate(order.id, "Processing")
                                    }
                                >
                                    Process
                                </button>
                                <button
                                    onClick={() =>
                                        handleUpdate(order.id, "Completed")
                                    }
                                >
                                    Complete
                                </button>
                                <button
                                    onClick={() =>
                                        axios
                                            .delete(`/api/orders/${order.id}`)
                                            .then(fetchOrders)
                                    }
                                >
                                    Archive
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderPage;
