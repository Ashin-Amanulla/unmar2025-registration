import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { RegistrationSchemas } from "../../zod-form-validators/registrationform";
import { useRegistration } from "../../hooks";
import { getPincodeDetails } from "../../api/pincodeApi";
import { usePayment } from "../../hooks/usePayment";

import { KERALA_DISTRICTS } from "../../assets/data";
import {
  FormSection,
  FormField,
  OtpInput,
  CaptchaVerification,
  NavigationButtons,
  MobileProgressIndicator,
} from "./FormComponents";
import StepIndicator from "./StepIndicator";
import PhoneInput from "react-phone-input-2";
import { motion } from "framer-motion";
import AttendeeCounter from "./AttendeeCounter";

import { indianStatesOptions } from "../../assets/data";

import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

import AlertDialog from "../ui/AlertDialog";

countries.registerLocale(enLocale);

// Get all countries and sort them alphabetically
const countryOptions = Object.entries(countries.getNames("en"))
  .map(([code, label]) => ({
    value: code,
    label: label,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const StaffRegistrationForm = ({ onBack, storageKey }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [formHasLocalData, setFormHasLocalData] = useState(false);
  const [hasPreviousContribution, setHasPreviousContribution] = useState(false);
  const [previousContributionAmount, setPreviousContributionAmount] =
    useState(0);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showMissionMessage, setShowMissionMessage] = useState(false);
  const [alertDialogConfig, setAlertDialogConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const { submitRegistration, calculateContribution } = useRegistration();
  const { isPaymentProcessing, initiatePayment } = usePayment();

  // Steps in the registration form
  const steps = [
    "Verification",
    "Personal Info",
    "Professional",
    "Event Attendance",
    "Sponsorship",
    "Transportation",
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
      attendees: {
        adults: { veg: 0, nonVeg: 0 },
        teens: { veg: 0, nonVeg: 0 },
        children: { veg: 0, nonVeg: 0 },
        toddlers: { veg: 0, nonVeg: 0 },
      },
      eventContribution: [],
      contributionDetails: "",

      // Sponsorship
      interestedInSponsorship: false,
      sponsorshipType: [],
      sponsorshipDetails: "",

      // Transportation
      startPincode: "",
      district: "",
      state: "",
      taluk: "",
      originArea: "",
      nearestLandmark: "",
      travelDate: "",
      travelTime: "",
      modeOfTransport: "",
      readyForRideShare: "",
      rideShareCapacity: 1,
      needParking: "",
      wantRideShare: "",
      rideShareGroupSize: 1,
      travelSpecialRequirements: "",

      // Accommodation
      accommodation: "",
      accommodationCapacity: 0,
      accommodationLocation: "",
      accommodationRemarks: "",

      // Optional
      bloodGroup: "",
      mentorshipInterest: false,
      mentorshipAreas: [],

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
  const modeOfTransport = watch("modeOfTransport");

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
        const attendees = watch("attendees");
        const totalAttendees = Object.values(attendees).reduce(
          (sum, group) => sum + (group.veg || 0) + (group.nonVeg || 0),
          0
        );

        if (totalAttendees === 0) {
          toast.error("Please add at least one attendee");
          return false;
        }
      }
      return true;
    } else if (currentStep === 4) {
      // Sponsorship
      fieldsToValidate = ["interestedInSponsorship"];

      if (watch("interestedInSponsorship")) {
        fieldsToValidate.push("sponsorshipType");
      }
    } else if (currentStep === 5) {
      // Transportation
      if (isAttending) {
        fieldsToValidate = [
          "startPincode",
          "travelDate",
          "travelTime",
          "modeOfTransport",
        ];

        if (watch("modeOfTransport") === "car") {
          fieldsToValidate.push("readyForRideShare");
          if (watch("readyForRideShare") === "yes") {
            fieldsToValidate.push("rideShareCapacity");
          }
          fieldsToValidate.push("needParking");
        } else if (watch("modeOfTransport")) {
          fieldsToValidate.push("wantRideShare");
          if (watch("wantRideShare") === "yes") {
            fieldsToValidate.push("rideShareGroupSize");
          }
        }
      } else {
        return true;
      }
    } else if (currentStep === 6) {
      // Accommodation
      if (isAttending) {
        fieldsToValidate = ["accommodation"];

        if (accommodation === "provide") {
          fieldsToValidate.push("accommodationCapacity");
        }
      } else {
        return true;
      }
    } else if (currentStep === 7) {
      // Optional fields - no required validation
      return true;
    } else if (currentStep === 8) {
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

  // Handle skipping the optional step
  const handleSkipOptional = () => {
    // Clear optional fields
    setValue("bloodGroup", "");
    setValue("mentorshipInterest", false);
    setValue("mentorshipAreas", []);

    // Move to next step
    setCurrentStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  };

  // Add useEffect to show mission message when entering financial step
  useEffect(() => {
    if (currentStep === 7) {
      setShowMissionMessage(true);
    }
  }, [currentStep]);



  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting registration data:", data);

      // Submit registration data
      // await submitRegistration(data);

      // Clear saved data
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-step`);

      // Show success message
      toast.success("🎉 Registration completed successfully!");

      // Use direct window location change for reliable redirect
      setTimeout(() => {
        window.location.href = "/registration-success";
      }, 1000); // Small delay to ensure toast is visible
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle final submit button click
  const handleSubmitForm = async () => {
    if (!hasPreviousContribution) {
      toast.error(
        "Please complete your contribution payment before submitting"
      );
      return;
    }

    try {
      // Get form data
      const formData = getValues();
      console.log("Submitting form with data:", formData);

      // Directly call onSubmit with form data
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please try again.");
    }
  };
    // Handle payment processing
  const handlePayment = async () => {
    try {
      const contributionAmount = watch("contributionAmount") || 0;

      // Skip expense comparison for additional contributions
      if (!hasPreviousContribution) {
        const attendees = watch("attendees");
        const adultCount =
          (attendees?.adults?.veg || 0) + (attendees?.adults?.nonVeg || 0);
        const teenCount =
          (attendees?.teens?.veg || 0) + (attendees?.teens?.nonVeg || 0);
        const childCount =
          (attendees?.children?.veg || 0) + (attendees?.children?.nonVeg || 0);

        const totalExpense =
          adultCount * 500 + teenCount * 250 + childCount * 150;

        if (
          isAttending &&
          contributionAmount > 0 &&
          contributionAmount < totalExpense
        ) {
          setAlertDialogConfig({
            title: "Contribution Amount Warning",
            message: `Your contribution (₹${contributionAmount}) is less than the estimated expenses (₹${totalExpense}) for your group. Would you like to add more to the current amount?`,
            onConfirm: () => proceedWithPayment(contributionAmount),
          });
          setShowAlertDialog(true);
          return;
        }
      }

      await proceedWithPayment(contributionAmount);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

  const proceedWithPayment = async (contributionAmount) => {
    await initiatePayment({
      amount: contributionAmount,
      name: watch("name"),
      email: watch("email"),
      contact: watch("contactNumber"),
      notes: {
        registrationType: "Staff",
        isAttending: isAttending ? "Yes" : "No",
      },
      onSuccess: (response) => {
        setValue("paymentStatus", "Completed");
        setValue("paymentId", response.razorpay_payment_id);
        setHasPreviousContribution(true);
        setPreviousContributionAmount(contributionAmount);

        // Show simple success toast instead of alert dialog
        toast.success(
          "Payment successful! You can now submit your registration."
        );
      },
      onFailure: (error) => {
        console.error("Payment failed:", error);
        toast.error("Payment failed. Please try again.");
      },
    });
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
            <FormSection title="Contact Verification">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                control={control}
                errors={errors}
                required={true}
                disabled={emailVerified}
              />
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
                disabled={emailVerified}
                preferredCountries={["in", "us", "gb", "ae"]}
              />
              {errors.contactNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contactNumber.message}
                </p>
              )}

              {!emailVerified &&
                email &&
                email.includes("@") &&
                watch("contactNumber") && (
                  <OtpInput
                    onVerify={handleEmailVerified}
                    email={email}
                    phone={watch("contactNumber")}
                  />
                )}

              {emailVerified && (
                <div className="flex items-center gap-2 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-800 font-medium">
                    Email & Phone Verified
                  </span>
                </div>
              )}

              {!captchaVerified && (
                <CaptchaVerification onVerify={handleCaptchaVerified} />
              )}

              {captchaVerified && (
                <div className="flex items-center gap-2 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-800 font-medium">
                    CAPTCHA Verified
                  </span>
                </div>
              )}
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
              label="Blood Group (for emergencies)"
              name="bloodGroup"
              type="select"
              control={control}
              errors={errors}
              options={[
                { value: "", label: "Select blood group" },
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
              ]}
            />

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
            {watch("stateUT") === "Kerala" && (
              <FormField
                label="District"
                name="district"
                type="select"
                control={control}
                errors={errors}
                required={true}
                options={KERALA_DISTRICTS}
                placeholder="Select your district"
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
            <div className="space-y-6">
              <FormField
                label="Will you attend the event?"
                name="isAttending"
                type="checkbox"
                control={control}
                errors={errors}
              />

              {isAttending && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-600">
                        Please indicate the number of attendees in each age
                        group and their food preferences. This will help us plan
                        the seating and catering arrangements accordingly.
                      </p>
                    </div>

                    <AttendeeCounter
                      values={
                        watch("attendees") || {
                          adults: { veg: 0, nonVeg: 0 },
                          teens: { veg: 0, nonVeg: 0 },
                          children: { veg: 0, nonVeg: 0 },
                          toddlers: { veg: 0, nonVeg: 0 },
                        }
                      }
                      onChange={(newValues) => {
                        setValue("attendees", newValues, {
                          shouldValidate: true,
                        });
                      }}
                    />

                    <div className="space-y-4 mt-8">
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
                          { value: "training", label: "Conduct Training" },
                          { value: "mentoring", label: "Mentoring Session" },
                          { value: "other", label: "Other" },
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
                          rows={4}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </FormSection>
        )}

        {/* Sponsorship Step */}
        {currentStep === 4 && (
          <FormSection title="Sponsorship">
            <p className="text-gray-600 mb-4">
              Sponsorship helps make UNMA 2025 a successful event. As a staff
              member, your contribution is valuable to us.
            </p>

            <FormField
              label="Are you interested in sponsoring the event?"
              name="interestedInSponsorship"
              type="checkbox"
              control={control}
              errors={errors}
              required={true}
            />

            {watch("interestedInSponsorship") && (
              <>
                <FormField
                  label="Sponsorship Type"
                  name="sponsorshipType"
                  type="multiselect"
                  control={control}
                  errors={errors}
                  options={[
                    { value: "gold", label: "Gold Sponsor (₹25,000+)" },
                    { value: "silver", label: "Silver Sponsor (₹15,000+)" },
                    { value: "bronze", label: "Bronze Sponsor (₹10,000+)" },
                    {
                      value: "supporting",
                      label: "Supporting Sponsor (₹5,000+)",
                    },
                    {
                      value: "inkind",
                      label: "In-kind Sponsor (Services/Products)",
                    },
                    { value: "other", label: "Other" },
                  ]}
                />

                <FormField
                  label="Sponsorship Details"
                  name="sponsorshipDetails"
                  type="textarea"
                  control={control}
                  errors={errors}
                  placeholder="Please provide details about your sponsorship interest, including any specific requirements or offerings."
                  rows={4}
                />

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="font-medium text-yellow-800">
                    Sponsorship Benefits
                  </h4>
                  <ul className="mt-2 text-sm text-yellow-700 list-disc pl-5 space-y-1">
                    <li>Recognition in event materials and website</li>
                    <li>
                      Exhibition space at the venue (Gold/Silver sponsors)
                    </li>
                    <li>Speaking opportunity (Gold sponsors)</li>
                    <li>Special mention during the event</li>
                    <li>Tax benefits as applicable</li>
                  </ul>
                </div>
              </>
            )}
          </FormSection>
        )}

        {/* Transportation Step */}
        {currentStep === 5 && isAttending && (
          <FormSection title="Transportation Details">
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-blue-800 text-sm">
                  This information will help us organize group transportation
                  from your area. We'll coordinate special bookings based on the
                  number of staff from each area.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Starting Location Pincode"
                  name="startPincode"
                  type="text"
                  control={control}
                  errors={errors}
                  required={true}
                  placeholder="Enter your starting location pincode"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  onChange={async (e) => {
                    const pincodeValue = e.target.value;
                    if (pincodeValue.length === 6) {
                      try {
                        // Show loading state
                        toast.info("Fetching location details...", {
                          autoClose: false,
                          closeButton: false,
                          isLoading: true,
                        });

                        const data = await getPincodeDetails(pincodeValue);

                        if (
                          data &&
                          data[0] &&
                          data[0].Status === "Success" &&
                          data[0].PostOffice &&
                          data[0].PostOffice.length > 0
                        ) {
                          const postOffice = data[0].PostOffice[0];

                          setValue("district", postOffice.District);
                          setValue("state", postOffice.State);
                          setValue(
                            "taluk",
                            postOffice.Block || postOffice.District
                          );

                          // Show success message with location details
                          toast.dismiss();
                          toast.success(
                            `Location found: ${postOffice.District}, ${postOffice.State}`
                          );
                        } else {
                          // Clear the values if pincode is invalid
                          setValue("district", "");
                          setValue("state", "");
                          setValue("taluk", "");
                          toast.dismiss();
                          toast.error("Invalid pincode or location not found");
                        }
                      } catch (error) {
                        // Clear the values if there's an error
                        setValue("district", "");
                        setValue("state", "");
                        setValue("taluk", "");
                        toast.dismiss();
                        toast.error(
                          "Error fetching location details. Please try again."
                        );
                      }
                    } else {
                      // Clear the values if pincode is not 6 digits
                      setValue("district", "");
                      setValue("state", "");
                      setValue("taluk", "");
                      // Don't show any message for incomplete pincode
                    }
                  }}
                />

                <FormField
                  label="Nearest Landmark"
                  name="nearestLandmark"
                  type="text"
                  control={control}
                  errors={errors}
                  placeholder="e.g., Railway Station, Bus Stand, etc."
                />
              </div>

              {/* Display location details if pincode is valid */}
              {watch("startPincode")?.length === 6 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Location Details
                  </h4>
                  {watch("district") && watch("state") ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">District</p>
                        <p className="text-sm font-medium">
                          {watch("district")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Taluk/Block</p>
                        <p className="text-sm font-medium">{watch("taluk")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">State</p>
                        <p className="text-sm font-medium">{watch("state")}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-red-600">
                        Invalid pincode or location not found
                      </p>
                      <FormField
                        label="Please enter your origin area details"
                        name="originArea"
                        type="text"
                        control={control}
                        errors={errors}
                        required={true}
                        placeholder="Enter your city/town name"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormField
                    label="Expected Travel Date"
                    name="travelDate"
                    type="date"
                    control={control}
                    errors={errors}
                    required={true}
                    min={new Date().toISOString().split("T")[0]}
                    className="date-picker"
                  />
                </div>
                <div>
                  <FormField
                    label="Expected Travel Time"
                    name="travelTime"
                    type="time"
                    control={control}
                    errors={errors}
                    required={true}
                    className="time-picker"
                  />
                </div>
              </div>

              <FormField
                label="Mode of Transport"
                name="modeOfTransport"
                type="select"
                control={control}
                errors={errors}
                required={true}
                options={[
                  { value: "car", label: "Car" },
                  { value: "train", label: "Train" },
                  { value: "flight", label: "Flight" },
                  { value: "bus", label: "Bus" },
                  { value: "other", label: "Other" },
                ]}
              />

              {watch("modeOfTransport") === "car" && (
                <div className="space-y-4">
                  <FormField
                    label="Will you be ready for ride sharing from your starting point?"
                    name="readyForRideShare"
                    type="select"
                    control={control}
                    errors={errors}
                    required={true}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />

                  {watch("readyForRideShare") === "yes" && (
                    <FormField
                      label="How many people can you accommodate in your car?"
                      name="rideShareCapacity"
                      type="number"
                      control={control}
                      errors={errors}
                      required={true}
                      min={1}
                      max={6}
                    />
                  )}

                  <FormField
                    label="Will you need car parking at the venue?"
                    name="needParking"
                    type="select"
                    control={control}
                    errors={errors}
                    required={true}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />
                </div>
              )}

              {watch("modeOfTransport") !== "car" &&
                watch("modeOfTransport") && (
                  <div className="space-y-4">
                    <FormField
                      label="Would you like to share a ride from your starting point?"
                      name="wantRideShare"
                      type="select"
                      control={control}
                      errors={errors}
                      required={true}
                      options={[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ]}
                    />

                    {watch("wantRideShare") === "yes" && (
                      <FormField
                        label="Number of people in your group"
                        name="rideShareGroupSize"
                        type="number"
                        control={control}
                        errors={errors}
                        required={true}
                        min={1}
                        max={6}
                      />
                    )}
                  </div>
                )}

              <FormField
                label="Special Requirements for Travel"
                name="travelSpecialRequirements"
                type="textarea"
                control={control}
                errors={errors}
                placeholder="Any specific requirements for travel (e.g., wheelchair access, medical conditions, etc.)"
              />

              {/* Show potential group information */}
              {watch("startPincode") &&
                watch("district") &&
                ((watch("modeOfTransport") === "car" &&
                  watch("readyForRideShare") === "yes") ||
                  (watch("modeOfTransport") !== "car" &&
                    watch("wantRideShare") === "yes")) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Group Travel Information
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">
                        Based on your location ({watch("district")},{" "}
                        {watch("state")}), we'll:
                      </p>
                      <ul className="list-disc list-inside text-gray-600 text-sm mt-2 space-y-1">
                        <li>
                          Group you with other staff from {watch("district")}{" "}
                          district
                        </li>
                        <li>Coordinate group transportation arrangements</li>
                        <li>Share travel details once the group is formed</li>
                        <li>
                          Provide pickup points based on the group's location
                        </li>
                        {watch("modeOfTransport") === "car" &&
                          watch("readyForRideShare") === "yes" && (
                            <li>
                              Coordinate ride sharing with other staff in your
                              area
                            </li>
                          )}
                        {watch("modeOfTransport") !== "car" &&
                          watch("wantRideShare") === "yes" && (
                            <li>
                              Arrange shared transportation from your starting
                              point
                            </li>
                          )}
                      </ul>
                    </div>
                  </div>
                )}
            </div>
          </FormSection>
        )}

        {/* Accommodation Step */}
        {currentStep === 6 && isAttending && (
          <FormSection title="Accommodation Arrangements">
            <FormField
              label="Accommodation Preference"
              name="accommodation"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={[
                { value: "not-required", label: "I don't need accommodation" },
                {
                  value: "need",
                  label:
                    "I'm open to joining someone for shared accommodation.",
                },
                {
                  value: "provide",
                  label: "I can provide accommodation to others",
                },
                {
                  value: "discount-hotel",
                  label: "I need discount hotel booking",
                },
              ]}
            />

            {accommodation === "provide" && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 text-sm">
                    Note: The accommodation must be within 25 km radius of CIAL
                    Convention Center (our venue) to be considered for group
                    arrangements.
                  </p>
                </div>

                <FormField
                  label="How many people can you accommodate?"
                  name="accommodationCapacity"
                  type="number"
                  control={control}
                  errors={errors}
                  required={true}
                  min={1}
                  valueAsNumber={true}
                />

                <FormField
                  label="Your Accommodation Location"
                  name="accommodationLocation"
                  type="text"
                  control={control}
                  errors={errors}
                  required={true}
                  placeholder="Enter the exact location/address of your accommodation"
                />
              </>
            )}

            <FormField
              label="Additional Accommodation Remarks"
              name="accommodationRemarks"
              type="textarea"
              control={control}
              errors={errors}
              placeholder="Any specific accommodation requirements or information"
            />
          </FormSection>
        )}

        {/* Financial Contribution Step */}
        {currentStep === 7 && (
          <FormSection title="Financial Contribution">
            <div className="space-y-6">
              {hasPreviousContribution && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-400 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-green-800">
                      Previous contribution of ₹{previousContributionAmount} was
                      successful
                    </p>
                  </div>
                </div>
              )}

              <FormField
                label={`${
                  hasPreviousContribution ? "Additional " : ""
                }Contribution Amount (in ₹)`}
                name="contributionAmount"
                type="number"
                control={control}
                errors={errors}
                required={!hasPreviousContribution}
                min={1}
                valueAsNumber={true}
              />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {watch("contributionAmount") > 0 && (
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={isPaymentProcessing}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPaymentProcessing ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg
                          className="-ml-1 mr-3 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {hasPreviousContribution
                          ? "Contribute More"
                          : "Proceed to Pay"}{" "}
                        ₹{watch("contributionAmount")}
                      </>
                    )}
                  </button>
                )}
              </motion.div>

              {/* Submit Registration Button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleSubmitForm}
                  disabled={isSubmitting || !hasPreviousContribution}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting Registration...
                    </>
                  ) : (
                    <>🎉 Submit Registration 🎊</>
                  )}
                </button>
              </div>

              {!hasPreviousContribution && (
                <div className="mt-4 text-center text-sm text-red-600">
                  Please complete your contribution payment before submitting
                  registration
                </div>
              )}
            </div>

            {/* Mission Message Popup */}
            <AlertDialog
              isOpen={showMissionMessage}
              onClose={() => setShowMissionMessage(false)}
              onConfirm={() => setShowMissionMessage(false)}
              title="Support UNMA's Mission"
              message={
                <div className="space-y-4">
                  <p className="text-lg">
                    This event is more than just a gathering - it's a fundraiser
                    for UNMA's future activities and emergency support
                    initiatives.
                  </p>
                  <p>
                    Your contribution will directly impact our community. We're
                    currently supporting alumni from Wayanad and Kozhikode who
                    lost everything in the 2024 landslides.
                  </p>
                  <p className="font-medium text-lg">
                    UNMA alumni stand together 24/7, supporting each other
                    through thick and thin. Your generosity strengthens this
                    support system.
                  </p>
                </div>
              }
              confirmText="I Understand"
              singleButton={true}
              type="info"
            />

            {/* Contribution Warning Dialog */}
            <AlertDialog
              isOpen={showAlertDialog}
              onClose={() => setShowAlertDialog(false)}
              onConfirm={() => {
                alertDialogConfig.onConfirm();
                setShowAlertDialog(false);
              }}
              title={alertDialogConfig.title}
              message={alertDialogConfig.message}
              confirmText="Proceed with current amount"
              cancelText="Add more amount"
              type="warning"
            />
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
          onSkip={handleSkipOptional}
          isSubmitting={isSubmitting}
          isNextDisabled={
            (currentStep === 0 && (!emailVerified || !captchaVerified)) ||
            currentStep === 7 // Disable next button on financial step
          }
          nextButtonText={currentStep === 7 ? "Finish" : "Next"}
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
