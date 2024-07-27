import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * @typedef {Object} LoginCredentials
 * @property {string} username - The user's username or email
 * @property {string} password - The user's password
 */

/**
 * @typedef {Object} TokenResponse
 * @property {string} access_token - The JWT access token
 * @property {string} token_type - The type of token (usually "bearer")
 */

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Authenticate user and store JWT token
 * @param {LoginCredentials} credentials - User login credentials
 * @returns {Promise<TokenResponse>} The authentication token response
 */
export const login = async (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  formData.append('grant_type', 'password');

  const response = await api.post('/auth/user/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const { access_token, token_type } = response.data;
  Cookies.set('jwt', access_token, { expires: 7 }); // Set expiry to 7 days
  return response.data;
};

/**
 * Remove the stored JWT token
 */
export const logout = () => {
  Cookies.remove('jwt');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const checkAuth = () => {
  return !!Cookies.get('jwt');
};

export default api;