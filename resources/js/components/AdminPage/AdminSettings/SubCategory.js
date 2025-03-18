import React, { useState, useEffect } from "react";
import {
    Layout,
    Tabs,
    Table,
    Space,
    Checkbox,
    Button,
    Modal,
    Input,
    Form,
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
const { TabPane } = Tabs;

const SubCategoryManagement = () => {
    const [activeTab, setActiveTab] = useState("brand");
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [form] = Form.useForm();
    const [selectAllActive, setSelectAllActive] = useState(false);
    const [selectAllArchived, setSelectAllArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [data, setData] = useState([]);
    const [archivedData, setArchivedData] = useState([]);
    const [selectedActiveItems, setSelectedActiveItems] = useState([]);
    const [selectedArchivedItems, setSelectedArchivedItems] = useState([]);

    const fetchData = () => {
        axios
            .get(`http://localhost:8000/api/sub-categories?type=${activeTab}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                setData(
                    res.data.map((item) => ({
                        ...item,
                        key: item.id.toString(),
                        selected: false,
                    }))
                );
            })
            .catch((err) => {
                console.error(err);
                message.error("Error fetching data");
            });
    };

    const fetchArchivedData = () => {
        axios
            .get(
                `http://localhost:8000/api/sub-categories?type=${activeTab}&archived=1`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then((res) => {
                setArchivedData(
                    res.data.map((item) => ({
                        ...item,
                        key: item.id.toString(),
                        selected: false,
                    }))
                );
            })
            .catch((err) => {
                console.error(err);
                message.error("Error fetching archived data");
            });
    };

    useEffect(() => {
        fetchData();
        if (openArchiveModal) {
            fetchArchivedData();
        }
    }, [activeTab, openArchiveModal]);

    // Handlers for active items
    const handleActiveCheckboxChange = (itemId) => {
        const updatedData = data.map((item) =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
        );
        setData(updatedData);
        setSelectedActiveItems(
            updatedData.filter((i) => i.selected).map((i) => i.id)
        );
        const allSelected = updatedData.every((i) => i.selected);
        setSelectAllActive(allSelected);
    };

    const handleSelectAllActiveChange = (e) => {
        const checked = e.target.checked;
        setSelectAllActive(checked);
        const updatedData = data.map((item) => ({
            ...item,
            selected: checked,
        }));
        setData(updatedData);
        setSelectedActiveItems(checked ? updatedData.map((i) => i.id) : []);
    };

    const handleBulkArchive = () => {
        if (selectedActiveItems.length === 0) {
            message.warning("Please select at least one item to archive");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedActiveItems.length} selected item(s)?`,
            onOk: () => {
                Promise.all(
                    selectedActiveItems.map((id) =>
                        axios.delete(
                            `http://localhost:8000/api/sub-categories/${id}`,
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
                        message.success("Selected items archived successfully");
                        fetchData();
                        setSelectedActiveItems([]);
                        setSelectAllActive(false);
                    })
                    .catch((err) =>
                        message.error("Failed to archive some items")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Handlers for archived items
    const handleArchivedCheckboxChange = (itemId) => {
        const updatedArchived = archivedData.map((item) =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
        );
        setArchivedData(updatedArchived);
        setSelectedArchivedItems(
            updatedArchived.filter((i) => i.selected).map((i) => i.id)
        );
        const allSelected = updatedArchived.every((i) => i.selected);
        setSelectAllArchived(allSelected);
    };

    const handleSelectAllArchivedChange = (e) => {
        const checked = e.target.checked;
        setSelectAllArchived(checked);
        const updatedArchived = archivedData.map((item) => ({
            ...item,
            selected: checked,
        }));
        setArchivedData(updatedArchived);
        setSelectedArchivedItems(
            checked ? updatedArchived.map((i) => i.id) : []
        );
    };

    const handleBulkRestore = () => {
        if (selectedArchivedItems.length === 0) {
            message.warning("Please select at least one item to restore");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to restore ${selectedArchivedItems.length} selected item(s)?`,
            onOk: () => {
                Promise.all(
                    selectedArchivedItems.map((id) =>
                        axios.post(
                            `http://localhost:8000/api/sub-categories/${id}/restore`,
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
                        message.success("Selected items restored successfully");
                        fetchArchivedData();
                        fetchData();
                        setSelectedArchivedItems([]);
                        setSelectAllArchived(false);
                    })
                    .catch((err) =>
                        message.error("Failed to restore some items")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    const columns = [
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
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Created At", dataIndex: "created_at", key: "created_at" },
        { title: "Updated At", dataIndex: "updated_at", key: "updated_at" },
    ];

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
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Created At", dataIndex: "created_at", key: "created_at" },
        { title: "Updated At", dataIndex: "updated_at", key: "updated_at" },
    ];

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSelectAllActive(false);
        setSelectedActiveItems([]);
        setSelectAllArchived(false);
        setSelectedArchivedItems([]);
    };

    const handleEdit = (record) => {
        form.setFieldsValue(record);
        setOpenAddModal(true);
    };

    const handleArchive = (record) => {
        Modal.confirm({
            title: "Are you sure you want to archive this item?",
            onOk: () => {
                axios
                    .delete(
                        `http://localhost:8000/api/sub-categories/${record.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        }
                    )
                    .then(() => {
                        message.success("Archived successfully");
                        fetchData();
                    })
                    .catch((err) => {
                        console.error(err);
                        message.error("Failed to archive");
                    });
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    const handleRestore = (id) => {
        axios
            .post(
                `http://localhost:8000/api/sub-categories/${id}/restore`,
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
                message.success("Restored successfully");
                fetchArchivedData();
                fetchData();
            })
            .catch((err) => {
                console.error(err);
                message.error("Failed to restore");
            });
    };

    const handleAdd = () => {
        form.resetFields();
        setOpenAddModal(true);
    };

    const handleModalOk = () => {
        form.validateFields()
            .then((values) => {
                if (values.id) {
                    axios
                        .put(
                            `http://localhost:8000/api/sub-categories/${values.id}`,
                            { name: values.name },
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem(
                                        "token"
                                    )}`,
                                },
                            }
                        )
                        .then(() => {
                            message.success("Updated successfully");
                            setOpenAddModal(false);
                            fetchData();
                        })
                        .catch((err) => {
                            console.error(err);
                            message.error("Update failed");
                        });
                } else {
                    axios
                        .post(
                            `http://localhost:8000/api/sub-categories`,
                            {
                                type: activeTab,
                                name: values.name,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem(
                                        "token"
                                    )}`,
                                },
                            }
                        )
                        .then(() => {
                            message.success("Added successfully");
                            setOpenAddModal(false);
                            fetchData();
                        })
                        .catch((err) => {
                            console.error(err);
                            message.error("Addition failed");
                        });
                }
            })
            .catch((info) => {
                console.log("Validation Failed:", info);
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
                    SUB-CATEGORY SETTINGS
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    <Tabs activeKey={activeTab} onChange={handleTabChange}>
                        <TabPane tab="Brand" key="brand" />
                        <TabPane tab="Categories" key="categories" />
                        <TabPane tab="Gender" key="gender" />
                        <TabPane tab="Movement" key="movement" />
                        <TabPane tab="Strap Materials" key="strap_materials" />
                        <TabPane tab="Sizes" key="sizes" />
                    </Tabs>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Input.Search
                                placeholder="Search sub-categories"
                                onSearch={(value) => setSearchQuery(value)}
                                style={{ width: 300, marginRight: 16 }}
                            />
                            <Checkbox
                                checked={selectAllActive}
                                onChange={handleSelectAllActiveChange}
                            >
                                Select All
                            </Checkbox>
                            {(selectAllActive ||
                                selectedActiveItems.length > 0) && (
                                <Button
                                    type="link"
                                    onClick={handleBulkArchive}
                                    style={{ marginLeft: 8 }}
                                    title="Archive Selected"
                                >
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />
                                    {selectedActiveItems.length > 0 &&
                                        ` (${selectedActiveItems.length})`}
                                </Button>
                            )}
                        </div>
                        <div
                            style={{ display: "flex", flexDirection: "column" }}
                        >
                            <Button
                                type="default"
                                onClick={() => setOpenArchiveModal(true)}
                                style={{ marginRight: 8, width: "131px" }}
                            >
                                Archived View
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleAdd}
                                icon={<PlusOutlined />}
                                style={{
                                    width: "131px",
                                    marginRight: 8,
                                    marginTop: "5px",
                                }}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={data.filter((item) =>
                            item.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                        )}
                    />
                </Content>
            </Layout>

            <Modal
                title="Sub-Category"
                centered
                open={openAddModal}
                onCancel={() => setOpenAddModal(false)}
                onOk={handleModalOk}
                okText="Save"
                okButtonProps={{ style: { width: "80px" } }}
                cancelText="Cancel"
                cancelButtonProps={{ style: { width: "80px" } }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="id" style={{ display: "none" }}>
                        <Input type="hidden" />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the name",
                            },
                        ]}
                    >
                        <Input placeholder="Enter name" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Archived Sub-Categories"
                centered
                open={openArchiveModal}
                onCancel={() => setOpenArchiveModal(false)}
                footer={[]}
                width={1200}
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
                            onClick={handleBulkRestore}
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
                    dataSource={archivedData.filter((item) =>
                        item.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                    )}
                    pagination={false}
                />
            </Modal>
        </Layout>
    );
};

export default SubCategoryManagement;
