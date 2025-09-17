import React from "react";
import "../../../sass/Footer.scss";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-title">Perfect Match</div>
                <nav className="footer-nav">
                    <a href="/" className="footer-link">
                        Home
                    </a>
                    <a href="/about" className="footer-link">
                        About
                    </a>
                    <a href="/contact" className="footer-link">
                        Contact
                    </a>
                </nav>
                <div className="footer-contact">
                    <p>Email: info@perfectmatch.com</p>
                    <p>Address: 123 Animal Lane, Pet City, PC 12345</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
