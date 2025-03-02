import React from "react";

const RecentOrders = () => {
    const orders = [
        {
            id: 1,
            customerName: "John Doe",
            totalAmount: 2000,
            paymentMethod: "Credit Card",
            orderStatus: "Pending",
            dateOrdered: "03/01/2025",
        },
    ];

    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr style={{ backgroundColor: "#2ecc71", color: "#fff" }}>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Product ID
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Customer Name
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Total Amount
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Payment Method
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Order Status
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Date Ordered
                    </th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => (
                    <tr key={order.id}>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {order.id}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {order.customerName}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            ${order.totalAmount}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {order.paymentMethod}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {order.orderStatus}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {order.dateOrdered}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default RecentOrders;
