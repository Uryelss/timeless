import React, { useState, useEffect } from "react";
import { Card, Avatar, Button, Form, Input, Modal, Spin, message } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api"; // Adjust to your Laravel API URL

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch current admin data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(`${API_BASE_URL}/current-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        message.error(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle edit profile submission
  const handleEditProfile = async (values) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `${API_BASE_URL}/users/${user.id}`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data);
      setEditModalVisible(false);
      message.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // Open edit modal and populate form
  const openEditModal = () => {
    form.setFieldsValue({
      username: user?.username,
      email: user?.email || "",
    });
    setEditModalVisible(true);
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Card
          title="Admin Profile"
          style={{ maxWidth: 600, margin: "0 auto" }}
          extra={
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={openEditModal}
              disabled={!user}
            >
              Edit Profile
            </Button>
          }
        >
          {user ? (
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                src={user.profile_image || null}
                style={{ marginBottom: "16px" }}
              />
              <h2>{user.username}</h2>
              <p style={{ color: "#888" }}>{user.email || "Email not provided"}</p>
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "red" }}>
              Unable to load profile. Please try again.
            </p>
          )}
        </Card>
      )}

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleEditProfile}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter a username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter an email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password (leave blank to keep unchanged)"
            rules={[{ min: 6, message: "Password must be at least 6 characters", required: false }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
            <Button
              style={{ marginLeft: "8px" }}
              onClick={() => setEditModalVisible(false)}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProfile;