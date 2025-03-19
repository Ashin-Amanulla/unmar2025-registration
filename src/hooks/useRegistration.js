import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRegistrationStore } from '../store';
import { registrationsApi } from '../api';
import { toast } from 'react-toastify';

// Query/Mutation keys
const REGISTRATION_KEYS = {
    FORM_DATA: 'registration-form',
    SETTINGS: 'registration-settings',
    EVENT_FEES: 'event-fees',
    PAYMENT_STATUS: 'payment-status',
    OTP_VERIFICATION: 'otp-verification'
};

/**
 * Custom registration hook that combines Zustand store with TanStack Query
 * for managing registration operations
 */
const useRegistration = () => {
    const queryClient = useQueryClient();

    // Get registration form state from store
    const {
        formData,
        currentStep,
        maxCompletedStep,
        otp,

        updateFormData,
        setOtp,
        setCurrentStep,
        nextStep,
        prevStep,
        completeRegistration,

    } = useRegistrationStore();

    // Query for registration fee structure
    const { data: feeStructure } = useQuery({
        queryKey: [REGISTRATION_KEYS.EVENT_FEES],
        queryFn: async () => {
            // In a real app, this would fetch from API
            await new Promise(resolve => setTimeout(resolve, 300));
            return {
                standard: 1200,
                vip: 2500,
                earlyBird: 999,
                student: 800,
                group: 1000 // per person for groups of 5+
            };
        },
        staleTime: 24 * 60 * 60 * 1000 // 24 hours - fees don't change often
    });

    // Calculate total fee based on registration type
    const calculateFee = (type) => {
        if (!feeStructure) return 0;
        const lowerType = (type || formData.registrationType || 'standard').toLowerCase();
        return feeStructure[lowerType] || feeStructure.standard;
    };

    // Send OTP mutation
    const sendOtpMutation = useMutation({
        mutationFn: async ({ email, phone }) => {
            // In a real app, this would call the API
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true, message: 'OTP sent successfully' };
        },
        onSuccess: () => {
            toast.success('OTP has been sent to your phone');
            // Store OTP sent status in query cache
            queryClient.setQueryData([REGISTRATION_KEYS.OTP_VERIFICATION, 'sent'], true);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to send OTP');
            queryClient.setQueryData([REGISTRATION_KEYS.OTP_VERIFICATION, 'sent'], false);
        }
    });

    // Verify OTP mutation
    const verifyOtpMutation = useMutation({
        mutationFn: async ({ email, phone, otp }) => {
            // In a real app, this would validate with the API
            await new Promise(resolve => setTimeout(resolve, 800));
            // For demo, any 4-digit OTP is valid
            if (otp.length !== 4) {
                throw new Error('Invalid OTP format');
            }
            return { success: true, verified: true };
        },
        onSuccess: () => {
            toast.success('OTP verified successfully');
            // Store verification status in query cache
            queryClient.setQueryData([REGISTRATION_KEYS.OTP_VERIFICATION, 'verified'], true);

            // Auto advance to next step
            nextStep();
        },
        onError: (error) => {
            toast.error(error.message || 'Invalid OTP');
            queryClient.setQueryData([REGISTRATION_KEYS.OTP_VERIFICATION, 'verified'], false);
        }
    });

    // Submit registration mutation
    const registrationMutation = useMutation({
        mutationFn: async (formData) => {
            // In a real app, this would submit to the API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Return mock registration response
            return {
                success: true,
                registrationId: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
                amount: calculateFee(formData.registrationType),
                timestamp: new Date().toISOString()
            };
        },
        onSuccess: (data) => {
            toast.success('Registration submitted successfully!');
            completeRegistration();

            // Store registration result in cache
            queryClient.setQueryData([REGISTRATION_KEYS.FORM_DATA, 'result'], data);

            // Reset form in 30 minutes
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: [REGISTRATION_KEYS.FORM_DATA] });
            }, 30 * 60 * 1000);

            return data;
        },
        onError: (error) => {
            toast.error(error.message || 'Registration failed');
        }
    });

    // Process payment mutation
    const paymentMutation = useMutation({
        mutationFn: async ({ registrationId, paymentDetails }) => {
            // In a real app, this would process payment through gateway
            await new Promise(resolve => setTimeout(resolve, 2000));

            return {
                success: true,
                paymentId: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
                status: 'completed',
                amount: paymentDetails.amount,
                timestamp: new Date().toISOString()
            };
        },
        onSuccess: (data) => {
            toast.success('Payment processed successfully!');

            // Update payment status in cache
            queryClient.setQueryData([REGISTRATION_KEYS.PAYMENT_STATUS], {
                status: 'success',
                data
            });

            return data;
        },
        onError: (error) => {
            toast.error(error.message || 'Payment failed');

            // Update payment status in cache
            queryClient.setQueryData([REGISTRATION_KEYS.PAYMENT_STATUS], {
                status: 'failed',
                error: error.message
            });
        }
    });

    // Get cached values
    const otpSent = queryClient.getQueryData([REGISTRATION_KEYS.OTP_VERIFICATION, 'sent']) || false;
    const otpVerified = queryClient.getQueryData([REGISTRATION_KEYS.OTP_VERIFICATION, 'verified']) || false;
    const registrationResult = queryClient.getQueryData([REGISTRATION_KEYS.FORM_DATA, 'result']);
    const paymentStatus = queryClient.getQueryData([REGISTRATION_KEYS.PAYMENT_STATUS]);

    // Helper functions for form flow
    const handleSendOtp = () => {
        const { email, phone } = formData;

        if (!email || !phone) {
            toast.error('Email and phone are required');
            return;
        }

        sendOtpMutation.mutate({ email, phone });
    };

    const handleVerifyOtp = () => {
        const { email, phone } = formData;

        if (!otp || otp.length < 4) {
            toast.error('Please enter a valid OTP');
            return;
        }

        verifyOtpMutation.mutate({ email, phone, otp });
    };

    const handleFormSubmit = (e) => {
        e?.preventDefault();

        if (currentStep === 0) {
            if (!otpVerified) {
                if (!otpSent) {
                    handleSendOtp();
                } else {
                    handleVerifyOtp();
                }
                return;
            }
        }

        // Handle normal step navigation
        if (currentStep < 3) {
            // Validate current step before proceeding
            if (validateCurrentStep()) {
                nextStep();
            }
        } else {
            // Final submission
            registrationMutation.mutate(formData);
        }
    };

    // Basic validation for each step
    const validateCurrentStep = () => {
        switch (currentStep) {
            case 0:
                // Personal info validation
                if (!otpVerified) {
                    toast.error('Please verify your phone number');
                    return false;
                }
                if (!formData.name || !formData.email || !formData.phone) {
                    toast.error('Please fill all required fields');
                    return false;
                }
                return true;

            case 1:
                // Education info validation
                if (!formData.school) {
                    toast.error('Please select your school');
                    return false;
                }
                return true;

            case 2:
                // Address validation
                if (!formData.city || !formData.state) {
                    toast.error('City and State are required');
                    return false;
                }
                return true;

            case 3:
                // Final step validation
                if (!formData.agreeToTerms) {
                    toast.error('You must agree to the terms and conditions');
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    // Reset the entire registration flow
    const resetRegistration = () => {
        // Clear all registration-related queries
        queryClient.removeQueries({ queryKey: [REGISTRATION_KEYS.FORM_DATA] });
        queryClient.removeQueries({ queryKey: [REGISTRATION_KEYS.OTP_VERIFICATION] });
        queryClient.removeQueries({ queryKey: [REGISTRATION_KEYS.PAYMENT_STATUS] });

        // Reset store state
        setCurrentStep(0);
        updateFormData({
            name: '',
            email: '',
            phone: '',
            school: '',
            graduationYear: '',
            registrationType: 'Standard',
            tShirtSize: 'M',
            address: '',
            city: '',
            state: '',
            pincode: '',
            agreeToTerms: false
        });
        setOtp('');

        toast.info('Registration form has been reset');
    };

    return {
        // Form state
        formData,
        currentStep,
        maxCompletedStep,
        otpSent,
        otpVerified,
        otp,

        // Loading states
        isSubmitting:
            registrationMutation.isPending ||
            sendOtpMutation.isPending ||
            verifyOtpMutation.isPending ||
            paymentMutation.isPending,
        isSendingOtp: sendOtpMutation.isPending,
        isVerifyingOtp: verifyOtpMutation.isPending,
        isProcessingPayment: paymentMutation.isPending,

        // Results
        fee: calculateFee(),
        paymentStatus: paymentStatus?.status || 'pending',
        registrationResult,

        // Form actions
        updateFormData,
        setOtp,
        setCurrentStep,
        nextStep,
        prevStep,
        resetRegistration,

        // Form submission handlers
        handleSendOtp,
        handleVerifyOtp,
        handleFormSubmit,

        // Payment processing
        processPayment: (details) => paymentMutation.mutate(details)
    };
};

export default useRegistration; 