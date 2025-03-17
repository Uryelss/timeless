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
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [data, setData] = useState([]);
    const [archivedData, setArchivedData] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

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

    const handleCheckboxChange = (itemId) => {
        const updatedData = data.map((item) =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
        );
        setData(updatedData);
        setSelectedItems(
            updatedData.filter((i) => i.selected).map((i) => i.id)
        );
        const allSelected = updatedData.every((i) => i.selected);
        setSelectAll(allSelected);
    };

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        const updatedData = data.map((item) => ({
            ...item,
            selected: checked,
        }));
        setData(updatedData);
        setSelectedItems(checked ? updatedData.map((i) => i.id) : []);
    };

    const handleBulkArchive = () => {
        if (selectedItems.length === 0) {
            message.warning("Please select at least one item to archive");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedItems.length} selected item(s)?`,
            onOk: () => {
                Promise.all(
                    selectedItems.map((id) =>
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
                        setSelectedItems([]);
                        setSelectAll(false);
                    })
                    .catch((err) =>
                        message.error("Failed to archive some items")
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
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Created At", dataIndex: "created_at", key: "created_at" },
        { title: "Updated At", dataIndex: "updated_at", key: "updated_at" },
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
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Created At", dataIndex: "created_at", key: "created_at" },
        { title: "Updated At", dataIndex: "updated_at", key: "updated_at" },
    ];

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSelectAll(false);
        setSelectedItems([]);
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
                                checked={selectAll}
                                onChange={handleSelectAllChange}
                            >
                                Select All
                            </Checkbox>
                            {(selectAll || selectedItems.length > 0) && (
                                <Button
                                    type="link"
                                    onClick={handleBulkArchive}
                                    style={{ marginLeft: 8 }}
                                    title="Archive Selected"
                                >
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />
                                    {selectedItems.length > 0 &&
                                        ` (${selectedItems.length})`}
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
                okButtonProps={{
                    style: { width: "80px" },
                }}
                cancelText="Cancel"
                cancelButtonProps={{
                    style: { width: "80px" },
                }}
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
