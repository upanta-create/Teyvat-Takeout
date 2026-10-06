import React, { useState, useEffect, useContext } from "react";
import "./Categories.css";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Categories = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [useUrl, setUseUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState(false);
  const [editImageUrlInput, setEditImageUrlInput] = useState("");
  const [editUseUrl, setEditUseUrl] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch all categories with real-time dish counts for Admin
  const fetchAdminCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/category/admin-list`, {
        headers: token ? { token } : {},
      });
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        const fallbackRes = await axios.get(`${url}/api/category/list`);
        if (fallbackRes.data.success) {
          setCategories(fallbackRes.data.data);
        }
      }
    } catch (err) {
      try {
        const fallbackRes = await axios.get(`${url}/api/category/list`);
        if (fallbackRes.data.success) {
          setCategories(fallbackRes.data.data);
        }
      } catch (fallbackErr) {
        toast.error("Please ensure the backend server is running to load categories.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = (admin || localStorage.getItem("admin")) && (token || localStorage.getItem("token"));
    if (!isAuth) {
      toast.error("Please sign in as Admin first");
      navigate("/");
    } else {
      fetchAdminCategories();
    }
  }, [admin, token]);

  const onAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!useUrl && !image) {
      toast.error("Please upload an image for this category");
      return;
    }

    if (useUrl && !imageUrlInput.trim()) {
      toast.error("Please enter a valid image URL");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());

    if (useUrl) {
      formData.append("imageUrl", imageUrlInput.trim());
    } else {
      formData.append("image", image);
    }

    try {
      const response = await axios.post(`${url}/api/category/add`, formData, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Category created successfully!");
        setName("");
        setDescription("");
        setImage(false);
        setImageUrlInput("");
        setShowAddModal(false);
        fetchAdminCategories();
      } else {
        toast.error(response.data.message || "Failed to add category");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Error creating category. Check server connection.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
    setEditImage(false);
    if (cat.image && (cat.image.startsWith("http://") || cat.image.startsWith("https://"))) {
      setEditImageUrlInput(cat.image);
      setEditUseUrl(true);
    } else {
      setEditImageUrlInput("");
      setEditUseUrl(false);
    }
    setShowEditModal(true);
  };

  const onEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setUpdating(true);
    const formData = new FormData();
    formData.append("id", editingCategory._id);
    formData.append("name", editName.trim());
    formData.append("description", editDescription.trim());

    if (editUseUrl && editImageUrlInput.trim()) {
      formData.append("imageUrl", editImageUrlInput.trim());
    } else if (editImage) {
      formData.append("image", editImage);
    }

    try {
      const response = await axios.post(`${url}/api/category/update`, formData, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Category updated successfully!");
        setShowEditModal(false);
        setEditingCategory(null);
        fetchAdminCategories();
      } else {
        toast.error(response.data.message || "Failed to update category");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Error updating category.";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const targetStatus = !cat.isActive;
    setTogglingId(cat._id);

    try {
      const response = await axios.post(
        `${url}/api/category/toggle`,
        { id: cat._id, isActive: targetStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchAdminCategories();
      } else {
        toast.error(response.data.message || "Failed to update category status");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Cannot change category status. Check if dishes are assigned.";
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const getCategoryImage = (img) => {
    if (!img) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
      return img;
    }
    return `${url}/images/${img}`;
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="categories-page">
      <div className="categories-container">
        {/* Page Top Header */}
        <div className="categories-header-section">
          <div>
            <h2>Category Catalog & Management</h2>
            <p>View all dining categories, track allotted dishes, and manage live menu visibility.</p>
          </div>
          <div className="header-action-group">
            <button
              onClick={() => setShowAddModal(true)}
              className="open-add-modal-btn"
            >
              <span>+</span> Add New Category
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="category-stats-grid">
          <div className="stat-card">
            <span className="stat-value">{categories.length}</span>
            <span className="stat-title">Total Categories</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-green">
              {categories.filter((c) => c.isActive).length}
            </span>
            <span className="stat-title">Active in Menu</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-red">
              {categories.filter((c) => !c.isActive).length}
            </span>
            <span className="stat-title">Disabled Categories</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-orange">
              {categories.reduce((acc, c) => acc + (c.dishesCount || 0), 0)}
            </span>
            <span className="stat-title">Total Allotted Dishes</span>
          </div>
        </div>

        {/* Policy Guidance Banner */}
        <div className="policy-alert-banner">
          <div className="policy-icon">🛡️</div>
          <div className="policy-text">
            <strong>System Integrity Policy:</strong> Categories cannot be deleted to preserve order history and catalog integrity. Disabling is <strong>strictly locked</strong> if any dishes are currently allotted to that category.
          </div>
        </div>

        {/* Categories Table Section */}
        <div className="categories-main-card">
          <div className="table-controls-bar">
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm("")}>✕</button>
              )}
            </div>

            <button onClick={fetchAdminCategories} className="refresh-action-btn" title="Refresh category list">
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading categories from database...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="empty-state">
              <p>No categories match your search. Click <strong>"+ Add New Category"</strong> to create one.</p>
            </div>
          ) : (
            <div className="categories-table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Visual</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Allotted Dishes</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((cat) => (
                    <tr key={cat._id} className={!cat.isActive ? "disabled-row" : ""}>
                      <td>
                        <img
                          src={getCategoryImage(cat.image)}
                          alt={cat.name}
                          className="cat-table-thumb"
                        />
                      </td>
                      <td>
                        <strong className="cat-table-name">{cat.name}</strong>
                      </td>
                      <td className="cat-table-desc">
                        {cat.description || "—"}
                      </td>
                      <td>
                        <span
                          className={`dish-count-badge ${
                            cat.dishesCount > 0 ? "has-dishes" : "empty-dishes"
                          }`}
                        >
                          🍽️ {cat.dishesCount || 0} {cat.dishesCount === 1 ? "dish" : "dishes"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            cat.isActive ? "status-active" : "status-disabled"
                          }`}
                        >
                          {cat.isActive ? "● Active" : "○ Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-group">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="edit-action-btn"
                            title="Edit Category Details"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(cat)}
                            disabled={togglingId === cat._id}
                            className={`toggle-status-btn ${
                              cat.isActive ? "btn-disable" : "btn-enable"
                            }`}
                            title={
                              cat.isActive && cat.dishesCount > 0
                                ? `Cannot disable while ${cat.dishesCount} dishes are allotted`
                                : cat.isActive
                                ? "Click to disable category"
                                : "Click to enable category"
                            }
                          >
                            {togglingId === cat._id
                              ? "Updating..."
                              : cat.isActive
                              ? "Disable"
                              : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="category-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>+ Add New Category</h3>
                <p>Create a new culinary category in the database.</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={onAddCategorySubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Artisanal Pizza, Biryani, Starters"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Brief description of this culinary category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Image Input Toggle */}
              <div className="img-type-toggle">
                <button
                  type="button"
                  className={`toggle-type-btn ${!useUrl ? "active" : ""}`}
                  onClick={() => setUseUrl(false)}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  className={`toggle-type-btn ${useUrl ? "active" : ""}`}
                  onClick={() => setUseUrl(true)}
                >
                  Direct Image URL
                </button>
              </div>

              {!useUrl ? (
                <div className="cat-img-upload">
                  <label htmlFor="modal-cat-image" className="cat-img-dropzone">
                    {image ? (
                      <img
                        src={URL.createObjectURL(image)}
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
                        <span>Click or drag image to upload</span>
                      </div>
                    )}
                  </label>
                  <input
                    onChange={(e) => setImage(e.target.files[0])}
                    type="file"
                    id="modal-cat-image"
                    accept="image/*"
                    hidden
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Image URL *</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    required={useUrl}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-modal-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-cat-btn"
                  disabled={submitting}
                >
                  {submitting ? "Publishing..." : "Publish Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="category-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>✏️ Edit Category: {editingCategory.name}</h3>
                <p>Update category name, description, or image.</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={onEditCategorySubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  rows="2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Current Image Preview */}
              <div className="current-image-preview-group">
                <label className="form-label">Current Image Preview</label>
                <img
                  src={getCategoryImage(editingCategory.image)}
                  alt={editingCategory.name}
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
                  Upload New File
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
                  <label htmlFor="edit-modal-cat-image" className="cat-img-dropzone">
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
                        <span>Click or drag new image to replace</span>
                      </div>
                    )}
                  </label>
                  <input
                    onChange={(e) => setEditImage(e.target.files[0])}
                    type="file"
                    id="edit-modal-cat-image"
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

export default Categories;
