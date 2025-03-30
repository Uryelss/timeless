import React, { useState, useEffect } from "react";
import { Card, Table, Spin, message } from "antd";
import axios from "axios";

// Helper function to format a number as Philippine Peso with no decimals
const formatPeso = (amount) =>
    "₱" +
    Number(amount).toLocaleString("en-PH", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });

const TopProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Sub-category data
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const fetchData = async () => {
        try {
            const [productRes, inventoryRes, subCatRes] = await Promise.all([
                axios.get("http://localhost:8000/api/products", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get("http://localhost:8000/api/inventory", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(
                    "http://localhost:8000/api/sub-categories?type=categories",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                ),
            ]);

            const productData = productRes.data;
            const inventoryData = inventoryRes.data;
            const subCategories = subCatRes.data;
            setCategories(subCategories);

            // Build a mapping from product_id to total sold from inventory
            const soldMap = {};
            inventoryData.forEach((inv) => {
                const key = Number(inv.product_id);
                const soldValue = Number(inv.sold) || 0;
                soldMap[key] = (soldMap[key] || 0) + soldValue;
            });

            // Attach the aggregated sold count to each product
            const aggregatedProducts = productData.map((prod) => ({
                ...prod,
                sold: soldMap[Number(prod.id)] || 0,
            }));

            // Sort products by sold count descending
            const sortedProducts = aggregatedProducts.sort(
                (a, b) => b.sold - a.sold
            );
            setProducts(sortedProducts);
            setLoading(false);
        } catch (error) {
            message.error("Error fetching products, inventory, or categories");
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    // Define table columns
    const columns = [
        {
            title: "Image",
            dataIndex: "main_image",
            key: "main_image",
            render: (image) => (
                <img
                    src={
                        image
                            ? `http://localhost:8000/storage/${image}`
                            : "https://via.placeholder.com/60"
                    }
                    alt="Product"
                    style={{ width: 60, height: 60, objectFit: "cover" }}
                />
            ),
        },
        {
            title: "Product Name",
            dataIndex: "product_name",
            key: "product_name",
        },
        {
            title: "Category",
            key: "category",
            render: (text, record) => {
                const cat = categories.find(
                    (c) => Number(c.id) === Number(record.category_id)
                );
                return cat ? cat.name : "N/A";
            },
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => formatPeso(price),
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: "Sold",
            key: "sold",
            render: (text, record) =>
                record.sold !== undefined ? record.sold : 0,
            sorter: (a, b) => (a.sold || 0) - (b.sold || 0),
        },
    ];

    return (
        <Card title="Top Products" style={{ margin: "24px" }}>
            {loading ? (
                <Spin tip="Loading top products..." />
            ) : (
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    pagination={false}
                />
            )}
        </Card>
    );
};

export default TopProducts;
