import axios from 'axios';

export const otpInstance = axios.create({
    baseURL: import.meta.env.VITE_OTP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});