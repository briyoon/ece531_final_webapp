import { api } from './index';
import Cookies from 'js-cookie';

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

  if (response.status !== 200) {
    throw new Error('Invalid credentials');
  }

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

export default { checkAuth, login, logout };