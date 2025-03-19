import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// Query keys for better organization
const AUTH_KEYS = {
    USER: 'user',
    AUTH_STATUS: 'auth-status'
};

const useAuth = () => {
    const queryClient = useQueryClient();

    // Get current user from localStorage on initial load
    const loadUserFromStorage = () => {
        const token = localStorage.getItem('userToken');

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
    const { data: user, isLoading: isAuthCheckLoading } = useQuery({
        queryKey: [AUTH_KEYS.USER],
        queryFn: loadUserFromStorage,
        staleTime: Infinity, // Auth state doesn't get stale until we explicitly invalidate it
        initialData: loadUserFromStorage
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async (userData) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For demo purposes, just return a success response
            return {
                id: Math.floor(Math.random() * 1000),
                name: userData.name,
                email: userData.email,
                token: 'mock-jwt-token'
            };
        },
        onSuccess: (data) => {
            // Store in local storage
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userData', JSON.stringify({
                id: data.id,
                name: data.name,
                email: data.email
            }));

            // Update cache
            queryClient.setQueryData([AUTH_KEYS.USER], data);
            toast.success('Registration successful!');
        },
        onError: (error) => {
            toast.error(error.message || 'Registration failed');
        }
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock validation
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }

            // For demo purposes, return mock user data
            return {
                id: Math.floor(Math.random() * 1000),
                name: credentials.email.split('@')[0],
                email: credentials.email,
                token: 'mock-jwt-token'
            };
        },
        onSuccess: (data) => {
            // Store in local storage
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userData', JSON.stringify({
                id: data.id,
                name: data.name,
                email: data.email
            }));

            // Update cache
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
            // Simulate API call (in a real app, this might invalidate the token on the server)
            await new Promise(resolve => setTimeout(resolve, 300));
            return true;
        },
        onSuccess: () => {
            // Clear local storage
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');

            // Set user to null in cache
            queryClient.setQueryData([AUTH_KEYS.USER], null);
            toast.success('Logged out successfully');
        }
    });

    return {
        // Auth state
        user,
        isAuthenticated: !!user,

        // Loading states
        isAuthCheckLoading,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        isLoggingOut: logoutMutation.isPending,

        // Error states
        loginError: loginMutation.error,
        registerError: registerMutation.error,

        // Auth actions
        login: (credentials) => loginMutation.mutate(credentials),
        register: (userData) => registerMutation.mutate(userData),
        logout: () => logoutMutation.mutate(),

        // Util functions
        clearErrors: () => {
            loginMutation.reset();
            registerMutation.reset();
        }
    };
};

export default useAuth; 