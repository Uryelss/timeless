import React, { useState, useEffect } from "react";
import {
    Layout,
    Tabs,
    Input,
    Card,
    Row,
    Col,
    Badge,
    Button,
    Pagination,
    Image,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Navbar from "../../Navbar/Navbar"; // Updated import path
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar"; // Adjust the import path if necessary

const { TabPane } = Tabs;
const { Content } = Layout;

const MyPurchase = () => {
    const [orders, setOrders] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [collapsed, setCollapsed] = useState(false);
    const API_URL = "http://localhost:8000/api/my-purchases";
    const navigate = useNavigate();

    // Fetch orders and transform them (including productId for each product)
    const fetchOrders = (page = 1) => {
        axios
            .get(`${API_URL}?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                const ordersArray = res.data.data || res.data;
                const transformedOrders = ordersArray.map((order) => ({
                    id: order.id,
                    products:
                        order.order_details?.map((detail) => ({
                            productId: detail.product?.id, // included for cart actions
                            name:
                                detail.product?.product_name ||
                                "Unknown Product",
                            quantity: detail.quantity || 0,
                            size: detail.inventory?.size || "N/A",
                            image: detail.product?.main_image
                                ? `http://localhost:8000/storage/${detail.product.main_image}`
                                : "https://via.placeholder.com/80",
                            total: detail.price
                                ? detail.price * detail.quantity
                                : 0,
                        })) || [],
                    status: mapStatusToTab(order.order_status),
                    orderTotal: order.total_amount || 0,
                }));
                setOrders(transformedOrders);
                setTotalOrders(res.data.total || transformedOrders.length);
                setCurrentPage(res.data.current_page || page);
            })
            .catch((err) => {
                console.error(
                    "Error fetching orders:",
                    err.response?.data || err.message
                );
            });
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => fetchOrders(currentPage), 30000);
        return () => clearInterval(interval);
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchOrders(page);
    };

    // Map API order status to our tab names
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

    const filterOrdersByStatus = (status) => {
        return orders.filter(
            (order) =>
                order.status &&
                order.status.toLowerCase() === status.toLowerCase()
        );
    };

    const filteredOrders = orders.filter((order) => {
        const lowerSearch = searchText.toLowerCase();
        return (
            order.id.toString().includes(lowerSearch) ||
            order.products.some((product) =>
                product.name.toLowerCase().includes(lowerSearch)
            )
        );
    });

    const handleTrackOrder = (orderId) => {
        navigate(`/order-tracking/${orderId}`);
    };

    // "Buy Again" adds each product from the order into the cart and navigates to the cart page.
    const handleBuyAgain = (order) => {
        const storedCart = localStorage.getItem("cart");
        let cart = storedCart ? JSON.parse(storedCart) : [];
        order.products.forEach((product) => {
            // Calculate price per unit (assuming product.total represents the total for the quantity)
            const pricePerUnit =
                product.quantity > 0
                    ? product.total / product.quantity
                    : product.total;
            const existingItemIndex = cart.findIndex(
                (item) =>
                    item.id === product.productId && item.size === product.size
            );
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += product.quantity;
                cart[existingItemIndex].total =
                    cart[existingItemIndex].price *
                    cart[existingItemIndex].quantity;
            } else {
                cart.push({
                    id: product.productId,
                    productName: product.name,
                    image: product.image,
                    size: product.size,
                    price: pricePerUnit,
                    quantity: product.quantity,
                    total: product.total,
                });
            }
        });
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/user-cart");
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Navbar />
            <Layout>
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <Layout style={{ padding: "24px 16px 0", overflow: "initial" }}>
                    <Content>
                        <div
                            style={{
                                padding: 24,
                                background: "#fff",
                                borderRadius: 8,
                                minHeight: 360,
                            }}
                        >
                            <Input
                                placeholder="Search by Order ID or Product Name"
                                prefix={<SearchOutlined />}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ marginBottom: "20px", width: "100%" }}
                            />
                            <Tabs defaultActiveKey="1" type="card">
                                <TabPane tab="All" key="1">
                                    <OrderList
                                        orders={filteredOrders}
                                        onTrackOrder={handleTrackOrder}
                                        onBuyAgain={handleBuyAgain}
                                    />
                                </TabPane>
                                <TabPane tab="To Pay" key="2">
                                    <OrderList
                                        orders={filterOrdersByStatus("To Pay")}
                                        showTrackButton={true}
                                        onTrackOrder={handleTrackOrder}
                                        onBuyAgain={handleBuyAgain}
                                    />
                                </TabPane>
                                <TabPane tab="To Ship" key="3">
                                    <OrderList
                                        orders={filterOrdersByStatus("To Ship")}
                                        onTrackOrder={handleTrackOrder}
                                        onBuyAgain={handleBuyAgain}
                                    />
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span>
                                            To Receive{" "}
                                            <Badge
                                                count={
                                                    filterOrdersByStatus(
                                                        "To Receive"
                                                    ).length
                                                }
                                                style={{
                                                    backgroundColor: "#f5222d",
                                                }}
                                            />
                                        </span>
                                    }
                                    key="4"
                                >
                                    <OrderList
                                        orders={filterOrdersByStatus(
                                            "To Receive"
                                        )}
                                        onTrackOrder={handleTrackOrder}
                                        onBuyAgain={handleBuyAgain}
                                    />
                                </TabPane>
                                <TabPane tab="Completed" key="5">
                                    <OrderList
                                        orders={filterOrdersByStatus(
                                            "Completed"
                                        )}
                                        onTrackOrder={handleTrackOrder}
                                        onBuyAgain={handleBuyAgain}
                                    />
                                </TabPane>
                                <TabPane tab="Cancelled" key="6">
                                    <OrderList
                                        orders={filterOrdersByStatus(
                                            "Cancelled"
                                        )}
                                        onTrackOrder={handleTrackOrder}
                                        onBuyAgain={handleBuyAgain}
                                    />
                                </TabPane>
                                <TabPane tab="Return/Refund" key="7">
                                    <OrderList
                                        orders={filterOrdersByStatus(
                                            "Return/Refund"
                                        )}
                                        onTrackOrder={handleTrackOrder}
                                        onBuyAgain={handleBuyAgain}
                                    />
                                </TabPane>
                            </Tabs>
                            <Pagination
                                current={currentPage}
                                total={totalOrders}
                                pageSize={10}
                                onChange={handlePageChange}
                                style={{
                                    marginTop: "20px",
                                    textAlign: "center",
                                }}
                            />
                            <div
                                style={{
                                    textAlign: "center",
                                    marginTop: "10px",
                                }}
                            >
                                Total Orders: {totalOrders}
                            </div>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

