import React, { useState, useEffect } from "react";
import {
    Layout,
    Table,
    Space,
    Checkbox,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Row,
    Col,
    Upload,
    message,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UploadOutlined,
    UndoOutlined,
    FolderOpenOutlined,
} from "@ant-design/icons";
import Sidebar from "../AdminSidebar/Sidebar";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { TextArea, Search } = Input;

const ProductManagement = () => {
    // Modal and form states
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [products, setProducts] = useState([]);
    const [archivedProducts, setArchivedProducts] = useState([]);
    // currentProduct: if null, we're adding; if not, we're updating.
    const [currentProduct, setCurrentProduct] = useState(null);

    // Image states for main and side images
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState("");
    const [sideImagesFiles, setSideImagesFiles] = useState([null, null, null]);
    const [sideImagesPreview, setSideImagesPreview] = useState(["", "", ""]);

    // Dynamic options for select fields
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [movements, setMovements] = useState([]);
    const [strapMaterials, setStrapMaterials] = useState([]);
    const [genders, setGenders] = useState([]);
    const [sizesOptions, setSizesOptions] = useState([]);

    // Base URL for images (adjust as needed)
    const imageBaseURL = "http://localhost:8000/storage/";

    // Fetch products from API
    const fetchProducts = () => {
        axios
            .get("http://localhost:8000/api/products", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => setProducts(res.data))
            .catch((err) => message.error("Error fetching products"));
    };

    // Fetch archived products
    const fetchArchivedProducts = () => {
        axios
            .get("http://localhost:8000/api/products?archived=1", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => setArchivedProducts(res.data))
            .catch((err) => message.error("Error fetching archived products"));
    };

    // Fetch sub-category options dynamically based on type
    const fetchSubCategoryOptions = (type, setter) => {
        axios
            .get(`http://localhost:8000/api/sub-categories?type=${type}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => setter(res.data))
            .catch((err) => console.error(`Error fetching ${type}`, err));
    };

    useEffect(() => {
        fetchProducts();
        fetchSubCategoryOptions("brand", setBrands);
        fetchSubCategoryOptions("categories", setCategories);
        fetchSubCategoryOptions("movement", setMovements);
        fetchSubCategoryOptions("strap_materials", setStrapMaterials);
        fetchSubCategoryOptions("gender", setGenders);
        fetchSubCategoryOptions("sizes", setSizesOptions);
    }, []);

    useEffect(() => {
        if (openArchiveModal) {
            fetchArchivedProducts();
        }
    }, [openArchiveModal]);

    // Helper for validation rules.
    // When adding, fields are required. When updating, form is prefilled so we relax client-side rules.
    const getRule = (message) => [{ required: !currentProduct, message }];

    // Table columns for active products
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
        {
            title: "Product Image",
            dataIndex: "main_image",
            key: "main_image",
            render: (image) => (
                <img
                    src={
                        image
                            ? `${imageBaseURL}${image}`
                            : "https://via.placeholder.com/100?text=Prod"
                    }
                    alt="product"
                    style={{ width: 50 }}
                />
            ),
        },
        {
            title: "Product Name",
            dataIndex: "product_name",
            key: "product_name",
        },
        {
            title: "Brand",
            dataIndex: "brand_id",
            key: "brand_id",
            render: (id) => {
                const option = brands.find((b) => b.id === id);
                return option ? option.name : "";
            },
        },
        {
            title: "Category",
            dataIndex: "category_id",
            key: "category_id",
            render: (id) => {
                const option = categories.find((c) => c.id === id);
                return option ? option.name : "";
            },
        },
        {
            title: "Movement",
            dataIndex: "movement_id",
            key: "movement_id",
            render: (id) => {
                const option = movements.find((m) => m.id === id);
                return option ? option.name : "";
            },
        },
        {
            title: "Strap Material",
            dataIndex: "strap_material_id",
            key: "strap_material_id",
            render: (id) => {
                const option = strapMaterials.find((s) => s.id === id);
                return option ? option.name : "";
            },
        },
        {
            title: "Gender",
            dataIndex: "gender_id",
            key: "gender_id",
            render: (id) => {
                const option = genders.find((g) => g.id === id);
                return option ? option.name : "";
            },
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `$${price}`,
        },
        { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    ];

    // Archive table columns – similar to main, but only restore action
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

    // When editing, prefill the form and load current images into previews.
    const handleEdit = (record) => {
        console.log("Edit product:", record);
        setCurrentProduct(record);
        form.setFieldsValue({
            id: record.id,
            product_name: record.product_name,
            brand_id: record.brand_id,
            category_id: record.category_id,
            movement_id: record.movement_id,
            strap_material_id: record.strap_material_id,
            gender_id: record.gender_id,
            price: record.price,
            quantity: record.quantity,
            description: record.description,
            sizes: record.sizes,
        });
        setMainImagePreview(
            record.main_image ? imageBaseURL + record.main_image : ""
        );
        // For simplicity, we clear side images on edit.
        setSideImagesPreview(["", "", ""]);
        setSideImagesFiles([null, null, null]);
        setOpenAddModal(true);
    };

    // Archive a product
    const handleArchive = (record) => {
        Modal.confirm({
            title: "Are you sure you want to archive this product?",
            onOk: () => {
                axios
                    .delete(`http://localhost:8000/api/products/${record.id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    })
                    .then(() => {
                        message.success("Product archived successfully");
                        fetchProducts();
                    })
                    .catch((err) => message.error("Failed to archive product"));
            },
        });
    };

    // Restore a product
    const handleRestore = (id) => {
        axios
            .post(
                `http://localhost:8000/api/products/${id}/restore`,
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
                message.success("Product restored successfully");
                fetchArchivedProducts();
                fetchProducts();
            })
            .catch((err) => message.error("Failed to restore product"));
    };

    // Bulk archive (placeholder)
    const handleArchiveAll = () => {
        Modal.confirm({
            title: "Are you sure you want to archive all selected products?",
            onOk: () => {
                message.success("Bulk archive executed (not implemented)");
            },
        });
    };

    // Open Add Product modal (reset form and images)
    const handleAdd = () => {
        form.resetFields();
        setCurrentProduct(null);
        setMainImageFile(null);
        setMainImagePreview("");
        setSideImagesFiles([null, null, null]);
        setSideImagesPreview(["", "", ""]);
        setOpenAddModal(true);
    };

    // Save product: if updating, perform PUT; if adding, perform POST.
    // For update, only append new image files if provided.
    const handleSave = () => {
        form.validateFields()
            .then((values) => {
                const formData = new FormData();
                formData.append("product_name", values.product_name);
                formData.append("brand_id", parseInt(values.brand_id, 10));
                formData.append(
                    "category_id",
                    parseInt(values.category_id, 10)
                );
                formData.append(
                    "movement_id",
                    parseInt(values.movement_id, 10)
                );
                formData.append(
                    "strap_material_id",
                    parseInt(values.strap_material_id, 10)
                );
                formData.append("gender_id", parseInt(values.gender_id, 10));
                formData.append("price", values.price);
                formData.append("quantity", values.quantity);
                formData.append("description", values.description);
                formData.append("sizes", JSON.stringify(values.sizes || {}));

                // Append new image files only if uploaded
                if (mainImageFile) {
                    formData.append("main_image", mainImageFile);
                }
                sideImagesFiles.forEach((file, index) => {
                    if (file) {
                        formData.append(`side_image_${index + 1}`, file);
                    }
                });

                // IMPORTANT: For update, use _method override for FormData with PUT.
                if (values.id) {
                    formData.append("_method", "PUT");
                    axios
                        .post(
                            `http://localhost:8000/api/products/${values.id}`,
                            formData,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem(
                                        "token"
                                    )}`,
                                    "Content-Type": "multipart/form-data",
                                },
                            }
                        )
                        .then(() => {
                            message.success("Product updated successfully");
                            setOpenAddModal(false);
                            fetchProducts();
                        })
                        .catch((err) => {
                            console.error(err);
                            message.error("Failed to update product");
                        });
                } else {
                    // Adding new product – require main image.
                    if (!mainImageFile) {
                        message.error("Main product image is required.");
                        return;
                    }
                    axios
                        .post("http://localhost:8000/api/products", formData, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                                "Content-Type": "multipart/form-data",
                            },
                        })
                        .then(() => {
                            message.success("Product added successfully");
                            setOpenAddModal(false);
                            fetchProducts();
                        })
                        .catch((err) => {
                            console.error(err);
                            message.error("Failed to add product");
                        });
                }
            })
            .catch((err) => {
                console.log("Validation Failed:", err);
            });
    };

    const handleImageUpload = (info, type, index = null) => {
        if (info.file.status === "done" || info.file.status === "uploading") {
            const file = info.file.originFileObj;
            const preview = URL.createObjectURL(file);
            if (type === "main") {
                setMainImageFile(file);
                setMainImagePreview(preview);
            } else {
                const updatedFiles = [...sideImagesFiles];
                updatedFiles[index] = file;
                setSideImagesFiles(updatedFiles);
                const updatedPreviews = [...sideImagesPreview];
                updatedPreviews[index] = preview;
                setSideImagesPreview(updatedPreviews);
            }
        }
    };

    const customUploadRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };

    const filteredProducts = products.filter((product) => {
        const lower = searchText.toLowerCase();
        return (
            product.product_name.toLowerCase().includes(lower) ||
            brands
                .find((b) => b.id === product.brand_id)
                ?.name.toLowerCase()
                .includes(lower) ||
            categories
                .find((c) => c.id === product.category_id)
                ?.name.toLowerCase()
                .includes(lower)
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
                    PRODUCT MANAGEMENT
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
                                placeholder="Search products..."
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 200, marginRight: 8 }}
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
                                icon={<DeleteOutlined />}
                                onClick={() => setOpenArchiveModal(true)}
                                style={{ marginRight: 8 }}
                            >
                                Archived View
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                            >
                                Add Product
                            </Button>
                        </div>
                    </div>
                    <Table
                        columns={mainColumns}
                        dataSource={filteredProducts}
                        scroll={{ x: 1200 }}
                    />
                </Content>
            </Layout>

            {/* Add / Edit Product Modal */}
            <Modal
                title="Add / Edit Product"
                centered
                open={openAddModal}
                onCancel={() => setOpenAddModal(false)}
                width={1000}
                footer={[
                    <Button key="cancel" onClick={() => setOpenAddModal(false)}>
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
                        Save Product
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    {/* Hidden field for product id (for update) */}
                    <Form.Item name="id" style={{ display: "none" }}>
                        <Input type="hidden" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="product_name"
                                label="Product Name"
                                rules={getRule("Please enter product name")}
                            >
                                <Input placeholder="Enter product name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="brand_id"
                                label="Brand"
                                rules={getRule("Please select a brand")}
                            >
                                <Select placeholder="Select Brand">
                                    {brands.map((brand) => (
                                        <Option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="category_id"
                                label="Category"
                                rules={getRule("Please select a category")}
                            >
                                <Select placeholder="Select Category">
                                    {categories.map((category) => (
                                        <Option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="strap_material_id"
                                label="Strap Material"
                                rules={getRule(
                                    "Please select a strap material"
                                )}
                            >
                                <Select placeholder="Select Strap Material">
                                    {strapMaterials.map((s) => (
                                        <Option key={s.id} value={s.id}>
                                            {s.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="movement_id"
                                label="Movement"
                                rules={getRule("Please select a movement")}
                            >
                                <Select placeholder="Select Movement">
                                    {movements.map((m) => (
                                        <Option key={m.id} value={m.id}>
                                            {m.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="gender_id"
                                label="Gender"
                                rules={getRule("Please select gender")}
                            >
                                <Select placeholder="Select Gender">
                                    {genders.map((g) => (
                                        <Option key={g.id} value={g.id}>
                                            {g.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Price"
                                rules={getRule("Please enter price")}
                            >
                                <Input
                                    type="number"
                                    placeholder="Enter price"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="quantity"
                                label="Quantity"
                                rules={getRule("Please enter quantity")}
                            >
                                <Input
                                    type="number"
                                    placeholder="Enter quantity"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="sizes"
                        label="Available Sizes"
                        rules={getRule("Please select sizes")}
                    >
                        <Select mode="multiple" placeholder="Select sizes">
                            {sizesOptions.map((s) => (
                                <Option key={s.id} value={s.name}>
                                    {s.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={getRule("Please enter product description")}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter product description"
                        />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Main Product Image">
                                <Upload
                                    showUploadList={false}
                                    customRequest={customUploadRequest}
                                    onChange={(info) =>
                                        handleImageUpload(info, "main")
                                    }
                                >
                                    <Button icon={<UploadOutlined />}>
                                        Upload Main Image
                                    </Button>
                                </Upload>
                                <div style={{ marginTop: 8 }}>
                                    <img
                                        src={
                                            mainImagePreview ||
                                            "https://via.placeholder.com/150?text=Main+Image"
                                        }
                                        alt="Main Preview"
                                        style={{ width: 150 }}
                                    />
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        {sideImagesPreview.map((img, index) => (
                            <Col span={8} key={index}>
                                <Form.Item label={`Side Image ${index + 1}`}>
                                    <Upload
                                        showUploadList={false}
                                        customRequest={customUploadRequest}
                                        onChange={(info) =>
                                            handleImageUpload(
                                                info,
                                                "side",
                                                index
                                            )
                                        }
                                    >
                                        <Button icon={<UploadOutlined />}>
                                            Upload
                                        </Button>
                                    </Upload>
                                    <div style={{ marginTop: 8 }}>
                                        <img
                                            src={
                                                img ||
                                                `https://via.placeholder.com/100?text=Side+${
                                                    index + 1
                                                }`
                                            }
                                            alt={`Side Preview ${index + 1}`}
                                            style={{ width: 100 }}
                                        />
                                    </div>
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                </Form>
            </Modal>
            <Modal
                title="Archived Products"
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
                    dataSource={archivedProducts}
                    scroll={{ x: 1500 }}
                    pagination={false}
                />
            </Modal>
        </Layout>
    );
};

export default ProductManagement;
