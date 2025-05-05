import React, { useState, useEffect } from "react";
import {
    Tabs,
    Input,
    Card,
    Row,
    Col,
    Badge,
    Button,
    Pagination,
    Image,
    Modal,
    Form,
    InputNumber,
    Select,
    Checkbox,
    Upload,
    message,
} from "antd";
import { SearchOutlined, UploadOutlined } from "@ant-design/icons";
import Navbar from "../../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;
const { Option } = Select;

const MyPurchase = () => {
    const [orders, setOrders] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [isOrderIdModalOpen, setIsOrderIdModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [issueType, setIssueType] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [form] = Form.useForm();
    const API_URL = "http://localhost:8000/api";
    const navigate = useNavigate();

    const fetchOrders = (page = 1) => {
        axios
            .get(`${API_URL}/my-purchases?page=${page}`, {
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
                            id: detail.id,
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
                    err.response?.data || err
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
            case "return/refunded":
                return "Return/Refund";
            default:
                console.warn(
                    `Unrecognized status: ${status}, defaulting to 'To Pay'`
                );
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
        window.location.href = `http://localhost:8000/order-tracking/${orderId}`;
    };

    const handleReturnRefund = (order) => {
        setSelectedOrder(order);
        setIsOrderIdModalOpen(true);
    };

    const validateOrderId = (values) => {
        if (values.orderId === selectedOrder.id) {
            setIsOrderIdModalOpen(false);
            setIsRequestModalOpen(true);
        } else {
            message.error("Invalid Order ID");
        }
    };

    const handleIssueTypeSelect = (type) => {
        setIssueType(type);
        setSelectedProducts([]);
        form.resetFields(["products", "reason", "description", "images"]);
    };

    const handleProductSelect = (productIds) => {
        setSelectedProducts(
            selectedOrder.products.filter((p) => productIds.includes(p.id))
        );
    };

    const calculateRefundAmount = () => {
        return selectedProducts.reduce((sum, p) => sum + p.total, 0);
    };

    const handleSubmitRequest = async (values) => {
        try {
            const formData = new FormData();
            formData.append("order_id", selectedOrder.id);
            formData.append("issue_type", issueType);
            formData.append("products", JSON.stringify(selectedProducts));
            formData.append("reason", values.reason);
            formData.append("refund_method", values.refund_method);
            formData.append("refund_amount", calculateRefundAmount());
            formData.append("description", values.description || "");
            formData.append(
                "policy_confirmed",
                values.policy_confirmed ? 1 : 0
            );

            if (values.images && values.images.length > 0) {
                values.images.forEach((file) => {
                    formData.append("images[]", file.originFileObj);
                });
            }

            await axios.post(`${API_URL}/return-refunds`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            message.success("Return/Refund request submitted successfully");
            setIsRequestModalOpen(false);
            setSelectedOrder(null);
            setIssueType(null);
            setSelectedProducts([]);
            form.resetFields();
            fetchOrders();
        } catch (err) {
            message.error("Failed to submit request");
            console.error(err.response?.data || err);
        }
    };

    return (
        <div>
            <Navbar />
            <div style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ flex: 1, padding: "20px" }}>
                    <Input
                        placeholder="Search by Order ID or Product Name"
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ marginBottom: "20px", width: "100%" }}
                    />
                    <Tabs defaultActiveKey="1" type="card">
                        <TabPane tab="All" key="1">
                            <OrderList orders={filteredOrders} />
                        </TabPane>
                        <TabPane tab="To Pay" key="2">
                            <OrderList
                                orders={filterOrdersByStatus("To Pay")}
                                showTrackButton={true}
                                onTrackOrder={handleTrackOrder}
                            />
                        </TabPane>
                        <TabPane tab="To Ship" key="3">
                            <OrderList
                                orders={filterOrdersByStatus("To Ship")}
                            />
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
                            <OrderList
                                orders={filterOrdersByStatus("Completed")}
                                showReturnRefundButton={true}
                                onReturnRefund={handleReturnRefund}
                            />
                        </TabPane>
                        <TabPane tab="Cancelled" key="6">
                            <OrderList
                                orders={filterOrdersByStatus("Cancelled")}
                            />
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
                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                        Total Orders: {totalOrders}
                    </div>
                </div>
            </div>

            <Modal
                title="Validate Order ID"
                open={isOrderIdModalOpen}
                onCancel={() => setIsOrderIdModalOpen(false)}
                footer={null}
            >
                <Form onFinish={validateOrderId}>
                    <Form.Item
                        name="orderId"
                        rules={[
                            {
                                required: true,
                                message: "Please enter Order ID",
                            },
                        ]}
                    >
                        <InputNumber
                            placeholder="Enter Order ID"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        Validate
                    </Button>
                </Form>
            </Modal>

            <Modal
                title="Request Return/Refund"
                open={isRequestModalOpen}
                onCancel={() => {
                    setIsRequestModalOpen(false);
                    setIssueType(null);
                    setSelectedProducts([]);
                    form.resetFields();
                }}
                footer={null}
                widthiuos
                Request
            >
                {!issueType ? (
                    <div>
                        <h3>Select Issue Type</h3>
                        <Button
                            onClick={() =>
                                handleIssueTypeSelect("received_with_issues")
                            }
                            style={{ marginRight: 10 }}
                        >
                            I received all items but there are issues
                        </Button>
                        <Button
                            onClick={() =>
                                handleIssueTypeSelect("not_received")
                            }
                        >
                            I didn’t receive some/all items
                        </Button>
                    </div>
                ) : (
                    <Form
                        form={form}
                        onFinish={handleSubmitRequest}
                        layout="vertical"
                    >
                        <Form.Item
                            name="products"
                            label="Select Products"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Please select at least one product",
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                onChange={handleProductSelect}
                                placeholder="Select products to return/refund"
                            >
                                {selectedOrder?.products.map((product) => (
                                    <Option key={product.id} value={product.id}>
                                        {product.name} (Size: {product.size})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {selectedProducts.length > 0 && (
                            <>
                                <h3>Selected Products</h3>
                                {selectedProducts.map((product) => (
                                    <Row
                                        key={product.id}
                                        style={{ marginBottom: 10 }}
                                    >
                                        <Col span={4}>
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                style={{
                                                    width: "50px",
                                                    height: "50px",
                                                }}
                                            />
                                        </Col>
                                        <Col span={20}>
                                            <p>
                                                <strong>{product.name}</strong>
                                            </p>
                                            <p>Size: {product.size}</p>
                                            <p>Quantity: {product.quantity}</p>
                                            <p>
                                                Price: ₱
                                                {product.total.toLocaleString()}
                                            </p>
                                        </Col>
                                    </Row>
                                ))}
                            </>
                        )}

                        <Form.Item
                            name="reason"
                            label="Reason for Return/Refund"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a reason",
                                },
                            ]}
                        >
                            <Select placeholder="Select reason">
                                <Option value="missing_part">
                                    Missing part of order
                                </Option>
                                <Option value="wrong_item">
                                    Sent wrong item (e.g., wrong size, model)
                                </Option>
                                <Option value="damaged">Damaged item</Option>
                                <Option value="defective">
                                    Product is defective or does not work
                                </Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="policy_confirmed"
                            valuePropName="checked"
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value
                                            ? Promise.resolve()
                                            : Promise.reject(
                                                  "You must confirm the return policy"
                                              ),
                                },
                            ]}
                        >
                            <Checkbox>
                                I confirm that I want to return item(s) in
                                original/sealed condition, in brand new
                                condition, and in original packaging. Sealed
                                items must remain sealed and unopened.
                            </Checkbox>
                        </Form.Item>

                        <Form.Item
                            name="refund_method"
                            label="Refund Method"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a refund method",
                                },
                            ]}
                        >
                            <Select placeholder="Select refund method">
                                <Option value="gcash">Gcash</Option>
                                <Option value="reorder">
                                    Reorder (without additional payment)
                                </Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Refund Amount">
                            <p>₱{calculateRefundAmount().toLocaleString()}</p>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description (Optional)"
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>

                        <Form.Item
                            name="images"
                            label="Upload Images (Proof of Issue)"
                            valuePropName="fileList"
                            getValueFromEvent={(e) =>
                                Array.isArray(e) ? e : e && e.fileList
                            }
                        >
                            <Upload
                                beforeUpload={() => false}
                                accept="image/*"
                                multiple
                            >
                                <Button icon={<UploadOutlined />}>
                                    Upload Images
                                </Button>
                            </Upload>
                        </Form.Item>

                        <Button type="primary" htmlType="submit">
                            Submit Request
                        </Button>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

const OrderList = ({
    orders,
    showTrackButton = false,
    onTrackOrder,
    showReturnRefundButton = false,
    onReturnRefund,
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
                    <Row style={{ marginTop: "10px" }}>
                        <Col span={24} style={{ textAlign: "right" }}>
                            <strong>
                                Order Total: ₱
                                {Number(order.orderTotal).toLocaleString()}
                            </strong>
                        </Col>
                    </Row>
                    <Row align="right">
                        <Col span={24} style={{ textAlign: "right" }}>
                            {showTrackButton && (
                                <Button
                                    type="primary"
                                    onClick={() => onTrackOrder(order.id)}
                                    style={{
                                        backgroundColor: "#000000",
                                        borderColor: "#black",
                                        marginRight: 10,
                                    }}
                                >
                                    Track Order
                                </Button>
                            )}
                            {showReturnRefundButton && (
                                <Button
                                    type="primary"
                                    onClick={() => onReturnRefund(order)}
                                    style={{
                                        backgroundColor: "#f5222d",
                                        borderColor: "#f5222d",
                                    }}
                                >
                                    Return/Refund
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Card>
            ))
        )}
    </>
);

export default MyPurchase;
