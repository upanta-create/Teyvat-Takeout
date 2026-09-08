import React, { useContext } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "../../context/StoreContext";

const ExploreMenu = ({ category, setCategory }) => {
  const { food_list, category_list, getImageUrl } = useContext(StoreContext);

  // Use database categories if available, else extract unique categories from food_list
  const categories = category_list && category_list.length > 0
    ? category_list.map((c) => ({ name: c.name, image: c.image }))
    : (() => {
        const categoryMap = new Map();
        food_list.forEach((item) => {
          if (item.category && !categoryMap.has(item.category)) {
            categoryMap.set(item.category, item.image);
          }
        });
        return Array.from(categoryMap.entries()).map(([name, image]) => ({
          name,
          image,
        }));
      })();

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>
      <p className="explore-menu-text">
        Choose from a diverse menu featuring a delectable array of dishes. Handcrafted with farm-fresh ingredients and master culinary techniques to elevate your dining experience.
      </p>
      <div className="explore-menu-list">
        {categories.map((item, index) => {
          return (
            <div
              onClick={() =>
                setCategory((prev) => (prev === item.name ? "All" : item.name))
              }
              key={index}
              className="explore-menu-list-item"
            >
              <img
                className={category === item.name ? "active" : ""}
                src={getImageUrl(item.image)}
                alt={item.name}
              />
              <p>{item.name}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
