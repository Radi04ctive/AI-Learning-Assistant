import { useState, useEffect } from "react";
import { AuthContext } from "../hooks/useAuth.js";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../utils/tokenStorage.js";
import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = () => {
    try {
      const token = getAccessToken();
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check fail: ", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData, accessToken, refreshToken) => {
    setTokens({ accessToken, refreshToken });
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    // Tell the server to blacklist this access token's jti and delete the
    // refresh token. Best-effort: we clear local state regardless of outcome.
    const refreshToken = getRefreshToken();
    try {
      await axiosInstance.post(API_PATHS.AUTH.LOGOUT, { refreshToken });
    } catch (error) {
      // Ignore: token may already be invalid/expired; we log out locally anyway.
      console.error("Logout request failed:", error.message);
    }

    clearTokens();
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem("user", JSON.stringify(newUserData));

    setUser(newUserData);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
};
