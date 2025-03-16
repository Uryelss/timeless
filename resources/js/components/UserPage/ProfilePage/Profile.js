import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Layout, Menu, Button, Modal, Form, Input, Select, message, Tabs, Input as AntInput } from "antd";
import Navbar from "../Navbar/Navbar";

const { Sider, Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = AntInput;

const UserProfile = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState("1"); // Default to "PROFILE"
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [formValues, setFormValues] = useState({
        username: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        date_of_birth: "",
        gender: "",
        profile_image: null,
    });
    const [previewImage, setPreviewImage] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [isAddAddressModalVisible, setIsAddAddressModalVisible] = useState(false);
    const [newAddressForm] = Form.useForm();
    const token = localStorage.getItem("token");

    const fetchProfile = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const formattedData = { ...res.data };
            if (formattedData.date_of_birth) {
                formattedData.date_of_birth = dayjs(formattedData.date_of_birth).format("YYYY-MM-DD");
            }
            if (formattedData.gender) {
                formattedData.gender = formattedData.gender.charAt(0).toUpperCase() + formattedData.gender.slice(1).toLowerCase();
            }
            setProfileData(formattedData);
            setFormValues({ ...formattedData });
            setPreviewImage(
                formattedData.profile_image
                    ? `http://localhost:8000/storage/${formattedData.profile_image}?${new Date().getTime()}`
                    : "http://localhost:8000/storage/profiles/tennis-racket.png"
            );
        } catch (error) {
            console.error("Error fetching profile:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            message.error(`Error fetching profile: ${error.response?.data?.message || error.message}`);
        }
    };

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

    const fetchOrders = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error("Error fetching orders");
        }
    };

    useEffect(() => {
        if (token) {
            fetchProfile();
            fetchAddresses();
            fetchOrders();
        } else {
            message.warning("No token found, please log in.");
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log("Selected file:", file);
            setFormValues((prev) => ({ ...prev, profile_image: file }));
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleCancel = () => {
        setFormValues({ ...profileData });
        setPreviewImage(
            profileData.profile_image
                ? `http://localhost:8000/storage/${profileData.profile_image}?${new Date().getTime()}`
                : "http://localhost:8000/storage/profiles/tennis-racket.png"
        );
        setEditMode(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const optimisticData = { ...formValues };
        if (optimisticData.date_of_birth) {
            optimisticData.date_of_birth = dayjs(optimisticData.date_of_birth).format("YYYY-MM-DD");
        }
        if (optimisticData.gender) {
            optimisticData.gender = optimisticData.gender.charAt(0).toUpperCase() + optimisticData.gender.slice(1).toLowerCase();
        }

        setProfileData(optimisticData);
        setEditMode(false);
        setPreviewImage(
            optimisticData.profile_image instanceof File
                ? URL.createObjectURL(optimisticData.profile_image)
                : optimisticData.profile_image
                ? `http://localhost:8000/storage/${optimisticData.profile_image}?${new Date().getTime()}`
                : "http://localhost:8000/storage/profiles/tennis-racket.png"
        );

        try {
            const formData = new FormData();
            Object.keys(formValues).forEach((key) => {
                if (key === "profile_image") {
                    if (formValues.profile_image instanceof File) {
                        formData.append(key, formValues.profile_image);
                    }
                } else {
                    formData.append(key, formValues[key] || "");
                }
            });
            console.log("Form data sent:", Object.fromEntries(formData));

            const res = await axios.post(
                "http://localhost:8000/api/profile",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log("Update Response:", res.data);

            if (res.data) {
                const updatedData = { ...res.data };
                if (updatedData.date_of_birth) {
                    updatedData.date_of_birth = dayjs(updatedData.date_of_birth).format("YYYY-MM-DD");
                }
                if (updatedData.gender) {
                    updatedData.gender = updatedData.gender.charAt(0).toUpperCase() + updatedData.gender.slice(1).toLowerCase();
                }
                setProfileData(updatedData);
                setFormValues(updatedData);
                setPreviewImage(
                    updatedData.profile_image
                        ? `http://localhost:8000/storage/${updatedData.profile_image}?${new Date().getTime()}`
                        : "http://localhost:8000/storage/profiles/tennis-racket.png"
                );
                window.dispatchEvent(new CustomEvent("profileUpdated", { detail: updatedData }));
            }
            message.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            message.error(`Update failed: ${error.response?.data?.message || error.message}`);
            fetchProfile();
        }
    };

    const handleAddAddress = () => {
        setIsAddAddressModalVisible(true);
    };

    const handleAddAddressSubmit = async (values) => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/addresses",
                {
                    full_name: values.fullName,
                    phone: values.phoneNumber,
                    region: values.region,
                    postal_code: values.postalCode,
                    street: values.street,
                    label: values.label,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAddresses([...addresses, res.data]);
            setIsAddAddressModalVisible(false);
            newAddressForm.resetFields();
            message.success("Address added successfully!");
        } catch (error) {
            console.error("Error adding address:", error);
            message.error("Failed to add address");
        }
    };

    const handleEditAddress = (address) => {
        console.log("Edit address:", address);
    };

    const handleDeleteAddress = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/addresses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAddresses(addresses.filter((addr) => addr.id !== id));
            message.success("Address deleted successfully!");
        } catch (error) {
            console.error("Error deleting address:", error);
            message.error("Failed to delete address");
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await axios.put(
                `http://localhost:8000/api/addresses/${id}/set-default`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedAddresses = addresses.map((addr) =>
                addr.id === id ? { ...addr, is_default: true } : { ...addr, is_default: false }
            );
            setAddresses(updatedAddresses);
            message.success("Default address updated!");
        } catch (error) {
            console.error("Error setting default address:", error);
            message.error("Failed to set default address");
        }
    };

    const handleContactSeller = (orderId) => {
        console.log("Contact seller for order:", orderId);
    };

    const filteredOrders = orders.filter((order) => {
        const lowerSearch = searchText.toLowerCase();
        const matchesStatus =
            activeTab === "all" ||
            order.order_status.toLowerCase() === activeTab.replace("-", " ");
        const matchesSearch =
            order.id.toString().includes(lowerSearch) ||
            order.seller_name.toLowerCase().includes(lowerSearch) ||
            order.products.some((p) =>
                p.product_name.toLowerCase().includes(lowerSearch)
            );
        return matchesStatus && matchesSearch;
    });

    if (!profileData) {
        return <p>Loading...</p>;
    }

    const items = [
        { key: "1", label: "PROFILE" },
        { key: "2", label: "MY PURCHASE" },
        { key: "3", label: "ADDRESSES" },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Navbar />
            <Layout>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    trigger={null}
                    style={{
                        background: "#fff",
                        height: "80vh",
                        width: collapsed ? "80px" : "200px",
                        transition: "width 0.2s",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        <Menu
                            theme="light"
                            defaultSelectedKeys={["1"]}
                            mode="inline"
                            items={items}
                            style={{ height: "100%", borderRight: 0, paddingTop: "20px" }}
                            onClick={({ key }) => setActiveMenu(key)}
                        />
                        <div
                            style={{
                                textAlign: "center",
                                padding: "10px 0",
                                background: collapsed ? "transparent" : "#001529",
                                color: "#fff",
                                cursor: "pointer",
                            }}
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            {collapsed ? ">" : "<"}
                        </div>
                    </div>
                </Sider>

                <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
                    <div style={{ padding: 24, minHeight: 360, background: "#fff", borderRadius: 8 }}>
                        {activeMenu === "1" && (
                            <div>
                                <div style={{ textAlign: "center", marginBottom: 20 }}>
                                    <img
                                        key={previewImage}
                                        src={previewImage}
                                        alt="Profile"
                                        style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%" }}
                                    />
                                    <h2>{profileData.username}</h2>
                                    {!editMode && (
                                        <button
                                            style={{ padding: "8px 16px", backgroundColor: "#0066cc", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                                            onClick={handleEdit}
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                                    <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Username:</label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formValues.username}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4 }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginTop: 15 }}>
                                        <div style={{ flex: 1 }}>
                                            <label>First Name:</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formValues.first_name}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4 }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Middle Name:</label>
                                            <input
                                                type="text"
                                                name="middle_name"
                                                value={formValues.middle_name}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4 }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginTop: 15 }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Last Name:</label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formValues.last_name}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4 }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Suffix:</label>
                                            <select
                                                name="suffix"
                                                value={formValues.suffix}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4 }}
                                            >
                                                <option value="">None</option>
                                                <option value="Jr.">Jr.</option>
                                                <option value="Sr.">Sr.</option>
                                                <option value="II">II</option>
                                                <option value="III">III</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginTop: 15 }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Date of Birth:</label>
                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={formValues.date_of_birth}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4 }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Gender:</label>
                                            <select
                                                name="gender"
                                                value={formValues.gender || "Select Gender"}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4 }}
                                            >
                                                <option value="Select Gender">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginTop: 15 }}>
                                        <div style={{ flex: 2 }}>
                                            <label>Profile Image:</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                disabled={!editMode}
                                                style={{ width: "100%", padding: 5 }}
                                            />
                                        </div>
                                    </div>

                                    {editMode && (
                                        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 15, width: "100%" }}>
                                            <button
                                                type="submit"
                                                style={{ padding: "8px 16px", backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                style={{ padding: "8px 16px", backgroundColor: "#ff4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {activeMenu === "3" && (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                    <h2>My Addresses</h2>
                                    <Button type="primary" danger onClick={handleAddAddress}>
                                        + Add New Address
                                    </Button>
                                </div>
                                {addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        style={{
                                            padding: "16px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            marginBottom: "16px",
                                            position: "relative",
                                        }}
                                    >
                                        <div>
                                            <h3>
                                                {address.full_name} (+{address.phone})
                                            </h3>
                                            <p>{address.street}</p>
                                            <p>
                                                {address.region}, {address.postal_code}
                                            </p>
                                            {address.is_default && <span style={{ color: "#ff4444", marginRight: "10px" }}>Default</span>}
                                            <span style={{ color: "#1890ff", cursor: "pointer", marginRight: "10px" }} onClick={() => handleEditAddress(address)}>
                                                Edit
                                            </span>
                                            <span style={{ color: "#1890ff", cursor: "pointer", marginRight: "10px" }} onClick={() => handleDeleteAddress(address.id)}>
                                                Delete
                                            </span>
                                            {!address.is_default && (
                                                <span
                                                    style={{ color: "#1890ff", cursor: "pointer" }}
                                                    onClick={() => handleSetDefault(address.id)}
                                                >
                                                    Set as default
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ marginTop: "10px" }}>
                                            <Button type="link" disabled={address.is_default}>
                                                Pickup Address
                                            </Button>
                                            <Button type="link">Return Address</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeMenu === "2" && (
                            <div>
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                    tabBarStyle={{ marginBottom: "20px" }}
                                >
                                    <TabPane tab="All" key="all"></TabPane>
                                    <TabPane tab="To Pay" key="to-pay"></TabPane>
                                    <TabPane tab="To Ship" key="to-ship"></TabPane>
                                    <TabPane tab="To Receive (1)" key="to-receive"></TabPane>
                                    <TabPane tab="Completed" key="completed"></TabPane>
                                    <TabPane tab="Cancelled" key="cancelled"></TabPane>
                                    <TabPane tab="Return Refund" key="return-refund"></TabPane>
                                </Tabs>
                                <Search
                                    placeholder="You can search by Seller Name, Order ID or Product name"
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{ width: "100%", marginBottom: "20px" }}
                                />
                                {filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        style={{
                                            padding: "16px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            marginBottom: "16px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <img
                                                src={order.products[0]?.main_image || "https://via.placeholder.com/50"}
                                                alt={order.products[0]?.product_name}
                                                style={{ width: "50px", height: "50px", marginRight: "10px" }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: "bold" }}>{order.seller_name}</div>
                                                <div>{order.products[0]?.product_name || "Unknown Product"} x{order.products[0]?.quantity || 1}</div>
                                                <div style={{ color: "#888" }}>₱{order.products[0]?.price || 0}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ color: order.order_status === "to-receive" ? "#00cc66" : "#ff4444" }}>
                                                {order.order_status === "to-receive" ? "Parcel has departed from sorting facility" : order.order_status.toUpperCase()}
                                            </div>
                                            <div>Order Total: ₱{order.total_amount || 0}</div>
                                            <Button type="primary" danger onClick={() => handleContactSeller(order.id)}>
                                                Contact Seller
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <p style={{ color: "#888", marginTop: "10px" }}>Confirm receipt after you've checked the received items and made payment</p>
                            </div>
                        )}

                        <Modal
                            title="New Address"
                            visible={isAddAddressModalVisible}
                            onCancel={() => setIsAddAddressModalVisible(false)}
                            footer={null}
                        >
                            <Form
                                form={newAddressForm}
                                name="new_address"
                                onFinish={handleAddAddressSubmit}
                                layout="vertical"
                            >
                                <Form.Item
                                    name="fullName"
                                    label="Full Name"
                                    rules={[{ required: true, message: "Please enter full name" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="phoneNumber"
                                    label="Phone Number"
                                    rules={[{ required: true, message: "Please enter phone number" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="region"
                                    label="Region, Province, City, Barangay"
                                    rules={[{ required: true, message: "Please enter region" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="postalCode"
                                    label="Postal Code"
                                    rules={[{ required: true, message: "Please enter postal code" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="street"
                                    label="Street Name, Building, House No."
                                    rules={[{ required: true, message: "Please enter street" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item name="label" label="Label As:">
                                    <Select>
                                        <Option value="Home">Home</Option>
                                        <Option value="Work">Work</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ backgroundColor: "#ff4444", borderColor: "#ff4444" }}>
                                        Submit
                                    </Button>
                                    <Button onClick={() => setIsAddAddressModalVisible(false)} style={{ marginLeft: "10px" }}>
                                        Cancel
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Modal>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default UserProfile;