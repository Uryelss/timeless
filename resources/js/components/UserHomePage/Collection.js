import React from "react";
import Collectionfilterbox from "../Collectionlayout/Collectionfilterbox"; // Import Collectionfilterbox
import CollectionNavbar from "../Collectionlayout/CollectionNavbar"; // Import CollectionNavbar
import CollectionFooter from "../Collectionlayout/CollectionFooter"; // Import CollectionFooter
import ProductList from "../Collectionlayout/Productlist"; // Import the ProductList component
import CollectionBanner from "../Collectionlayout/CollectionBanner";

export default function Collection() {
    return (
        <div>
            <CollectionNavbar /> {/* Collection Navbar */}
            <CollectionBanner /> {/* Collection Banner */}
            <div
                className="collection-container"
                style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr", // Adjusted grid template columns
                    gap: "10px", // Adjusted gap
                }}
            >
                <div>
                    <Collectionfilterbox /> {/* Collection Filter Box */}
                </div>
                <div>
                    <ProductList /> {/* Product List */}
                </div>
            </div>
            <CollectionFooter /> {/* Collection Footer */}
        </div>
    );
}
