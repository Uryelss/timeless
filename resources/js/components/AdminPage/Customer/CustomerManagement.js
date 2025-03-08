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

const CustomerManagement = () => {
    // State for Archive modal, search query and bulk selection
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);

    // Dummy data for main customers
    const [customers] = useState([
        {
            key: "1",
            id: 1,
            customerImage: "https://via.placeholder.com/100?text=John+Doe",
            customerName: "John Doe",
            phone: "123-456-7890",
            dob: "1990-01-01",
            gender: "Male",
            address: "123 Main St",
            lastUpdated: "2023-12-01",
        },
        {
            key: "2",
            id: 2,
            customerImage: "https://via.placeholder.com/100?text=Jane+Smith",
            customerName: "Jane Smith",
            phone: "987-654-3210",
            dob: "1985-05-05",
            gender: "Female",
            address: "456 Elm St",
            lastUpdated: "2023-12-02",
        },
    ]);

    // Dummy data for archived customers
    const [archivedCustomers] = useState([
        {
            key: "3",
            id: 3,
            customerImage: "https://via.placeholder.com/100?text=Alice+Johnson",
            customerName: "Alice Johnson",
            phone: "555-123-4567",
            dob: "1992-03-03",
            gender: "Female",
            address: "789 Oak St",
            lastUpdated: "2023-11-20",
        },
    ]);

    // Handlers for edit, archive and restore actions
    const handleEdit = (record) => {
        console.log("Edit customer:", record);
        // Implement edit functionality here
    };

    const handleArchive = (record) => {
        console.log("Archive customer:", record);
        // Implement individual archive functionality here
    };

    const handleRestore = (key) => {
        console.log("Restore customer with key:", key);
        // Implement restore functionality here
    };

    // Handler for search action
    const handleSearch = (value) => {
        console.log("Search query:", value);
        setSearchQuery(value);
        // Optionally filter customers based on search query
    };

    // Bulk archive handler with confirmation
    const handleArchiveAll = () => {
        Modal.confirm({
            title: "Are you sure you want to archive all selected customers?",
            onOk: () => {
                console.log("Bulk archiving all selected customers");
                // Perform bulk archive action here
            },
        });
    };

    // Main table columns for customers
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
            title: "Customer Image",
            dataIndex: "customerImage",
            key: "customerImage",
            render: (image) => (
                <img src={image} alt="customer" style={{ width: 50 }} />
            ),
        },
        {
            title: "Customer Name",
            dataIndex: "customerName",
            key: "customerName",
        },
        { title: "Phone", dataIndex: "phone", key: "phone" },
        { title: "Date of Birth", dataIndex: "dob", key: "dob" },
        { title: "Gender", dataIndex: "gender", key: "gender" },
        { title: "Address", dataIndex: "address", key: "address" },
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
                    CUSTOMER
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
                                placeholder="Search customers"
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
                        dataSource={customers}
                        scroll={{ x: 1200 }}
                    />
                </Content>
            </Layout>

            {/* Archived Customers Modal */}
            <Modal
                title="Archived Customers"
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
                    dataSource={archivedCustomers}
                    scroll={{ x: 1200 }}
                    pagination={false}
                />
            </Modal>
        </Layout>
    );
};

export default CustomerManagement;
