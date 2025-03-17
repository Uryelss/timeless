import React, { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Button, Form, Input, Select, Checkbox, Radio, message } from "antd";
import Navbar from "../Navbar/Navbar";

const { Content } = Layout;
const { Option } = Select;

const MyAddress = () => {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false); // Track if we're editing
    const [currentAddressId, setCurrentAddressId] = useState(null); // Store the ID of the address being edited
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");

    // Fetch addresses with profile data from the API
    const fetchAddresses = async () => {
        if (!token) {
            message.error("No token found, please log in.");
            return;
        }

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
        fetchAddresses();
    }, [token]);

    // Handle form submission for adding or updating an address
    const onFinish = async (values) => {
        const addressData = {
            street: values.street,
            city: values.city,
            state: values.province, // Mapping province to state
            barangay: values.barangay,
            postal_code: values.postal_code,
            country: values.country,
            phone: values.phone,
            is_pickup: values.is_pickup || false,
            is_return: values.is_return || false,
        };

        try {
            if (editMode) {
                // Update existing address
                const res = await axios.put(
                    `http://localhost:8000/api/addresses/${currentAddressId}`,
                    addressData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                message.success("Address updated successfully!");
            } else {
                // Add new address
                const res = await axios.post(
                    "http://localhost:8000/api/addresses",
                    addressData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                message.success("Address added successfully!");
            }
            setShowForm(false);
            setEditMode(false);
            setCurrentAddressId(null);
            form.resetFields();
            fetchAddresses(); // Refresh the address list
        } catch (error) {
            console.error("Error saving address:", error);
            message.error(`Error ${editMode ? "updating" : "adding"} address`);
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

    // Handle editing an address
    const handleEdit = (address) => {
        setEditMode(true);
        setCurrentAddressId(address.id);
        setShowForm(true);
        // Pre-fill the form with the address data
        form.setFieldsValue({
            street: address.street,
            barangay: address.barangay,
            city: address.city,
            province: address.state, // Mapping state to province
            postal_code: address.postal_code,
            country: address.country,
            phone: address.phone,
            is_pickup: address.is_pickup,
            is_return: address.is_return,
        });
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
                                    onClick={() => {
                                        setShowForm(true);
                                        setEditMode(false);
                                        setCurrentAddressId(null);
                                        form.resetFields();
                                    }}
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
                                                {address.profile?.first_name} {address.profile?.last_name} | {address.phone}
                                            </h3>
                                            <p style={{ margin: 0 }}>
                                                {address.street}, {address.barangay}, {address.city}, {address.state}, {address.postal_code}, {address.country}
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
                            <h1>{editMode ? "Edit Address" : "New Address"}</h1>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                style={{ maxWidth: 600 }}
                                initialValues={{ country: "Philippines" }}
                            >
                                <Form.Item
                                    label="Street Name, Building, House No."
                                    name="street"
                                    rules={[{ required: true, message: "Please enter your street details" }]}
                                >
                                    <Input placeholder="Street Name, Building, House No." />
                                </Form.Item>
                                <Form.Item
                                    label="Barangay"
                                    name="barangay"
                                    rules={[{ required: true, message: "Please enter your barangay" }]}
                                >
                                    <Input placeholder="Barangay" />
                                </Form.Item>
                                <Form.Item
                                    label="City"
                                    name="city"
                                    rules={[{ required: true, message: "Please enter your city" }]}
                                >
                                    <Input placeholder="City" />
                                </Form.Item>
                                <Form.Item
                                    label="Province"
                                    name="province"
                                    rules={[{ required: true, message: "Please enter your province" }]}
                                >
                                    <Input placeholder="Province" />
                                </Form.Item>
                                <Form.Item
                                    label="Postal Code"
                                    name="postal_code"
                                    rules={[{ required: true, message: "Please enter your postal code" }]}
                                >
                                    <Input placeholder="Postal Code" />
                                </Form.Item>
                                <Form.Item
                                    label="Country"
                                    name="country"
                                    rules={[{ required: true, message: "Please enter your country" }]}
                                >
                                    <Select placeholder="Select Country">
                                        <Option value="Philippines">Philippines</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label="Phone Number"
                                    name="phone"
                                    rules={[{ required: true, message: "Please enter your phone number" }]}
                                >
                                    <Input placeholder="Phone Number" />
                                </Form.Item>

                                <Form.Item label="Label As:">
                                    <Radio.Group name="label" defaultValue="Home">
                                        <Radio value="Home">Home</Radio>
                                        <Radio value="Work">Work</Radio>
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item name="is_pickup" valuePropName="checked">
                                    <Checkbox>Pickup Address</Checkbox>
                                </Form.Item>
                                <Form.Item name="is_return" valuePropName="checked">
                                    <Checkbox>Return Address</Checkbox>
                                </Form.Item>

                                <Form.Item>
                                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                        <Button
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditMode(false);
                                                setCurrentAddressId(null);
                                                form.resetFields();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
                                        >
                                            {editMode ? "Update" : "Submit"}
                                        </Button>
                                    </div>
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default MyAddress;