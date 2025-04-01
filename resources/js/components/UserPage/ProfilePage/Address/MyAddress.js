import React, { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Button, Form, Input, Select, Radio, message } from "antd";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";

const { Content } = Layout;
const { Option } = Select;

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
    const [collapsed, setCollapsed] = useState(false);
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
        // Trim all string values to remove leading/trailing whitespace
        const addressData = {
            street: values.street?.trim() || "",
            city: values.city?.trim() || "",
            state: values.province?.trim() || "",
            barangay: values.barangay?.trim() || "",
            postal_code: values.postal_code?.trim() || "",
            country: values.country?.trim() || "",
            phone: values.phone?.trim() || "",
            label: values.label?.trim() || "Home", // Include label in the data
        };

        // Check if any required field is empty after trimming
        const requiredFields = [
            "street",
            "city",
            "state",
            "barangay",
            "postal_code",
            "country",
            "phone",
        ];
        const emptyFields = requiredFields.filter(
            (field) => !addressData[field]
        );
        if (emptyFields.length > 0) {
            message.error("Please fill in all required fields");
            return;
        }

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
            street: address.street?.trim() || "",
            barangay: address.barangay?.trim() || "",
            city: address.city?.trim() || "",
            province: address.state?.trim() || "",
            postal_code: address.postal_code?.trim() || "",
            country: address.country?.trim() || "",
            phone: address.phone?.trim() || "",
            label: address.label || "Home",
        });
    };

    // Custom validator to check for whitespace-only input
    const noWhitespaceValidator = (_, value) => {
        if (value && !value.trim()) {
            return Promise.reject(new Error("Input cannot be just whitespace"));
        }
        return Promise.resolve();
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
                                            backgroundColor: "#000000",
                                            borderInline: "#ff4d4f",
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
                                                        ? "#e6f7ff"
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
                                                                color: "#000000",
                                                                marginRight: 10,
                                                                fontWeight:
                                                                    "bold",
                                                            }}
                                                        >
                                                            Default
                                                        </span>
                                                    )}
                                                    {Number(
                                                        address.is_default
                                                    ) !== 1 && (
                                                        <Button
                                                            type="default"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSetDefault(
                                                                    address.id
                                                                );
                                                            }}
                                                            style={{
                                                                width: "100px",
                                                            }}
                                                        >
                                                            Set as default
                                                        </Button>
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
                                    initialValues={{
                                        country: "Philippines",
                                        label: "Home",
                                    }}
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
                                            {
                                                validator:
                                                    noWhitespaceValidator,
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
                                            {
                                                validator:
                                                    noWhitespaceValidator,
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
                                            {
                                                validator:
                                                    noWhitespaceValidator,
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
                                            {
                                                validator:
                                                    noWhitespaceValidator,
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
                                            {
                                                validator:
                                                    noWhitespaceValidator,
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
                                            {
                                                validator:
                                                    noWhitespaceValidator,
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
                                            {
                                                validator:
                                                    noWhitespaceValidator,
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Phone Number" />
                                    </Form.Item>
                                    <Form.Item label="Label As" name="label">
                                        <Radio.Group>
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
                                                style={{
                                                    width: "131.8px",
                                                    height: "32px",
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                style={{
                                                    backgroundColor: "#000000",
                                                    borderInline: "#000000",
                                                    width: "120.8px",
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
