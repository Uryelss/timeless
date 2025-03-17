import React, { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Button, Form, Input, Select, Checkbox, Radio, message } from "antd";
import Navbar from "../Navbar/Navbar";

const { Content } = Layout;
const { Option } = Select;

const MyAddress = () => {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");

    // Fetch addresses from the API
    const fetchAddresses = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/addresses", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAddresses(res.data);
        } catch (error) {
            console.error("Error fetching addresses:", error);
            message.error("Error fetching addresses");
        }
    };

    useEffect(() => {
        if (token) {
            fetchAddresses();
        } else {
            message.error("No token found, please log in.");
        }
    }, [token]);

    // Handle form submission to add a new address
    const onFinish = async (values) => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/addresses",
                values,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success("Address added successfully!");
            setShowForm(false);
            form.resetFields();
            fetchAddresses(); // Refresh the address list
        } catch (error) {
            console.error("Error adding address:", error);
            message.error("Error adding address");
        }
    };

    // Handle deleting an address
    const handleDelete = async (addressId) => {
        try {
            await axios.delete(`http://localhost:8000/api/addresses/${addressId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("Address deleted successfully!");
            fetchAddresses();
        } catch (error) {
            console.error("Error deleting address:", error);
            message.error("Error deleting address");
        }
    };

    // Handle setting an address as default
    const handleSetDefault = async (addressId) => {
        try {
            await axios.put(
                `http://localhost:8000/api/addresses/${addressId}/set-default`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success("Address set as default!");
            fetchAddresses();
        } catch (error) {
            console.error("Error setting default address:", error);
            message.error("Error setting default address");
        }
    };

    // Handle editing an address (for now, we'll just log it)
    const handleEdit = (address) => {
        console.log("Edit address:", address);
        // You can implement a modal or redirect to an edit form here
        message.info("Edit functionality to be implemented");
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Navbar />
            <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
                <div
                    style={{
                        padding: 24,
                        minHeight: 360,
                        background: "#fff",
                        borderRadius: 8,
                    }}
                >
                    {!showForm ? (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                                <h1>My Addresses</h1>
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
                                    onClick={() => setShowForm(true)}
                                >
                                    + Add New Address
                                </Button>
                            </div>

                            {addresses.length === 0 ? (
                                <p>No addresses found.</p>
                            ) : (
                                addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        style={{
                                            borderBottom: "1px solid #ddd",
                                            padding: "10px 0",
                                            marginBottom: 10,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <h3 style={{ margin: 0 }}>
                                                {address.full_name} | {address.phone_number}
                                            </h3>
                                            <p style={{ margin: 0 }}>
                                                {address.street}, {address.city}, {address.province}, {address.region}, {address.postal_code}
                                            </p>
                                            <div style={{ marginTop: 5 }}>
                                                {address.is_default && (
                                                    <span style={{ color: "#ff4d4f", marginRight: 10 }}>Default</span>
                                                )}
                                                {address.is_pickup && (
                                                    <span style={{ marginRight: 10 }}>Pickup Address</span>
                                                )}
                                                {address.is_return && (
                                                    <span>Return Address</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                type="link"
                                                onClick={() => handleEdit(address)}
                                                style={{ padding: 0, marginRight: 10 }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                type="link"
                                                onClick={() => handleDelete(address.id)}
                                                style={{ padding: 0, color: "#ff4d4f" }}
                                            >
                                                Delete
                                            </Button>
                                            {!address.is_default && (
                                                <Button
                                                    type="default"
                                                    onClick={() => handleSetDefault(address.id)}
                                                    style={{ marginLeft: 10 }}
                                                >
                                                    Set as default
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    ) : (
                        <>
                            <h1>New Address</h1>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                style={{ maxWidth: 600 }}
                            >
                                <div style={{ display: "flex", gap: 15 }}>
                                    <Form.Item
                                        label="Full Name"
                                        name="full_name"
                                        rules={[{ required: true, message: "Please enter your full name" }]}
                                        style={{ flex: 1 }}
                                    >
                                        <Input placeholder="Full Name" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Phone Number"
                                        name="phone_number"
                                        rules={[{ required: true, message: "Please enter your phone number" }]}
                                        style={{ flex: 1 }}
                                    >
                                        <Input placeholder="Phone Number" />
                                    </Form.Item>
                                </div>

                                <Form.Item
                                    label="Region, Province, City, Barangay"
                                    name="location"
                                    rules={[{ required: true, message: "Please select your location" }]}
                                >
                                    <Select placeholder="Region, Province, City, Barangay">
                                        {/* This should be populated dynamically from an API */}
                                        <Option value="Mindanao-Aguasan Del Norte-Butuan City-Ong Yiu Pob">
                                            Mindanao, Aguasan Del Norte, Butuan City, Ong Yiu Pob
                                        </Option>
                                        {/* Add more options as needed */}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label="Postal Code"
                                    name="postal_code"
                                    rules={[{ required: true, message: "Please enter your postal code" }]}
                                >
                                    <Input placeholder="Postal Code" />
                                </Form.Item>

                                <Form.Item
                                    label="Street Name, Building, House No."
                                    name="street"
                                    rules={[{ required: true, message: "Please enter your street details" }]}
                                >
                                    <Input placeholder="Street Name, Building, House No." />
                                </Form.Item>

                                <Button type="default" style={{ marginBottom: 20 }}>
                                    + Add Location
                                </Button>

                                <Form.Item label="Label As:">
                                    <Radio.Group name="label" defaultValue="Home">
                                        <Radio value="Home">Home</Radio>
                                        <Radio value="Work">Work</Radio>
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <Checkbox name="is_pickup">Pickup Address</Checkbox>
                                        <Checkbox name="is_return">Return Address</Checkbox>
                                    </div>
                                </Form.Item>

                                <Form.Item>
                                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                        <Button onClick={() => setShowForm(false)}>Cancel</Button>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </div>
            </Content

>
        </Layout>
    );
};

export default MyAddress;