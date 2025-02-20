import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("/api/orders");
            console.log("API Response:", response.data); // Debugging log
            if (Array.isArray(response.data)) {
                const formattedOrders = response.data.map((order) => ({
                    ...order,
                    items: JSON.parse(order.items || "[]"),
                    customer_details: JSON.parse(
                        order.customer_details || "{}"
                    ),
                    payment_information: JSON.parse(
                        order.payment_information || "{}"
                    ),
                }));
                console.log("Formatted Orders:", formattedOrders); // Debugging log
                setOrders(formattedOrders);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        }
    };

    const handleView = async (id) => {
        try {
            const response = await axios.get(`/api/orders/${id}`);
            console.log("Selected Order Response:", response.data); // Debugging log
            if (response.data) {
                setSelectedOrder({
                    ...response.data,
                    items: JSON.parse(response.data.items || "[]"),
                    customer_details: JSON.parse(
                        response.data.customer_details || "{}"
                    ),
                    payment_information: JSON.parse(
                        response.data.payment_information || "{}"
                    ),
                });
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
        }
    };

    return (
        <div className="order-page">
            <h2>Orders</h2>
            {orders.length > 0 ? (
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Date Added</th>
                            <th>Last Updated</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>
                                    ₱{parseFloat(order.total_amount).toFixed(2)}
                                </td>
                                <td>{order.status}</td>
                                <td>
                                    {order.date_added
                                        ? new Date(
                                              order.date_added.replace(" ", "T")
                                          ).toLocaleString()
                                        : "N/A"}
                                </td>
                                <td>
                                    {order.last_updated
                                        ? new Date(
                                              order.last_updated.replace(
                                                  " ",
                                                  "T"
                                              )
                                          ).toLocaleString()
                                        : "N/A"}
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleView(order.id)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No orders found.</p>
            )}

            {selectedOrder && (
                <div className="order-details">
                    <h3>Order Details</h3>
                    <p>
                        <strong>ID:</strong> {selectedOrder.id}
                    </p>
                    <p>
                        <strong>Total Amount:</strong> ₱
                        {parseFloat(selectedOrder.total_amount).toFixed(2)}
                    </p>
                    <p>
                        <strong>Status:</strong> {selectedOrder.status}
                    </p>
                    <h4>Customer Details</h4>
                    <pre>
                        {JSON.stringify(
                            selectedOrder.customer_details,
                            null,
                            2
                        )}
                    </pre>
                    <h4>Payment Information</h4>
                    <pre>
                        {JSON.stringify(
                            selectedOrder.payment_information,
                            null,
                            2
                        )}
                    </pre>
                    <h4>Items</h4>
                    <ul>
                        {selectedOrder.items.map((item, index) => (
                            <li key={index}>
                                {item.name} - {item.quantity}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setSelectedOrder(null)}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderPage;
