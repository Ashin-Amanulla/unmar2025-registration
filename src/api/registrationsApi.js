import axios from './axios';

/**
 * Registrations API Service
 * Handles event registration related API calls
 */
const registrationsApi = {
    /**
     * Create a new registration
     * @param {Object} registrationData - Registration form data
     * @returns {Promise} - Promise with registration data
     */
    create: async (registrationId, payload) => {
        try {
            const response = await axios.post(`/registrations/step/${registrationId || 'new'}`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    },

    /**
     * Verify OTP for registration
     * @param {string} email - User email
     * @param {string} phone - User phone
     * @param {string} otp - OTP to verify
     * @returns {Promise} - Promise with verification result
     */
    verifyOtp: async (email, phone, otp) => {
        try {
            const response = await axios.post('/registrations/verify-otp', { email, phone, otp });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'OTP verification failed' };
        }
    },

    /**
     * Send OTP to user's phone/email
     * @param {string} email - User email
     * @param {string} phone - User phone
     * @returns {Promise} - Promise with send result
     */
    sendOtp: async (email, phone) => {
        try {
            const response = await axios.post('/registrations/send-otp', { email, phone });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to send OTP' };
        }
    },

    /**
     * Process payment for registration
     * @param {number} registrationId - Registration ID
     * @param {Object} paymentDetails - Payment details
     * @returns {Promise} - Promise with payment result
     */
    processPayment: async (registrationId, paymentDetails) => {
        try {
            const response = await axios.post(`/registrations/${registrationId}/payment`, paymentDetails);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Payment processing failed' };
        }
    },

    /**
     * Get all registrations with optional query parameters
     * @param {string} queryParams - URL query parameters for filtering
     * @returns {Promise} - Promise with registrations data
     */
    getAllRegistrations: async (queryParams = '') => {
        try {
            const url = queryParams ? `/registrations?${queryParams}` : '/registrations';
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch registrations' };
        }
    },

    getRegistrationById: async (id) => {
        try {
            const response = await axios.get(`/registrations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch registration' };
        }
    },

    deleteRegistration: async (id) => {
        try {
            const response = await axios.delete(`/registrations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete registration' };
        }
    },

    updateRegistration: async (id, registrationData) => {
        try {
            const response = await axios.put(`/registrations/${id}`, registrationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update registration' };
        }
    },

    sendOtp: async (email, contactNumber) => {
        try {
            const response = await axios.post('/registrations/send-otp', { email, contactNumber });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to send OTP' };
        }
    },
    verifyOtp: async (email, contactNumber, otp) => {
        try {
            const response = await axios.post('/registrations/verify-otp', { email, contactNumber, otp });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to verify OTP' };
        }
    },

    transactionRegister: async (registrationId, payload) => {
        try {
            const response = await axios.post(`/registrations/${registrationId}/payment`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to register transaction' };
        }
    },

};

export default registrationsApi; 