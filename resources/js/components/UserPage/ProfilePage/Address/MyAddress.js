import React, { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Button, Form, Input, Select, Radio, message } from "antd";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar"; // Adjust the import path as needed

const { Content } = Layout;
const { Option } = Select;

// Helper function to format address string and filter out "000"
const formatAddress = (address) => {
    const parts = [];
    if (address.street && address.street !== "000") parts.push(address.street);
    if (address.barangay && address.barangay !== "000")
        parts.push(address.barangay);
    if (address.city && address.city !== "000") parts.push(address.city);
    if (address.state && address.state !== "000") parts.push(address.state);
    if (address.postal_code && address.postal_code !== "000")
        parts.push(address.postal_code);
    if (address.country && address.country !== "000")
        parts.push(address.country);
    return parts.join(", ");
};

const MyAddress = () => {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentAddressId, setCurrentAddressId] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [collapsed, setCollapsed] = useState(false); // Sidebar collapsed state
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

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
            return res.data;
        } catch (error) {
            console.error("Error fetching addresses:", error);
            message.error("Error fetching addresses");
            return [];
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [token]);

    const onFinish = async (values) => {
        const addressData = {
            street: values.street,
            city: values.city,
            state: values.province,
            barangay: values.barangay,
            postal_code: values.postal_code,
            country: values.country,
            phone: values.phone,
        };

        try {
            if (editMode) {
                await axios.put(
                    `http://localhost:8000/api/addresses/${currentAddressId}`,
                    addressData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                message.success("Address updated successfully!");
            } else {
                await axios.post(
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
            fetchAddresses();
        } catch (error) {
            console.error("Error saving address:", error);
            message.error(`Error ${editMode ? "updating" : "adding"} address`);
        }
    };

    const handleDelete = async (addressId) => {
        try {
            await axios.delete(
                `http://localhost:8000/api/addresses/${addressId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success("Address deleted successfully!");
            fetchAddresses();
        } catch (error) {
            console.error("Error deleting address:", error);
            message.error("Error deleting address");
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await axios.put(
                `http://localhost:8000/api/addresses/${addressId}/set-default`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success("Address set as default!");
            const updatedAddresses = await fetchAddresses();
            const defaultAddress = updatedAddresses.find(
                (addr) => addr.id === addressId
            );
            if (!defaultAddress) {
                message.error("Failed to retrieve the default address.");
            }
        } catch (error) {
            console.error("Error setting default address:", error);
            message.error("Error setting default address");
        }
    };

    const handleEdit = (address) => {
        setEditMode(true);
        setCurrentAddressId(address.id);
        setShowForm(true);
        form.setFieldsValue({
            street: address.street,
            barangay: address.barangay,
            city: address.city,
            province: address.state,
            postal_code: address.postal_code,
            country: address.country,
            phone: address.phone,
        });
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Navbar />
            <Layout>
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
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
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 20,
                                    }}
                                >
                                    <h1 style={{ margin: 0 }}>My Addresses</h1>
                                    <Button
                                        type="primary"
                                        style={{
                                            backgroundColor: "#ff4d4f",
                                            borderColor: "#ff4d4f",
                                        }}
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
                                            onClick={() =>
                                                setSelectedAddressId(address.id)
                                            }
                                            style={{
                                                borderBottom: "1px solid #ddd",
                                                padding: "10px 0",
                                                marginBottom: 10,
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                cursor: "pointer",
                                                backgroundColor:
                                                    selectedAddressId ===
                                                    address.id
                                                        ? "#e6f7ff" // Blue highlight when selected
                                                        : "transparent",
                                            }}
                                        >
                                            <div>
                                                <h3 style={{ margin: 0 }}>
                                                    {
                                                        address.profile
                                                            ?.first_name
                                                    }{" "}
                                                    {address.profile?.last_name}{" "}
                                                    |{" "}
                                                    {address.phone !== "000" &&
                                                        address.phone}
                                                </h3>
                                                <p style={{ margin: 0 }}>
                                                    {formatAddress(address)}
                                                </p>
                                                <div style={{ marginTop: 5 }}>
                                                    {Number(
                                                        address.is_default
                                                    ) === 1 && (
                                                        <span
                                                            style={{
                                                                color: "#ff4d4f",
                                                                marginRight: 10,
                                                            }}
                                                        >
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <Button
                                                    type="link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(address);
                                                    }}
                                                    style={{
                                                        padding: 0,
                                                        marginRight: 10,
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(
                                                            address.id
                                                        );
                                                    }}
                                                    style={{
                                                        padding: 0,
                                                        color: "#ff4d4f",
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                                {Number(address.is_default) !==
                                                    1 && (
                                                    <Button
                                                        type="default"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSetDefault(
                                                                address.id
                                                            );
                                                        }}
                                                        style={{
                                                            marginLeft: 10,
                                                        }}
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
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: 20,
                                    }}
                                >
                                    <h1 style={{ margin: 0 }}>
                                        {editMode
                                            ? "Edit Address"
                                            : "New Address"}
                                    </h1>
                                </div>
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
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your street details",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Street Name, Building, House No." />
                                    </Form.Item>
                                    <Form.Item
                                        label="Barangay"
                                        name="barangay"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your barangay",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Barangay" />
                                    </Form.Item>
                                    <Form.Item
                                        label="City"
                                        name="city"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your city",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="City" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Province"
                                        name="province"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your province",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Province" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Postal Code"
                                        name="postal_code"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your postal code",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Postal Code" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Country"
                                        name="country"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your country",
                                            },
                                        ]}
                                    >
                                        <Select placeholder="Select Country">
                                            <Option value="Philippines">
                                                Philippines
                                            </Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        label="Phone Number"
                                        name="phone"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your phone number",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Phone Number" />
                                    </Form.Item>
                                    <Form.Item label="Label As:">
                                        <Radio.Group
                                            name="label"
                                            defaultValue="Home"
                                        >
                                            <Radio value="Home">Home</Radio>
                                            <Radio value="Work">Work</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                    <Form.Item>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 10,
                                                justifyContent: "flex-end",
                                            }}
                                        >
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
                                                style={{
                                                    backgroundColor: "#ff4d4f",
                                                    borderColor: "#ff4d4f",
                                                }}
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
        </Layout>
    );
};

export default MyAddress;
