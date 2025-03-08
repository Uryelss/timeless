import React, { useState } from "react";
import { Layout, Table, Space, Checkbox, Button, Modal, Input } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    FolderOpenOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";

const { Header, Content, Sider } = Layout;

const InventoryManagement = () => {
    // States for Archive modal, search query and bulk selection
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);

    // Dummy data for main inventory items
    const [inventoryItems] = useState([
        {
            key: "1",
            id: 1,
            productImage: "https://via.placeholder.com/100?text=Prod+1",
            productName: "Classic Watch",
            stockQuantity: 50,
            size: "Medium",
            sold: 20,
            stockStatus: "In Stock",
            lastUpdated: "2023-12-01",
        },
        {
            key: "2",
            id: 2,
            productImage: "https://via.placeholder.com/100?text=Prod+2",
            productName: "Sport Watch",
            stockQuantity: 30,
            size: "Large",
            sold: 15,
            stockStatus: "Low Stock",
            lastUpdated: "2023-12-02",
        },
    ]);

    // Dummy data for archived inventory items
    const [archivedInventory] = useState([
        {
            key: "3",
            id: 3,
            productImage:
                "https://via.placeholder.com/100?text=Archived+Prod+1",
            productName: "Vintage Watch",
            stockQuantity: 10,
            size: "Small",
            sold: 5,
            stockStatus: "Archived",
            lastUpdated: "2023-11-20",
        },
    ]);

    // Handlers for edit, archive and restore actions
    const handleEdit = (record) => {
        console.log("Edit inventory item:", record);
        // Implement edit functionality here
    };

    const handleArchive = (record) => {
        console.log("Archive inventory item:", record);
        // Implement individual archive functionality here
    };

    const handleRestore = (key) => {
        console.log("Restore inventory item with key:", key);
        // Implement restore functionality here
    };

    // Handler for search action
    const handleSearch = (value) => {
        console.log("Search query:", value);
        setSearchQuery(value);
        // Optionally filter inventory items based on search query
    };

    // Bulk archive handler with confirmation
    const handleArchiveAll = () => {
        Modal.confirm({
            title: "Are you sure you want to archive all selected inventory items?",
            onOk: () => {
                console.log("Bulk archiving all selected inventory items");
                // Perform bulk archive action here
            },
        });
    };

    // Main table columns for inventory items
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
            title: "Product (Image)",
            dataIndex: "productImage",
            key: "productImage",
            render: (image) => (
                <img src={image} alt="product" style={{ width: 50 }} />
            ),
        },
        { title: "Product Name", dataIndex: "productName", key: "productName" },
        {
            title: "Stock Quantity",
            dataIndex: "stockQuantity",
            key: "stockQuantity",
        },
        { title: "Size", dataIndex: "size", key: "size" },
        { title: "Sold", dataIndex: "sold", key: "sold" },
        { title: "Stock Status", dataIndex: "stockStatus", key: "stockStatus" },
        { title: "Last Updated", dataIndex: "lastUpdated", key: "lastUpdated" },
    ];

    // Archive table columns: same as main, except Actions shows only the Restore icon.
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
                    INVENTORY
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
                                placeholder="Search inventory"
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
                    <Table columns={mainColumns} dataSource={inventoryItems} />
                </Content>
            </Layout>

            {/* Archived Inventory Modal */}
            <Modal
                title="Archived Inventory"
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
                    dataSource={archivedInventory}
                    pagination={false}
                />
            </Modal>
        </Layout>
    );
};

export default InventoryManagement;
