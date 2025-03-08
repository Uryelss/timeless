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
    // Active tab (values: brand, categories, gender, movement, strap_materials, sizes)
    const [activeTab, setActiveTab] = useState("brand");
    // Modal states
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [form] = Form.useForm();
    // Bulk selection and search state
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    // Data state for active and archived records
    const [data, setData] = useState([]);
    const [archivedData, setArchivedData] = useState([]);

    // Fetch active sub-categories for the current active tab
    const fetchData = () => {
        axios
            .get(`http://localhost:8000/api/sub-categories?type=${activeTab}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                // Ensure each record has a unique "key" for Ant Design table
                setData(
                    res.data.map((item) => ({
                        ...item,
                        key: item.id.toString(),
                    }))
                );
            })
            .catch((err) => {
                console.error(err);
                message.error("Error fetching data");
            });
    };

    // Fetch archived sub-categories for the current active tab
    const fetchArchivedData = () => {
        // Assuming your backend supports an archived flag (or use a separate endpoint)
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

    // Table columns for active items
    const columns = [
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
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Created At", dataIndex: "created_at", key: "created_at" },
        { title: "Updated At", dataIndex: "updated_at", key: "updated_at" },
    ];

    // Table columns for archived items (Restore action)
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
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Created At", dataIndex: "created_at", key: "created_at" },
        { title: "Updated At", dataIndex: "updated_at", key: "updated_at" },
    ];

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSelectAll(false);
    };

    const handleEdit = (record) => {
        // Set form values for editing; include record id if editing
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
                    .then((res) => {
                        message.success("Archived successfully");
                        fetchData();
                    })
                    .catch((err) => {
                        console.error(err);
                        message.error("Failed to archive");
                    });
            },
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
            .then((res) => {
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
                // If an id exists, we are editing; otherwise, we add new
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
                        .then((res) => {
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
                        .then((res) => {
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

    const handleBulkArchive = () => {
        Modal.confirm({
            title: "Are you sure you want to archive all selected items?",
            onOk: () => {
                // Implement bulk archive logic here (e.g., send array of selected IDs)
                message.success("Bulk archive executed (not implemented)");
            },
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
                    {/* Toolbar */}
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
                                onChange={(e) => setSelectAll(e.target.checked)}
                            >
                                Select All
                            </Checkbox>
                            {selectAll && (
                                <Button
                                    type="link"
                                    onClick={handleBulkArchive}
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
                                style={{ marginRight: 8 }}
                            >
                                Archived View
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleAdd}
                                icon={<PlusOutlined />}
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

            {/* Add/Edit Modal */}
            <Modal
                title="Sub-Category"
                centered
                open={openAddModal}
                onCancel={() => setOpenAddModal(false)}
                onOk={handleModalOk}
                okText="Save"
                cancelText="Cancel"
            >
                <Form form={form} layout="vertical">
                    {/* Hidden field for editing */}
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

            {/* Archive Modal */}
            <Modal
                title="Archived Sub-Categories"
                centered
                open={openArchiveModal}
                onCancel={() => setOpenArchiveModal(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setOpenArchiveModal(false)}
                    >
                        Close
                    </Button>,
                ]}
                width={1200}
            >
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
