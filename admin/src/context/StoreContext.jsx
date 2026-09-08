import { createContext, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("admin");
    return saved === "true" || saved === true;
  });

  const contextValue = {
    token,
    setToken,
    admin,
    setAdmin,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
