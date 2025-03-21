import React, { useState, useEffect } from "react";
import {
    Tabs,
    Input,
    Button,
    Card,
    Row,
    Col,
    Badge,
    Space,
    Pagination,
    Image,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Navbar from "../../Navbar/Navbar"; // Adjust path as needed
import axios from "axios";

const { TabPane } = Tabs;

const MyPurchase = () => {
    const [orders, setOrders] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const API_URL = "http://localhost:8000/api/my-purchases";

    // Fetch orders from the API
    const fetchOrders = (page = 1) => {
        axios
            .get(`${API_URL}?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                const transformedOrders = res.data.data.map((order) => ({
                    id: order.id,
                    seller: order.order_details[0]?.product?.seller?.name || "",
                    products: order.order_details.map((detail) => ({
                        name: detail.product?.product_name || "Unknown Product",
                        quantity: detail.quantity || 0,
                        price: detail.price || 0,
                        size: detail.inventory?.size || "N/A", // Assuming size comes from inventory
                        image: detail.product?.main_image
                            ? `http://localhost:8000/storage/${detail.product.main_image}`
                            : "https://via.placeholder.com/80",
                    })),
                    status: mapStatusToTab(order.order_status),
                    orderTotal: order.total_amount || 0,
                }));
                setOrders(transformedOrders);
                setTotalOrders(res.data.total);
                setCurrentPage(res.data.current_page);
            })
            .catch((err) => {
                console.error(
                    "Error fetching orders:",
                    err.response?.data || err
                );
            });
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Handle page change
    const handlePageChange = (page) => {
        fetchOrders(page);
    };

    // Map API statuses to MyPurchase tabs
    const mapStatusToTab = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "To Pay";
            case "processing":
                return "To Ship";
            case "shipped":
                return "To Receive";
            case "completed":
                return "Completed";
            case "cancelled":
                return "Cancelled";
            default:
                return "To Pay";
        }
    };

    // Filter orders by status for each tab
    const filterOrdersByStatus = (status) => {
        return orders.filter((order) => order.status === status);
    };

    // Filter orders based on search text
    const filteredOrders = orders.filter((order) => {
        const lowerSearch = searchText.toLowerCase();
        return (
            order.id.toString().includes(lowerSearch) ||
            order.seller.toLowerCase().includes(lowerSearch) ||
            order.products.some((product) =>
                product.name.toLowerCase().includes(lowerSearch)
            )
        );
    });

    return (
        <div>
            <Navbar />
            <div style={{ padding: "20px" }}>
                <Input
                    placeholder="Search by Seller Name, Order ID, or Product Name"
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: "20px", width: "100%" }}
                />
                <Tabs defaultActiveKey="1" type="card">
                    <TabPane tab="All" key="1">
                        <OrderList orders={filteredOrders} />
                    </TabPane>
                    <TabPane tab="To Pay" key="2">
                        <OrderList orders={filterOrdersByStatus("To Pay")} />
                    </TabPane>
                    <TabPane tab="To Ship" key="3">
                        <OrderList orders={filterOrdersByStatus("To Ship")} />
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                To Receive{" "}
                                <Badge
                                    count={
                                        filterOrdersByStatus("To Receive")
                                            .length
                                    }
                                    style={{ backgroundColor: "#f5222d" }}
                                />
                            </span>
                        }
                        key="4"
                    >
                        <OrderList
                            orders={filterOrdersByStatus("To Receive")}
                        />
                    </TabPane>
                    <TabPane tab="Completed" key="5">
                        <OrderList orders={filterOrdersByStatus("Completed")} />
                    </TabPane>
                    <TabPane tab="Cancelled" key="6">
                        <OrderList orders={filterOrdersByStatus("Cancelled")} />
                    </TabPane>
                    <TabPane tab="Return/Refund" key="7">
                        <OrderList
                            orders={filterOrdersByStatus("Return/Refund")}
                        />
                    </TabPane>
                </Tabs>

                <Pagination
                    current={currentPage}
                    total={totalOrders}
                    pageSize={10}
                    onChange={handlePageChange}
                    style={{ marginTop: "20px", textAlign: "center" }}
                />
            </div>
        </div>
    );
};

// Reusable Order List Component
const OrderList = ({ orders }) => (
    <>
        {orders.map((order) => (
            <Card key={order.id} style={{ marginBottom: "20px" }}>
                <Row align="middle">
                    <Col span={12}>
                        <span>{order.seller || ""}</span>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                        <span style={{ color: "#13c2c2" }}>
                            {order.status === "To Receive"
                                ? "Parcel has arrived and to be received by the delivery hub"
                                : order.status}
                        </span>{" "}
                        <Button type="link" style={{ color: "#f5222d" }}>
                            {order.status.toUpperCase()}
                        </Button>
                    </Col>
                </Row>
                <hr />
                {order.products.map((product, index) => (
                    <Row
                        align="middle"
                        style={{ marginTop: "10px" }}
                        key={index}
                    >
                        <Col span={4}>
                            <Image
                                src={product.image}
                                alt={product.name}
                                style={{ width: "80px", height: "80px" }}
                            />
                        </Col>
                        <Col span={12}>
                            <div>
                                <strong>{product.name}</strong>
                            </div>
                            <div>Size: {product.size}</div>
                            <div>Quantity: {product.quantity}</div>
                        </Col>
                        <Col span={8} style={{ textAlign: "right" }}>
                            <div>₱{product.price.toLocaleString()}</div>
                        </Col>
                    </Row>
                ))}
                <hr />
                <Row align="middle">
                    <Col span={12}>
                        <span style={{ fontSize: "12px", color: "#888" }}>
                            Confirm receipt after you've checked the received
                            items and made payment
                        </span>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                        <Space>
                            <span>
                                Order Total: ₱
                                {order.orderTotal.toLocaleString()}
                            </span>
                            <Button type="primary" danger>
                                Contact Seller
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>
        ))}
    </>
);

export default MyPurchase;
