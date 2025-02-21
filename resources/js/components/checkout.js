import React, { useState } from "react";
import axios from "axios";

const Checkout = () => {
    const [formData, setFormData] = useState({
        customer_name: "",
        items: [],
        priority: "Standard",
        total_amount: 0,
    });

    const handleAddItem = () => {
        const item = prompt("Enter product name:");
        const price = parseFloat(prompt("Enter product price:"));
        if (item && price) {
            setFormData((prev) => ({
                ...prev,
                items: [...prev.items, { item, price }],
                total_amount: prev.total_amount + price,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post("/api/orders", formData);
        alert("Order placed successfully!");
    };

    return (
        <div>
            <h2>Checkout</h2>
            <input
                type="text"
                placeholder="Customer Name"
                onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                }
                required
            />
            <button onClick={handleAddItem}>Add Item</button>
            <p>Total: ${formData.total_amount}</p>
            <select
                onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                }
            >
                <option value="Standard">Standard Shipping</option>
                <option value="Expedited">Expedited Shipping</option>
            </select>
            <button onClick={handleSubmit}>Place Order</button>
        </div>
    );
};

export default Checkout;
