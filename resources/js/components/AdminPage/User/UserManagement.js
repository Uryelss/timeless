import React, { useState } from "react";
import { Layout, Table, Space, Checkbox, Button, Modal, Input } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    UndoOutlined,
    FolderOpenOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";

const { Header, Content, Sider } = Layout;

const UserManagement = () => {
    // State for Archive modal, search query and bulk selection
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);

    // Dummy data for main users
    const [users] = useState([
        {
            key: "1",
            id: 1,
            userImage: "https://via.placeholder.com/100?text=User+1",
            username: "john_doe",
            email: "john@example.com",
            role: "Admin",
            status: "Active",
            dateAdded: "2023-12-01",
            lastUpdated: "2023-12-01",
        },
        {
            key: "2",
            id: 2,
            userImage: "https://via.placeholder.com/100?text=User+2",
            username: "jane_smith",
            email: "jane@example.com",
            role: "User",
            status: "Inactive",
            dateAdded: "2023-12-02",
            lastUpdated: "2023-12-02",
        },
    ]);

    // Dummy data for archived users
    const [archivedUsers] = useState([
        {
            key: "3",
            id: 3,
            userImage: "https://via.placeholder.com/100?text=User+3",
            username: "alice_jones",
            email: "alice@example.com",
            role: "User",
            status: "Inactive",
            dateAdded: "2023-11-20",
            lastUpdated: "2023-11-20",
        },
    ]);

    // Handlers for edit, archive and restore actions
    const handleEdit = (record) => {
        console.log("Edit user:", record);
        // Implement edit functionality here
    };

    const handleArchive = (record) => {
        console.log("Archive user:", record);
        // Implement individual archive functionality here
    };

    const handleRestore = (key) => {
        console.log("Restore user with key:", key);
        // Implement restore functionality here
    };

    // Handler for search action
    const handleSearch = (value) => {
        console.log("Search query:", value);
        setSearchQuery(value);
        // Optionally filter users based on search query
    };

    // Bulk archive handler with confirmation
    const handleArchiveAll = () => {
        Modal.confirm({
            title: "Are you sure you want to archive all selected users?",
            onOk: () => {
                console.log("Bulk archiving all selected users");
                // Perform bulk archive action here
            },
        });
    };

    // Main table columns for users
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
        { title: "ID", dataIndex: "id", key: "id" },
        {
            title: "User Image",
            dataIndex: "userImage",
            key: "userImage",
            render: (image) => (
                <img src={image} alt="user" style={{ width: 50 }} />
            ),
        },
        { title: "Username", dataIndex: "username", key: "username" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Role", dataIndex: "role", key: "role" },
        { title: "Status", dataIndex: "status", key: "status" },
        { title: "Date Added", dataIndex: "dateAdded", key: "dateAdded" },
        { title: "Last Updated", dataIndex: "lastUpdated", key: "lastUpdated" },
    ];

    // Archive table columns: same as main, except the Actions column shows only Restore.
    const archiveColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Button type="link" onClick={() => handleRestore(record.key)}>
                    <UndoOutlined style={{ fontSize: "18px" }} />
                </Button>
            ),
        },
        ...mainColumns.slice(1),
    ];

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
                    USER
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    {/* Toolbar with Search, Select All and Bulk Archive */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Input.Search
                                placeholder="Search users"
                                onSearch={handleSearch}
                                style={{ width: 300, marginRight: 16 }}
                            />
                            <Checkbox
                                onChange={(e) => setSelectAll(e.target.checked)}
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
                        <div>
                            <Button
                                type="default"
                                onClick={() => setOpenArchiveModal(true)}
                            >
                                Archived View
                            </Button>
                        </div>
                    </div>
                    <Table
                        columns={mainColumns}
                        dataSource={users}
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
                    >
                        Close
                    </Button>,
                ]}
            >
                <Table
                    columns={archiveColumns}
                    dataSource={archivedUsers}
                    scroll={{ x: 1200 }}
                    pagination={false}
                />
            </Modal>
        </Layout>
    );
};

export default UserManagement;
