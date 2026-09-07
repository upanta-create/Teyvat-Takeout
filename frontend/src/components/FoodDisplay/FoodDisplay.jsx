import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list, userRecommendations, preferredCategories } = useContext(StoreContext);

  return (
    <div className="food-display" id="food-display">
      {/* Personalized Recommendations Section for Logged-in Customer */}
      {userRecommendations && userRecommendations.length > 0 && category === "All" && (
        <div className="recommendations-container">
          <div className="recommendations-header">
            <span className="rec-badge">Personalized For You</span>
            <h2>Recommended Based on Your Taste</h2>
            <p>
              Curated dishes matching your favorite flavors in{" "}
              <strong>{preferredCategories.join(", ")}</strong>:
            </p>
          </div>
          <div className="food-display-list recommendations-list">
            {userRecommendations.slice(0, 4).map((item) => (
              <FoodItem
                key={`rec-${item._id}`}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
                rating={item.rating}
                reviewsCount={item.reviewsCount}
                category={item.category}
              />
            ))}
          </div>
          <hr className="rec-divider" />
        </div>
      )}

      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {food_list.map((item, index) => {
          if (category === "All" || category === item.category) {
            return (
              <FoodItem
                key={item._id || index}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
                rating={item.rating}
                reviewsCount={item.reviewsCount}
                category={item.category}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default FoodDisplay;
