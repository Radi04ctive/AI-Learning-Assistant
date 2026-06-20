// Single source of truth for the access/refresh tokens in localStorage.
// Kept outside React so the axios response interceptor (non-React code) can
// read and swap tokens without needing access to the AuthContext.

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken !== undefined) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken !== undefined) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
