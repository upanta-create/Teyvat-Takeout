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
  const [categoriesList, setCategoriesList] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  // Edit Dish Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("Salad");
  const [editRating, setEditRating] = useState("4.8");
  const [editImage, setEditImage] = useState(false);
  const [editImageUrlInput, setEditImageUrlInput] = useState("");
  const [editUseUrl, setEditUseUrl] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${url}/api/category/list`);
      if (res.data.success) {
        setCategoriesList(res.data.data);
      }
    } catch (err) {
      console.error("Error loading categories for edit dropdown:", err);
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

  const openEditModal = (food) => {
    setEditingFood(food);
    setEditName(food.name);
    setEditDescription(food.description || "");
    setEditPrice(food.price);
    setEditCategory(food.category || (categoriesList[0]?.name || "Salad"));
    setEditRating(food.rating ? String(food.rating) : "4.8");
    setEditImage(false);
    if (food.image && (food.image.startsWith("http://") || food.image.startsWith("https://"))) {
      setEditImageUrlInput(food.image);
      setEditUseUrl(true);
    } else {
      setEditImageUrlInput("");
      setEditUseUrl(false);
    }
    setShowEditModal(true);
  };

  const onEditDishSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Dish name is required");
      return;
    }

    setUpdating(true);
    const formData = new FormData();
    formData.append("id", editingFood._id);
    formData.append("name", editName.trim());
    formData.append("description", editDescription.trim());
    formData.append("price", Number(editPrice));
    formData.append("category", editCategory.trim());
    formData.append("rating", Number(editRating));

    if (editUseUrl && editImageUrlInput.trim()) {
      formData.append("imageUrl", editImageUrlInput.trim());
    } else if (editImage) {
      formData.append("image", editImage);
    }

    try {
      const response = await axios.post(`${url}/api/food/update`, formData, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Dish updated successfully!");
        setShowEditModal(false);
        setEditingFood(null);
        fetchList();
      } else {
        toast.error(response.data.message || "Failed to update dish");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Error updating dish";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please sign in as Admin first");
      navigate("/");
    }
    fetchList();
    fetchCategories();
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
                    <div className="dish-actions-group">
                      <button
                        onClick={() => openEditModal(item)}
                        className="dish-edit-btn"
                        title="Edit dish"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => removeFood(item._id, item.name)}
                        className="delete-item-btn"
                        title="Delete dish"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dish Modal */}
      {showEditModal && editingFood && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="dish-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>✏️ Edit Dish: {editingFood.name}</h3>
                <p>Update pricing, description, category, or photo.</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={onEditDishSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label className="form-label">Dish Name *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Price (in ₹) *</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Culinary Description *</label>
                <textarea
                  rows="3"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                  >
                    {categoriesList.length > 0
                      ? categoriesList.map((c) => (
                          <option key={c._id} value={c.name}>
                            {c.name}
                          </option>
                        ))
                      : ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"].map(
                          (c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          )
                        )}
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Rating (★)</label>
                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(e.target.value)}
                  >
                    <option value="5.0">★ 5.0 (Exceptional)</option>
                    <option value="4.9">★ 4.9 (Masterpiece)</option>
                    <option value="4.8">★ 4.8 (Highly Rated)</option>
                    <option value="4.7">★ 4.7 (Popular)</option>
                    <option value="4.5">★ 4.5 (Great)</option>
                  </select>
                </div>
              </div>

              {/* Current Dish Image Preview */}
              <div className="current-image-preview-group">
                <label className="form-label">Current Photo Preview</label>
                <img
                  src={getImageUrl(editingFood.image)}
                  alt={editingFood.name}
                  className="current-edit-thumb"
                />
              </div>

              {/* Image Input Toggle */}
              <div className="img-type-toggle">
                <button
                  type="button"
                  className={`toggle-type-btn ${!editUseUrl ? "active" : ""}`}
                  onClick={() => setEditUseUrl(false)}
                >
                  Upload New Photo
                </button>
                <button
                  type="button"
                  className={`toggle-type-btn ${editUseUrl ? "active" : ""}`}
                  onClick={() => setEditUseUrl(true)}
                >
                  New Image URL
                </button>
              </div>

              {!editUseUrl ? (
                <div className="cat-img-upload">
                  <label htmlFor="edit-dish-image" className="cat-img-dropzone">
                    {editImage ? (
                      <img
                        src={URL.createObjectURL(editImage)}
                        alt="Upload preview"
                        className="cat-uploaded-preview"
                      />
                    ) : (
                      <div className="upload-placeholder">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#94a3b8" strokeWidth="1.8">
                          <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span>Click or drag image to replace</span>
                      </div>
                    )}
                  </label>
                  <input
                    onChange={(e) => setEditImage(e.target.files[0])}
                    type="file"
                    id="edit-dish-image"
                    accept="image/*"
                    hidden
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={editImageUrlInput}
                    onChange={(e) => setEditImageUrlInput(e.target.value)}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-modal-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-cat-btn"
                  disabled={updating}
                >
                  {updating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
