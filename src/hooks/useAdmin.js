import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '../store';
import { adminApi } from '../api';
import { toast } from 'react-toastify';

// Query keys
const QUERY_KEYS = {
    STATS: 'adminStats',
    REGISTRATIONS: 'registrations',
    SETTINGS: 'adminSettings'
};

// Mock data for development (will be removed in production)
const mockAdminSettings = {
    registrationOpen: true,
    earlyBirdDate: '2023-09-30',
    earlyBirdPrice: 1000,
    regularPrice: 1200,
    vipPrice: 1500,
    maxCapacity: 500,
    paymentMethods: ['UPI', 'Bank Transfer', 'Credit Card'],
    emailNotifications: true,
    smsNotifications: false,
    supportEmail: 'support@unma2025.org',
    supportPhone: '+91 9876543210'
};

/**
 * Custom admin hook that combines Zustand state with Tanstack Query
 * for managing admin dashboard operations
 */
export function useAdmin() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const {
        registrationsFilters,
        updateRegistrationsFilters,
        resetRegistrationsFilters
    } = useAdminStore();

    // Queries
    const statsQuery = useQuery({
        queryKey: [QUERY_KEYS.STATS],
        queryFn: async () => {
            try {
                return await adminApi.getDashboardStats();
            } catch (error) {
                console.error('Error fetching stats:', error);
                toast.error('Failed to load dashboard statistics');
                return null;
            }
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    const registrationsQuery = useQuery({
        queryKey: [QUERY_KEYS.REGISTRATIONS, registrationsFilters],
        queryFn: async () => {
            try {
                return await adminApi.getRegistrations(registrationsFilters);
            } catch (error) {
                console.error('Error fetching registrations:', error);
                toast.error('Failed to load registrations');
                return { registrations: [], totalCount: 0, currentPage: 1, totalPages: 1 };
            }
        },
        keepPreviousData: true
    });

    const settingsQuery = useQuery({
        queryKey: [QUERY_KEYS.SETTINGS],
        queryFn: async () => {
            // In a real app, this would call an API
            // Simulating an API call with timeout
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockAdminSettings;
        }
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock validation (in a real app, this would be server-side)
            if (credentials.email === 'admin@unma2025.org' && credentials.password === 'admin123') {
                // Store token
                localStorage.setItem('adminToken', 'mock-jwt-token');
                return { success: true };
            } else {
                throw new Error('Invalid email or password');
            }
        },
        onSuccess: () => {
            navigate('/admin/dashboard');
        },
        onError: (error) => {
            toast.error(error.message || 'Login failed');
        }
    });

    // Update registration mutation
    const updateRegistrationMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.updateRegistration(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.REGISTRATIONS] });
            const previousData = queryClient.getQueryData([QUERY_KEYS.REGISTRATIONS, registrationsFilters]);

            // Optimistically update the cache
            if (previousData) {
                queryClient.setQueryData([QUERY_KEYS.REGISTRATIONS, registrationsFilters], old => ({
                    ...old,
                    registrations: old.registrations.map(reg =>
                        reg.id === id ? { ...reg, ...data } : reg
                    )
                }));
            }

            return { previousData };
        },
        onError: (err, { id, data }, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(
                    [QUERY_KEYS.REGISTRATIONS, registrationsFilters],
                    context.previousData
                );
            }
            toast.error('Failed to update registration');
        },
        onSuccess: () => {
            toast.success('Registration updated successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REGISTRATIONS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STATS] });
        }
    });

    // Update settings mutation
    const updateSettingsMutation = useMutation({
        mutationFn: async (settings) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            return settings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS] });
            toast.success('Settings updated successfully');
        },
        onError: () => {
            toast.error('Failed to update settings');
        }
    });

    // Handle searching registrations
    const handleSearch = (searchTerm) => {
        updateRegistrationsFilters({ searchTerm, page: 1 });
    };

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        updateRegistrationsFilters({ [filterName]: value, page: 1 });
    };

    // Handle page changes
    const handlePageChange = (page) => {
        updateRegistrationsFilters({ page });
    };

    // Handle export
    const handleExport = async () => {
        try {
            const data = await adminApi.exportRegistrations(registrationsFilters);

            // Create a downloadable blob
            const blob = new Blob([data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'registrations.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Export successful');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export registrations');
        }
    };

    // Prefetch next page
    const prefetchNextPage = () => {
        if (registrationsQuery.data?.hasNextPage) {
            const nextPage = registrationsFilters.page + 1;
            queryClient.prefetchQuery({
                queryKey: [QUERY_KEYS.REGISTRATIONS, { ...registrationsFilters, page: nextPage }],
                queryFn: () => adminApi.getRegistrations({ ...registrationsFilters, page: nextPage })
            });
        }
    };

    return {
        // Data
        stats: statsQuery.data,
        registrations: registrationsQuery.data,
        settings: settingsQuery.data,
        filters: registrationsFilters,

        // Loading states
        isStatsLoading: statsQuery.isLoading,
        isRegistrationsLoading: registrationsQuery.isLoading,
        isSettingsLoading: settingsQuery.isLoading,
        isLoginLoading: loginMutation.isPending,
        isUpdatingSettings: updateSettingsMutation.isPending,
        isUpdatingRegistration: updateRegistrationMutation.isPending,

        // Mutations
        login: (credentials) => loginMutation.mutate(credentials),
        updateSettings: (settings) => updateSettingsMutation.mutate(settings),
        updateRegistration: (id, data) => updateRegistrationMutation.mutate({ id, data }),

        // Handlers
        handleSearch,
        handleFilterChange,
        handlePageChange,
        handleExport,
        resetFilters: resetRegistrationsFilters,
        prefetchNextPage
    };
}

export default useAdmin; 