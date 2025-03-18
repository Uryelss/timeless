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
    const [selectAllActive, setSelectAllActive] = useState(false);
    const [selectAllArchived, setSelectAllArchived] = useState(false);
    const [selectedActiveCustomers, setSelectedActiveCustomers] = useState([]);
    const [selectedArchivedCustomers, setSelectedArchivedCustomers] = useState(
        []
    );
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();

    const API_URL = "http://localhost:8000/api/customers";

    const fetchCustomers = () => {
        axios
            .get(API_URL, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                setCustomers(
                    res.data.map((customer) => ({
                        ...customer,
                        selected: false,
                    }))
                );
            })
            .catch((err) => {
                message.error("Error fetching customers");
                console.error(err);
            });
    };

    const fetchArchivedCustomers = () => {
        axios
            .get(`${API_URL}?archived=1`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                setArchivedCustomers(
                    res.data.map((customer) => ({
                        ...customer,
                        selected: false,
                    }))
                );
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
        if (openArchiveModal) fetchArchivedCustomers();
    }, [openArchiveModal]);

    const handleActiveCheckboxChange = (customerId) => {
        const updatedCustomers = customers.map((customer) =>
            customer.id === customerId
                ? { ...customer, selected: !customer.selected }
                : customer
        );
        setCustomers(updatedCustomers);
        setSelectedActiveCustomers(
            updatedCustomers.filter((c) => c.selected).map((c) => c.id)
        );
        const allSelected = updatedCustomers.every((c) => c.selected);
        setSelectAllActive(allSelected);
    };

    const handleSelectAllActiveChange = (e) => {
        const checked = e.target.checked;
        setSelectAllActive(checked);
        const updatedCustomers = customers.map((customer) => ({
            ...customer,
            selected: checked,
        }));
        setCustomers(updatedCustomers);
        setSelectedActiveCustomers(
            checked ? updatedCustomers.map((c) => c.id) : []
        );
    };

    const handleArchiveAll = () => {
        if (selectedActiveCustomers.length === 0) {
            message.warning("Please select at least one customer to archive");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedActiveCustomers.length} selected customer(s)?`,
            onOk: () => {
                Promise.all(
                    selectedActiveCustomers.map((id) =>
                        axios.delete(`${API_URL}/${id}`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        })
                    )
                )
                    .then(() => {
                        message.success(
                            "Selected customers archived successfully"
                        );
                        fetchCustomers();
                        setSelectedActiveCustomers([]);
                        setSelectAllActive(false);
                    })
                    .catch((err) =>
                        message.error("Failed to archive some customers")
                    );
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    const handleArchivedCheckboxChange = (customerId) => {
        const updatedArchived = archivedCustomers.map((customer) =>
            customer.id === customerId
                ? { ...customer, selected: !customer.selected }
                : customer
        );
        setArchivedCustomers(updatedArchived);
        setSelectedArchivedCustomers(
            updatedArchived.filter((c) => c.selected).map((c) => c.id)
        );
        const allSelected = updatedArchived.every((c) => c.selected);
        setSelectAllArchived(allSelected);
    };

    const handleSelectAllArchivedChange = (e) => {
        const checked = e.target.checked;
        setSelectAllArchived(checked);
        const updatedArchived = archivedCustomers.map((customer) => ({
            ...customer,
            selected: checked,
        }));
        setArchivedCustomers(updatedArchived);
        setSelectedArchivedCustomers(
            checked ? updatedArchived.map((c) => c.id) : []
        );
    };

    const handleRestoreAll = () => {
        if (selectedArchivedCustomers.length === 0) {
            message.warning("Please select at least one customer to restore");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to restore ${selectedArchivedCustomers.length} selected customer(s)?`,
            onOk: () => {
                Promise.all(
                    selectedArchivedCustomers.map((id) =>
                        axios.post(
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
                    )
                )
                    .then(() => {
                        message.success(
                            "Selected customers restored successfully"
                        );
                        fetchArchivedCustomers();
                        fetchCustomers();
                        setSelectedArchivedCustomers([]);
                        setSelectAllArchived(false);
                    })
                    .catch((err) =>
                        message.error("Failed to restore some customers")
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
            key: "customerName",
            render: (record) =>
                record.customer_name ||
                `${record.first_name} ${
                    record.middle_name
                        ? record.middle_name.charAt(0).toUpperCase() + ". "
                        : ""
                }${record.last_name}`,
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            render: (phone) => phone || "N/A",
        },
        {
            title: "Date of Birth",
            dataIndex: "date_of_birth",
            key: "date_of_birth",
            render: (dob) => dob || "N/A",
        },
        {
            title: "Gender",
            dataIndex: "gender",
            key: "gender",
            render: (gender) => gender || "N/A",
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
            render: (address) => address || "N/A",
        },
        { title: "Last Updated", dataIndex: "updated_at", key: "updated_at" },
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
        ...mainColumns.slice(1),
    ];

    const handleEdit = (record) => {
        setEditingCustomer(record);
        form.setFieldsValue({
            first_name: record.first_name,
            middle_name: record.middle_name,
            last_name: record.last_name,
            suffix: record.suffix,
            gender: record.gender,
            date_of_birth: record.date_of_birth,
        });
        setOpenEditModal(true);
    };

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
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

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
            .catch((err) => console.log("Validation Failed:", err));
    };

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
            (customer.phone && customer.phone.toLowerCase().includes(lower)) ||
            (customer.address && customer.address.toLowerCase().includes(lower))
        );
    });

    const filteredArchivedCustomers = archivedCustomers.filter((customer) => {
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
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Search
                                placeholder="Search customers"
                                onSearch={(value) => setSearchQuery(value)}
                                style={{ width: 300, marginRight: 16 }}
                            />
                            <Checkbox
                                checked={selectAllActive}
                                onChange={handleSelectAllActiveChange}
                                style={{ marginLeft: 16 }}
                            >
                                Select All
                            </Checkbox>
                            {(selectAllActive ||
                                selectedActiveCustomers.length > 0) && (
                                <Button
                                    type="link"
                                    onClick={handleArchiveAll}
                                    style={{ marginLeft: 8 }}
                                >
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />
                                    {selectedActiveCustomers.length > 0 &&
                                        ` (${selectedActiveCustomers.length})`}
                                </Button>
                            )}
                        </div>
                        <Button
                            type="default"
                            icon={<DeleteOutlined />}
                            onClick={() => setOpenArchiveModal(true)}
                            style={{ marginRight: 8, width: "131px" }}
                        >
                            Archived View
                        </Button>
                    </div>
                    <Table
                        columns={mainColumns}
                        dataSource={filteredCustomers}
                        rowKey="id"
                        scroll={{ x: 1200 }}
                    />
                </Content>
            </Layout>
            <Modal
                title="Archived Customers"
                centered
                open={openArchiveModal}
                onCancel={() => setOpenArchiveModal(false)}
                width={1200}
                footer={[]}
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
                        selectedArchivedCustomers.length > 0) && (
                        <Button
                            type="link"
                            onClick={handleRestoreAll}
                            style={{ marginRight: 8 }}
                        >
                            <UndoOutlined style={{ fontSize: "18px" }} />
                            Restore
                            {selectedArchivedCustomers.length > 0 &&
                                ` (${selectedArchivedCustomers.length})`}
                        </Button>
                    )}
                </div>
                <Table
                    columns={archiveColumns}
                    dataSource={filteredArchivedCustomers}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1200 }}
                />
            </Modal>
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
                        style={{ width: "131px" }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        onClick={handleUpdate}
                        style={{ width: "131px" }}
                    >
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
                    <Form.Item name="gender" label="Gender">
                        <Input placeholder="Enter gender" />
                    </Form.Item>
                    <Form.Item name="date_of_birth" label="Date of Birth">
                        <Input placeholder="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item label="Note">
                        <span>
                            Phone and Address editing requires address
                            management (not implemented here).
                        </span>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default CustomerManagement;