// OrderList component receives onBuyAgain and conditionally renders the "Buy Again" button
const OrderList = ({
    orders,
    showTrackButton = false,
    onTrackOrder,
    onBuyAgain,
}) => (
    <>
        {orders.length === 0 ? (
            <p>No orders found.</p>
        ) : (
            orders.map((order) => (
                <Card key={order.id} style={{ marginBottom: "20px" }}>
                    <Row align="middle">
                        <Col span={12}>
                            <span>Order ID: {order.id}</span>
                        </Col>
                        <Col span={12} style={{ textAlign: "right" }}>
                            <span style={{ color: "#13c2c2" }}>
                                {order.status === "To Receive"
                                    ? "Parcel has arrived and to be received by the delivery hub"
                                    : order.status}
                            </span>
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
                            <Col span={20}>
                                <div>
                                    <strong>{product.name}</strong>
                                </div>
                                <div>Size: {product.size}</div>
                                <div>Quantity: {product.quantity}</div>
                                <div>
                                    Total: ₱{product.total.toLocaleString()}
                                </div>
                            </Col>
                        </Row>
                    ))}
                    <hr />
                    <Row align="middle" gutter={[16, 16]}>
                        <Col span={24} style={{ textAlign: "center" }}>
                            {showTrackButton && (
                                <Button
                                    type="primary"
                                    onClick={() => onTrackOrder(order.id)}
                                    style={{ marginRight: "10px" }}
                                >
                                    Track Order
                                </Button>
                            )}
                            {order.status === "Completed" && onBuyAgain && (
                                <Button
                                    type="default"
                                    onClick={() => onBuyAgain(order)}
                                >
                                    Buy Again
                                </Button>
                            )}
                        </Col>
                    </Row>
                    <Row style={{ marginTop: "10px" }}>
                        <Col span={24} style={{ textAlign: "center" }}>
                            <strong>
                                Order Total: ₱
                                {Number(order.orderTotal).toLocaleString()}
                            </strong>
                        </Col>
                    </Row>
                </Card>
            ))
        )}
    </>
);

export default MyPurchase;
