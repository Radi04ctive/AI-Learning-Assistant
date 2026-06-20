import axios from "axios";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const register = async (username, email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      email,
      password,
      username,
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

// Exchange a refresh token for a new access/refresh pair. Uses a plain axios
// import (not the interceptored instance) so the response interceptor's 401
// refresh logic can't recurse into itself.
const refreshToken = async (refreshTokenValue) => {
  try {
    const response = await axios.post(
      `${BASE_URL}${API_PATHS.AUTH.REFRESH}`,
      { refreshToken: refreshTokenValue },
      { headers: { "Content-Type": "application/json", Accept: "application/json" } },
    );
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const logout = async (refreshTokenValue) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGOUT, {
      refreshToken: refreshTokenValue,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const changePassword = async (passwords) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, passwords);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error occurred" };
  }
};

const authService = {
  login,
  register,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
};

export default authService;
