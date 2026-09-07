import React, { useState, useContext, useEffect } from "react";
import "./Add.css";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Add = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
    customCategory: "",
    rating: "4.8",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!image) {
      toast.error("Please upload a dish image");
      return;
    }

    const finalCategory =
      data.category === "Custom" ? (data.customCategory.trim() || "Specialty") : data.category;

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", finalCategory);
    formData.append("rating", Number(data.rating));
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: { token },
      });
      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad",
          customCategory: "",
          rating: "4.8",
        });
        setImage(false);
        toast.success("New gourmet delicacy added to catalog!");
      } else {
        toast.error(response.data.message || "Failed to add food item");
      }
    } catch (err) {
      toast.error("Error connecting to backend server");
    }
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please sign in as Admin first");
      navigate("/");
    }
  }, [admin, token]);

  return (
    <div className="add-page">
      <div className="add-container">
        <div className="add-header">
          <h2>Add New Gourmet Dish</h2>
          <p>Create and publish new culinary creations to the live customer catalog.</p>
        </div>

        <form onSubmit={onSubmitHandler} className="add-form">
          <div className="add-img-upload">
            <label className="form-label">Dish Image *</label>
            <label htmlFor="image" className="img-upload-dropzone">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Upload preview"
                  className="uploaded-preview"
                />
              ) : (
                <div className="upload-svg-placeholder">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94a3b8" strokeWidth="1.8">
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
              id="image"
              accept="image/*"
              hidden
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label className="form-label">Dish Name *</label>
              <input
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                name="name"
                placeholder="e.g. Truffle Butter Paneer Tikka"
                required
              />
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Price (in ₹) *</label>
              <input
                onChange={onChangeHandler}
                value={data.price}
                type="number"
                name="price"
                placeholder="₹250"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Culinary Description *</label>
            <textarea
              onChange={onChangeHandler}
              value={data.description}
              name="description"
              rows="3"
              placeholder="Describe the flavor notes, ingredients, and preparation method..."
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Category *</label>
              <select
                name="category"
                required
                onChange={onChangeHandler}
                value={data.category}
              >
                <option value="Salad">Salad</option>
                <option value="Rolls">Rolls</option>
                <option value="Deserts">Deserts</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Cake">Cake</option>
                <option value="Pure Veg">Pure Veg</option>
                <option value="Pasta">Pasta</option>
                <option value="Noodles">Noodles</option>
                <option value="Custom">+ Add Custom Category...</option>
              </select>
            </div>

            {data.category === "Custom" && (
              <div className="form-group flex-1">
                <label className="form-label">New Category Name *</label>
                <input
                  name="customCategory"
                  type="text"
                  placeholder="e.g. Biryani, Starters, Drinks"
                  value={data.customCategory}
                  onChange={onChangeHandler}
                  required
                />
              </div>
            )}

            <div className="form-group flex-1">
              <label className="form-label">Initial Rating (★)</label>
              <select
                name="rating"
                onChange={onChangeHandler}
                value={data.rating}
              >
                <option value="5.0">★ 5.0 (Exceptional)</option>
                <option value="4.9">★ 4.9 (Masterpiece)</option>
                <option value="4.8">★ 4.8 (Highly Rated)</option>
                <option value="4.7">★ 4.7 (Popular)</option>
                <option value="4.5">★ 4.5 (Great)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="add-submit-btn">
            Publish Dish to Live Menu (₹)
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
