import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Query keys for better organization
const AUTH_KEYS = {
    USER: 'user',
    AUTH_STATUS: 'auth-status'
};

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: async (credentials) => {
                try {
                    const response = await fetch("/api/admin/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(credentials),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || "Login failed");
                    }

                    const data = await response.json();
                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                    });

                    // Set token in localStorage for API calls
                    localStorage.setItem("adminToken", data.token);
                    return data;
                } catch (error) {
                    throw error;
                }
            },
            logout: () => {
                localStorage.removeItem("adminToken");
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },
            updateUser: (userData) => {
                set((state) => ({
                    user: { ...state.user, ...userData },
                }));
            },
        }),
        {
            name: "admin-auth",
            getStorage: () => localStorage,
        }
    )
);

// Create an axios instance with auth headers
export const createAuthenticatedApi = () => {
    const token = localStorage.getItem("adminToken");

    return {
        get: async (url) => {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Request failed");
            return response.json();
        },
        post: async (url, data) => {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Request failed");
            return response.json();
        },
        put: async (url, data) => {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Request failed");
            return response.json();
        },
        delete: async (url) => {
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Request failed");
            return response.json();
        },
    };
};

const useAuth = () => {
    const queryClient = useQueryClient();
    const {
        user,
        token,
        isAuthenticated,
        login: storeLogin,
        logout: storeLogout,
        updateUser,
    } = useAuthStore();

    // Get current user from localStorage on initial load
    const loadUserFromStorage = () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return null;

        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            return { ...userData, token };
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    };

    // Query to check authentication status
    const { isLoading: isAuthCheckLoading } = useQuery({
        queryKey: [AUTH_KEYS.USER],
        queryFn: loadUserFromStorage,
        staleTime: Infinity,
        initialData: loadUserFromStorage
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: storeLogin,
        onSuccess: (data) => {
            queryClient.setQueryData([AUTH_KEYS.USER], data);
            toast.success('Login successful!');
        },
        onError: (error) => {
            toast.error(error.message || 'Login failed');
        }
    });

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: async () => {
            storeLogout();
            return true;
        },
        onSuccess: () => {
            queryClient.setQueryData([AUTH_KEYS.USER], null);
            toast.success('Logged out successfully');
        }
    });

    return {
        // Auth state
        user,
        token,
        isAuthenticated,

        // Loading states
        isAuthCheckLoading,
        isLoggingIn: loginMutation.isPending,
        isLoggingOut: logoutMutation.isPending,

        // Error states
        loginError: loginMutation.error,

        // Auth actions
        login: (credentials) => loginMutation.mutate(credentials),
        logout: () => logoutMutation.mutate(),
        updateUser,

        // Util functions
        clearErrors: () => {
            loginMutation.reset();
        }
    };
};

export default useAuth; 