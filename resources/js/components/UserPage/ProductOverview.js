import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../UserLayout/Navbar";

const ProductOverview = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0); // Numeric rating for reviews
    const [reviewText, setReviewText] = useState("");
    const [activeTab, setActiveTab] = useState("details");
    const [selectedSize, setSelectedSize] = useState("");

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = () => {
        axios
            .get(`http://localhost:8000/api/product/${id}`)
            .then((response) => {
                setProduct(response.data.product);
                setReviews(response.data.reviews);
                // If there are available sizes, set the first one as default
                if (
                    response.data.product.sizes &&
                    response.data.product.sizes.length > 0
                ) {
                    setSelectedSize(response.data.product.sizes[0].name);
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
                // Option: re-fetch updated reviews from the backend
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
            <Navbar />
            <div className="product-container">
                <div className="product-images">
                    <div className="main-image">
                        <img
                            src={product.product_image}
                            alt={product.product_name}
                            onError={(e) =>
                                (e.target.src = "/default-product.png")
                            }
                        />
                    </div>
                    <div className="side-images">
                        <img src="/side-image-1.png" alt="Side 1" />
                        <img src="/side-image-2.png" alt="Side 2" />
                        <img src="/side-image-3.png" alt="Side 3" />
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
                        <div className="price">₱{product.price}</div>
                        {/* Dynamic sizes from the many-to-many relationship */}
                        <div className="available-sizes">
                            {product.sizes && product.sizes.length > 0 ? (
                                product.sizes.map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() =>
                                            setSelectedSize(size.name)
                                        }
                                        className={
                                            selectedSize === size.name
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        {size.name}
                                    </button>
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

export default ProductOverview;
