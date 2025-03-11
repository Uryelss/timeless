import React, { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Menu, Form, Input, Select, DatePicker, Upload, Button, Avatar, message } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import Header from "../Usercomponent/Header";

const { Content, Sider } = Layout;
const { Option } = Select;

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        username: "",
        email: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        date_of_birth: "",
        gender: "",
        profile_image: null,
    });

    const [form] = Form.useForm();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/user", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setUser(response.data);
            setProfileData({
                username: response.data.username || "",
                email: response.data.email || "",
                first_name: response.data.first_name || "",
                middle_name: response.data.middle_name || "",
                last_name: response.data.last_name || "",
                suffix: response.data.suffix || "",
                date_of_birth: response.data.date_of_birth ? moment(response.data.date_of_birth) : null,
                gender: response.data.gender || "",
                profile_image: response.data.profile_image || "/default-profile.png",
            });

            form.setFieldsValue({
                ...response.data,
                date_of_birth: response.data.date_of_birth ? moment(response.data.date_of_birth) : null,
            });
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const [previewImage, setPreviewImage] = useState(profileData.profile_image);

    useEffect(() => {
        setPreviewImage(profileData.profile_image);
    }, [profileData]);

    const handleFileChange = (info) => {
        const file = info.file.originFileObj;
        if (file) {
            setProfileData((prevState) => ({
                ...prevState,
                profile_image: file,
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();

            Object.keys(values).forEach((key) => {
                if (key !== "profile_image" && key !== "date_of_birth") {
                    formData.append(key, values[key]);
                }
            });

            if (values.date_of_birth) {
                formData.append("date_of_birth", moment(values.date_of_birth).format("YYYY-MM-DD"));
            }

            if (profileData.profile_image instanceof File) {
                formData.append("profile_image", profileData.profile_image);
            }

            await axios.post("http://localhost:8000/api/update-profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            message.success("Profile updated successfully!");
            setEditMode(false);
            fetchUserProfile();
        } catch (error) {
            console.error("Error updating profile:", error.response?.data);
            message.error("Complete the Required Fields");
        }
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <Layout>
            <Header />
            <Layout>
                <Sider width={200} className="site-layout-background">
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        style={{ height: '100%', borderRight: 0 }}
                    >
                        <Menu.Item key="1">PROFILE</Menu.Item>
                        <Menu.Item key="2">MY PURCHASE</Menu.Item>
                        <Menu.Item key="3">ADDRESSES</Menu.Item>
                    </Menu>
                </Sider>
                <Content style={{ padding: '24px', minHeight: '100vh' }}>
                    <div className="profile-content">
                        <div className="profile-header">
                            <Avatar src={previewImage} icon={<UserOutlined />} size={120} />
                            <h2>{user.username}</h2>
                            {editMode && ( // Show Upload button only in edit mode
                                <Form.Item name="profile_image">
                                    <Upload
                                        listType="picture"
                                        showUploadList={false}
                                        beforeUpload={() => false}
                                        onChange={handleFileChange}
                                    >
                                        <Button icon={<UploadOutlined />}>Upload Image</Button>
                                    </Upload>
                                </Form.Item>
                            )}
                        </div>

                        <Form
                            form={form}
                            onFinish={handleSubmit}
                            initialValues={profileData}
                        >
                            <Form.Item label="Username" name="username" rules={[{ required: true, message: "Username is required!" }]}>
                                <Input disabled={!editMode} />
                            </Form.Item>

                            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email is required!" }]}>
                                <Input disabled={!editMode} />
                            </Form.Item>

                            <Form.Item label="First Name" name="first_name">
                                <Input disabled={!editMode} />
                            </Form.Item>

                            <Form.Item label="Middle Name" name="middle_name">
                                <Input disabled={!editMode} />
                            </Form.Item>

                            <Form.Item label="Last Name" name="last_name">
                                <Input disabled={!editMode} />
                            </Form.Item>

                            <Form.Item label="Suffix" name="suffix">
                                <Select disabled={!editMode}>
                                    <Option value="">None</Option>
                                    <Option value="Jr.">Jr.</Option>
                                    <Option value="Sr.">Sr.</Option>
                                    <Option value="II">II</Option>
                                    <Option value="III">III</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item label="Date of Birth" name="date_of_birth">
                                <DatePicker format="YYYY-MM-DD" disabled={!editMode} />
                            </Form.Item>

                            <Form.Item label="Gender" name="gender">
                                <Select disabled={!editMode}>
                                    <Option value="">Select Gender</Option>
                                    <Option value="Male">Male</Option>
                                    <Option value="Female">Female</Option>
                                </Select>
                            </Form.Item>

                            {editMode ? (
                                <>
                                    <Button type="primary" htmlType="submit">Save Changes</Button>
                                    <Button style={{ marginLeft: '8px' }} onClick={() => setEditMode(false)}>Cancel</Button>
                                </>
                            ) : (
                                <Button type="primary" onClick={handleEdit}>Edit Profile</Button>
                            )}
                        </Form>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default UserProfile;
