/**
 * API Service
 * Handles custom backend calls for forgot/reset password
 */

const API_URL = 'https://api.example.com'; // TODO: Update with actual backend URL

export const apiService = {
  /**
   * Request a password reset email
   */
  forgotPassword: async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      return await response.json();
    } catch (error: any) {
      console.error('API forgotPassword error:', error.message);
      throw error;
    }
  },

  /**
   * Reset password using a token
   */
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      return await response.json();
    } catch (error: any) {
      console.error('API resetPassword error:', error.message);
      throw error;
    }
  },
};
