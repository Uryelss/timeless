import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../UserLayout/Navbar"; // Import the Navbar component

const ProductOverview = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [activeTab, setActiveTab] = useState("details"); // For tab switching

    useEffect(() => {
        axios
            .get(`http://localhost:8000/api/product/${id}`)
            .then((response) => {
                setProduct(response.data.product);
                setReviews(response.data.reviews);
            })
            .catch((error) => console.error("Error fetching product:", error));
    }, [id]);

    const submitReview = () => {
        if (!rating) {
            alert("Please select a rating.");
            return;
        }

        axios
            .post(
                `http://localhost:8000/api/product/${id}/review`,
                {
                    rating,
                    review: reviewText,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                alert("Review submitted!");
                setReviewText("");
                setRating("");
            })
            .catch((error) => console.error("Error submitting review:", error));
    };

    if (!product) return <p>Loading...</p>;

    // Calculate average rating for display
    const averageRating =
        reviews.length > 0
            ? (
                  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              ).toFixed(1)
            : 0;

    return (
        <>
            <Navbar /> {/* Include the Navbar */}
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
                        {/* Placeholder for side images - you can add logic to fetch or generate these */}
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
                                                <div key={index}>
                                                    <p>⭐ {r.rating}</p>
                                                    <p>{r.review}</p>
                                                    <small>
                                                        By:{" "}
                                                        {r.user?.username ||
                                                            "Anonymous"}
                                                    </small>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No reviews yet</p>
                                        )}
                                        <h3>Leave a Review</h3>
                                        <select
                                            value={rating}
                                            onChange={(e) =>
                                                setRating(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Select Rating
                                            </option>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <option key={star} value={star}>
                                                    {star} Stars
                                                </option>
                                            ))}
                                        </select>
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
                <div className="product-details-card">
                    <h1>{product.product_name}</h1>
                    <div className="price">₱{product.price}</div>
                    <div className="rating">
                        Rating: <span className="stars">⭐</span>{" "}
                        {averageRating}
                    </div>
                    <div className="size">
                        Size: {product.size?.name || "Default Size"}
                    </div>
                </div>
                <div className="actions">
                    <button className="add-to-cart">Add to Cart</button>
                    <button className="buy-now">Buy Now</button>
                </div>
            </div>
        </>
    );
};

export default ProductOverview;
