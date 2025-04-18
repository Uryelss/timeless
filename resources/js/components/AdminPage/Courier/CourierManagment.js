import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Alert,
  Layout,
  message,
  Space,
  Select,
  Typography,
  Descriptions,
  Tag,
  Image,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Sidebar from "../AdminSidebar/Sidebar";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const CourierManagement = () => {
  const [couriers, setCouriers] = useState([]);
  const [error, setError] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const [selectedCourierOrders, setSelectedCourierOrders] = useState([]);

  const API_URL = "http://127.0.0.1:8000/api";

  const fetchCouriers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/couriers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCouriers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError("Error fetching couriers");
      console.error("Error fetching couriers:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCourierOrders = async (courier) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const transformed = response.data.map((order) => ({
        ...order,
        order_date: order.order_date || order.created_at,
        shipping: order.shipping || { paymentMethod: {}, shippingStatus: {} },
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
      const formData = {
        name: values.name,
        email: values.email,
        phone: values.phone_number,
        address: values.address,
        status: values.status,
      };

      const response = await axios.post(`${API_URL}/couriers`, formData, {
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
      phone: courier.phone_number,
      address: courier.address,
      status: courier.status,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const formData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        status: values.status,
        _method: "PUT",
      };

      const response = await axios.post(
        `${API_URL}/couriers/${selectedCourier.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCouriers(
        couriers.map((courier) =>
          courier.id === selectedCourier.id ? response.data : courier
        )
      );

      message.success("Courier updated successfully!");
      setEditModalVisible(false);
      form.resetFields();
      setSelectedCourier(null);
    } catch (error) {
      message.error("Failed to update courier.");
      console.error("Update error:", error.response?.data || error);
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

  const renderOrderDetails = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <Text>No items available</Text>;
    }

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
                    detail.product && detail.product.main_image
                      ? `http://localhost:8000/storage/${detail.product.main_image}`
                      : "https://via.placeholder.com/50"
                  }
                  width={40}
                  preview={false}
                  alt={detail.product?.product_name || "product"}
                  onError={() =>
                    console.warn(`Failed to load image for product: ${detail.product?.product_name}`)
                  }
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
        rowKey={(detail) => detail.id || Math.random()}
        size="small"
      />
    );
  };

  const statusColors = {
    active: "green",
    inactive: "red",
    "on delivery": "blue",
    returned: "orange",
  };

  const columns = [
    {
      title: "Actions",
      key: "action",
      render: (_, courier) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(courier)}
            type="text"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(courier)}
            type="text"
            danger
          />
          <Button
            icon={<EyeOutlined />}
            onClick={() => fetchCourierOrders(courier)}
            type="text"
          />
        </Space>
      ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone Number", dataIndex: "phone_number", key: "phone_number" },
    { title: "Address", dataIndex: "address", key: "address", ellipsis: true },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status?.toLowerCase()] || "default"}>
          {status ? status.toUpperCase() : "N/A"}
        </Tag>
      ),
    },
    {
      title: "Transfer Method",
      dataIndex: "transfer_method",
      key: "transfer_method",
      render: (method) => (
        <Text>{method ? `${method} - Transferred` : "Pending Transfer"}</Text>
      ),
    },
    {
      title: "Total Transferred",
      dataIndex: "total_transferred",
      key: "total_transferred",
      render: (amount) => `₱${parseFloat(amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      title: "Last Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
  ];

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
          {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchCouriers}
            >
              Refresh
            </Button>
            <Button type="primary" onClick={handleCreate}>
              Create New Courier
            </Button>
          </div>
          <Table
            dataSource={couriers}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: true }}
            locale={{ emptyText: "Loading couriers..." }}
          />

          <Modal
            title="Create New Courier"
            open={createModalVisible}
            onCancel={() => {
              setCreateModalVisible(false);
              createForm.resetFields();
            }}
            onOk={() => createForm.submit()}
            width={700}
          >
            <Form
              form={createForm}
              onFinish={handleCreateSubmit}
              layout="vertical"
            >
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
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
                  <Form.Item
                    name="phone_number"
                    label="Phone Number"
                    rules={[{ required: true, message: "Please enter the courier's phone number" }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    name="address"
                    label="Address"
                    rules={[{ required: true, message: "Please enter the courier's address" }]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Form.Item name="status" label="Status" initialValue="active">
                    <Select>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                      <Option value="on delivery">On Delivery</Option>
                      <Option value="returned">Returned</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </Form>
          </Modal>

          <Modal
            title="Edit Courier"
            open={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              form.resetFields();
              setSelectedCourier(null);
            }}
            onOk={() => form.submit()}
            width={700}
          >
            <Form form={form} onFinish={handleUpdate} layout="vertical">
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
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
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: "Please enter the courier's phone number" }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    name="address"
                    label="Address"
                    rules={[{ required: true, message: "Please enter the courier's address" }]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Form.Item name="status" label="Status">
                    <Select>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                      <Option value="on delivery">On Delivery</Option>
                      <Option value="returned">Returned</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </Form>
          </Modal>

          <Modal
            title={`Orders Assigned to ${selectedCourier?.name || "Courier"}`}
            open={ordersModalVisible}
            onCancel={() => {
              setOrdersModalVisible(false);
              setSelectedCourierOrders([]);
              setSelectedCourier(null);
            }}
            footer={
              <Button
                onClick={() => {
                  setOrdersModalVisible(false);
                  setSelectedCourierOrders([]);
                  setSelectedCourier(null);
                }}
              >
                Close
              </Button>
            }
            width={800}
          >
            {selectedCourierOrders.length > 0 ? (
              <>
                {selectedCourierOrders.map((order) => (
                  <div key={order.id} style={{ marginBottom: 24 }}>
                    <Title level={5}>Order #{order.id}</Title>
                    {renderOrderDetails(order.order_details || [])}
                    <Descriptions
                      bordered
                      size="small"
                      style={{ marginTop: 16 }}
                    >
                      <Descriptions.Item label="Customer">
                        {order.profile
                          ? `${order.profile.first_name || ""} ${
                              order.profile.last_name || ""
                            }`.trim() || "N/A"
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default CourierManagement;