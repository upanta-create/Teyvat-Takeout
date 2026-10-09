import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  // Load backend base URL from Vite environment with local fallback for docker/dev
  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [category_list, setCategoryList] = useState([]);
  const [appLoading, setAppLoading] = useState(true);

  // Modal & Recommendation States
  const [showLogin, setShowLogin] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetFood, setReviewTargetFood] = useState(null);
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [preferredCategories, setPreferredCategories] = useState([]);

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      const response = await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Item added to cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      const response = await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Item removed from cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data.success) {
        setFoodList(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching food list:", err);
    }
  };

  const fetchCategoryList = async () => {
    try {
      const response = await axios.get(url + "/api/category/list");
      if (response.data.success) {
        setCategoryList(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching category list:", err);
    }
  };

  const fetchRecommendations = async (authToken) => {
    const activeToken = authToken || token || localStorage.getItem("token");
    if (!activeToken) {
      setUserRecommendations([]);
      setPreferredCategories([]);
      return;
    }
    try {
      const response = await axios.post(
        url + "/api/review/recommendations",
        {},
        { headers: { token: activeToken } }
      );
      if (response.data.success && response.data.hasPreferences) {
        setUserRecommendations(response.data.data);
        setPreferredCategories(response.data.preferredCategories || []);
      } else {
        setUserRecommendations([]);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    }
  };

  const openReviewModal = (foodItem) => {
    if (!token && !localStorage.getItem("token")) {
      toast.info("Please sign in to rate this delicacy!");
      setShowLogin(true);
      return;
    }
    setReviewTargetFood(foodItem);
    setShowReviewModal(true);
  };

  const loadCardData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (err) {
      console.error("Error loading cart data:", err);
    }
  };

  useEffect(() => {
    async function loadData() {
      setAppLoading(true);
      await Promise.all([fetchFoodList(), fetchCategoryList()]);
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCardData(savedToken);
        await fetchRecommendations(savedToken);
      }
      setAppLoading(false);
    }
    loadData();
  }, []);

  const getImageUrl = (image) => {
    if (!image) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
      return image;
    }
    return `${url}/images/${image}`;
  };

  const contextValue = {
    food_list,
    category_list,
    fetchCategoryList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    fetchFoodList,
    fetchRecommendations,
    userRecommendations,
    preferredCategories,
    showLogin,
    setShowLogin,
    showReviewModal,
    setShowReviewModal,
    reviewTargetFood,
    setReviewTargetFood,
    openReviewModal,
    getImageUrl,
    url,
    token,
    setToken,
    appLoading,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
