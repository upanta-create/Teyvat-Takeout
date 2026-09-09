import React, { useState, useContext } from "react";
import "./ReviewModal.css";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import axios from "axios";

const ReviewModal = ({ food, onClose }) => {
  const { url, token, fetchFoodList, fetchRecommendations } = useContext(StoreContext);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!food) return null;

  const starLabels = {
    1: "Poor - Needs improvement",
    2: "Fair - Average dish",
    3: "Good - Satisfying taste",
    4: "Delicious - Highly recommended!",
    5: "Culinary Masterpiece! 🌟",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please sign in to submit a review");
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        url + "/api/review/add",
        {
          foodId: food.id || food._id,
          rating,
          comment,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Rating submitted successfully!");
        if (fetchFoodList) await fetchFoodList();
        if (fetchRecommendations) await fetchRecommendations();
        onClose();
      } else {
        toast.error(response.data.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error("Error connecting to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="review-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="review-dish-header">
          <img
            src={url + "/images/" + food.image}
            alt={food.name}
            className="review-dish-thumb"
          />
          <div className="review-dish-meta">
            <span className="review-dish-category">{food.category || "Gourmet"}</span>
            <h3>{food.name}</h3>
            <p className="review-dish-price">₹{food.price}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="star-rating-picker">
            <label>How would you rate this dish?</label>
            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${
                    star <= (hoverRating || rating) ? "active" : ""
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="star-feedback-text">
              {starLabels[hoverRating || rating]}
            </span>
          </div>

          <div className="review-comment-group">
            <label>Share Your Tasting Notes (Optional)</label>
            <textarea
              rows="3"
              placeholder="How was the flavor, texture, and presentation? Would you recommend it?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            className="submit-review-action-btn"
            disabled={submitting}
          >
            {submitting ? "Recording Rating..." : `Submit ${rating}★ Review`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
