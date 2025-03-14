import React, { useState } from "react";
import { Table, Space, Button, message } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const OrderManagement = () => {
    // Static order data
    const [orders, setOrders] = useState([
        {
            key: "1",
            orderId: "ORD1001",
            customerName: "John Doe",
            items: "3 items",
            priority: "Expedited",
            orderStatus: "Completed",
            totalAmount: 150.0,
            orderDate: "2023-03-01",
        },
        {
            key: "2",
            orderId: "ORD1002",
            customerName: "Jane Smith",
            items: "2 items",
            priority: "Standard Shipping",
            orderStatus: "Pending",
            totalAmount: 90.0,
            orderDate: "2023-03-02",
        },
        {
            key: "3",
            orderId: "ORD1003",
            customerName: "Bob Johnson",
            items: "1 item",
            priority: "Standard Shipping",
            orderStatus: "Processing",
            totalAmount: 45.0,
            orderDate: "2023-03-03",
        },
    ]);

    const navigate = useNavigate();

    const columns = [
        {
            title: "Action",
            key: "action",
            render: (text, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() =>
                            message.info(`Edit order ${record.orderId}`)
                        }
                    />
                    <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() =>
                            message.info(`Archive order ${record.orderId}`)
                        }
                    />
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() =>
                            navigate(`/admin/order-details/${record.orderId}`)
                        }
                    />
                </Space>
            ),
        },
        {
            title: "Order ID",
            dataIndex: "orderId",
            key: "orderId",
        },
        {
            title: "Customer Name",
            dataIndex: "customerName",
            key: "customerName",
        },
        {
            title: "Items",
            dataIndex: "items",
            key: "items",
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
        },
        {
            title: "Order Status",
            dataIndex: "orderStatus",
            key: "orderStatus",
        },
        {
            title: "Total Amount",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (amount) => `$${amount.toFixed(2)}`,
        },
        {
            title: "Order Date",
            dataIndex: "orderDate",
            key: "orderDate",
        },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <h2>Order Management</h2>
            <Table columns={columns} dataSource={orders} />
        </div>
    );
};

export default OrderManagement;
