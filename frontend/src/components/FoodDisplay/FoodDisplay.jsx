import React, { useContext, useEffect } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { Link } from "react-router-dom";

const FoodDisplay = ({ category }) => {
  const { food_list, fetchFoodList, userRecommendations, preferredCategories } = useContext(StoreContext);

  // Fetch the latest menu items dynamically on mount
  useEffect(() => {
    if (fetchFoodList) {
      fetchFoodList();
    }
  }, []);

  // Show a curated selection of top 8 menus on the home page
  const filteredList = category === "All"
    ? food_list.slice(0, 8)
    : food_list.filter((item) => item.category.toLowerCase() === category.toLowerCase()).slice(0, 8);

  return (
    <div className="food-display" id="food-display">
      {/* Personalized Recommendations Section for Logged-in Customer */}
      {userRecommendations && userRecommendations.length > 0 && category === "All" && (
        <div className="recommendations-container">
          <div className="recommendations-header">
            <span className="rec-badge">Personalized For You</span>
            <h2>Recommended Based on Your Taste</h2>
            <p>
              Curated items matching your favorite flavors in{" "}
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

      <div className="food-display-header-row">
        <div>
          <h2>Top dishes near you</h2>
          <p className="food-display-subtitle">
            Curated signature culinary creations prepared fresh by our master chefs.
          </p>
        </div>
        <Link to="/menu" className="view-all-header-link">
          View All Dishes ({food_list.length}) <span>→</span>
        </Link>
      </div>

      <div className="food-display-list">
        {filteredList.map((item) => (
          <FoodItem
            key={item._id}
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

      {/* Explore More Banner */}
      <div className="food-display-explore-more">
        <div className="explore-more-content">
          <h3>Craving something specific?</h3>
          <p>Explore our complete catalog of handcrafted appetizers, main courses, artisanal pastas, and desserts.</p>
          <Link to="/menu" className="explore-all-dishes-btn">
            Explore Full Menu ({food_list.length} Dishes) <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FoodDisplay;
