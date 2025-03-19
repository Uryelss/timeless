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
            setReviews(response.data.reviews);
            setArchivedReviews(response.data.archived_reviews);
        } catch (error) {
            message.error("Failed to fetch reviews");
            console.error(error);
        }
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

    const filteredReviews = reviews.filter((review) => {
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
                    style={{ width: 50, borderRadius: 5 }}
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
                <Button type="link" onClick={() => handleRestore(record)}>
                    <UndoOutlined style={{ fontSize: "18px" }} />
                </Button>
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
                        <Space>
                            <Search
                                placeholder="Search by username"
                                onSearch={(value) => setSearchQuery(value)}
                                style={{ width: 300 }}
                            />
                            <Select
                                placeholder="Filter by rating"
                                style={{ width: 200 }}
                                allowClear
                                onChange={(value) => setSelectedRating(value)}
                            >
                                <Option value={1}>⭐ 1 Star</Option>
                                <Option value={2}>⭐⭐ 2 Stars</Option>
                                <Option value={3}>⭐⭐⭐ 3 Stars</Option>
                                <Option value={4}>⭐⭐⭐⭐ 4 Stars</Option>
                                <Option value={5}>⭐⭐⭐⭐⭐ 5 Stars</Option>
                            </Select>
                        </Space>
                        <Button
                            type="default"
                            onClick={() => setOpenArchiveModal(true)}
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
                    >
                        Close
                    </Button>,
                ]}
            >
                <Table
                    columns={archiveColumns}
                    dataSource={archivedReviews}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1000 }}
                />
            </Modal>
        </Layout>
    );
};

export default ReviewsManagement;
