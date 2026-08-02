import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event("userProfileUpdated"));
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("userProfileUpdated"));
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = prev ? { ...prev, ...updatedData } : updatedData;
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
    window.dispatchEvent(new Event("userProfileUpdated"));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
