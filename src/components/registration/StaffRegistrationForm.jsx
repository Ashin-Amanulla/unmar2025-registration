import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { RegistrationSchemas } from "../../zod-form-validators/registrationform";
import { useRegistration } from "../../hooks";
import VerificationQuiz from "../VerificationQuiz";
import {
  FormSection,
  FormField,
  OtpInput,
  CaptchaVerification,
  NavigationButtons,
  MobileProgressIndicator,
} from "./FormComponents";
import StepIndicator from "./StepIndicator";

const StaffRegistrationForm = ({ onBack, storageKey }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [formHasLocalData, setFormHasLocalData] = useState(false);

  const { submitRegistration } = useRegistration();

  // Steps in the registration form
  const steps = [
    "Verification",
    "Personal Info",
    "Professional",
    "Event Attendance",
    "Accommodation",
    "Financial",
  ];

  // Set up form with Zod validation
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(RegistrationSchemas.Staff),
    mode: "onChange",
    defaultValues: {
      registrationType: "Staff",
      name: "",
      contactNumber: "",
      email: "",
      emailVerified: false,
      captchaVerified: false,
      whatsappNumber: "",
      country: "India",
      stateUT: "",

      // Professional
      schoolsWorked: "",
      yearsOfWorking: "",
      currentPosition: "",

      // Event attendance
      isAttending: true,
      foodPreference: undefined,
      totalVeg: 0,
      totalNonVeg: 0,
      eventContribution: [],
      contributionDetails: "",

      // Accommodation
      accommodation: "",
      accommodationCapacity: 0,
      accommodationLocation: "",
      accommodationRemarks: "",

      // Financial
      willContribute: false,
      contributionAmount: 0,
      proposedAmount: 0,
    },
  });

  // Watch specific fields for conditional rendering
  const email = watch("email");
  const isAttending = watch("isAttending");
  const accommodation = watch("accommodation");
  const willContribute = watch("willContribute");

  // Load saved data from local storage
  useEffect(() => {
    const savedRegistrationData = localStorage.getItem(storageKey);
    const savedStep = localStorage.getItem(`${storageKey}-step`);

    if (savedRegistrationData) {
      try {
        const parsedData = JSON.parse(savedRegistrationData);

        // Only load if it's a Staff registration
        if (parsedData.registrationType === "Staff") {
          reset(parsedData);
          setFormHasLocalData(true);

          // Restore verification states
          setEmailVerified(parsedData.emailVerified);
          setCaptchaVerified(parsedData.captchaVerified);

          // Restore step
          if (savedStep) {
            setCurrentStep(parseInt(savedStep, 10));
          }

          toast.info("Previous form data restored");
        }
      } catch (error) {
        console.error("Error parsing saved form data:", error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [reset, storageKey]);

  // Save data to local storage when form changes
  useEffect(() => {
    if (isDirty) {
      const formData = getValues();
      localStorage.setItem(storageKey, JSON.stringify(formData));
      localStorage.setItem(`${storageKey}-step`, currentStep.toString());
    }
  }, [watch(), currentStep, isDirty, getValues, storageKey]);

  // Update verification states in form data
  useEffect(() => {
    setValue("emailVerified", emailVerified);
    setValue("captchaVerified", captchaVerified);
  }, [emailVerified, captchaVerified, setValue]);

  // Email verification handler
  const handleEmailVerified = (status) => {
    setEmailVerified(status);
    setValue("emailVerified", status);
  };

  // CAPTCHA verification handler
  const handleCaptchaVerified = (status) => {
    setCaptchaVerified(status);
    setValue("captchaVerified", status);
  };

  // Validate current step before moving to next
  const validateCurrentStep = async () => {
    let fieldsToValidate = [];

    if (currentStep === 0) {
      // Verification step
      if (!emailVerified) {
        toast.error("Please verify your email to continue");
        return false;
      }
      if (!captchaVerified) {
        toast.error("Please complete the CAPTCHA verification");
        return false;
      }
      return true;
    }

    if (currentStep === 1) {
      // Personal info
      fieldsToValidate = ["name", "contactNumber", "country"];

      if (watch("country") === "India") {
        fieldsToValidate.push("stateUT");
      }
    } else if (currentStep === 2) {
      // Professional info
      fieldsToValidate = ["schoolsWorked", "yearsOfWorking"];
    } else if (currentStep === 3) {
      // Event attendance
      fieldsToValidate = ["isAttending"];

      if (isAttending) {
        fieldsToValidate.push("foodPreference", "totalVeg", "totalNonVeg");
      }
    } else if (currentStep === 4) {
      // Accommodation
      if (isAttending) {
        fieldsToValidate = ["accommodation"];

        if (accommodation === "provide") {
          fieldsToValidate.push("accommodationCapacity");
        }
      } else {
        return true;
      }
    } else if (currentStep === 5) {
      // Financial contribution
      fieldsToValidate = ["willContribute"];

      if (willContribute) {
        fieldsToValidate.push("contributionAmount");
      }
    }

    // Trigger validation for the current step's fields
    return await trigger(fieldsToValidate);
  };

  // Handle next button click
  const handleNextStep = async () => {
    const isStepValid = await validateCurrentStep();

    if (isStepValid) {
      setCurrentStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle back button click
  const handleBackStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Calculate proposed contribution based on attendance
      if (data.isAttending) {
        data.proposedAmount = data.totalVeg * 500 + data.totalNonVeg * 500;
      }

      // Submit registration
      const result = await submitRegistration(data);

      // Clear saved data on successful submission
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-step`);

      toast.success("Registration submitted successfully!");
      navigate("/registration-success", {
        state: { registrationId: result.registrationId },
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle final submit button click
  const handleSubmitForm = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <>
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-blue-600 hover:underline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Registration Type
      </button>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <form className="space-y-4 sm:space-y-6">
        {/* Verification Step */}
        {currentStep === 0 && (
          <>
            <FormSection title="Email Verification">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                control={control}
                errors={errors}
                required={true}
                disabled={emailVerified}
              />

              {email && email.includes("@") && (
                <OtpInput onVerify={handleEmailVerified} email={email} />
              )}

              <CaptchaVerification onVerify={handleCaptchaVerified} />
            </FormSection>
          </>
        )}

        {/* Personal Information Step */}
        {currentStep === 1 && (
          <FormSection title="Personal Information">
            <FormField
              label="Full Name"
              name="name"
              type="text"
              control={control}
              errors={errors}
              required={true}
            />

            <FormField
              label="Contact Number"
              name="contactNumber"
              type="tel"
              control={control}
              errors={errors}
              required={true}
            />

            <FormField
              label="WhatsApp Number (if different)"
              name="whatsappNumber"
              type="tel"
              control={control}
              errors={errors}
            />

            <FormField
              label="Country"
              name="country"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={[
                { value: "India", label: "India" },
                { value: "UAE", label: "UAE" },
                { value: "USA", label: "USA" },
                { value: "UK", label: "UK" },
                { value: "Canada", label: "Canada" },
                { value: "Australia", label: "Australia" },
                { value: "Other", label: "Other" },
              ]}
            />

            {watch("country") === "India" && (
              <FormField
                label="State/UT"
                name="stateUT"
                type="select"
                control={control}
                errors={errors}
                required={true}
                options={[
                  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
                  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
                  { value: "Assam", label: "Assam" },
                  { value: "Bihar", label: "Bihar" },
                  { value: "Chhattisgarh", label: "Chhattisgarh" },
                  { value: "Goa", label: "Goa" },
                  { value: "Gujarat", label: "Gujarat" },
                  { value: "Haryana", label: "Haryana" },
                  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
                  { value: "Jharkhand", label: "Jharkhand" },
                  { value: "Karnataka", label: "Karnataka" },
                  { value: "Kerala", label: "Kerala" },
                  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
                  { value: "Maharashtra", label: "Maharashtra" },
                  { value: "Manipur", label: "Manipur" },
                  { value: "Meghalaya", label: "Meghalaya" },
                  { value: "Mizoram", label: "Mizoram" },
                  { value: "Nagaland", label: "Nagaland" },
                  { value: "Odisha", label: "Odisha" },
                  { value: "Punjab", label: "Punjab" },
                  { value: "Rajasthan", label: "Rajasthan" },
                  { value: "Sikkim", label: "Sikkim" },
                  { value: "Tamil Nadu", label: "Tamil Nadu" },
                  { value: "Telangana", label: "Telangana" },
                  { value: "Tripura", label: "Tripura" },
                  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
                  { value: "Uttarakhand", label: "Uttarakhand" },
                  { value: "West Bengal", label: "West Bengal" },
                  {
                    value: "Andaman and Nicobar Islands",
                    label: "Andaman and Nicobar Islands",
                  },
                  { value: "Chandigarh", label: "Chandigarh" },
                  {
                    value: "Dadra and Nagar Haveli and Daman and Diu",
                    label: "Dadra and Nagar Haveli and Daman and Diu",
                  },
                  { value: "Delhi", label: "Delhi" },
                  { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
                  { value: "Ladakh", label: "Ladakh" },
                  { value: "Lakshadweep", label: "Lakshadweep" },
                  { value: "Puducherry", label: "Puducherry" },
                ]}
              />
            )}
          </FormSection>
        )}

        {/* Professional Information Step */}
        {currentStep === 2 && (
          <FormSection title="Professional Information">
            <FormField
              label="JNV Schools Worked At"
              name="schoolsWorked"
              type="textarea"
              control={control}
              errors={errors}
              required={true}
              placeholder="List the JNV schools where you have worked"
            />

            <FormField
              label="Years of Working Experience"
              name="yearsOfWorking"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={[
                { value: "Less than 5", label: "Less than 5 years" },
                { value: "5-10", label: "5-10 years" },
                { value: "11-15", label: "11-15 years" },
                { value: "16-20", label: "16-20 years" },
                { value: "21-25", label: "21-25 years" },
                { value: "More than 25", label: "More than 25 years" },
              ]}
            />

            <FormField
              label="Current Position"
              name="currentPosition"
              type="select"
              control={control}
              errors={errors}
              options={[
                { value: "Principal", label: "Principal" },
                { value: "Vice Principal", label: "Vice Principal" },
                { value: "PGT", label: "PGT" },
                { value: "TGT", label: "TGT" },
                { value: "Miscellaneous Staff", label: "Miscellaneous Staff" },
                { value: "Retired", label: "Retired" },
                { value: "Other", label: "Other" },
              ]}
            />
          </FormSection>
        )}

        {/* Event Attendance Step */}
        {currentStep === 3 && (
          <FormSection title="Event Attendance">
            <FormField
              label="Will you attend the UNMA 2025 event?"
              name="isAttending"
              type="checkbox"
              control={control}
              errors={errors}
              required={true}
            />

            {isAttending && (
              <>
                <FormField
                  label="Food Preference"
                  name="foodPreference"
                  type="select"
                  control={control}
                  errors={errors}
                  required={true}
                  options={[
                    { value: "vegetarian", label: "Vegetarian" },
                    { value: "non-vegetarian", label: "Non-Vegetarian" },
                    { value: "both", label: "Both" },
                  ]}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Number of Vegetarian Meals"
                    name="totalVeg"
                    type="number"
                    control={control}
                    errors={errors}
                    required={true}
                    min={0}
                  />

                  <FormField
                    label="Number of Non-Vegetarian Meals"
                    name="totalNonVeg"
                    type="number"
                    control={control}
                    errors={errors}
                    required={true}
                    min={0}
                  />
                </div>

                <FormField
                  label="How would you like to contribute to the event?"
                  name="eventContribution"
                  type="multiselect"
                  control={control}
                  errors={errors}
                  options={[
                    { value: "organize", label: "Help organize" },
                    { value: "volunteer", label: "Volunteer" },
                    { value: "sponsor", label: "Sponsor" },
                    { value: "perform", label: "Perform" },
                    { value: "speak", label: "Speaker" },
                  ]}
                />

                {watch("eventContribution")?.length > 0 && (
                  <FormField
                    label="Please provide details about your contribution"
                    name="contributionDetails"
                    type="textarea"
                    control={control}
                    errors={errors}
                    placeholder="Describe how you would like to contribute"
                  />
                )}
              </>
            )}
          </FormSection>
        )}

        {/* Accommodation Step */}
        {currentStep === 4 && isAttending && (
          <FormSection title="Accommodation">
            <FormField
              label="Accommodation Preference"
              name="accommodation"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={[
                { value: "need", label: "I need accommodation" },
                { value: "provide", label: "I can provide accommodation" },
                {
                  value: "arrange",
                  label: "I will arrange my own accommodation",
                },
              ]}
            />

            {accommodation === "provide" && (
              <>
                <FormField
                  label="Number of people you can accommodate"
                  name="accommodationCapacity"
                  type="number"
                  control={control}
                  errors={errors}
                  required={true}
                  min={1}
                />

                <FormField
                  label="Accommodation Location"
                  name="accommodationLocation"
                  type="text"
                  control={control}
                  errors={errors}
                  placeholder="Area/locality where you can provide accommodation"
                />
              </>
            )}

            <FormField
              label="Additional remarks about accommodation"
              name="accommodationRemarks"
              type="textarea"
              control={control}
              errors={errors}
              placeholder="Any special requirements or information"
            />
          </FormSection>
        )}

        {/* Financial Contribution Step */}
        {currentStep === 5 && (
          <FormSection title="Financial Contribution">
            <p className="text-gray-600 mb-4">
              The estimated cost per person for the event is ₹500. Your
              contribution helps make this event successful.
            </p>

            <FormField
              label="Would you like to make a financial contribution?"
              name="willContribute"
              type="checkbox"
              control={control}
              errors={errors}
              required={true}
            />

            {willContribute && (
              <FormField
                label="Contribution Amount (in ₹)"
                name="contributionAmount"
                type="number"
                control={control}
                errors={errors}
                required={true}
                min={100}
              />
            )}
          </FormSection>
        )}

        <MobileProgressIndicator
          currentStep={currentStep}
          stepsCount={steps.length}
        />

        <NavigationButtons
          currentStep={currentStep}
          stepsCount={steps.length}
          onBack={handleBackStep}
          onNext={
            currentStep === steps.length - 1 ? handleSubmitForm : handleNextStep
          }
          isSubmitting={isSubmitting}
          isNextDisabled={
            currentStep === 0 && (!emailVerified || !captchaVerified)
          }
        />

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Form data is automatically saved in your browser
          </p>
        </div>
      </form>
    </>
  );
};

export default StaffRegistrationForm;
