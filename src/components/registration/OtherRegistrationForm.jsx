import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { RegistrationSchemas } from "../../zod-form-validators/registrationform";
import { useRegistration } from "../../hooks";
import PhoneInput from "react-phone-input-2";
import {
  FormSection,
  FormField,
  OtpInput,
  CaptchaVerification,
  NavigationButtons,
  MobileProgressIndicator,
} from "./FormComponents";
import StepIndicator from "./StepIndicator";


import {  indianStatesOptions } from "../../assets/data";

import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

// Get all countries and sort them alphabetically
const countryOptions = Object.entries(countries.getNames("en"))
  .map(([code, label]) => ({
    value: code,
    label: label,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));






const OtherRegistrationForm = ({ onBack, storageKey }) => {
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
    "Event Attendance",
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
    resolver: zodResolver(RegistrationSchemas.Other),
    mode: "onChange",
    defaultValues: {
      registrationType: "Other",
      name: "",
      contactNumber: "",
      email: "",
      emailVerified: false,
      captchaVerified: false,
      whatsappNumber: "",
      country: "India",
      stateUT: "",
      purpose: "",

      // Event attendance
      isAttending: true,
      foodPreference: undefined,
      totalVeg: 0,
      totalNonVeg: 0,

      // Financial
      willContribute: false,
      contributionAmount: 0,
      proposedAmount: 0,
    },
  });

  // Watch specific fields for conditional rendering
  const email = watch("email");
  const isAttending = watch("isAttending");
  const willContribute = watch("willContribute");

  // Load saved data from local storage
  useEffect(() => {
    const savedRegistrationData = localStorage.getItem(storageKey);
    const savedStep = localStorage.getItem(`${storageKey}-step`);

    if (savedRegistrationData) {
      try {
        const parsedData = JSON.parse(savedRegistrationData);

        // Only load if it's an Other registration
        if (parsedData.registrationType === "Other") {
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
      fieldsToValidate = ["name", "contactNumber", "purpose", "country"];

      if (watch("country") === "India") {
        fieldsToValidate.push("stateUT");
      }
    } else if (currentStep === 2) {
      // Event attendance
      fieldsToValidate = ["isAttending"];

      if (isAttending) {
        fieldsToValidate.push("foodPreference", "totalVeg", "totalNonVeg");
      }
    } else if (currentStep === 3) {
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

<div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <PhoneInput
                country={"in"}
                value={watch("contactNumber")}
                onChange={(value) => setValue("contactNumber", value)}
                inputProps={{
                  name: "contactNumber",
                  required: true,
                  className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contactNumber ? "border-red-500" : "border-gray-300"
                  }`,
                }}
                containerClass="phone-input"
                buttonClass="border-gray-300"
                dropdownClass="country-dropdown"
                searchClass="country-search"
                searchPlaceholder="Search country..."
                enableSearch={true}
                disableSearchIcon={false}
                searchNotFound="No country found"
                specialLabel=""
                enableLongNumbers={true}
                countryCodeEditable={false}
                preferredCountries={["in", "us", "gb", "ae"]}
              />
              {errors.contactNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contactNumber.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number (if different)
              </label>
              <PhoneInput
                country={"in"}
                value={watch("whatsappNumber")}
                onChange={(value) => setValue("whatsappNumber", value)}
                inputProps={{
                  name: "whatsappNumber",
                  className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.whatsappNumber ? "border-red-500" : "border-gray-300"
                  }`,
                }}
                containerClass="phone-input"
                buttonClass="border-gray-300"
                dropdownClass="country-dropdown"
                searchClass="country-search"
                searchPlaceholder="Search country..."
                enableSearch={true}
                disableSearchIcon={false}
                searchNotFound="No country found"
                specialLabel=""
                enableLongNumbers={true}
                countryCodeEditable={false}
                preferredCountries={["in", "us", "gb", "ae"]}
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.whatsappNumber.message}
                </p>
              )}
            </div>

             <FormField
              label="Country"
              name="country"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={countryOptions}
              placeholder="Select your country"
              isSearchable={true}
              isClearable={false}
              className="react-select-container"
              classNamePrefix="react-select"
            />

            {watch("country") === "IN" && (
              <FormField
                label="State/UT"
                name="stateUT"
                type="select"
                control={control}
                errors={errors}
                required={true}
                options={indianStatesOptions}
              />
            )}  
          </FormSection>
        )}

        {/* Event Attendance Step */}
        {currentStep === 2 && (
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
              </>
            )}
          </FormSection>
        )}

        {/* Financial Contribution Step */}
        {currentStep === 3 && (
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

export default OtherRegistrationForm;
