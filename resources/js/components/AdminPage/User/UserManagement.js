import React, { useState, useEffect } from "react";
import {
    Layout,
    Table,
    Space,
    Button,
    Modal,
    Input,
    Checkbox,
    Form,
    Select,
    message,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    UndoOutlined,
    FolderOpenOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [archivedUsers, setArchivedUsers] = useState([]);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [openAddEditModal, setOpenAddEditModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    // API endpoint for users
    const API_URL = "http://localhost:8000/api/users";

    // Fetch active users with role relationship
    const fetchUsers = () => {
        axios
            .get(API_URL, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                console.log("Fetched users:", res.data);
                setUsers(res.data);
            })
            .catch((err) => {
                message.error("Error fetching users");
                console.error(err);
            });
    };

    // Fetch archived users
    const fetchArchivedUsers = () => {
        axios
            .get(`${API_URL}?archived=1`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                console.log("Fetched archived users:", res.data);
                setArchivedUsers(res.data);
            })
            .catch((err) => {
                message.error("Error fetching archived users");
                console.error(err);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (openArchiveModal) {
            fetchArchivedUsers();
        }
    }, [openArchiveModal]);

    // Table columns for active users
    // Table columns for active users
    const mainColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Checkbox />
                    <EditOutlined
                        onClick={() => handleEdit(record)}
                        style={{ fontSize: "16px" }}
                    />
                    <DeleteOutlined
                        onClick={() => handleArchive(record)}
                        style={{ fontSize: "16px" }}
                    />
                </Space>
            ),
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Role",
            key: "role",
            render: (record) =>
                record.role ? record.role.name : record.role_id,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Date Added",
            dataIndex: "created_at",
            key: "created_at",
        },
        {
            title: "Last Updated",
            dataIndex: "updated_at",
            key: "updated_at",
        },
    ];

    // Archive table columns – similar to main, but with only restore action.
    const archiveColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Button type="link" onClick={() => handleRestore(record.id)}>
                    <UndoOutlined style={{ fontSize: "18px" }} />
                </Button>
            ),
        },
        ...mainColumns.slice(1),
    ];

    // Handle edit action: open modal and prefill form with record data.
    const handleEdit = (record) => {
        console.log("Edit user:", record);
        setEditingUser(record);
        form.setFieldsValue({
            username: record.username,
            email: record.email,
            role_id: record.role ? record.role.id : "",
            status: record.status,
        });
        setOpenAddEditModal(true);
    };

    // Handle archive (soft delete) action.
    const handleArchive = (record) => {
        Modal.confirm({
            title: "Are you sure you want to archive this user?",
            onOk: () => {
                axios
                    .delete(`${API_URL}/${record.id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    })
                    .then(() => {
                        message.success("User archived successfully");
                        fetchUsers();
                    })
                    .catch((err) => {
                        message.error("Failed to archive user");
                        console.error(err);
                    });
            },

            okButtonProps: {
                style: { width: "80px" }, // Adjust the width to match the Cancel button
            },
            cancelText: "Cancel",
            cancelButtonProps: {
                style: { width: "80px" }, // Adjust the width to match the OK button
            },
        });
    };

    // Handle restore action.
    const handleRestore = (id) => {
        axios
            .post(
                `${API_URL}/${id}/restore`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                message.success("User restored successfully");
                fetchArchivedUsers();
                fetchUsers();
            })
            .catch((err) => {
                message.error("Failed to restore user");
                console.error(err);
            });
    };

    // Bulk archive handler (if needed)
    const handleArchiveAll = () => {
        Modal.confirm({
            title: "Are you sure you want to archive all selected users?",
            onOk: () => {
                message.success("Bulk archive executed (not implemented)");
            },
        });
    };

    // Handle adding a new user (opens the add modal)
    const handleAdd = () => {
        form.resetFields();
        setEditingUser(null);
        setOpenAddEditModal(true);
    };

    // Handle save (for both add and edit)
    const handleSave = () => {
        form.validateFields()
            .then((values) => {
                if (editingUser) {
                    // Update existing user
                    axios
                        .put(`${API_URL}/${editingUser.id}`, values, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        })
                        .then(() => {
                            message.success("User updated successfully");
                            setOpenAddEditModal(false);
                            setEditingUser(null);
                            fetchUsers();
                        })
                        .catch((err) => {
                            message.error("Failed to update user");
                            console.error(err);
                        });
                } else {
                    // Add new user
                    axios
                        .post(API_URL, values, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        })
                        .then(() => {
                            message.success("User added successfully");
                            setOpenAddEditModal(false);
                            fetchUsers();
                        })
                        .catch((err) => {
                            message.error("Failed to add user");
                            console.error(err);
                        });
                }
            })
            .catch((err) => {
                console.log("Validation Failed:", err);
            });
    };

    // Filter users based on search query.
    const filteredUsers = users.filter((user) => {
        const lower = searchQuery.toLowerCase();
        return (
            user.username.toLowerCase().includes(lower) ||
            user.email.toLowerCase().includes(lower) ||
            (user.role && user.role.name.toLowerCase().includes(lower)) ||
            user.status.toLowerCase().includes(lower)
        );
    });

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
                    USER MANAGEMENT
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        {/* Left side: Search input and Bulk Archive controls */}
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Search
                                placeholder="Search users"
                                onSearch={(value) => setSearchQuery(value)}
                                style={{ width: 300 }}
                            />
                            <Checkbox
                                onChange={(e) => setSelectAll(e.target.checked)}
                                style={{ marginLeft: 16 }}
                            >
                                Select All
                            </Checkbox>
                            {selectAll && (
                                <Button
                                    type="link"
                                    onClick={handleArchiveAll}
                                    style={{ marginLeft: 8 }}
                                    title="Archive All"
                                >
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />
                                </Button>
                            )}
                        </div>
                        {/* Right side: Add User and Archived View */}
                        <div
                            style={{
                                flexDirection: "column",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Button
                                type="default"
                                icon={<DeleteOutlined />}
                                onClick={() => setOpenArchiveModal(true)}
                                style={{
                                    marginRight: 8,
                                    width: "131px",
                                }}
                            >
                                Archived View
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                                style={{
                                    width: "131px",
                                    marginRight: 8,
                                    marginTop: "5px",
                                }}
                            >
                                Add User
                            </Button>
                        </div>
                    </div>
                    <Table
                        columns={mainColumns}
                        dataSource={filteredUsers}
                        rowKey="id"
                        scroll={{ x: 1200 }}
                    />
                </Content>
            </Layout>
            {/* Archived Users Modal */}
            <Modal
                title="Archived Users"
                centered
                open={openArchiveModal}
                onCancel={() => setOpenArchiveModal(false)}
                width={1200}
                footer={[]}
            >
                <Table
                    columns={archiveColumns}
                    dataSource={archivedUsers}
                    rowKey="id"
                    pagination={false}
                />
            </Modal>
            {/* Add/Edit User Modal */}
            <Modal
                title={editingUser ? "Edit User" : "Add User"}
                centered
                open={openAddEditModal}
                onCancel={() => {
                    setOpenAddEditModal(false);
                    setEditingUser(null);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setOpenAddEditModal(false);
                            setEditingUser(null);
                        }}
                        style={{ marginRight: 8, width: 100 }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        onClick={handleSave}
                        style={{ width: 100 }}
                    >
                        {editingUser ? "Update User" : "Add User"}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[
                            {
                                required: true,
                                message: "Please enter username",
                            },
                        ]}
                    >
                        <Input placeholder="Enter username" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Please enter email" },
                            {
                                type: "email",
                                message: "Please enter a valid email",
                            },
                        ]}
                    >
                        <Input placeholder="Enter email" />
                    </Form.Item>
                    <Form.Item
                        name="role_id"
                        label="Role"
                        rules={[
                            { required: true, message: "Please select a role" },
                        ]}
                    >
                        <Select placeholder="Select role">
                            <Option value={1}>Admin</Option>
                            <Option value={2}>User</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[
                            { required: true, message: "Please select status" },
                        ]}
                    >
                        <Select placeholder="Select status">
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Form.Item>
                    {/* Only show password input when adding a user */}
                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter password",
                                },
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </Layout>
    );
};

export default UserManagement;
