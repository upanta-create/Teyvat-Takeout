import React, { useEffect, useState, useContext } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const List = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Failed to load delicacies catalog");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    }
  };

  const removeFood = async (foodId, foodName) => {
    if (!window.confirm(`Are you sure you want to remove "${foodName}" from the menu?`)) {
      return;
    }
    try {
      const response = await axios.post(
        `${url}/api/food/remove`,
        { id: foodId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Removed "${foodName}" from catalog`);
        await fetchList();
      } else {
        toast.error(response.data.message || "Failed to remove item");
      }
    } catch (err) {
      toast.error("Error removing item");
    }
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please sign in as Admin first");
      navigate("/");
    }
    fetchList();
  }, [admin, token]);

  const categories = ["All", ...Array.from(new Set(list.map((item) => item.category).filter(Boolean)))];

  const filteredList = list.filter((item) => {
    const matchesCat = selectedCat === "All" || item.category === selectedCat;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getImageUrl = (image) => {
    if (!image) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
      return image;
    }
    return `${url}/images/${image}`;
  };

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2>Menu Catalog Management</h2>
          <p>
            Manage active culinary items in the live customer menu ({list.length} total dishes).
          </p>
        </div>
        <button onClick={() => navigate("/add")} className="add-new-header-btn">
          + Add New Dish
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="list-controls-bar">
        <input
          type="text"
          placeholder="Search dishes or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="list-search-input"
        />
        <div className="category-filter-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`cat-chip ${selectedCat === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="list-table-card">
        <div className="table-responsive">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Dish Preview</th>
                <th>Name</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="table-dish-thumb"
                    />
                  </td>
                  <td>
                    <div className="table-dish-info">
                      <strong>{item.name}</strong>
                      <span className="desc-preview">{item.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{item.category}</span>
                  </td>
                  <td>
                    <span className="rating-pill">
                      ★ {item.rating ? Number(item.rating).toFixed(1) : "4.8"}
                    </span>
                  </td>
                  <td>
                    <span className="price-tag">₹{item.price}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => removeFood(item._id, item.name)}
                      className="delete-item-btn"
                      title="Delete dish"
                    >
                      🗑️ Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default List;
