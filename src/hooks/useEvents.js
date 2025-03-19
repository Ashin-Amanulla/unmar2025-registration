import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { registrationsApi } from "../api";
import { toast } from "react-toastify";

/**
 * Hook for managing events using React Query
 */
export function useEvents() {
    const queryClient = useQueryClient();

    // Fetch all events
    const eventsQuery = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            try {
                return await registrationsApi.getEvents();
            } catch (error) {
                console.error("Error fetching events:", error);
                toast.error("Failed to load events");
                return [];
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch single event
    const getEvent = (eventId) => {
        return useQuery({
            queryKey: ["event", eventId],
            queryFn: async () => {
                try {
                    return await registrationsApi.getEventById(eventId);
                } catch (error) {
                    console.error(`Error fetching event ${eventId}:`, error);
                    toast.error("Failed to load event details");
                    return null;
                }
            },
            enabled: !!eventId, // Only run if eventId is provided
        });
    };

    // Check availability
    const checkAvailability = (eventId) => {
        return useQuery({
            queryKey: ["event-availability", eventId],
            queryFn: async () => {
                try {
                    return await registrationsApi.checkEventAvailability(eventId);
                } catch (error) {
                    console.error(`Error checking availability for event ${eventId}:`, error);
                    return { available: false, error: true };
                }
            },
            enabled: !!eventId,
            // Refresh every minute to keep availability data current
            refetchInterval: 60 * 1000,
        });
    };

    // Register for event
    const registerMutation = useMutation({
        mutationFn: (registrationData) =>
            registrationsApi.registerForEvent(registrationData),

        onSuccess: (data, variables) => {
            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({
                queryKey: ["event", variables.eventId]
            });
            queryClient.invalidateQueries({
                queryKey: ["event-availability", variables.eventId]
            });

            toast.success("Registration successful!");
            return data;
        },

        onError: (error) => {
            console.error("Registration error:", error);
            toast.error(error.message || "Registration failed. Please try again.");
        }
    });

    return {
        // Queries
        events: eventsQuery.data,
        isEventsLoading: eventsQuery.isLoading,
        isEventsError: eventsQuery.isError,
        getEvent,
        checkAvailability,

        // Mutations
        register: (data) => registerMutation.mutate(data),
        isRegistering: registerMutation.isPending,

        // Refetch functions
        refetchEvents: () => eventsQuery.refetch(),
    };
}

export default useEvents; 