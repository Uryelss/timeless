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
    const [selectAllActive, setSelectAllActive] = useState(false);
    const [selectedActiveUsers, setSelectedActiveUsers] = useState([]);
    const [selectAllArchived, setSelectAllArchived] = useState(false);
    const [selectedArchivedUsers, setSelectedArchivedUsers] = useState([]);
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
                setUsers(
                    res.data.map((user) => ({ ...user, selected: false }))
                );
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
                setArchivedUsers(
                    res.data.map((user) => ({ ...user, selected: false }))
                );
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

    // Checkbox handling for active users
    const handleActiveCheckboxChange = (userId) => {
        const updatedUsers = users.map((user) =>
            user.id === userId ? { ...user, selected: !user.selected } : user
        );
        setUsers(updatedUsers);
        setSelectedActiveUsers(
            updatedUsers.filter((u) => u.selected).map((u) => u.id)
        );
        const allSelected = updatedUsers.every((u) => u.selected);
        setSelectAllActive(allSelected);
    };

    // Select All checkbox handling for active users
    const handleSelectAllActiveChange = (e) => {
        const checked = e.target.checked;
        setSelectAllActive(checked);
        const updatedUsers = users.map((user) => ({
            ...user,
            selected: checked,
        }));
        setUsers(updatedUsers);
        setSelectedActiveUsers(checked ? updatedUsers.map((u) => u.id) : []);
    };

    // Checkbox handling for archived users
    const handleArchivedCheckboxChange = (userId) => {
        const updatedArchived = archivedUsers.map((user) =>
            user.id === userId ? { ...user, selected: !user.selected } : user
        );
        setArchivedUsers(updatedArchived);
        setSelectedArchivedUsers(
            updatedArchived.filter((u) => u.selected).map((u) => u.id)
        );
        const allSelected = updatedArchived.every((u) => u.selected);
        setSelectAllArchived(allSelected);
    };

    // Select All checkbox handling for archived users
    const handleSelectAllArchivedChange = (e) => {
        const checked = e.target.checked;
        setSelectAllArchived(checked);
        const updatedArchived = archivedUsers.map((user) => ({
            ...user,
            selected: checked,
        }));
        setArchivedUsers(updatedArchived);
        setSelectedArchivedUsers(
            checked ? updatedArchived.map((u) => u.id) : []
        );
    };

    // Table columns for active users
    const mainColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Checkbox
                        checked={record.selected}
                        onChange={() => handleActiveCheckboxChange(record.id)}
                    />
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

    // Archive table columns
    const archiveColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Checkbox
                        checked={record.selected}
                        onChange={() => handleArchivedCheckboxChange(record.id)}
                    />
                    <Button
                        type="link"
                        onClick={() => handleRestore(record.id)}
                    >
                        <UndoOutlined style={{ fontSize: "18px" }} />
                    </Button>
                </Space>
            ),
        },
        ...mainColumns.slice(1),
    ];

    // Handle edit action
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

    // Handle archive action
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
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Handle restore action
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

    // Bulk archive handler for active users
    const handleArchiveAll = () => {
        if (selectedActiveUsers.length === 0) {
            message.warning("Please select at least one user to archive");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedActiveUsers.length} selected user(s)?`,
            onOk: () => {
                Promise.all(
                    selectedActiveUsers.map((id) =>
                        axios.delete(`${API_URL}/${id}`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        })
                    )
                )
                    .then(() => {
                        message.success("Selected users archived successfully");
                        fetchUsers();
                        setSelectedActiveUsers([]);
                        setSelectAllActive(false);
                    })
                    .catch((err) =>
                        message.error("Failed to archive some users")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Bulk restore handler for archived users
    const handleRestoreAll = () => {
        if (selectedArchivedUsers.length === 0) {
            message.warning("Please select at least one user to restore");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to restore ${selectedArchivedUsers.length} selected user(s)?`,
            onOk: () => {
                Promise.all(
                    selectedArchivedUsers.map((id) =>
                        axios.post(
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
                    )
                )
                    .then(() => {
                        message.success("Selected users restored successfully");
                        fetchArchivedUsers();
                        fetchUsers();
                        setSelectedArchivedUsers([]);
                        setSelectAllArchived(false);
                    })
                    .catch((err) =>
                        message.error("Failed to restore some users")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Handle adding a new user
    const handleAdd = () => {
        form.resetFields();
        setEditingUser(null);
        setOpenAddEditModal(true);
    };

    // Handle save (add or edit)
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

    // Filter users based on search query
    const filteredUsers = users.filter((user) => {
        const lower = searchQuery.toLowerCase();
        return (
            user.username.toLowerCase().includes(lower) ||
            user.email.toLowerCase().includes(lower) ||
            (user.role && user.role.name.toLowerCase().includes(lower)) ||
            user.status.toLowerCase().includes(lower)
        );
    });

    // Filter archived users based on search query
    const filteredArchivedUsers = archivedUsers.filter((user) => {
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
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Search
                                placeholder="Search users"
                                onSearch={(value) => setSearchQuery(value)}
                                style={{ width: 300 }}
                            />
                            <Checkbox
                                checked={selectAllActive}
                                onChange={handleSelectAllActiveChange}
                                style={{ marginLeft: 16 }}
                            >
                                Select All
                            </Checkbox>
                            {(selectAllActive ||
                                selectedActiveUsers.length > 0) && (
                                <Button
                                    type="link"
                                    onClick={handleArchiveAll}
                                    style={{ marginLeft: 8 }}
                                >
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />
                                    Archive
                                    {selectedActiveUsers.length > 0 &&
                                        ` (${selectedActiveUsers.length})`}
                                </Button>
                            )}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Button
                                type="default"
                                icon={<DeleteOutlined />}
                                onClick={() => setOpenArchiveModal(true)}
                                style={{ marginRight: 8, width: "131px" }}
                            >
                                Archived View
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleAdd}
                                style={{
                                    width: "131px",
                                    marginRight: 8,
                                    marginTop: "5px",
                                }}
                            >
                                <PlusOutlined style={{ marginRight: 4 }} />
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
                footer={[
                    <Button
                        key="close"
                        onClick={() => setOpenArchiveModal(false)}
                        style={{ width: "131px" }}
                    >
                        Close
                    </Button>,
                ]}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <Checkbox
                        checked={selectAllArchived}
                        onChange={handleSelectAllArchivedChange}
                        style={{ marginRight: 16 }}
                    >
                        Select All
                    </Checkbox>
                    {(selectAllArchived ||
                        selectedArchivedUsers.length > 0) && (
                        <Button
                            type="link"
                            onClick={handleRestoreAll}
                            style={{ marginRight: 8 }}
                        >
                            <UndoOutlined style={{ fontSize: "18px" }} />
                            Restore
                            {selectedArchivedUsers.length > 0 &&
                                ` (${selectedArchivedUsers.length})`}
                        </Button>
                    )}
                </div>
                <Table
                    columns={archiveColumns}
                    dataSource={filteredArchivedUsers}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1200 }}
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
                        style={{ marginRight: 8, width: "100px" }}
                        onClick={() => {
                            setOpenAddEditModal(false);
                            setEditingUser(null);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
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
