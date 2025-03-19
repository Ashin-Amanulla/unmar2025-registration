import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Registration Form Store
 * Manages registration form state and progress using Zustand with persistence
 */
const useRegistrationStore = create(
    persist(
        (set, get) => ({
            // Step state
            currentStep: 0,
            maxCompletedStep: 0,
            otpSent: false,
            otpVerified: false,
            isSubmitting: false,
            registrationCompleted: false,

            // Form data
            formData: {
                name: '',
                email: '',
                phone: '',
                school: '',
                batch: '',
                foodPreference: 'veg',
                accommodation: false,
                tshirtSize: '',
                registrationType: 'standard',
                specialRequirements: '',
            },

            // OTP management
            otp: '',

            // Payment tracking
            paymentStatus: null,
            paymentId: null,

            // Calculated total based on current selections
            get totalAmount() {
                const { formData } = get();
                let amount = 0;

                // Base registration fee
                switch (formData.registrationType) {
                    case 'standard':
                        amount += 500;
                        break;
                    case 'premium':
                        amount += 1000;
                        break;
                    case 'supporter':
                        amount += 2000;
                        break;
                    default:
                        amount += 500;
                }

                // Additional for accommodation
                if (formData.accommodation) {
                    amount += 500;
                }

                return amount;
            },

            // Actions
            updateFormData: (data) => {
                set((state) => ({
                    formData: { ...state.formData, ...data }
                }));
            },

            setOtp: (otp) => set({ otp }),

            setOtpSent: (status) => set({ otpSent: status }),

            setOtpVerified: (status) => set({ otpVerified: status }),

            setCurrentStep: (step) => {
                set((state) => ({
                    currentStep: step,
                    maxCompletedStep: Math.max(state.maxCompletedStep, step)
                }));
            },

            nextStep: () => {
                set((state) => ({
                    currentStep: state.currentStep + 1,
                    maxCompletedStep: Math.max(state.maxCompletedStep, state.currentStep + 1)
                }));
            },

            prevStep: () => {
                set((state) => ({
                    currentStep: Math.max(0, state.currentStep - 1)
                }));
            },

            setSubmitting: (status) => set({ isSubmitting: status }),

            updatePaymentStatus: (status, paymentId) => set({
                paymentStatus: status,
                paymentId: paymentId
            }),

            completeRegistration: () => set({ registrationCompleted: true }),

            resetForm: () => set({
                currentStep: 0,
                maxCompletedStep: 0,
                otpSent: false,
                otpVerified: false,
                isSubmitting: false,
                registrationCompleted: false,
                formData: {
                    name: '',
                    email: '',
                    phone: '',
                    school: '',
                    batch: '',
                    foodPreference: 'veg',
                    accommodation: false,
                    tshirtSize: '',
                    registrationType: 'standard',
                    specialRequirements: '',
                },
                otp: '',
                paymentStatus: null,
                paymentId: null
            })
        }),
        {
            name: 'registration-form', // Storage key
            partialize: (state) => ({
                currentStep: state.currentStep,
                maxCompletedStep: state.maxCompletedStep,
                otpSent: state.otpSent,
                otpVerified: state.otpVerified,
                formData: state.formData,
                paymentStatus: state.paymentStatus,
                paymentId: state.paymentId,
                registrationCompleted: state.registrationCompleted
            }) // Only persist these fields
        }
    )
);

export default useRegistrationStore; 