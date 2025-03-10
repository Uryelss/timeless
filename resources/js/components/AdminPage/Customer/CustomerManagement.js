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
    UndoOutlined,
    FolderOpenOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Search } = Input;

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [archivedCustomers, setArchivedCustomers] = useState([]);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();

    // API endpoint for customer profiles
    const API_URL = "http://localhost:8000/api/customers";

    // Fetch active customer profiles
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

    // Fetch archived customer profiles
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

    // Table columns for active customers
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
                        image
                            ? image
                            : "https://via.placeholder.com/100?text=Customer"
                    }
                    alt="customer"
                    style={{ width: 50 }}
                />
            ),
        },
        {
            title: "Customer Name",
            key: "customerName",
            render: (record) =>
                record.customer_name
                    ? record.customer_name
                    : `${record.first_name} ${
                          record.middle_name
                              ? record.middle_name.charAt(0).toUpperCase() +
                                ". "
                              : ""
                      }${record.last_name}`,
        },
        { title: "Phone", dataIndex: "phone", key: "phone" },
        {
            title: "Date of Birth",
            dataIndex: "date_of_birth",
            key: "date_of_birth",
        },
        { title: "Gender", dataIndex: "gender", key: "gender" },
        { title: "Address", dataIndex: "address", key: "address" },
        { title: "Last Updated", dataIndex: "updated_at", key: "updated_at" },
    ];

    // Archive table columns – similar to main, but with only restore action.
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
            gender: record.gender, // these fields become optional on update
            date_of_birth: record.date_of_birth,
            phone: record.phone,
            address: record.address,
        });
        setOpenEditModal(true);
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

    // Bulk archive handler (if needed)
    const handleArchiveAll = () => {
        Modal.confirm({
            title: "Are you sure you want to archive all selected customers?",
            onOk: () => {
                message.success("Bulk archive executed (not implemented)");
            },
        });
    };

    // Filter customers based on search query.
    const filteredCustomers = customers.filter((customer) => {
        const lower = searchQuery.toLowerCase();
        const fullName =
            customer.customer_name ||
            `${customer.first_name} ${
                customer.middle_name
                    ? customer.middle_name.charAt(0).toUpperCase() + ". "
                    : ""
            }${customer.last_name}`;
        return (
            fullName.toLowerCase().includes(lower) ||
            (customer.email && customer.email.toLowerCase().includes(lower)) ||
            (customer.status && customer.status.toLowerCase().includes(lower))
        );
    });

    // Handle update of customer profile (called from the edit modal)
    const handleUpdate = () => {
        form.validateFields()
            .then((values) => {
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
                        setOpenEditModal(false);
                        setEditingCustomer(null);
                        fetchCustomers();
                    })
                    .catch((err) => {
                        message.error("Failed to update customer");
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
                                style={{ width: 300, marginRight: 16 }}
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
                        {/* Right side: Archived View */}
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
                    scroll={{ x: 1200 }}
                />
            </Modal>
            {/* Edit Customer Modal */}
            <Modal
                title="Edit Customer"
                centered
                open={openEditModal}
                onCancel={() => {
                    setOpenEditModal(false);
                    setEditingCustomer(null);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setOpenEditModal(false);
                            setEditingCustomer(null);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" onClick={handleUpdate}>
                        Update Customer
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
                    <Form.Item name="middle_name" label="Middle Name">
                        <Input placeholder="Enter middle name (optional)" />
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
                    <Form.Item name="suffix" label="Suffix">
                        <Input placeholder="Enter suffix (optional)" />
                    </Form.Item>
                    {/* For update, make these fields optional */}
                    <Form.Item name="gender" label="Gender">
                        <Input placeholder="Enter gender" />
                    </Form.Item>
                    <Form.Item name="date_of_birth" label="Date of Birth">
                        <Input placeholder="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone">
                        <Input placeholder="Enter phone number" />
                    </Form.Item>
                    <Form.Item name="address" label="Address">
                        <Input placeholder="Enter address" />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default CustomerManagement;