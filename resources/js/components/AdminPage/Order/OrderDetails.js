import React from "react";
import { Row, Col, Card, Table, Typography, Divider, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const OrderDetails = () => {
    // Static order data
    const orderId = "ORD1001";
    const orderItems = [
        {
            key: "1",
            productImage: "https://via.placeholder.com/80",
            productName: "Luxury Watch",
            quantity: 1,
            size: "42mm",
            price: 250.0,
            total: 250.0,
        },
        {
            key: "2",
            productImage: "https://via.placeholder.com/80",
            productName: "Casio Watch",
            quantity: 2,
            size: "38mm",
            price: 50.0,
            total: 100.0,
        },
    ];

    // Summary calculations
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const deliveryCharge = 15.0;
    const estimatedTax = subtotal * 0.055;
    const totalAmount = subtotal + deliveryCharge + estimatedTax;

    // Table columns for order summary
    const columns = [
        {
            title: "Product Image",
            dataIndex: "productImage",
            key: "productImage",
            render: (image) => (
                <img src={image} alt="product" style={{ width: 80 }} />
            ),
        },
        {
            title: "Product Name",
            dataIndex: "productName",
            key: "productName",
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Size",
            dataIndex: "size",
            key: "size",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `$${price.toFixed(2)}`,
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total",
            render: (total) => `$${total.toFixed(2)}`,
        },
    ];

    return (
        <div style={{ padding: "20px" }}>
            {/* Order ID at the top */}
            <Card style={{ marginBottom: "20px" }}>
                <Title level={4}>Order ID: {orderId}</Title>
            </Card>

            {/* Order Summary */}
            <Card title="Order Summary" style={{ marginBottom: "20px" }}>
                <Table
                    columns={columns}
                    dataSource={orderItems}
                    pagination={false}
                    footer={() => (
                        <div
                            style={{ textAlign: "right", marginRight: "20px" }}
                        >
                            <Text strong>Subtotal:</Text> ${subtotal.toFixed(2)}{" "}
                            <br />
                            <Text strong>Delivery Charge/Fee:</Text> $
                            {deliveryCharge.toFixed(2)} <br />
                            <Text strong>Estimated Tax (5.5%):</Text> $
                            {estimatedTax.toFixed(2)} <br />
                            <Divider />
                            <Title level={4}>
                                Total Amount: ${totalAmount.toFixed(2)}
                            </Title>
                        </div>
                    )}
                />
            </Card>

            {/* Customer Details */}
            <Row gutter={16} style={{ marginBottom: "20px" }}>
                <Col xs={24} md={12}>
                    <Card title="Customer Details">
                        <p>
                            <Text strong>Username:</Text> John Doe
                        </p>
                        <p>
                            <Text strong>Email:</Text> john@example.com
                        </p>
                        <p>
                            <Text strong>Phone Number:</Text> 123-456-7890
                        </p>
                        <p>
                            <Text strong>Address:</Text> 123 Main Street, City,
                            Country
                        </p>
                    </Card>
                </Col>

                {/* Payment Information */}
                <Col xs={24} md={12}>
                    <Card title="Payment Information">
                        <p>
                            <Text strong>Payment Method:</Text> Master Card
                        </p>
                        <p>
                            <Text strong>Card Number:</Text> **** **** **** 1234
                        </p>
                    </Card>
                </Col>
            </Row>

            {/* Track Order */}
            <Card>
                <Button type="primary">Track Order</Button>
            </Card>
        </div>
    );
};

export default OrderDetails;
