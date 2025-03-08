import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import HeaderComponent from "../UserLayout/Headercomponent";

const ProductOverview = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [currentMainImage, setCurrentMainImage] = useState("");
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0); // Numeric rating for reviews
    const [reviewText, setReviewText] = useState("");
    const [activeTab, setActiveTab] = useState("details");
    const [selectedSizes, setSelectedSizes] = useState([]);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = () => {
        axios
            .get(`http://localhost:8000/api/product/${id}`)
            .then((response) => {
                const prod = response.data.product;
                setProduct(prod);
                setReviews(response.data.reviews);
                // Set the current main image to the product's main image initially
                setCurrentMainImage(prod.product_image);
                // Optionally preselect sizes
                if (prod.sizes && prod.sizes.length > 0) {
                    setSelectedSizes([prod.sizes[0].id.toString()]);
                }
            })
            .catch((error) => console.error("Error fetching product:", error));
    };

    const submitReview = () => {
        if (rating === 0) {
            alert("Please select a rating.");
            return;
        }
        axios
            .post(
                `http://localhost:8000/api/product/${id}/review`,
                { rating, review: reviewText },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then((response) => {
                // Optionally re-fetch updated reviews
                axios
                    .get(`http://localhost:8000/api/product/${id}`)
                    .then((res) => {
                        setReviews(res.data.reviews);
                    })
                    .catch((err) =>
                        console.error("Error fetching updated reviews:", err)
                    );
                alert("Review submitted!");
                setReviewText("");
                setRating(0);
            })
            .catch((error) => console.error("Error submitting review:", error));
    };

    if (!product) return <p>Loading...</p>;

    const averageRating =
        reviews.length > 0
            ? (
                  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              ).toFixed(1)
            : 0;

    return (
        <>
            <HeaderComponent />
            <div className="product-container">
                <div className="product-images">
                    <div className="main-image">
                        <img
                            src={currentMainImage}
                            alt={product.product_name}
                            onError={(e) =>
                                (e.target.src = "/default-product.png")
                            }
                        />
                    </div>
                    <div className="side-images">
                        {product.side_image1 && (
                            <img
                                src={product.side_image1}
                                alt="Side 1"
                                onClick={() =>
                                    setCurrentMainImage(product.side_image1)
                                }
                                style={{ cursor: "pointer" }}
                            />
                        )}
                        {product.side_image2 && (
                            <img
                                src={product.side_image2}
                                alt="Side 2"
                                onClick={() =>
                                    setCurrentMainImage(product.side_image2)
                                }
                                style={{ cursor: "pointer" }}
                            />
                        )}
                        {product.side_image3 && (
                            <img
                                src={product.side_image3}
                                alt="Side 3"
                                onClick={() =>
                                    setCurrentMainImage(product.side_image3)
                                }
                                style={{ cursor: "pointer" }}
                            />
                        )}
                    </div>
                    <div className="tabs">
                        <div className="tab-container">
                            <div className="tab-buttons">
                                <button
                                    className={
                                        activeTab === "details" ? "active" : ""
                                    }
                                    onClick={() => setActiveTab("details")}
                                >
                                    PRODUCT DETAILS
                                </button>
                                <button
                                    className={
                                        activeTab === "reviews" ? "active" : ""
                                    }
                                    onClick={() => setActiveTab("reviews")}
                                >
                                    REVIEWS & RATINGS
                                </button>
                            </div>
                            <div className="tab-content">
                                {activeTab === "details" && (
                                    <p>{product.description}</p>
                                )}
                                {activeTab === "reviews" && (
                                    <>
                                        {reviews.length > 0 ? (
                                            reviews.map((r, index) => (
                                                <div
                                                    className="review-card"
                                                    key={index}
                                                >
                                                    <img
                                                        src={
                                                            r.user.profile_image
                                                        }
                                                        alt={r.user.username}
                                                        className="review-profile-image"
                                                        onError={(e) =>
                                                            (e.target.src =
                                                                "/default-profile.png")
                                                        }
                                                    />
                                                    <div className="review-content">
                                                        <strong>
                                                            {r.user.username}
                                                        </strong>
                                                        <p>
                                                            {Array.from(
                                                                { length: 5 },
                                                                (_, i) => (
                                                                    <i
                                                                        key={i}
                                                                        className={
                                                                            i <
                                                                            r.rating
                                                                                ? "fas fa-star"
                                                                                : "far fa-star"
                                                                        }
                                                                        style={{
                                                                            color:
                                                                                i <
                                                                                r.rating
                                                                                    ? "#ffd700"
                                                                                    : "#ccc",
                                                                        }}
                                                                    />
                                                                )
                                                            )}
                                                        </p>
                                                        <p>{r.review}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No reviews yet</p>
                                        )}
                                        <h3>Leave a Review</h3>
                                        <div className="star-rating-selector">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <i
                                                    key={star}
                                                    className={
                                                        rating >= star
                                                            ? "fas fa-star"
                                                            : "far fa-star"
                                                    }
                                                    onClick={() =>
                                                        setRating(star)
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                        color:
                                                            rating >= star
                                                                ? "#ffd700"
                                                                : "#ccc",
                                                        fontSize: "24px",
                                                        marginRight: "5px",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) =>
                                                setReviewText(e.target.value)
                                            }
                                            placeholder="Write a review"
                                        ></textarea>
                                        <button onClick={submitReview}>
                                            Submit Review
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="details-actions-container">
                    <div className="product-details-card">
                        <h1>{product.product_name}</h1>
                        <div className="price">
                            ₱{number_format(product.price)}
                        </div>
                        <div className="available-sizes">
                            <p>Select Sizes:</p>
                            {product.sizes && product.sizes.length > 0 ? (
                                product.sizes.map((size) => (
                                    <label
                                        key={size.id}
                                        className="size-checkbox"
                                    >
                                        <input
                                            type="checkbox"
                                            value={size.id}
                                            checked={selectedSizes.includes(
                                                size.id.toString()
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedSizes([
                                                        ...selectedSizes,
                                                        size.id.toString(),
                                                    ]);
                                                } else {
                                                    setSelectedSizes(
                                                        selectedSizes.filter(
                                                            (id) =>
                                                                id !==
                                                                size.id.toString()
                                                        )
                                                    );
                                                }
                                            }}
                                        />
                                        {size.name}
                                    </label>
                                ))
                            ) : (
                                <p>No sizes available</p>
                            )}
                        </div>
                        <div className="rating">
                            <span>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <i
                                        key={i}
                                        className={
                                            i < Math.round(averageRating)
                                                ? "fas fa-star"
                                                : "far fa-star"
                                        }
                                        style={{
                                            color: "#ffd700",
                                            marginRight: "2px",
                                        }}
                                    />
                                ))}
                            </span>
                            <span
                                style={{
                                    marginLeft: "8px",
                                    fontWeight: "bold",
                                }}
                            >
                                {averageRating}
                            </span>
                        </div>
                    </div>
                    <div className="actions">
                        <button
                            className="add-to-cart"
                            onClick={() => alert("Added to cart!")}
                        >
                            ADD TO CART
                        </button>
                        <button
                            className="buy-now"
                            onClick={() => alert("Redirecting to checkout!")}
                        >
                            BUY NOW
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

// Helper function to format price with commas
const number_format = (number) => {
    return Number(number)
        .toFixed(0)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default ProductOverview;
