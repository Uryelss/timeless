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
    message,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    FolderOpenOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Search } = Input;

const InventoryManagement = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [archivedInventory, setArchivedInventory] = useState([]);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    // Base URL for images – adjust if needed
    const imageBaseURL = "http://localhost:8000/storage/";

    // Fetch active inventory records from API (with product data)
    const fetchInventory = () => {
        axios
            .get("http://localhost:8000/api/inventory", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                console.log("Fetched inventory:", res.data);
                setInventoryItems(res.data);
            })
            .catch((err) => {
                message.error("Error fetching inventory");
                console.error(err);
            });
    };

    // Fetch archived inventory records
    const fetchArchivedInventory = () => {
        axios
            .get("http://localhost:8000/api/inventory?archived=1", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                console.log("Fetched archived inventory:", res.data);
                setArchivedInventory(res.data);
            })
            .catch((err) => {
                message.error("Error fetching archived inventory");
                console.error(err);
            });
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    useEffect(() => {
        if (openArchiveModal) {
            fetchArchivedInventory();
        }
    }, [openArchiveModal]);

    // Table columns for active inventory records
    // Table columns for active inventory records
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
            title: "Product (Image)",
            key: "productImage",
            render: (record) => {
                const productImage = record.product?.main_image;
                return (
                    <img
                        src={
                            productImage
                                ? `${imageBaseURL}${productImage}`
                                : "https://via.placeholder.com/100?text=Prod"
                        }
                        alt="product"
                        style={{ width: 50 }}
                    />
                );
            },
        },
        {
            title: "Product Name",
            key: "productName",
            render: (record) =>
                record.product ? record.product.product_name : "N/A",
        },
        { title: "Size", dataIndex: "size", key: "size" },
        { title: "Stock Quantity", dataIndex: "quantity", key: "quantity" },
        { title: "Sold", dataIndex: "sold", key: "sold" },
        {
            title: "Stock Status",
            dataIndex: "stock_status",
            key: "stock_status",
        },
        { title: "Last Updated", dataIndex: "updated_at", key: "updated_at" },
    ];

    // Archive table columns – similar to main, but with a restore button.
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
        console.log("Edit inventory record:", record);
        setEditingRecord(record);
        form.setFieldsValue({
            size: record.size,
            quantity: record.quantity,
            sold: record.sold,
        });
        setOpenEditModal(true);
    };

    // Handle archive (soft delete) action.
    const handleArchive = (record) => {
        Modal.confirm({
            title: "Are you sure you want to archive this inventory item?",
            onOk: () => {
                axios
                    .delete(
                        `http://localhost:8000/api/inventory/${record.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        }
                    )
                    .then(() => {
                        message.success("Inventory item archived successfully");
                        fetchInventory();
                    })
                    .catch((err) => {
                        message.error("Failed to archive inventory item");
                        console.error(err);
                    });
            },
        });
    };

    // Handle restore action.
    const handleRestore = (id) => {
        axios
            .post(
                `http://localhost:8000/api/inventory/${id}/restore`,
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
                message.success("Inventory item restored successfully");
                fetchArchivedInventory();
                fetchInventory();
            })
            .catch((err) => {
                message.error("Failed to restore inventory item");
                console.error(err);
            });
    };

    // Bulk archive handler (if needed).
    const handleArchiveAll = () => {
        Modal.confirm({
            title: "Are you sure you want to archive all selected inventory items?",
            onOk: () => {
                message.success("Bulk archive executed (not implemented)");
            },
        });
    };

    // Filter inventory records based on the search query.
    const filteredInventory = inventoryItems.filter((item) => {
        const lower = searchQuery.toLowerCase();
        return (
            (item.product &&
                item.product.product_name.toLowerCase().includes(lower)) ||
            item.size.toLowerCase().includes(lower) ||
            item.stock_status.toLowerCase().includes(lower)
        );
    });

    // Handle update of inventory record (called from the edit modal).
    const handleUpdate = () => {
        form.validateFields()
            .then((values) => {
                axios
                    .put(
                        `http://localhost:8000/api/inventory/${editingRecord.id}`,
                        values,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        }
                    )
                    .then(() => {
                        message.success("Inventory updated successfully");
                        setOpenEditModal(false);
                        setEditingRecord(null);
                        fetchInventory();
                    })
                    .catch((err) => {
                        message.error("Failed to update inventory");
                        console.error(err);
                    });
            })
            .catch((err) => {
                console.log("Validation Failed:", err);
            });
    };

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
                    INVENTORY MANAGEMENT
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        {/* Left side: Search input and Select All checkbox with bulk archive button */}
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Search
                                placeholder="Search inventory"
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
                                >
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />
                                </Button>
                            )}
                        </div>
                        {/* Right side: Archived View button with trash icon */}
                        <div>
                            <Button
                                type="default"
                                onClick={() => setOpenArchiveModal(true)}
                            >
                                <DeleteOutlined style={{ marginRight: 4 }} />
                                Archived View
                            </Button>
                        </div>
                    </div>
                    <Table
                        columns={mainColumns}
                        dataSource={filteredInventory}
                        rowKey="id"
                    />
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
                    rowKey="id"
                    pagination={false}
                />
            </Modal>
            {/* Edit Inventory Modal */}
            <Modal
                title="Edit Inventory Item"
                centered
                open={openEditModal}
                onCancel={() => {
                    setOpenEditModal(false);
                    setEditingRecord(null);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setOpenEditModal(false);
                            setEditingRecord(null);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" onClick={handleUpdate}>
                        Update Inventory
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="size"
                        label="Size"
                        rules={[
                            { required: true, message: "Size is required" },
                        ]}
                    >
                        <Input disabled />{" "}
                        {/* Size is typically not editable */}
                    </Form.Item>
                    <Form.Item
                        name="quantity"
                        label="Stock Quantity"
                        rules={[
                            { required: true, message: "Quantity is required" },
                        ]}
                    >
                        <Input type="number" placeholder="Enter quantity" />
                    </Form.Item>
                    <Form.Item
                        name="sold"
                        label="Sold"
                        rules={[
                            { required: true, message: "Sold is required" },
                        ]}
                    >
                        <Input
                            type="number"
                            placeholder="Enter sold quantity"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default InventoryManagement;
