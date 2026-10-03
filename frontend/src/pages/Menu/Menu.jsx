import React, { useContext, useEffect, useState } from "react";
import "./Menu.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";

const Menu = () => {
  const { food_list, fetchFoodList, category_list, fetchCategoryList } = useContext(StoreContext);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    if (fetchFoodList) fetchFoodList();
    if (fetchCategoryList) fetchCategoryList();
  }, []);

  // Dynamically extract categories from database category_list, with fallback to food_list
  const dynamicCategories = [
    "All",
    ...(category_list && category_list.length > 0
      ? category_list.map((c) => c.name)
      : Array.from(new Set(food_list.map((item) => item.category).filter(Boolean)))),
  ];

  // Filter food items based on category and search query
  const filteredFoods = food_list
    .filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating-high") return (b.rating || 4.8) - (a.rating || 4.8);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="menu-page">
      {/* Header Banner */}
      <div className="menu-header">
        <span className="menu-badge">Gourmet Catalog</span>
        <h1>Explore Our Culinary Creations</h1>
        <p>
          Handcrafted dishes made with farm-fresh ingredients by master chefs. Filter by category, search by taste, and order in seconds.
        </p>
      </div>

      {/* Sticky Filter & Search Toolbar */}
      <div className="menu-sticky-toolbar">
        {/* Controls: Search, Filter & Sort */}
        <div className="menu-controls">
          <div className="menu-search-wrapper">
            <svg className="search-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search delicious dishes, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="menu-search-input"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          <div className="menu-sort-wrapper">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="menu-sort-select"
            >
              <option value="default">Featured</option>
              <option value="rating-high">Top Rated (★ 5.0 - 1.0)</option>
              <option value="price-low">Price: Low to High (₹)</option>
              <option value="price-high">Price: High to Low (₹)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="menu-category-pills">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      <div className="menu-results-info">
        <span>Showing <strong>{filteredFoods.length}</strong> dishes</span>
        {selectedCategory !== "All" && (
          <span className="active-filter-tag">
            Category: {selectedCategory}
            <button onClick={() => setSelectedCategory("All")}>✕</button>
          </span>
        )}
      </div>

      {filteredFoods.length > 0 ? (
        <div className="menu-food-grid">
          {filteredFoods.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              rating={item.rating}
              reviewsCount={item.reviewsCount}
            />
          ))}
        </div>
      ) : (
        <div className="menu-empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>No dishes found</h3>
          <p>Try searching for a different keyword or select another category.</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="reset-filters-btn"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
