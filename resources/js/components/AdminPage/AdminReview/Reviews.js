import React, { useState, useEffect } from "react";
import {
    Layout,
    Table,
    Space,
    Button,
    Modal,
    Input,
    Select,
    Form,
    message,
    Checkbox,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    StarOutlined,
    UndoOutlined,
    FolderOpenOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Sidebar from "../AdminSidebar/Sidebar";

const { Header, Content, Sider } = Layout;
const { Search } = Input;
const { Option } = Select;

const ReviewsManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [archivedReviews, setArchivedReviews] = useState([]);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRating, setSelectedRating] = useState(null);
    const [selectAllActive, setSelectAllActive] = useState(false);
    const [selectedActiveReviews, setSelectedActiveReviews] = useState([]);
    const [selectAllArchived, setSelectAllArchived] = useState(false);
    const [selectedArchivedReviews, setSelectedArchivedReviews] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await axios.get("/api/admin/reviews", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setReviews(
                response.data.reviews.map((review) => ({
                    ...review,
                    selected: false,
                }))
            );
            setArchivedReviews(
                response.data.archived_reviews.map((review) => ({
                    ...review,
                    selected: false,
                }))
            );
        } catch (error) {
            message.error("Failed to fetch reviews");
            console.error(error);
        }
    };

    // Checkbox handling for active reviews
    const handleActiveCheckboxChange = (reviewId) => {
        const updatedReviews = reviews.map((review) =>
            review.id === reviewId
                ? { ...review, selected: !review.selected }
                : review
        );
        setReviews(updatedReviews);
        setSelectedActiveReviews(
            updatedReviews.filter((r) => r.selected).map((r) => r.id)
        );
        const filtered = updatedReviews.filter((review) => {
            const matchesRating = selectedRating
                ? review.rating === selectedRating
                : true;
            const matchesSearch = review.username
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            return matchesRating && matchesSearch;
        });
        setSelectAllActive(filtered.every((r) => r.selected));
    };

    // Select All checkbox handling for active reviews, respecting filters
    const handleSelectAllActiveChange = (e) => {
        const checked = e.target.checked;
        setSelectAllActive(checked);
        const updatedReviews = reviews.map((review) => {
            const matchesRating = selectedRating
                ? review.rating === selectedRating
                : true;
            const matchesSearch = review.username
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            return {
                ...review,
                selected: checked && matchesRating && matchesSearch,
            };
        });
        setReviews(updatedReviews);
        setSelectedActiveReviews(
            updatedReviews.filter((r) => r.selected).map((r) => r.id)
        );
    };

    // Checkbox handling for archived reviews
    const handleArchivedCheckboxChange = (reviewId) => {
        const updatedArchived = archivedReviews.map((review) =>
            review.id === reviewId
                ? { ...review, selected: !review.selected }
                : review
        );
        setArchivedReviews(updatedArchived);
        setSelectedArchivedReviews(
            updatedArchived.filter((r) => r.selected).map((r) => r.id)
        );
        const allSelected = updatedArchived.every((r) => r.selected);
        setSelectAllArchived(allSelected);
    };

    // Select All checkbox handling for archived reviews
    const handleSelectAllArchivedChange = (e) => {
        const checked = e.target.checked;
        setSelectAllArchived(checked);
        const updatedArchived = archivedReviews.map((review) => ({
            ...review,
            selected: checked,
        }));
        setArchivedReviews(updatedArchived);
        setSelectedArchivedReviews(
            checked ? updatedArchived.map((r) => r.id) : []
        );
    };

    const handleEdit = (record) => {
        setEditingReview(record);
        form.setFieldsValue({
            rating: record.rating,
            review: record.review,
        });
        setOpenEditModal(true);
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            const response = await axios.put(
                `/api/admin/reviews/${editingReview.id}`,
                values,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            message.success(response.data.message);
            setOpenEditModal(false);
            setEditingReview(null);
            fetchReviews();
        } catch (error) {
            message.error("Failed to update review");
            console.error(error);
        }
    };

    const handleArchive = (record) => {
        Modal.confirm({
            title: "Are you sure you want to archive this review?",
            onOk: async () => {
                try {
                    const response = await axios.post(
                        `/api/admin/reviews/${record.id}/archive`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        }
                    );
                    message.success(response.data.message);
                    fetchReviews();
                } catch (error) {
                    message.error("Failed to archive review");
                    console.error(error);
                }
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    // Bulk archive handler for active reviews
    const handleArchiveAll = () => {
        if (selectedActiveReviews.length === 0) {
            message.warning("Please select at least one review to archive");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to archive ${selectedActiveReviews.length} selected review(s)?`,
            onOk: async () => {
                try {
                    await Promise.all(
                        selectedActiveReviews.map((id) =>
                            axios.post(
                                `/api/admin/reviews/${id}/archive`,
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
                    );
                    message.success("Selected reviews archived successfully");
                    fetchReviews();
                    setSelectedActiveReviews([]);
                    setSelectAllActive(false);
                } catch (error) {
                    message.error("Failed to archive some reviews");
                    console.error(error);
                }
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    const handleRestore = async (record) => {
        try {
            const response = await axios.post(
                `/api/admin/reviews/${record.id}/restore`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            message.success(response.data.message);
            fetchReviews();
        } catch (error) {
            message.error("Failed to restore review");
            console.error(error);
        }
    };

    // Bulk restore handler for archived reviews
    const handleRestoreAll = () => {
        if (selectedArchivedReviews.length === 0) {
            message.warning("Please select at least one review to restore");
            return;
        }
        Modal.confirm({
            title: `Are you sure you want to restore ${selectedArchivedReviews.length} selected review(s)?`,
            onOk: async () => {
                try {
                    await Promise.all(
                        selectedArchivedReviews.map((id) =>
                            axios.post(
                                `/api/admin/reviews/${id}/restore`,
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
                    );
                    message.success("Selected reviews restored successfully");
                    fetchReviews();
                    setSelectedArchivedReviews([]);
                    setSelectAllArchived(false);
                } catch (error) {
                    message.error("Failed to restore some reviews");
                    console.error(error);
                }
            },
            okButtonProps: { style: { width: "80px" } },
            cancelButtonProps: { style: { width: "80px" } },
        });
    };

    const filteredReviews = reviews.filter((review) => {
        const matchesSearch = review.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesRating = selectedRating
            ? review.rating === selectedRating
            : true;
        return matchesSearch && matchesRating;
    });

    const filteredArchivedReviews = archivedReviews.filter((review) => {
        const matchesSearch = review.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesRating = selectedRating
            ? review.rating === selectedRating
            : true;
        return matchesSearch && matchesRating;
    });

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
                        style={{ fontSize: "16px", cursor: "pointer" }}
                    />
                    <DeleteOutlined
                        onClick={() => handleArchive(record)}
                        style={{
                            fontSize: "16px",
                            cursor: "pointer",
                            color: "red",
                        }}
                    />
                </Space>
            ),
        },
        {
            title: "Product Photo",
            dataIndex: "product_image",
            key: "product_image",
            render: (image) => (
                <img
                    src={image || "https://via.placeholder.com/50"}
                    alt="Product"
                    style={{ width: "60px", borderRadius: 5, height: "70px" }}
                />
            ),
        },
        {
            title: "Product Name",
            dataIndex: "product_name",
            key: "product_name",
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            render: (rating) => (
                <Space>
                    <StarOutlined style={{ color: "#FFD700" }} />
                    {rating}
                </Space>
            ),
        },
        {
            title: "Review",
            dataIndex: "review",
            key: "review",
        },
        {
            title: "Date Added",
            dataIndex: "date_added",
            key: "date_added",
        },
        {
            title: "Date Updated",
            dataIndex: "date_updated",
            key: "date_updated",
        },
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
                    <Button type="link" onClick={() => handleRestore(record)}>
                        <UndoOutlined style={{ fontSize: "18px" }} />
                    </Button>
                </Space>
            ),
        },
        ...columns.slice(1),
    ];

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
                    REVIEWS MANAGEMENT
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                            }}
                        >
                            <Search
                                placeholder="Search by username"
                                onSearch={(value) => setSearchQuery(value)}
                                style={{ width: 300 }}
                            />
                            <Select
                                placeholder="Filter by rating"
                                style={{ width: 200 }}
                                allowClear
                                onChange={(value) => {
                                    setSelectedRating(value);
                                    setSelectAllActive(false); // Reset Select All when filter changes
                                    setSelectedActiveReviews([]); // Reset selected reviews when filter changes
                                    const updatedReviews = reviews.map(
                                        (review) => ({
                                            ...review,
                                            selected: false,
                                        })
                                    );
                                    setReviews(updatedReviews);
                                }}
                            >
                                <Option value={1}>⭐ 1 Star</Option>
                                <Option value={2}>⭐⭐ 2 Stars</Option>
                                <Option value={3}>⭐⭐⭐ 3 Stars</Option>
                                <Option value={4}>⭐⭐⭐⭐ 4 Stars</Option>
                                <Option value={5}>⭐⭐⭐⭐⭐ 5 Stars</Option>
                            </Select>
                            <Checkbox
                                checked={selectAllActive}
                                onChange={handleSelectAllActiveChange}
                            >
                                Select All
                            </Checkbox>
                            {(selectAllActive ||
                                selectedActiveReviews.length > 0) && (
                                <Button type="link" onClick={handleArchiveAll}>
                                    <FolderOpenOutlined
                                        style={{ fontSize: "18px" }}
                                    />
                                    Archive
                                    {selectedActiveReviews.length > 0 &&
                                        ` (${selectedActiveReviews.length})`}
                                </Button>
                            )}
                        </div>
                        <Button
                            type="default"
                            onClick={() => setOpenArchiveModal(true)}
                            style={{ width: "180px" }}
                        >
                            <FolderOpenOutlined style={{ marginRight: 4 }} />{" "}
                            View Archived Reviews
                        </Button>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={filteredReviews}
                        rowKey="id"
                        scroll={{ x: 1000 }}
                    />
                </Content>
            </Layout>

            <Modal
                title="Edit Review"
                centered
                open={openEditModal}
                onOk={handleUpdate}
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
                        Update Review
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="rating"
                        label="Rating"
                        rules={[
                            {
                                required: true,
                                message: "Please select a rating",
                            },
                        ]}
                    >
                        <Select>
                            <Option value={1}>1 Star</Option>
                            <Option value={2}>2 Stars</Option>
                            <Option value={3}>3 Stars</Option>
                            <Option value={4}>4 Stars</Option>
                            <Option value={5}>5 Stars</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="review"
                        label="Review"
                        rules={[
                            {
                                required: true,
                                message: "Please enter a review",
                            },
                        ]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Archived Reviews"
                centered
                open={openArchiveModal}
                onCancel={() => setOpenArchiveModal(false)}
                width={1000}
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
                        selectedArchivedReviews.length > 0) && (
                        <Button
                            type="link"
                            onClick={handleRestoreAll}
                            style={{ marginRight: 8 }}
                        >
                            <UndoOutlined style={{ fontSize: "18px" }} />
                            Restore
                            {selectedArchivedReviews.length > 0 &&
                                ` (${selectedArchivedReviews.length})`}
                        </Button>
                    )}
                </div>
                <Table
                    columns={archiveColumns}
                    dataSource={filteredArchivedReviews}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1000 }}
                />
            </Modal>
        </Layout>
    );
};

export default ReviewsManagement;
