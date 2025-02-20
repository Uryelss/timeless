import React, { useState } from "react";
import axios from "axios";

const CheckoutPage = () => {
    const [customerName, setCustomerName] = useState("");
    const [priority, setPriority] = useState("standard");
    const [cart, setCart] = useState([
        { product_name: "Watch 1", price: 2500 },
        { product_name: "Watch 2", price: 3500 },
    ]);
    const [customerDetails, setCustomerDetails] = useState({
        address: "",
        contact: "",
    });
    const [paymentInfo, setPaymentInfo] = useState({
        method: "cash on delivery",
    });

    const totalAmount = cart.reduce((total, item) => total + item.price, 0);

    const handleCheckout = async () => {
        const orderData = {
            customer_name: customerName,
            items: cart,
            priority: priority,
            total_amount: totalAmount,
            order_status: "pending",
            customer_details: customerDetails,
            payment_information: paymentInfo,
        };

        try {
            const response = await axios.post("/api/orders", orderData);
            alert("Order placed successfully!");
            console.log(response.data);
        } catch (error) {
            console.error("Error placing order", error);
            alert("Order failed!");
        }
    };

    return (
        <div>
            <h2>Checkout</h2>
            <label>Customer Name:</label>
            <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
            />

            <label>Shipping Priority:</label>
            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
            >
                <option value="standard">Standard</option>
                <option value="expedited">Expedited</option>
            </select>

            <h3>Cart Items</h3>
            <ul>
                {cart.map((item, index) => (
                    <li key={index}>
                        {item.product_name} - ₱{item.price}
                    </li>
                ))}
            </ul>

            <h3>Total Amount: ₱{totalAmount}</h3>

            <label>Address:</label>
            <input
                type="text"
                value={customerDetails.address}
                onChange={(e) =>
                    setCustomerDetails({
                        ...customerDetails,
                        address: e.target.value,
                    })
                }
                required
            />

            <label>Contact:</label>
            <input
                type="text"
                value={customerDetails.contact}
                onChange={(e) =>
                    setCustomerDetails({
                        ...customerDetails,
                        contact: e.target.value,
                    })
                }
                required
            />

            <label>Payment Method:</label>
            <select
                value={paymentInfo.method}
                onChange={(e) =>
                    setPaymentInfo({ ...paymentInfo, method: e.target.value })
                }
            >
                <option value="cash on delivery">Cash on Delivery</option>
                <option value="credit card">Credit Card</option>
            </select>

            <button onClick={handleCheckout}>Place Order</button>
        </div>
    );
};

export default CheckoutPage;
