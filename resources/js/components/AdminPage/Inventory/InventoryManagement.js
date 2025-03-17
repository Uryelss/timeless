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
    const [selectedItems, setSelectedItems] = useState([]);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    const imageBaseURL = "http://localhost:8000/storage/";

    const fetchInventory = () => {
        axios
            .get("http://localhost:8000/api/inventory", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                setInventoryItems(
                    res.data.map((item) => ({ ...item, selected: false }))
                );
            })
            .catch((err) => {
                message.error("Error fetching inventory");
                console.error(err);
            });
    };

    const fetchArchivedInventory = () => {
        axios
            .get("http://localhost:8000/api/inventory?archived=1", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
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

    const handleCheckboxChange = (itemId) => {
        const updatedItems = inventoryItems.map((item) =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
        );
        setInventoryItems(updatedItems);
        setSelectedItems(
            updatedItems.filter((i) => i.selected).map((i) => i.id)
        );
        const allSelected = updatedItems.every((i) => i.selected);
        setSelectAll(allSelected);
    };

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        const updatedItems = inventoryItems.map((item) => ({
            ...item,
            selected: checked,
        }));
        setInventoryItems(updatedItems);
        setSelectedItems(checked ? updatedItems.map((i) => i.id) : []);
    };

    const handleArchiveAll = () => {
        if (selectedItems.length === 0) {
            message.warning("Please select at least one item to archive");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedItems.length} selected inventory item(s)?`,
            onOk: () => {
                Promise.all(
                    selectedItems.map((id) =>
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
                        setSelectedItems([]);
                        setSelectAll(false);
                    })
                    .catch((err) =>
                        message.error("Failed to archive some inventory items")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    const mainColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Checkbox
                        checked={record.selected}
                        onChange={() => handleCheckboxChange(record.id)}
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

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            size: record.size,
            quantity: record.quantity,
            sold: record.sold,
        });
        setOpenEditModal(true);
    };

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

    const filteredInventory = inventoryItems.filter((item) => {
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
                                checked={selectAll}
                                onChange={handleSelectAllChange}
                                style={{ marginLeft: 16 }}
                            >
                                Select All
                            </Checkbox>
                            {(selectAll || selectedItems.length > 0) && (
                                <Button
                                    type="link"
                                    onClick={handleArchiveAll}
                                    style={{ marginLeft: 8 }}
                                >
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />
                                    {selectedItems.length > 0 &&
                                        ` (${selectedItems.length})`}
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
                    />
                </Content>
            </Layout>
            <Modal
                title="Archived Inventory"
                centered
                open={openArchiveModal}
                onCancel={() => setOpenArchiveModal(false)}
                width={1200}
                footer={[]}
            >
                <Table
                    columns={archiveColumns}
                    dataSource={archivedInventory}
                    rowKey="id"
                    pagination={false}
                />
            </Modal>
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
                        <Input disabled />
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
