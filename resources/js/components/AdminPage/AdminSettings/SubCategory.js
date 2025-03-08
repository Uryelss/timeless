import React, { useState } from "react";
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
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    FolderOpenOutlined,
    UndoOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

const SubCategoryManagement = () => {
    // Active tab key: "brand", "categories", "gender", "movement", "strap-materials", "sizes"
    const [activeTab, setActiveTab] = useState("brand");
    const [selectAll, setSelectAll] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [form] = Form.useForm();

    // Dummy data for main sub-categories (one array per tab)
    const dummyData = {
        brand: [
            {
                key: "1",
                id: 1,
                name: "Brand A",
                created_at: "2023-12-01",
                updated_at: "2023-12-02",
            },
            {
                key: "2",
                id: 2,
                name: "Brand B",
                created_at: "2023-12-03",
                updated_at: "2023-12-04",
            },
        ],
        categories: [
            {
                key: "1",
                id: 1,
                name: "Category A",
                created_at: "2023-11-01",
                updated_at: "2023-11-02",
            },
            {
                key: "2",
                id: 2,
                name: "Category B",
                created_at: "2023-11-03",
                updated_at: "2023-11-04",
            },
        ],
        gender: [
            {
                key: "1",
                id: 1,
                name: "Male",
                created_at: "2023-10-01",
                updated_at: "2023-10-02",
            },
            {
                key: "2",
                id: 2,
                name: "Female",
                created_at: "2023-10-03",
                updated_at: "2023-10-04",
            },
        ],
        movement: [
            {
                key: "1",
                id: 1,
                name: "Automatic",
                created_at: "2023-09-01",
                updated_at: "2023-09-02",
            },
        ],
        "strap-materials": [
            {
                key: "1",
                id: 1,
                name: "Leather",
                created_at: "2023-08-01",
                updated_at: "2023-08-02",
            },
        ],
        sizes: [
            {
                key: "1",
                id: 1,
                name: "Small",
                created_at: "2023-07-01",
                updated_at: "2023-07-02",
            },
            {
                key: "2",
                id: 2,
                name: "Medium",
                created_at: "2023-07-03",
                updated_at: "2023-07-04",
            },
            {
                key: "3",
                id: 3,
                name: "Large",
                created_at: "2023-07-05",
                updated_at: "2023-07-06",
            },
        ],
    };

    // Dummy data for archived sub-categories
    const archivedDummyData = {
        brand: [
            {
                key: "3",
                id: 3,
                name: "Brand C",
                created_at: "2023-06-01",
                updated_at: "2023-06-02",
            },
        ],
        categories: [
            {
                key: "3",
                id: 3,
                name: "Category C",
                created_at: "2023-05-01",
                updated_at: "2023-05-02",
            },
        ],
        gender: [],
        movement: [],
        "strap-materials": [],
        sizes: [],
    };

    // Common table columns for main sub-categories
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

    // Archive modal columns: same as main but Actions only show Restore
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
        ...columns.slice(1),
    ];

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSelectAll(false); // reset select all on tab change
    };

    const handleEdit = (record) => {
        console.log("Edit sub-category:", record);
        form.setFieldsValue(record);
        setOpenAddModal(true);
    };

    const handleArchive = (record) => {
        console.log("Archive sub-category:", record);
    };

    const handleRestore = (key) => {
        console.log("Restore sub-category with key:", key);
    };

    const handleArchiveAll = () => {
        Modal.confirm({
            title: `Are you sure you want to archive all selected ${activeTab}?`,
            onOk: () => {
                console.log("Bulk archiving sub-categories in", activeTab);
            },
        });
    };

    const handleAdd = () => {
        form.resetFields();
        setOpenAddModal(true);
    };

    const handleModalOk = () => {
        form.validateFields()
            .then((values) => {
                console.log("Saved values:", values, "for type:", activeTab);
                setOpenAddModal(false);
                // Save add/update action here
            })
            .catch((err) => console.log("Validation error:", err));
    };

    const handleModalCancel = () => {
        setOpenAddModal(false);
    };

    // Capitalize activeTab for display purposes
    const displayActiveTab = activeTab
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

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
                    SUB CATEGORY
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    {/* Tabs for sub-category types */}
                    <Tabs activeKey={activeTab} onChange={handleTabChange}>
                        <TabPane tab="Brand" key="brand" />
                        <TabPane tab="Categories" key="categories" />
                        <TabPane tab="Gender" key="gender" />
                        <TabPane tab="Movement" key="movement" />
                        <TabPane tab="Strap Materials" key="strap-materials" />
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
                                onSearch={(value) =>
                                    console.log("Search:", value)
                                }
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
                                style={{ marginRight: 8 }}
                            >
                                Archived {displayActiveTab}
                            </Button>
                            <Button type="primary" onClick={handleAdd}>
                                Add {displayActiveTab}
                            </Button>
                        </div>
                    </div>

                    {/* Main Table */}
                    <Table
                        columns={columns}
                        dataSource={dummyData[activeTab]}
                    />

                    {/* Archive Modal */}
                    <Modal
                        title={`Archived ${displayActiveTab}`}
                        visible={openArchiveModal}
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
                            dataSource={archivedDummyData[activeTab]}
                            pagination={false}
                        />
                    </Modal>

                    {/* Add/Edit Modal */}
                    <Modal
                        title={
                            form.getFieldValue("id")
                                ? `Edit ${displayActiveTab}`
                                : `Add ${displayActiveTab}`
                        }
                        visible={openAddModal}
                        onOk={handleModalOk}
                        onCancel={handleModalCancel}
                        width={600}
                    >
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="name"
                                label="Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter a name",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder={`Enter ${displayActiveTab} name`}
                                />
                            </Form.Item>
                            {/* Hidden field for type (active tab) */}
                            <Form.Item
                                name="type"
                                initialValue={activeTab}
                                hidden
                            >
                                <Input />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
};

export default SubCategoryManagement;
