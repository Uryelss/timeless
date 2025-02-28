import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="footer">
            {/* Left Side: TIMELESS Logo */}
            <div className="footer-logo">TIMELESS</div>

            {/* Right Side: SUPPORT & Links */}
            <div className="footer-right">
                <h3>SUPPORT</h3>
                <ul>
                    <li>
                        <Link to="/faqs">FAQs</Link>
                    </li>
                    <li>
                        <Link to="/how-to-order">How to Order</Link>
                    </li>
                    <li>
                        <Link to="/modes-of-payment">Modes of Payment</Link>
                    </li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;

