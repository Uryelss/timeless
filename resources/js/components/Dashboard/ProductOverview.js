import React from "react";

const ProductOverview = () => {
    const products = [
        {
            id: 1,
            name: "Watch Model 1",
            category: "Watches",
            price: 2000,
            stock: 5,
            sold: 5,
            status: "In Stock",
        },
        {
            id: 2,
            name: "Watch Model 2",
            category: "Watches",
            price: 3000,
            stock: 3,
            sold: 3,
            status: "In Stock",
        },
    ];

    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr style={{ backgroundColor: "#2ecc71", color: "#fff" }}>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Product ID
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Product Name
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Category
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Price
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Stock Quantity
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Sold Quantity
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                        Stock Status
                    </th>
                </tr>
            </thead>
            <tbody>
                {products.map((product) => (
                    <tr key={product.id}>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {product.id}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {product.name}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {product.category}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            ${product.price}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {product.stock}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {product.sold}
                        </td>
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {product.status}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ProductOverview;
