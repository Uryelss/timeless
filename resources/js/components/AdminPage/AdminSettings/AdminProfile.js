import React, { useState, useEffect, Component } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
    Layout,
    Card,
    Form,
    Input,
    Button,
    Select,
    Modal,
    Spin,
    message,
    ConfigProvider,
    Typography,
} from "antd";
import Sidebar from "../AdminSidebar/Sidebar";

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

// Error Boundary Component
class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 24 }}>
                    <h1>Something went wrong.</h1>
                    <p>{this.state.error?.message || "Unknown error"}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

const AdminProfile = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formValues, setFormValues] = useState({
        username: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        date_of_birth: "",
        gender: "",
        email: "",
        profile_image: null,
    });
    const [previewImage, setPreviewImage] = useState("");
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [passwordForm] = Form.useForm();
    const token = localStorage.getItem("token");

    // Fetch profile data
    const fetchProfile = async () => {
        if (!token) {
            message.error("No token found, please log in.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(
                "http://localhost:8000/api/admin/profile",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const formattedData = {
                ...res.data,
                email: res.data.email || "",
                date_of_birth: res.data.date_of_birth
                    ? dayjs(res.data.date_of_birth).format("YYYY-MM-DD")
                    : "",
                gender: res.data.gender
                    ? res.data.gender.charAt(0).toUpperCase() +
                      res.data.gender.slice(1).toLowerCase()
                    : "",
            };
            setProfileData(formattedData);
            setFormValues(formattedData);
            setPreviewImage(
                formattedData.profile_image
                    ? formattedData.profile_image + "?" + new Date().getTime()
                    : "http://localhost:8000/storage/profiles/default.png"
            );
        } catch (error) {
            console.error("Error fetching profile:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
            });
            message.error(
                `Failed to fetch profile: ${
                    error.response?.data?.message || error.message
                }`
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFormValues((prev) => ({ ...prev, profile_image: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleCancel = () => {
        setFormValues({ ...profileData });
        setPreviewImage(
            profileData?.profile_image
                ? profileData.profile_image + "?" + new Date().getTime()
                : "http://localhost:8000/storage/profiles/default.png"
        );
        setEditMode(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const optimisticData = { ...formValues };
        if (optimisticData.date_of_birth) {
            optimisticData.date_of_birth = dayjs(
                optimisticData.date_of_birth
            ).format("YYYY-MM-DD");
        }
        if (optimisticData.gender) {
            optimisticData.gender =
                optimisticData.gender.charAt(0).toUpperCase() +
                optimisticData.gender.slice(1).toLowerCase();
        }

        setProfileData(optimisticData);
        setEditMode(false);
        setPreviewImage(
            optimisticData.profile_image instanceof File
                ? URL.createObjectURL(optimisticData.profile_image)
                : optimisticData.profile_image
                ? optimisticData.profile_image + "?" + new Date().getTime()
                : "http://localhost:8000/storage/profiles/default.png"
        );

        try {
            const formData = new FormData();
            Object.keys(formValues).forEach((key) => {
                if (key !== "profile_image") {
                    formData.append(key, formValues[key] || "");
                }
            });
            if (formValues.profile_image instanceof File) {
                formData.append("profile_image", formValues.profile_image);
            }

            const res = await axios.post(
                "http://localhost:8000/api/admin/profile",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const updatedData = {
                ...res.data,
                date_of_birth: res.data.date_of_birth
                    ? dayjs(res.data.date_of_birth).format("YYYY-MM-DD")
                    : "",
                gender: res.data.gender
                    ? res.data.gender.charAt(0).toUpperCase() +
                      res.data.gender.slice(1).toLowerCase()
                    : "",
            };
            setProfileData(updatedData);
            setFormValues(updatedData);
            setPreviewImage(
                updatedData.profile_image
                    ? updatedData.profile_image + "?" + new Date().getTime()
                    : "http://localhost:8000/storage/profiles/default.png"
            );
            window.dispatchEvent(
                new CustomEvent("profileUpdated", { detail: updatedData })
            );
            message.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error.response?.data);
            message.error(
                `Update failed: ${
                    error.response?.data?.message || error.message
                }`
            );
            fetchProfile();
        }
    };

    const showPasswordModal = () => {
        setIsPasswordModalVisible(true);
    };

    const handlePasswordSubmit = async (values) => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/admin/password",
                {
                    current_password: values.current_password,
                    password: values.password,
                    password_confirmation: values.password_confirmation,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsPasswordModalVisible(false);
            passwordForm.resetFields();
            message.success(res.data.message);
        } catch (error) {
            console.error("Error updating password:", error.response?.data);
            message.error(
                error.response?.data?.message || "Failed to update password"
            );
        }
    };

    const handlePasswordCancel = () => {
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
    };

    return (
        <ConfigProvider>
            <ErrorBoundary>
                {loading ? (
                    <Layout
                        style={{
                            minHeight: "100vh",
                            background: "#f0f2f5",
                        }}
                    >
                        <Sider width={256} style={{ minHeight: "100vh" }}>
                            <Sidebar
                                collapsed={collapsed}
                                setCollapsed={setCollapsed}
                            />
                        </Sider>
                        <Layout>
                            <Header
                                style={{
                                    background: "#fff",
                                    padding: "0 24px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Title level={3} style={{ margin: 0 }}>
                                    Admin Profile
                                </Title>
                            </Header>
                            <Content
                                style={{
                                    margin: "24px 16px",
                                    padding: 24,
                                    background: "#fff",
                                    borderRadius: 8,
                                }}
                            >
                                <Spin tip="Loading profile..." />
                            </Content>
                        </Layout>
                    </Layout>
                ) : !profileData ? (
                    <Layout
                        style={{
                            minHeight: "100vh",
                            background: "#f0f2f5",
                        }}
                    >
                        <Sider width={256} style={{ minHeight: "100vh" }}>
                            <Sidebar
                                collapsed={collapsed}
                                setCollapsed={setCollapsed}
                            />
                        </Sider>
                        <Layout>
                            <Header
                                style={{
                                    background: "#fff",
                                    padding: "0 24px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Title level={3} style={{ margin: 0 }}>
                                    Admin Profile
                                </Title>
                            </Header>
                            <Content
                                style={{
                                    margin: "24px 16px",
                                    padding: 24,
                                    background: "#fff",
                                    borderRadius: 8,
                                }}
                            >
                                <p>
                                    Unable to load profile. Please try again
                                    later.
                                </p>
                            </Content>
                        </Layout>
                    </Layout>
                ) : (
                    <Layout
                        style={{
                            minHeight: "100vh",
                            background: "#f0f2f5",
                        }}
                    >
                        <Sider width={256} style={{ minHeight: "100vh" }}>
                            <Sidebar
                                collapsed={collapsed}
                                setCollapsed={setCollapsed}
                            />
                        </Sider>
                        <Layout>
                            <Header
                                style={{
                                    background: "#fff",
                                    padding: "0 24px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Title level={3} style={{ margin: 0 }}>
                                    Admin Profile
                                </Title>
                            </Header>
                            <Content
                                style={{
                                    margin: "24px 16px",
                                    padding: 24,
                                    background: "#fff",
                                    borderRadius: 8,
                                }}
                            >
                                <Card
                                    title="Profile Details"
                                    bordered={false}
                                    style={{ marginBottom: 24 }}
                                >
                                    <div
                                        style={{
                                            textAlign: "center",
                                            marginBottom: 20,
                                        }}
                                    >
                                        <img
                                            key={previewImage}
                                            src={previewImage}
                                            alt="Profile"
                                            style={{
                                                width: "120px",
                                                height: "120px",
                                                objectFit: "cover",
                                                borderRadius: "50%",
                                            }}
                                        />
                                        <h2>{profileData.username}</h2>
                                        {!editMode && (
                                            <div>
                                                <Button
                                                    style={{
                                                        marginRight: 10,
                                                        backgroundColor:
                                                            "#0066cc",
                                                        color: "#fff",
                                                    }}
                                                    onClick={handleEdit}
                                                >
                                                    Edit Profile
                                                </Button>
                                                <Button
                                                    style={{
                                                        backgroundColor:
                                                            "#0066cc",
                                                        color: "#fff",
                                                    }}
                                                    onClick={showPasswordModal}
                                                >
                                                    Change Password
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        style={{ width: "100%" }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 15,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <label>Username:</label>
                                                <Input
                                                    name="username"
                                                    value={formValues.username}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: 4,
                                                    }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label>Email:</label>
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    value={formValues.email}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: 4,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 15,
                                                flexWrap: "wrap",
                                                marginTop: 15,
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <label>First Name:</label>
                                                <Input
                                                    name="first_name"
                                                    value={
                                                        formValues.first_name
                                                    }
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: 4,
                                                    }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label>Middle Name:</label>
                                                <Input
                                                    name="middle_name"
                                                    value={
                                                        formValues.middle_name
                                                    }
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: 4,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 15,
                                                flexWrap: "wrap",
                                                marginTop: 15,
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <label>Last Name:</label>
                                                <Input
                                                    name="last_name"
                                                    value={formValues.last_name}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: 4,
                                                    }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label>Suffix:</label>
                                                <Select
                                                    name="suffix"
                                                    value={formValues.suffix}
                                                    onChange={(value) =>
                                                        setFormValues(
                                                            (prev) => ({
                                                                ...prev,
                                                                suffix: value,
                                                            })
                                                        )
                                                    }
                                                    disabled={!editMode}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: 4,
                                                    }}
                                                >
                                                    <Select.Option value="">
                                                        None
                                                    </Select.Option>
                                                    <Select.Option value="Jr.">
                                                        Jr.
                                                    </Select.Option>
                                                    <Select.Option value="Sr.">
                                                        Sr.
                                                    </Select.Option>
                                                    <Select.Option value="II">
                                                        II
                                                    </Select.Option>
                                                    <Select.Option value="III">
                                                        III
                                                    </Select.Option>
                                                </Select>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 15,
                                                flexWrap: "wrap",
                                                marginTop: 15,
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <label>Date of Birth:</label>
                                                <Input
                                                    type="date"
                                                    name="date_of_birth"
                                                    value={
                                                        formValues.date_of_birth
                                                    }
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: 4,
                                                    }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label>Gender:</label>
                                                <Select
                                                    name="gender"
                                                    value={
                                                        formValues.gender ||
                                                        "Select Gender"
                                                    }
                                                    onChange={(value) =>
                                                        setFormValues(
                                                            (prev) => ({
                                                                ...prev,
                                                                gender: value,
                                                            })
                                                        )
                                                    }
                                                    disabled={!editMode}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: 4,
                                                    }}
                                                >
                                                    <Select.Option value="Select Gender">
                                                        Select Gender
                                                    </Select.Option>
                                                    <Select.Option value="Male">
                                                        Male
                                                    </Select.Option>
                                                    <Select.Option value="Female">
                                                        Female
                                                    </Select.Option>
                                                </Select>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 15,
                                                flexWrap: "wrap",
                                                marginTop: 15,
                                            }}
                                        >
                                            <div style={{ flex: 2 }}>
                                                <label>Profile Image:</label>
                                                <Input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    disabled={!editMode}
                                                    style={{
                                                        width: "100%",
                                                        padding: 5,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {editMode && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    justifyContent: "center",
                                                    marginTop: 15,
                                                    width: "100%",
                                                }}
                                            >
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    style={{
                                                        backgroundColor:
                                                            "#4caf50",
                                                        borderColor: "#4caf50",
                                                    }}
                                                >
                                                    Save Changes
                                                </Button>
                                                <Button
                                                    style={{
                                                        backgroundColor:
                                                            "#ff4444",
                                                        borderColor: "#ff4444",
                                                        color: "#fff",
                                                    }}
                                                    onClick={handleCancel}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                </Card>
                            </Content>
                            <Footer
                                style={{
                                    textAlign: "center",
                                    background: "#f0f2f5",
                                }}
                            >
                                TIMELESS ADMIN ©{new Date().getFullYear()}
                            </Footer>
                        </Layout>
                    </Layout>
                )}
                <Modal
                    title="Change Password"
                    open={isPasswordModalVisible}
                    onCancel={handlePasswordCancel}
                    footer={null}
                >
                    <Form
                        form={passwordForm}
                        onFinish={handlePasswordSubmit}
                        layout="vertical"
                    >
                        <Form.Item
                            name="current_password"
                            label="Current Password"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Please enter your current password",
                                },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label="New Password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your new password",
                                },
                                {
                                    min: 8,
                                    message:
                                        "Password must be at least 8 characters",
                                },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            name="password_confirmation"
                            label="Confirm New Password"
                            dependencies={["password"]}
                            rules={[
                                {
                                    required: true,
                                    message: "Please confirm your new password",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (
                                            !value ||
                                            getFieldValue("password") === value
                                        ) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error("Passwords do not match")
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ marginRight: 10 }}
                            >
                                Submit
                            </Button>
                            <Button onClick={handlePasswordCancel}>
                                Cancel
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </ErrorBoundary>
        </ConfigProvider>
    );
};

export default AdminProfile;
