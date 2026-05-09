/**
 * API Service
 * Handles custom backend calls and EmailJS notifications.
 */

const API_URL = 'https://api.example.com'; // TODO: Update with actual backend URL
const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';
const EMAILJS_SERVICE_ID = 'service_855pl3l';
const EMAILJS_APPROVED_TEMPLATE_ID = 'template_ddhdpd4';
const EMAILJS_REJECTED_TEMPLATE_ID = 'template_vlng6ju';
const EMAILJS_PUBLIC_KEY = 'rtOl8W4tvRgSvuTYa';

type RegistrationEmailParams = {
  student_name: string;
  student_email: string;
  department: string;
  website_link?: string;
  support_email?: string;
  rejection_reason?: string;
};

const sendEmailJsTemplate = async (templateId: string, templateParams: RegistrationEmailParams) => {
  const response = await fetch(EMAILJS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to send EmailJS email');
  }
};

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

  sendStudentApprovalEmail: async (params: RegistrationEmailParams) => {
    try {
      await sendEmailJsTemplate(EMAILJS_APPROVED_TEMPLATE_ID, {
        website_link: 'https://your-app-url.example.com', // TODO: replace with your real app URL
        support_email: 'admin@university.edu', // TODO: replace with your support/admin email
        ...params,
      });
    } catch (error: any) {
      console.error('API sendStudentApprovalEmail error:', error.message);
      throw error;
    }
  },

  sendStudentRejectionEmail: async (params: RegistrationEmailParams) => {
    try {
      await sendEmailJsTemplate(EMAILJS_REJECTED_TEMPLATE_ID, {
        website_link: 'https://your-app-url.example.com', // TODO: replace with your real app URL
        support_email: 'admin@university.edu', // TODO: replace with your support/admin email
        ...params,
      });
    } catch (error: any) {
      console.error('API sendStudentRejectionEmail error:', error.message);
      throw error;
    }
  },
};
