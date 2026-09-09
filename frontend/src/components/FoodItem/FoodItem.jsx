import React, { useContext } from "react";
import "./FoodItem.css";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({ id, name, price, description, image, rating, reviewsCount, category }) => {
  const { cartItems, addToCart, removeFromCart, getImageUrl, openReviewModal } = useContext(StoreContext);

  const numRating = Number(rating) || 0;
  const numReviews = Number(reviewsCount) || 0;

  const handleReviewClick = (e) => {
    e.stopPropagation();
    openReviewModal({ id, name, price, description, image, category });
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          src={getImageUrl(image)}
          alt={name}
          className="food-item-image"
          loading="lazy"
        />
        {!cartItems[id] ? (
          <button
            type="button"
            className="food-item-add-btn"
            onClick={() => addToCart(id)}
            aria-label="Add to cart"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        ) : (
          <div className="food-item-counter">
            <button
              type="button"
              className="counter-btn remove-btn"
              onClick={() => removeFromCart(id)}
              aria-label="Remove item"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <span className="counter-val">{cartItems[id]}</span>
            <button
              type="button"
              className="counter-btn add-btn"
              onClick={() => addToCart(id)}
              aria-label="Add more"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p className="food-item-title">{name}</p>
          <button
            type="button"
            className={`food-rating-badge ${numReviews === 0 ? "new-dish" : ""}`}
            onClick={handleReviewClick}
            title="Click to rate this dish"
          >
            <span className="star-icon">★</span>
            <span className="rating-num">
              {numReviews > 0 ? numRating.toFixed(1) : "0.0"}
            </span>
            <span className="rating-count">({numReviews})</span>
          </button>
        </div>
        <p className="food-item-desc">{description}</p>
        <div className="food-item-bottom-row">
          <p className="food-item-price">₹{price}</p>
          <button
            type="button"
            onClick={handleReviewClick}
            className="rate-dish-btn"
          >
            Rate Dish ★
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
