import React from "react";


export default function Collectionfilterbox() {
    return (
        <div className="filter-box">
            <h3>FILTER</h3>

            <div className="filter-content">
                {/* Brand Filter */}
                <div className="filter-group">
                    <h4>BRAND</h4>
                    <label><input type="checkbox" /> Timberly</label>
                    <label><input type="checkbox" /> QMUs</label>
                    <label><input type="checkbox" /> Braven</label>
                    <label><input type="checkbox" /> Solana</label>
                    <label><input type="checkbox" /> Tivora</label>
                    <label><input type="checkbox" /> Altius</label>
                </div>

                {/* Gender Filter */}
                <div className="filter-group">
                    <h4>GENDER</h4>
                    <label><input type="checkbox" /> Male</label>
                    <label><input type="checkbox" /> Female</label>
                    <label><input type="checkbox" /> Unilex</label>
                </div>

                {/* Movement Filter */}
                <div className="filter-group">
                    <h4>MOVEMENT</h4>
                    <label><input type="checkbox" /> Automatic</label>
                    <label><input type="checkbox" /> Quartz</label>
                    <label><input type="checkbox" /> Charging Type</label>
                </div>

                {/* Strap Material Filter */}
                <div className="filter-group">
                    <h4>STRAP MATERIAL</h4>
                    <label><input type="checkbox" /> Leather</label>
                    <label><input type="checkbox" /> Stainless</label>
                    <label><input type="checkbox" /> Rubber</label>
                </div>
            </div>

            {/* Apply Button - Stays at Bottom */}
            <button className="apply-button">APPLY</button>
        </div>
    );
}
