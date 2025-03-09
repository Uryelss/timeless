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
    Select,
    message,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    UndoOutlined,
    FolderOpenOutlined,
    SearchOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Search } = Input;
const { Option } = Select;

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [archivedCustomers, setArchivedCustomers] = useState([]);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [openAddEditModal, setOpenAddEditModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();

    // API endpoint for customers
    const API_URL = "http://localhost:8000/api/customers";

    // Fetch active customers
    const fetchCustomers = () => {
        axios
            .get(API_URL, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                console.log("Fetched customers:", res.data);
                setCustomers(res.data);
            })
            .catch((err) => {
                message.error("Error fetching customers");
                console.error(err);
            });
    };

    // Fetch archived customers
    const fetchArchivedCustomers = () => {
        axios
            .get(`${API_URL}?archived=1`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                console.log("Fetched archived customers:", res.data);
                setArchivedCustomers(res.data);
            })
            .catch((err) => {
                message.error("Error fetching archived customers");
                console.error(err);
            });
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (openArchiveModal) {
            fetchArchivedCustomers();
        }
    }, [openArchiveModal]);

    // Table columns for active customers.
    // We use the computed full_name from the Customer model.
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
            dataIndex: "profile_image",
            key: "profile_image",
            render: (image) => (
                <img
                    src={
                        image || "https://via.placeholder.com/100?text=Customer"
                    }
                    alt="customer"
                    style={{ width: 50 }}
                />
            ),
        },
        {
            title: "Customer Name",
            dataIndex: "full_name",
            key: "full_name",
            // full_name is computed in the model (accessor)
        },
        { title: "Phone", dataIndex: "phone", key: "phone" },
        { title: "Date of Birth", dataIndex: "date_of_birth", key: "dob" },
        { title: "Gender", dataIndex: "gender", key: "gender" },
        { title: "Address", dataIndex: "address", key: "address" },
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
        console.log("Edit customer:", record);
        setEditingCustomer(record);
        form.setFieldsValue({
            first_name: record.first_name,
            middle_name: record.middle_name,
            last_name: record.last_name,
            suffix: record.suffix,
            phone: record.phone,
            date_of_birth: record.date_of_birth,
            gender: record.gender,
            address: record.address,
        });
        setOpenAddEditModal(true);
    };

    // Handle archive (soft delete) action.
    const handleArchive = (record) => {
        Modal.confirm({
            title: "Are you sure you want to archive this customer?",
            onOk: () => {
                axios
                    .delete(`${API_URL}/${record.id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    })
                    .then(() => {
                        message.success("Customer archived successfully");
                        fetchCustomers();
                    })
                    .catch((err) => {
                        message.error("Failed to archive customer");
                        console.error(err);
                    });
            },
        });
    };

    // Handle restore action.
    const handleRestore = (id) => {
        axios
            .post(
                `${API_URL}/${id}/restore`,
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
                message.success("Customer restored successfully");
                fetchArchivedCustomers();
                fetchCustomers();
            })
            .catch((err) => {
                message.error("Failed to restore customer");
                console.error(err);
            });
    };

    // Bulk archive handler.
    const handleArchiveAll = () => {
        Modal.confirm({
            title: "Are you sure you want to archive all selected customers?",
            onOk: () => {
                message.success("Bulk archive executed (not implemented)");
            },
        });
    };

    // Handle adding a new customer (opens the add modal)
    const handleAdd = () => {
        form.resetFields();
        setEditingCustomer(null);
        setOpenAddEditModal(true);
    };

    // Handle save (for both add and edit)
    const handleSave = () => {
        form.validateFields()
            .then((values) => {
                if (editingCustomer) {
                    // Update existing customer
                    axios
                        .put(`${API_URL}/${editingCustomer.id}`, values, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        })
                        .then(() => {
                            message.success("Customer updated successfully");
                            setOpenAddEditModal(false);
                            setEditingCustomer(null);
                            fetchCustomers();
                        })
                        .catch((err) => {
                            message.error("Failed to update customer");
                            console.error(err);
                        });
                } else {
                    // Add new customer
                    axios
                        .post(API_URL, values, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        })
                        .then(() => {
                            message.success("Customer added successfully");
                            setOpenAddEditModal(false);
                            fetchCustomers();
                        })
                        .catch((err) => {
                            message.error("Failed to add customer");
                            console.error(err);
                        });
                }
            })
            .catch((err) => {
                console.log("Validation Failed:", err);
            });
    };

    // Filter customers based on search query.
    const filteredCustomers = customers.filter((customer) => {
        const lower = searchQuery.toLowerCase();
        return (
            (customer.full_name &&
                customer.full_name.toLowerCase().includes(lower)) ||
            (customer.phone && customer.phone.toLowerCase().includes(lower)) ||
            (customer.address && customer.address.toLowerCase().includes(lower))
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
                    CUSTOMER MANAGEMENT
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        {/* Left side: Search input and Bulk Archive controls */}
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Search
                                placeholder="Search customers"
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
                                    title="Archive All"
                                >
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />
                                </Button>
                            )}
                        </div>
                        {/* Right side: Add Customer and Archived View */}
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Button
                                type="primary"
                                onClick={handleAdd}
                                style={{ marginRight: 16 }}
                            >
                                <PlusOutlined style={{ marginRight: 4 }} />
                                Add Customer
                            </Button>
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
                        dataSource={filteredCustomers}
                        rowKey="id"
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
                    rowKey="id"
                    pagination={false}
                />
            </Modal>
            {/* Add/Edit Customer Modal */}
            <Modal
                title={editingCustomer ? "Edit Customer" : "Add Customer"}
                centered
                open={openAddEditModal}
                onCancel={() => {
                    setOpenAddEditModal(false);
                    setEditingCustomer(null);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setOpenAddEditModal(false);
                            setEditingCustomer(null);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
                        {editingCustomer ? "Update Customer" : "Add Customer"}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="first_name"
                        label="First Name"
                        rules={[
                            {
                                required: true,
                                message: "Please enter first name",
                            },
                        ]}
                    >
                        <Input placeholder="Enter first name" />
                    </Form.Item>
                    <Form.Item
                        name="middle_name"
                        label="Middle Name (optional)"
                    >
                        <Input placeholder="Enter middle name" />
                    </Form.Item>
                    <Form.Item
                        name="last_name"
                        label="Last Name"
                        rules={[
                            {
                                required: true,
                                message: "Please enter last name",
                            },
                        ]}
                    >
                        <Input placeholder="Enter last name" />
                    </Form.Item>
                    <Form.Item name="suffix" label="Suffix (optional)">
                        <Input placeholder="Enter suffix (if any)" />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone">
                        <Input placeholder="Enter phone number" />
                    </Form.Item>
                    <Form.Item name="date_of_birth" label="Date of Birth">
                        <Input placeholder="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="gender" label="Gender">
                        <Select placeholder="Select gender">
                            <Option value="Male">Male</Option>
                            <Option value="Female">Female</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="address" label="Address">
                        <Input.TextArea placeholder="Enter address" />
                    </Form.Item>
                    {/* Optionally, you can add a customer image field if needed */}
                    {/* Only show password input when adding a customer */}
                    {!editingCustomer && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter password",
                                },
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </Layout>
    );
};

export default CustomerManagement;
