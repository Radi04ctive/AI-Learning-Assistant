import axios from "axios";
import { BASE_URL, API_PATHS } from "./apiPaths.js";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./tokenStorage.js";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: attach the short-lived access token.
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- 401 refresh logic ---
// On an expired access token we transparently call /refresh once, swap in the
// new tokens, and replay the original request. Concurrent 401s are queued and
// resolved once the in-flight refresh finishes.
let isRefreshing = false;
let waitQueue = []; // [{ resolve, reject }] waiting for the active refresh

const redirectToLogin = () => {
  clearTokens();
  localStorage.removeItem("user");
  // Avoid loops if we're already on the login page.
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
};

const refreshAccessToken = async () => {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error("No refresh token");
  }
  // Plain axios call so the response interceptor can't recurse into itself.
  const response = await axios.post(
    `${BASE_URL}${API_PATHS.AUTH.REFRESH}`,
    { refreshToken: refreshTokenValue },
    { headers: { "Content-Type": "application/json", Accept: "application/json" } },
  );
  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  setTokens({ accessToken, refreshToken: newRefreshToken });
  return accessToken;
};

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 500) {
      console.error("Server error, Please try again later");
    } else if (error.code === "ECONNABROTED") {
      console.error("Request timeout, Please try again");
    }

    const originalRequest = error.config;
    const status = error.response?.status;

    // Only attempt a refresh once per request, skip the refresh/login endpoints
    // themselves, and skip requests that have no URL.
    const isAuthEndpoint =
      originalRequest?.url?.includes(API_PATHS.AUTH.REFRESH) ||
      originalRequest?.url?.includes(API_PATHS.AUTH.LOGIN);

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      // If a refresh is already in flight, queue this request until it resolves.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waitQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();

        // Replay the original request with the fresh access token.
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Drain the queue: replay every queued request with the new token.
        waitQueue.forEach(({ resolve }) => resolve(newAccessToken));
        waitQueue = [];

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed (revoked/expired refresh token): drop queued requests
        // and force a re-login.
        waitQueue.forEach(({ reject }) => reject(refreshError));
        waitQueue = [];
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
