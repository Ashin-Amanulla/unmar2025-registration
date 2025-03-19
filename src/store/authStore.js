import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api';

/**
 * Authentication Store
 * Manages authentication state using Zustand with persistence
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            login: async (email, password) => {
                set({ isLoading: true, error: null });

                try {
                    const data = await authApi.login(email, password);

                    // Store token in localStorage for interceptors
                    localStorage.setItem('adminToken', data.token);

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return data;
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message || 'Login failed'
                    });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });

                try {
                    // Call API logout (if needed)
                    await authApi.logout();

                    // Clear local storage
                    localStorage.removeItem('adminToken');

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message || 'Logout failed'
                    });

                    // Still clear state and storage on error
                    localStorage.removeItem('adminToken');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false
                    });
                }
            },

            checkAuth: async () => {
                const token = localStorage.getItem('adminToken');

                // If no token in storage, user is not authenticated
                if (!token) {
                    set({ isAuthenticated: false, user: null, token: null });
                    return false;
                }

                set({ isLoading: true, token });

                try {
                    // Verify token validity with backend
                    const data = await authApi.verifyToken();

                    set({
                        user: data.user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return true;
                } catch (error) {
                    // Token verification failed, clear auth state
                    localStorage.removeItem('adminToken');

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.message || 'Session expired'
                    });

                    return false;
                }
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage', // Storage key
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }) // Only persist these fields
        }
    )
);

export default useAuthStore; 