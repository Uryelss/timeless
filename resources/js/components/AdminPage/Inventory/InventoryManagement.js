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
    const [selectAllActive, setSelectAllActive] = useState(false);
    const [selectedActiveItems, setSelectedActiveItems] = useState([]);
    const [selectAllArchived, setSelectAllArchived] = useState(false);
    const [selectedArchivedItems, setSelectedArchivedItems] = useState([]);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    // Base URL for images
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
                setInventoryItems(
                    res.data.map((item) => ({ ...item, selected: false }))
                );
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
                setArchivedInventory(
                    res.data.map((item) => ({ ...item, selected: false }))
                );
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

    // Checkbox handling for active items
    const handleActiveCheckboxChange = (itemId) => {
        const updatedItems = inventoryItems.map((item) =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
        );
        setInventoryItems(updatedItems);
        setSelectedActiveItems(
            updatedItems.filter((i) => i.selected).map((i) => i.id)
        );
        const allSelected = updatedItems.every((i) => i.selected);
        setSelectAllActive(allSelected);
    };

    // Select All checkbox handling for active items
    const handleSelectAllActiveChange = (e) => {
        const checked = e.target.checked;
        setSelectAllActive(checked);
        const updatedItems = inventoryItems.map((item) => ({
            ...item,
            selected: checked,
        }));
        setInventoryItems(updatedItems);
        setSelectedActiveItems(checked ? updatedItems.map((i) => i.id) : []);
    };

    // Checkbox handling for archived items
    const handleArchivedCheckboxChange = (itemId) => {
        const updatedArchived = archivedInventory.map((item) =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
        );
        setArchivedInventory(updatedArchived);
        setSelectedArchivedItems(
            updatedArchived.filter((i) => i.selected).map((i) => i.id)
        );
        const allSelected = updatedArchived.every((i) => i.selected);
        setSelectAllArchived(allSelected);
    };

    // Select All checkbox handling for archived items
    const handleSelectAllArchivedChange = (e) => {
        const checked = e.target.checked;
        setSelectAllArchived(checked);
        const updatedArchived = archivedInventory.map((item) => ({
            ...item,
            selected: checked,
        }));
        setArchivedInventory(updatedArchived);
        setSelectedArchivedItems(
            checked ? updatedArchived.map((i) => i.id) : []
        );
    };

    // Table columns for active inventory records
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
        console.log("Edit inventory record:", record);
        setEditingRecord(record);
        form.setFieldsValue({
            size: record.size,
            quantity: record.quantity,
            sold: record.sold,
        });
        setOpenEditModal(true);
    };

    // Handle archive action
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
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Handle restore action
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

    // Bulk archive handler for active items
    const handleArchiveAll = () => {
        if (selectedActiveItems.length === 0) {
            message.warning("Please select at least one item to archive");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedActiveItems.length} selected inventory item(s)?`,
            onOk: () => {
                Promise.all(
                    selectedActiveItems.map((id) =>
                        axios.delete(
                            `http://localhost:8000/api/inventory/${id}`,
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
                        message.success(
                            "Selected inventory items archived successfully"
                        );
                        fetchInventory();
                        setSelectedActiveItems([]);
                        setSelectAllActive(false);
                    })
                    .catch((err) =>
                        message.error("Failed to archive some inventory items")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Bulk restore handler for archived items
    const handleRestoreAll = () => {
        if (selectedArchivedItems.length === 0) {
            message.warning("Please select at least one item to restore");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to restore ${selectedArchivedItems.length} selected inventory item(s)?`,
            onOk: () => {
                Promise.all(
                    selectedArchivedItems.map((id) =>
                        axios.post(
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
                    )
                )
                    .then(() => {
                        message.success(
                            "Selected inventory items restored successfully"
                        );
                        fetchArchivedInventory();
                        fetchInventory();
                        setSelectedArchivedItems([]);
                        setSelectAllArchived(false);
                    })
                    .catch((err) =>
                        message.error("Failed to restore some inventory items")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Handle update of inventory record
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

    // Filter inventory records based on the search query
    const filteredInventory = inventoryItems.filter((item) => {
        const lower = searchQuery.toLowerCase();
        return (
            (item.product &&
                item.product.product_name.toLowerCase().includes(lower)) ||
            item.size.toLowerCase().includes(lower) ||
            item.stock_status.toLowerCase().includes(lower)
        );
    });

    // Filter archived inventory records based on the search query
    const filteredArchivedInventory = archivedInventory.filter((item) => {
        const lower = searchQuery.toLowerCase();
        return (
            (item.product &&
                item.product.product_name.toLowerCase().includes(lower)) ||
            item.size.toLowerCase().includes(lower) ||
            item.stock_status.toLowerCase().includes(lower)
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
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Search
                                placeholder="Search inventory"
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
                                selectedActiveItems.length > 0) && (
                                <Button
                                    type="link"
                                    onClick={handleArchiveAll}
                                    style={{ marginLeft: 8 }}
                                >
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />
                                    Archive
                                    {selectedActiveItems.length > 0 &&
                                        ` (${selectedActiveItems.length})`}
                                </Button>
                            )}
                        </div>
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
                        scroll={{ x: 1200 }}
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
                        selectedArchivedItems.length > 0) && (
                        <Button
                            type="link"
                            onClick={handleRestoreAll}
                            style={{ marginRight: 8 }}
                        >
                            <UndoOutlined style={{ fontSize: "18px" }} />
                            Restore
                            {selectedArchivedItems.length > 0 &&
                                ` (${selectedArchivedItems.length})`}
                        </Button>
                    )}
                </div>
                <Table
                    columns={archiveColumns}
                    dataSource={filteredArchivedInventory}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1200 }}
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
                        style={{ width: "131px" }}
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
