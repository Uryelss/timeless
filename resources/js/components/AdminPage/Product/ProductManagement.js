import React, { useState, useEffect } from "react";
import axios from "axios";
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
import "./ProductManagement.scss";

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { TextArea, Search } = Input;

const ProductManagement = () => {
    // Modal and toolbar state
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openArchiveModal, setOpenArchiveModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [form] = Form.useForm();

    // Backend states
    const [products, setProducts] = useState([]);
    const [archivedProducts, setArchivedProducts] = useState([]);
    const [dropdownData, setDropdownData] = useState({
        brands: [],
        categories: [],
        movements: [],
        strapMaterials: [],
        genders: [],
        sizes: [],
    });
    const [productData, setProductData] = useState({
        product_name: "",
        product_image: null,
        brand_id: "",
        category_id: "",
        movement_id: "",
        strap_material_id: "",
        gender_id: "",
        size_ids: [],
        price: "",
        quantity: "",
        description: "",
        side_image1: null,
        side_image2: null,
        side_image3: null,
    });

    // For image preview in the modal
    const [mainImage, setMainImage] = useState(null);
    const [sideImages, setSideImages] = useState([null, null, null]);

    // Use backend on component mount
    useEffect(() => {
        fetchProducts();
        fetchDropdownData();
        fetchArchivedProducts();
    }, []);

    const fetchDropdownData = () => {
        axios
            .get("http://localhost:8000/api/products/create", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setDropdownData(response.data))
            .catch((error) =>
                console.error("Error fetching dropdown data:", error)
            );
    };

    const fetchProducts = () => {
        axios
            .get("http://localhost:8000/api/products", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setProducts(response.data))
            .catch((error) => console.error("Error fetching products:", error));
    };

    const fetchArchivedProducts = () => {
        axios
            .get("http://localhost:8000/api/products/archived", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setArchivedProducts(response.data))
            .catch((error) =>
                console.error("Error fetching archived products:", error)
            );
    };

    const filteredProducts = products.filter((product) => {
        const lowerSearch = searchText.toLowerCase();
        return (
            product.product_name.toLowerCase().includes(lowerSearch) ||
            product.brand?.name.toLowerCase().includes(lowerSearch) ||
            product.category?.name.toLowerCase().includes(lowerSearch)
        );
    });

    // Handle form submission (add or edit)
    const handleSave = () => {
        form.validateFields()
            .then((values) => {
                const data = { ...productData, ...values };
                const formData = new FormData();
                for (const key in data) {
                    if (
                        key === "product_image" ||
                        key.startsWith("side_image")
                    ) {
                        if (data[key] && data[key] instanceof File) {
                            formData.append(key, data[key]);
                        }
                    } else if (key === "size_ids") {
                        data.size_ids.forEach((sizeId) => {
                            formData.append("size_ids[]", sizeId);
                        });
                    } else {
                        formData.append(key, data[key]);
                    }
                }
                if (!data.quantity) {
                    message.error("Quantity is required.");
                    return;
                }
                // Use PUT for edit, POST for new product
                const url = productData.id
                    ? `http://localhost:8000/api/products/${productData.id}?_method=PUT`
                    : "http://localhost:8000/api/products/store";

                axios
                    .post(url, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    })
                    .then(() => {
                        message.success("Product saved successfully!");
                        fetchProducts();
                        fetchArchivedProducts();
                        resetForm();
                        setOpenAddModal(false);
                        form.resetFields();
                    })
                    .catch((error) => {
                        console.error("Error saving product:", error);
                        message.error("Failed to save product.");
                    });
            })
            .catch((err) => console.log("Validation Failed:", err));
    };

    const resetForm = () => {
        setProductData({
            product_name: "",
            product_image: null,
            brand_id: "",
            category_id: "",
            movement_id: "",
            strap_material_id: "",
            gender_id: "",
            size_ids: [],
            price: "",
            quantity: "",
            description: "",
            side_image1: null,
            side_image2: null,
            side_image3: null,
        });
        setMainImage(null);
        setSideImages([null, null, null]);
    };

    const handleEdit = (record) => {
        setProductData({
            product_name: record.product_name,
            product_image: record.product_image,
            brand_id: record.brand?.id,
            category_id: record.category?.id,
            movement_id: record.movement?.id,
            strap_material_id: record.strap_material?.id,
            gender_id: record.gender?.id,
            size_ids: record.sizes
                ? record.sizes.map((s) => s.id.toString())
                : [],
            price: record.price,
            quantity: record.quantity,
            description: record.description,
            side_image1: record.side_image1,
            side_image2: record.side_image2,
            side_image3: record.side_image3,
        });
        if (record.product_image) {
            setMainImage(
                `http://localhost:8000/storage/${record.product_image}`
            );
        }
        if (record.side_image1) {
            setSideImages((prev) => {
                let newArr = [...prev];
                newArr[0] = `http://localhost:8000/storage/${record.side_image1}`;
                return newArr;
            });
        }
        if (record.side_image2) {
            setSideImages((prev) => {
                let newArr = [...prev];
                newArr[1] = `http://localhost:8000/storage/${record.side_image2}`;
                return newArr;
            });
        }
        if (record.side_image3) {
            setSideImages((prev) => {
                let newArr = [...prev];
                newArr[2] = `http://localhost:8000/storage/${record.side_image3}`;
                return newArr;
            });
        }
        form.setFieldsValue({
            product_name: record.product_name,
            price: record.price,
            quantity: record.quantity,
            description: record.description,
            brand_id: record.brand?.id,
            category_id: record.category?.id,
            movement_id: record.movement?.id,
            strap_material_id: record.strap_material?.id,
            gender_id: record.gender?.id,
            size_ids: record.sizes
                ? record.sizes.map((s) => s.id.toString())
                : [],
        });
        setOpenAddModal(true);
    };

    const handleArchive = (record) => {
        Modal.confirm({
            title: "Are you sure you want to archive this product?",
            onOk: () => {
                axios
                    .put(
                        `http://localhost:8000/api/products/${record.id}/archive`,
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
                        message.success("Product archived successfully!");
                        fetchProducts();
                        fetchArchivedProducts();
                    })
                    .catch((error) => {
                        console.error("Error archiving product:", error);
                        message.error("Failed to archive product.");
                    });
            },
        });
    };

    const handleRestore = (record) => {
        Modal.confirm({
            title: "Are you sure you want to restore this product?",
            onOk: () => {
                axios
                    .put(
                        `http://localhost:8000/api/products/${record.id}/restore`,
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
                        message.success("Product restored successfully!");
                        fetchProducts();
                        fetchArchivedProducts();
                    })
                    .catch((error) => {
                        console.error("Error restoring product:", error);
                        message.error("Failed to restore product.");
                    });
            },
        });
    };

    const handleArchiveAll = () => {
        Modal.confirm({
            title: "Are you sure you want to archive all selected products?",
            onOk: () => {
                // Implement bulk archive action here
                message.info("Bulk archive action triggered");
            },
        });
    };

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
                        style={{ fontSize: "16px", cursor: "pointer" }}
                    />
                    <DeleteOutlined
                        onClick={() => handleArchive(record)}
                        style={{ fontSize: "16px", cursor: "pointer" }}
                    />
                </Space>
            ),
        },
        { title: "ID", dataIndex: "id", key: "id" },
        {
            title: "Product Image",
            dataIndex: "product_image",
            key: "product_image",
            render: (image) => (
                <img
                    src={
                        typeof image === "string"
                            ? `http://localhost:8000/storage/${image}`
                            : image
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
        { title: "Brand", dataIndex: ["brand", "name"], key: "brand" },
        { title: "Category", dataIndex: ["category", "name"], key: "category" },
        { title: "Movement", dataIndex: ["movement", "name"], key: "movement" },
        {
            title: "Strap Material",
            dataIndex: ["strap_material", "name"],
            key: "strap_material",
        },
        { title: "Gender", dataIndex: ["gender", "name"], key: "gender" },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `$${price}`,
        },
        { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    ];

    // Table columns for archived products (with restore icon)
    const archiveColumns = [
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleRestore(record)}>
                        <UndoOutlined style={{ fontSize: "18px" }} />
                    </Button>
                </Space>
            ),
        },
        ...mainColumns.slice(1),
    ];

    // Handle image upload for Add Product modal using AntD Upload customRequest
    const handleImageUpload = (info, type, index = null) => {
        // Accept file immediately (prevent automatic upload)
        if (info.file.status === "done" || info.file.status === "error") {
            const imageUrl = URL.createObjectURL(info.file.originFileObj);
            if (type === "main") {
                setMainImage(imageUrl);
                setProductData((prev) => ({
                    ...prev,
                    product_image: info.file.originFileObj,
                }));
            } else {
                const updatedImages = [...sideImages];
                updatedImages[index] = imageUrl;
                setSideImages(updatedImages);
                setProductData((prev) => ({
                    ...prev,
                    [`side_image${index + 1}`]: info.file.originFileObj,
                }));
            }
        }
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
                    PRODUCT
                </Header>
                <Content style={{ padding: 24, background: "#fff" }}>
                    {/* Toolbar */}
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
                                onClick={() => {
                                    resetForm();
                                    form.resetFields();
                                    setOpenAddModal(true);
                                }}
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

            {/* Add/Edit Product Modal */}
            <Modal
                title="Add Product"
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
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="product_name"
                                label="Product Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter product name",
                                    },
                                ]}
                            >
                                <Input placeholder="Enter product name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="brand_id"
                                label="Brand"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a brand",
                                    },
                                ]}
                            >
                                <Select placeholder="Select Brand">
                                    {dropdownData.brands.map((brand) => (
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
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a category",
                                    },
                                ]}
                            >
                                <Select placeholder="Select Category">
                                    {dropdownData.categories.map((category) => (
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
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please select a strap material",
                                    },
                                ]}
                            >
                                <Select placeholder="Select Strap Material">
                                    {dropdownData.strapMaterials.map(
                                        (strap) => (
                                            <Option
                                                key={strap.id}
                                                value={strap.id}
                                            >
                                                {strap.name}
                                            </Option>
                                        )
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="gender_id"
                                label="Gender"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select gender",
                                    },
                                ]}
                            >
                                <Select placeholder="Select Gender">
                                    {dropdownData.genders.map((gender) => (
                                        <Option
                                            key={gender.id}
                                            value={gender.id}
                                        >
                                            {gender.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Price"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter price",
                                    },
                                ]}
                            >
                                <Input
                                    type="number"
                                    placeholder="Enter price"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="quantity"
                                label="Quantity"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter quantity",
                                    },
                                ]}
                            >
                                <Input
                                    type="number"
                                    placeholder="Enter quantity"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="size_ids" label="Available Sizes">
                                <Checkbox.Group>
                                    <Row>
                                        {sizes.map((size, index) => (
                                            <Col span={8} key={index}>
                                                <Checkbox value={size}>
                                                    {size}
                                                </Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            {
                                required: true,
                                message: "Please enter product description",
                            },
                        ]}
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
                                    customRequest={(info) =>
                                        handleImageUpload(info, "main")
                                    }
                                >
                                    <Button icon={<UploadOutlined />}>
                                        Upload Main Image
                                    </Button>
                                </Upload>
                                <div className="image-preview-card">
                                    <img
                                        src={
                                            mainImage ||
                                            "https://via.placeholder.com/150?text=Main+Image"
                                        }
                                        alt="Main Preview"
                                    />
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        {sideImages.map((image, index) => (
                            <Col span={8} key={index}>
                                <Form.Item label={`Side Image ${index + 1}`}>
                                    <Upload
                                        showUploadList={false}
                                        customRequest={(info) =>
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
                                    <div className="image-preview-card">
                                        <img
                                            src={
                                                image ||
                                                `https://via.placeholder.com/100?text=Side+${
                                                    index + 1
                                                }`
                                            }
                                            alt={`Side Preview ${index + 1}`}
                                        />
                                    </div>
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                </Form>
            </Modal>

            {/* Archived Products Modal with Restore button */}
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
