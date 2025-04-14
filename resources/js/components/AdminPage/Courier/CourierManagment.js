import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Alert,
  Layout,
  message,
  Space,
  Checkbox,
  Select,
  Typography,
  Image,
  Descriptions,
} from "antd";
import {
  EditOutlined,
  FolderOpenOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Sidebar from "../AdminSidebar/Sidebar";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const CourierManagement = () => {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const [selectedCourierOrders, setSelectedCourierOrders] = useState([]);

  const API_URL = "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/couriers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCouriers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError("Error fetching couriers");
      console.error(error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const transformed = response.data.map((order) => ({
        ...order,
        order_date: order.order_date || order.created_at,
        shipping: order.shipping || {},
        selected: false,
      }));
      setUnassignedOrders(
        transformed.filter((order) => !order.courier_id && !order.deleted_at)
      );
    } catch (error) {
      message.error("Error fetching orders");
      console.error(error.response?.data || error);
    }
  };

  const handleViewOrders = async (courier) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const transformed = response.data.map((order) => ({
        ...order,
        order_date: order.order_date || order.created_at,
        shipping: order.shipping || {},
        selected: false,
      }));
      const courierOrders = transformed.filter(
        (order) => order.courier_id === courier.id && !order.deleted_at
      );
      setSelectedCourier(courier);
      setSelectedCourierOrders(courierOrders);
      setOrdersModalVisible(true);
    } catch (error) {
      message.error("Error fetching orders");
      console.error(error.response?.data || error);
    }
  };

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/couriers`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCouriers([...couriers, response.data]);
      message.success("Courier created successfully!");
      setCreateModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      message.error("Failed to create courier.");
      console.error(error.response?.data || error);
    }
  };

  const handleEdit = (courier) => {
    setSelectedCourier(courier);
    form.setFieldsValue({
      name: courier.name,
      email: courier.email,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/couriers/${selectedCourier.id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCouriers(
        couriers.map((courier) =>
          courier.id === selectedCourier.id
            ? { ...courier, ...values }
            : courier
        )
      );

      message.success("Courier updated successfully!");
      setEditModalVisible(false);
      form.resetFields();
      setSelectedCourier(null);
    } catch (error) {
      message.error("Failed to update courier.");
      console.error(error.response?.data || error);
    }
  };

  const handleDelete = (courier) => {
    Modal.confirm({
      title: "Are you sure you want to delete this courier?",
      content: `Courier: ${courier.name}`,
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_URL}/couriers/${courier.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setCouriers(couriers.filter((c) => c.id !== courier.id));
          message.success("Courier deleted successfully!");
        } catch (error) {
          message.error("Failed to delete courier.");
          console.error(error.response?.data || error);
        }
      },
    });
  };

  const handleAssignOrders = () => {
    fetchUnassignedOrders();
    setAssignModalVisible(true);
  };

  const handleAssignSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/orders/${values.order_id}/assign-courier`,
        { courier_id: values.courier_id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUnassignedOrders(
        unassignedOrders.filter((order) => order.id !== values.order_id)
      );
      await fetchCouriers();
      message.success(
        `Order #${values.order_id} assigned successfully! View it in Order Tracking.`
      );
      assignForm.resetFields();
      setAssignModalVisible(false);
    } catch (error) {
      message.error("Failed to assign order.");
      console.error(error.response?.data || error);
    }
  };

  const renderOrderDetails = (items) => {
    return (
      <Table
        dataSource={items}
        columns={[
          {
            title: "Item",
            render: (detail) => (
              <Space>
                <Image
                  src={
                    detail.product?.main_image
                      ? `http://127.0.0.1:8000/storage/${detail.product.main_image}`
                      : "https://via.placeholder.com/50"
                  }
                  width={40}
                  preview={false}
                />
                <Text>{detail.product?.product_name || "Unknown"}</Text>
              </Space>
            ),
          },
          { title: "Quantity", dataIndex: "quantity" },
          {
            title: "Price",
            dataIndex: "price",
            render: (price) => `₱${parseFloat(price || 0).toLocaleString()}`,
          },
          {
            title: "Total",
            render: (detail) =>
              `₱${((detail.quantity || 0) * (detail.price || 0)).toLocaleString()}`,
          },
        ]}
        pagination={false}
        rowKey="id"
        size="small"
      />
    );
  };

  const columns = [
    {
      title: "Actions",
      key: "action",
      render: (_, courier) => (
        <Space>
          <Checkbox disabled />
          <EditOutlined onClick={() => handleEdit(courier)} />
          <FolderOpenOutlined
            onClick={() => handleDelete(courier)}
            style={{ color: "#ff4d4f" }}
          />
          <EyeOutlined
            onClick={() => handleViewOrders(courier)}
            style={{ color: "#1890ff" }}
          />
        </Space>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  const unassignedOrderColumns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Customer",
      key: "profile",
      render: (_, order) =>
        order.profile
          ? `${order.profile.first_name || ""} ${order.profile.last_name || ""}`
              .trim() || "N/A"
          : "N/A",
    },
    {
      title: "Items",
      key: "order_details",
      render: (_, order) =>
        order.order_details?.length
          ? order.order_details
              .map((detail) => detail.product?.product_name || "Unknown")
              .join(", ")
          : "No items",
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (total) => `₱${parseFloat(total || 0).toLocaleString()}`,
    },
  ];

  if (loading) return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
  if (error) return <Alert message={error} type="error" style={{ margin: "20px" }} />;

  return (
    <Layout>
      <Sider width={256} style={{ minHeight: "100vh" }}>
        <Sidebar />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          COURIER MANAGEMENT
        </Header>
        <Content style={{ padding: 24, background: "#fff" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}></div>
            <div>
              <Button
                type="primary"
                onClick={handleAssignOrders}
                style={{ marginRight: 8 }}
                disabled={couriers.length === 0}
              >
                Assign Orders
              </Button>
              <Button type="primary" onClick={handleCreate}>
                Create New Courier
              </Button>
            </div>
          </div>
          <Table
            dataSource={couriers}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
          <Modal
            title="Create New Courier"
            visible={createModalVisible}
            onCancel={() => {
              setCreateModalVisible(false);
              createForm.resetFields();
            }}
            onOk={() => createForm.submit()}
          >
            <Form form={createForm} onFinish={handleCreateSubmit} layout="vertical">
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter the courier's name" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter the courier's email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="Edit Courier"
            visible={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              form.resetFields();
              setSelectedCourier(null);
            }}
            onOk={() => form.submit()}
          >
            <Form form={form} onFinish={handleUpdate} layout="vertical">
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter the courier's name" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter the courier's email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title={`Orders Assigned to ${selectedCourier?.name || "Courier"}`}
            visible={ordersModalVisible}
            onCancel={() => setOrdersModalVisible(false)}
            footer={<Button onClick={() => setOrdersModalVisible(false)}>Close</Button>}
            width={800}
          >
            {selectedCourierOrders.length > 0 ? (
              <>
                {selectedCourierOrders.map((order) => (
                  <div key={order.id} style={{ marginBottom: 24 }}>
                    <Title level={5}>Order #{order.id}</Title>
                    {renderOrderDetails(order.order_details || [])}
                    <Descriptions bordered size="small" style={{ marginTop: 16 }}>
                      <Descriptions.Item label="Customer">
                        {order.profile
                          ? `${order.profile.first_name || ""} ${order.profile.last_name || ""}`
                              .trim() || "N/A"
                          : "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Total">
                        ₱{parseFloat(order.total_amount || 0).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Address">
                        {order.shipping?.address?.full_address || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                ))}
              </>
            ) : (
              <Text>No orders assigned to this courier.</Text>
            )}
          </Modal>
          <Modal
            title="Assign Orders to Courier"
            visible={assignModalVisible}
            onCancel={() => {
              setAssignModalVisible(false);
              assignForm.resetFields();
            }}
            footer={null}
            width={1000}
          >
            <Form form={assignForm} onFinish={handleAssignSubmit} layout="vertical">
              <Form.Item
                name="order_id"
                label="Select Order"
                rules={[{ required: true, message: "Please select an order" }]}
              >
                <Select placeholder="Select an order">
                  {unassignedOrders.length > 0 ? (
                    unassignedOrders.map((order) => (
                      <Option key={order.id} value={order.id}>
                        Order #{order.id} -{" "}
                        {order.profile
                          ? `${order.profile.first_name || ""} ${order.profile.last_name || ""}`
                              .trim() || "Unknown"
                          : "Unknown"}
                        {order.order_details?.length > 0
                          ? ` (${
                              order.order_details
                                .map(
                                  (d) =>
                                    `${d.product?.product_name || "Unknown"} x${d.quantity}`
                                )
                                .join(", ")
                            })`
                          : " (No items)"}
                      </Option>
                    ))
                  ) : (
                    <Option disabled>No unassigned orders available</Option>
                  )}
                </Select>
              </Form.Item>
              <Form.Item
                name="courier_id"
                label="Select Courier"
                rules={[{ required: true, message: "Please select a courier" }]}
              >
                <Select placeholder="Select a courier">
                  {couriers.map((courier) => (
                    <Option key={courier.id} value={courier.id}>
                      {courier.name} ({courier.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Assign
                </Button>
              </Form.Item>
            </Form>
            <div style={{ marginTop: 16 }}>
              {unassignedOrders.length > 0 ? (
                unassignedOrders.map((order) => (
                  <div key={order.id} style={{ marginBottom: 24 }}>
                    <Title level={5}>Order #{order.id}</Title>
                    {renderOrderDetails(order.order_details || [])}
                    <Descriptions bordered size="small" style={{ marginTop: 16 }}>
                      <Descriptions.Item label="Customer">
                        {order.profile
                          ? `${order.profile.first_name || ""} ${order.profile.last_name || ""}`
                              .trim() || "N/A"
                          : "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Total">
                        ₱{parseFloat(order.total_amount || 0).toLocaleString()}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                ))
              ) : (
                <Text>No unassigned orders available.</Text>
              )}
            </div>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CourierManagement;