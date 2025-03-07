import React from "react";

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                {/* Company Column */}
                <div className="footer-column">
                    <h3 className="footer-title">Company</h3>
                    <ul className="footer-links">
                        <li>
                            <a href="#">About Us</a>
                        </li>
                        <li>
                            <a href="#">Our Services</a>
                        </li>
                        <li>
                            <a href="#">Privacy Policy</a>
                        </li>
                        <li>
                            <a href="#">Affiliate Program</a>
                        </li>
                    </ul>
                </div>

                {/* Get Help Column */}
                <div className="footer-column">
                    <h3 className="footer-title">Get Help</h3>
                    <ul className="footer-links">
                        <li>
                            <a href="#">FAQ</a>
                        </li>
                        <li>
                            <a href="#">Shipping</a>
                        </li>
                        <li>
                            <a href="#">Returns</a>
                        </li>
                        <li>
                            <a href="#">Order Status</a>
                        </li>
                        <li>
                            <a href="#">Payment Options</a>
                        </li>
                    </ul>
                </div>

                {/* Contact Us Column */}
                <div className="footer-column">
                    <h3 className="footer-title">Contact Us</h3>
                    <ul className="footer-links">
                        <li>
                            {/* Email Icon + Email Address */}
                            <i className="fa-solid fa-envelope"></i>{" "}
                            Timeless@gmail.com
                        </li>
                        <li>
                            {/* Phone Icon + Phone Number */}
                            <i className="fa-solid fa-phone"></i> +63 123456789
                        </li>
                        <li>
                            {/* Location Icon + Address */}
                            <i className="fa-solid fa-location-dot"></i> Father
                            Saturnino Urios University
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
