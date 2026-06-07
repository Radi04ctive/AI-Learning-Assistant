import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getDashboard = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.PROGRRESS.GET_DASHBOARD);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to fetch dashboard data" };
  }
};

const progressService = {
  getDashboard,
};

export default progressService;
