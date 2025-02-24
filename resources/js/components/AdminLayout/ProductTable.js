import React from "react";

const Table = ({
    products,
    handleEdit,
    handleArchive,
    restoreProduct,
    handleSelectProduct,
    selectedProducts,
    showArchived,
}) => {
    return (
        <div className="table-container">
            <table className="styled-table">
                <thead>
                    <tr>
                        <th></th> {/* Empty space for checkbox */}
                        <th>Action</th>
                        <th>ID</th>
                        <th>Product (Image)</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Movement</th>
                        <th>Strap Material</th>
                        <th>Gender</th>
                        <th>Size</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(item.id)}
                                    onChange={() =>
                                        handleSelectProduct(item.id)
                                    }
                                />
                            </td>
                            <td>
                                {showArchived ? (
                                    // Restore icon if viewing archived products
                                    <button
                                        className="action-button"
                                        onClick={() => restoreProduct(item.id)}
                                    >
                                        <i className="fa-solid fa-arrows-rotate"></i>
                                    </button>
                                ) : (
                                    <>
                                        {/* Edit Icon */}
                                        <button
                                            className="action-button"
                                            onClick={() => handleEdit(item)} // Trigger edit function
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>

                                        {/* Archive Icon */}
                                        <button
                                            className="action-button"
                                            onClick={() =>
                                                handleArchive(item.id)
                                            } // Trigger archive function
                                        >
                                            <i className="fa-solid fa-box-archive"></i>
                                        </button>
                                    </>
                                )}
                            </td>
                            <td>{item.id}</td>
                            <td>
                                <img
                                    src={`/storage/${item.product_image}`}
                                    alt={item.product_name}
                                    width="50"
                                    height="50"
                                />
                            </td>
                            <td>{item.product_name}</td>
                            <td>{item.price}</td>
                            <td>{item.category}</td>
                            <td>{item.brand}</td>
                            <td>{item.movement}</td>
                            <td>{item.strap_material}</td>
                            <td>{item.gender}</td>
                            <td>{item.size}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
