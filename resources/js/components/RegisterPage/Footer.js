import React from "react";

const Footer = () => {
    return (
        <footer className="footer">
            {/* Left Side: TIMELESS */}
            <div className="footer-logo">TIMELESS</div>

            {/* Right Side: SUPPORT & Links */}
            <div className="footer-right">
                <h3>SUPPORT</h3>
                <ul>
                    <li>
                        <a href="#">FAQs</a>
                    </li>

                    <li>
                        <a href="#">How to Order</a>
                    </li>
                    <li>
                        <a href="#">Modes of Payment</a>
                    </li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;
