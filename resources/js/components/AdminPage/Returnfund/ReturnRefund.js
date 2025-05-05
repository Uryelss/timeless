import React, { useState, useEffect } from "react";
import {
    Layout,
    Table,
    Space,
    Button,
    Modal,
    Select,
    Input,
    message,
    Checkbox,
    Form,
    Input as AntInput,
    Image,
} from "antd";
import {
    EditOutlined,
    FolderOpenOutlined,
    UndoOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { Search } = Input;

const ReturnRefundManagement = () => {
    const [requests, setRequests] = useState([]);
    const [archivedRequests, setArchivedRequests] = useState([]);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [selectAllActive, setSelectAllActive] = useState(false);
    const [selectedActiveRequests, setSelectedActiveRequests] = useState([]);
    const [selectAllArchived, setSelectAllArchived] = useState(false);
    const [selectedArchivedRequests, setSelectedArchivedRequests] = useState(
        []
    );
    const [searchText, setSearchText] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openImageModal, setOpenImageModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [form] = Form.useForm();

    const API_URL = "http://localhost:8000/api/return-refunds";
    const STORAGE_URL = "http://localhost:8000/storage";
    const token = localStorage.getItem("token");

    const fetchRequests = async (archived = false) => {
        try {
            const url = archived ? `${API_URL}/archived` : API_URL;
            console.log(
                `Fetching ${
                    archived ? "archived" : "active"
                } requests from: ${url}`
            );
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(
                `Response for ${archived ? "archived" : "active"} requests:`,
                response.data
            );
            const transformed = Array.isArray(response.data)
                ? response.data.map((req) => ({
                      ...req,
                      selected: false,
                  }))
                : [];
            if (archived) {
                setArchivedRequests(transformed);
            } else {
                setRequests(transformed);
            }
        } catch (err) {
            console.error(
                `Error fetching ${
                    archived ? "archived" : "active"
                } return/refund requests:`,
                {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    headers: err.response?.headers,
                }
            );
            message.error(
                `Error fetching ${
                    archived ? "archived" : "active"
                } return/refund requests: ${
                    err.response?.data?.message || err.message
                }`
            );
        }
    };

    useEffect(() => {
        if (token) {
            fetchRequests(false); // Fetch active requests
            fetchRequests(true); // Fetch archived requests
        } else {
            console.warn("No token found, cannot fetch requests");
            message.error("Please log in as an admin to view requests");
        }
    }, [token]);

    const handleActiveCheckboxChange = (requestId) => {
        const updated = requests.map((req) =>
            req.id === requestId ? { ...req, selected: !req.selected } : req
        );
        setRequests(updated);
        setSelectedActiveRequests(
            updated.filter((r) => r.selected).map((r) => r.id)
        );
        setSelectAllActive(updated.every((r) => r.selected));
    };

    const handleSelectAllActiveChange = (e) => {
        const checked = e.target.checked;
        setSelectAllActive(checked);
        const updated = requests.map((req) => ({
            ...req,
            selected: checked,
        }));
        setRequests(updated);
        setSelectedActiveRequests(checked ? updated.map((r) => r.id) : []);
    };

    const handleArchiveAll = () => {
        if (selectedActiveRequests.length === 0) {
            message.warning("Please select at least one request to archive");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedActiveRequests.length} selected request(s)?`,
            onOk: () => {
                Promise.all(
                    selectedActiveRequests.map((id) =>
                        axios.post(
                            `${API_URL}/${id}/archive`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    )
                )
                    .then(() => {
                        message.success(
                            "Selected requests archived successfully"
                        );
                        fetchRequests(false);
                        fetchRequests(true);
                        setSelectedActiveRequests([]);
                        setSelectAllActive(false);
                    })
                    .catch((err) => {
                        console.error("Archive error:", err.response?.data);
                        message.error("Failed to archive some requests");
                    });
            },
        });
    };

    const handleArchivedCheckboxChange = (requestId) => {
        const updated = archivedRequests.map((req) =>
            req.id === requestId ? { ...req, selected: !req.selected } : req
        );
        setArchivedRequests(updated);
        setSelectedArchivedRequests(
            updated.filter((r) => r.selected).map((r) => r.id)
        );
        setSelectAllArchived(updated.every((r) => r.selected));
    };

    const handleSelectAllArchivedChange = (e) => {
        const checked = e.target.checked;
        setSelectAllArchived(checked);
        const updated = archivedRequests.map((req) => ({
            ...req,
            selected: checked,
        }));
        setArchivedRequests(updated);
        setSelectedArchivedRequests(checked ? updated.map((r) => r.id) : []);
    };

    const handleRestoreAll = () => {
        if (selectedArchivedRequests.length === 0) {
            message.warning("Please select at least one request to restore");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to restore ${selectedArchivedRequests.length} selected request(s)?`,
            onOk: () => {
                Promise.all(
                    selectedArchivedRequests.map((id) =>
                        axios.post(
                            `${API_URL}/${id}/restore`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    )
                )
                    .then(() => {
                        message.success(
                            "Selected requests restored successfully"
                        );
                        fetchRequests(false);
                        fetchRequests(true);
                        setSelectedArchivedRequests([]);
                        setSelectAllArchived(false);
                    })
                    .catch((err) => {
                        console.error("Restore error:", err.response?.data);
                        message.error("Failed to restore some requests");
                    });
            },
        });
    };

    const handleUpdate = () => {
        form.validateFields()
            .then((values) => {
                console.log("Updating request with values:", values);
                axios
                    .put(`${API_URL}/${selectedRequest.id}`, values, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((response) => {
                        console.log("Update response:", response.data);
                        message.success(
                            "Return/Refund request updated successfully"
                        );
                        setOpenEditModal(false);
                        fetchRequests(false);
                        fetchRequests(true);
                        if (response.data.new_order_id) {
                            message.info(
                                `New order created with ID: ${response.data.new_order_id}`
                            );
                        }
                    })
                    .catch((err) => {
                        console.error("Update error:", err.response?.data);
                        message.error(
                            `Failed to update request: ${
                                err.response?.data?.message || err.message
                            }`
                        );
                    });
            })
            .catch((err) => {
                console.error("Form validation error:", err);
                message.error("Please fill in all required fields");
            });
    };

    const handleViewImages = (record) => {
        try {
            const images = record.images ? JSON.parse(record.images) : [];
            setSelectedImages(images);
            setOpenImageModal(true);
        } catch (err) {
            console.error("Error parsing images:", err);
            message.error("Failed to load images");
        }
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
                    <EyeOutlined
                        onClick={() => handleViewImages(record)}
                        style={{ color: "#1890ff" }}
                    />
                    <EditOutlined
                        onClick={() => {
                            setSelectedRequest(record);
                            form.setFieldsValue({
                                status: record.status || "pending",
                                admin_comments: record.admin_comments || "",
                            });
                            setOpenEditModal(true);
                        }}
                    />
                    <FolderOpenOutlined
                        onClick={() => {
                            Modal.confirm({
                                title: "Are you sure you want to archive this request?",
                                onOk: () => {
                                    axios
                                        .post(
                                            `${API_URL}/${record.id}/archive`,
                                            {},
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            }
                                        )
                                        .then(() => {
                                            message.success(
                                                "Request archived successfully"
                                            );
                                            fetchRequests(false);
                                            fetchRequests(true);
                                        })
                                        .catch((err) => {
                                            console.error(
                                                "Archive error:",
                                                err.response?.data
                                            );
                                            message.error(
                                                "Failed to archive request"
                                            );
                                        });
                                },
                            });
                        }}
                    />
                </Space>
            ),
        },
        { title: "Request ID", dataIndex: "id", key: "id" },
        { title: "Order ID", dataIndex: "order_id", key: "order_id" },
        {
            title: "Customer",
            key: "customer",
            render: (record) =>
                record.profile
                    ? `${record.profile.first_name || ""} ${
                          record.profile.last_name || ""
                      }`.trim() || "Unknown Customer"
                    : "No Profile",
        },
        { title: "Issue Type", dataIndex: "issue_type", key: "issue_type" },
        { title: "Reason", dataIndex: "reason", key: "reason" },
        {
            title: "Refund Method",
            dataIndex: "refund_method",
            key: "refund_method",
        },
        {
            title: "Refund Amount",
            dataIndex: "refund_amount",
            key: "refund_amount",
            render: (amount) => `₱${parseFloat(amount || 0).toLocaleString()}`,
        },
        { title: "Status", dataIndex: "status", key: "status" },
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
                    <EyeOutlined
                        onClick={() => handleViewImages(record)}
                        style={{ color: "#1890ff" }}
                    />
                    <Button
                        type="link"
                        onClick={() => {
                            axios
                                .post(
                                    `${API_URL}/${record.id}/restore`,
                                    {},
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                )
                                .then(() => {
                                    message.success(
                                        "Request restored successfully"
                                    );
                                    fetchRequests(false);
                                    fetchRequests(true);
                                })
                                .catch((err) => {
                                    console.error(
                                        "Restore error:",
                                        err.response?.data
                                    );
                                    message.error("Failed to restore request");
                                });
                        }}
                        icon={<UndoOutlined />}
                    />
                </Space>
            ),
        },
        ...mainColumns.slice(1),
    ];

    const filteredRequests = requests.filter((req) => {
        const lowerSearch = searchText.toLowerCase();
        const customerName = req.profile
            ? `${req.profile.first_name || ""} ${
                  req.profile.last_name || ""
              }`.toLowerCase()
            : "";
        return (
            req.id?.toString().includes(lowerSearch) ||
            req.order_id?.toString().includes(lowerSearch) ||
            customerName.includes(lowerSearch) ||
            req.status?.toLowerCase().includes(lowerSearch)
        );
    });

    const filteredArchivedRequests = archivedRequests.filter((req) => {
        const lowerSearch = searchText.toLowerCase();
        const customerName = req.profile
            ? `${req.profile.first_name || ""} ${
                  req.profile.last_name || ""
              }`.toLowerCase()
            : "";
        return (
            req.id?.toString().includes(lowerSearch) ||
            req.order_id?.toString().includes(lowerSearch) ||
            customerName.includes(lowerSearch) ||
            req.status?.toLowerCase().includes(lowerSearch)
        );
    });

    return (
        <Layout>
            <Sider width={256} style={{ minHeight: "100vh" }}>
                <Sidebar />
            </Sider>
            <Layout>
                <Header style={{ background: "#fff", padding: "0 24px" }}>
                    RETURN/REFUND MANAGEMENT
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
                                placeholder="Search requests by ID, order ID, customer, or status"
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 300, marginRight: 16 }}
                            />
                            <Checkbox
                                checked={selectAllActive}
                                onChange={handleSelectAllActiveChange}
                                style={{ marginRight: 16 }}
                            >
                                Select All
                            </Checkbox>
                            {(selectAllActive ||
                                selectedActiveRequests.length > 0) && (
                                <Button
                                    type="link"
                                    onClick={handleArchiveAll}
                                    icon={<FolderOpenOutlined />}
                                />
                            )}
                        </div>
                        <Button
                            type="default"
                            onClick={() => {
                                fetchRequests(true);
                                setOpenArchiveModal(true);
                            }}
                            style={{ width: "131px" }}
                        >
                            Archived Requests
                        </Button>
                    </div>
                    <Table
                        columns={mainColumns}
                        dataSource={filteredRequests}
                        rowKey="id"
                        scroll={{ x: 1200 }}
                        locale={{
                            emptyText: "No active return/refund requests",
                        }}
                    />
                </Content>
            </Layout>
            <Modal
                title="Archived Return/Refund Requests"
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
                        selectedArchivedRequests.length > 0) && (
                        <Button
                            type="link"
                            onClick={handleRestoreAll}
                            icon={<UndoOutlined />}
                        />
                    )}
                </div>
                <Table
                    columns={archiveColumns}
                    dataSource={filteredArchivedRequests}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                    pagination={false}
                    locale={{ emptyText: "No archived return/refund requests" }}
                />
            </Modal>
            <Modal
                title="Edit Return/Refund Request"
                open={openEditModal}
                onCancel={() => setOpenEditModal(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setOpenEditModal(false)}
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
                        Update Request
                    </Button>,
                ]}
            >
                {selectedRequest && (
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a status",
                                },
                            ]}
                        >
                            <Select>
                                <Option value="pending">Pending</Option>
                                <Option value="approved">Approved</Option>
                                <Option value="denied">Denied</Option>
                                <Option value="completed">Completed</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="admin_comments"
                            label="Admin Comments"
                            rules={[{ required: false }]}
                        >
                            <AntInput.TextArea rows={4} />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
            <Modal
                title="Proof of Issue Images"
                centered
                open={openImageModal}
                onCancel={() => setOpenImageModal(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setOpenImageModal(false)}
                        style={{ width: "131px" }}
                    >
                        Close
                    </Button>,
                ]}
            >
                {selectedImages.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                        {selectedImages.map((image, index) => (
                            <Image
                                key={index}
                                src={`${STORAGE_URL}/${image}`}
                                alt={`Proof of issue ${index + 1}`}
                                width={200}
                                style={{ objectFit: "contain" }}
                            />
                        ))}
                    </div>
                ) : (
                    <p>No images available for this request.</p>
                )}
            </Modal>
        </Layout>
    );
};

export default ReturnRefundManagement;
