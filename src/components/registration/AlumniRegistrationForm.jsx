import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { RegistrationSchemas } from "../../zod-form-validators/registrationform";
import { useRegistration } from "../../hooks";
import VerificationQuiz from "../VerificationQuiz";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../../styles/phone-input.css";
import "../../styles/date-time-pickers.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
  FormSection,
  FormField,
  OtpInput,
  CaptchaVerification,
  NavigationButtons,
  MobileProgressIndicator,
} from "./FormComponents";
import { getPincodeDetails } from "../../api/pincodeApi";
import StepIndicator from "./StepIndicator";
import { jnvSchools, indianStatesOptions } from "../../assets/data";
import SponsorshipCards from "./SponsorshipCards";
import AttendeeCounter from "./AttendeeCounter";
import { motion } from "framer-motion";
import AlertDialog from "../ui/AlertDialog";
import { Checkbox } from "../ui/Checkbox";
import { usePayment } from "../../hooks/usePayment";
import {
  MENTORSHIP_OPTIONS,
  TRAINING_OPTIONS,
  SEMINAR_OPTIONS,
  TSHIRT_SIZES,
  DEFAULT_TSHIRT_SIZES,
  PROFESSION_OPTIONS,
} from "../../assets/data";
// Initialize countries data
countries.registerLocale(enLocale);

// Get all countries and sort them alphabetically
const countryOptions = Object.entries(countries.getNames("en"))
  .map(([code, label]) => ({
    value: code,
    label: label,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const AlumniRegistrationForm = ({ onBack, storageKey }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [formHasLocalData, setFormHasLocalData] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showMissionMessage, setShowMissionMessage] = useState(false);
  const [alertDialogConfig, setAlertDialogConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [hasPreviousContribution, setHasPreviousContribution] = useState(false);
  const [previousContributionAmount, setPreviousContributionAmount] =
    useState(0);

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
    "Optional",
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
    resolver: zodResolver(RegistrationSchemas.Alumni),
    mode: "onChange",
    defaultValues: {
      registrationType: "Alumni",
      name: "",
      contactNumber: "",
      email: "",
      emailVerified: false,
      captchaVerified: false,
      whatsappNumber: "",
      school: "",
      yearOfPassing: "",
      country: "India",
      stateUT: "",
      verificationQuizPassed: false,

      // Professional
      profession: "",
      businessDetails: "",
      areaOfExpertise: "",
      keySkills: "",

      // Event attendance
      isAttending: false,
      attendees: {
        adults: { veg: 0, nonVeg: 0 },
        teens: { veg: 0, nonVeg: 0 },
        children: { veg: 0, nonVeg: 0 },
        toddlers: { veg: 0, nonVeg: 0 },
      },
      eventContribution: [],
      contributionDetails: "",

      // Transportation
      travellingFrom: "",
      travelDateTime: "",
      modeOfTravel: undefined,
      pincode: "",
      needParking: false,
      carPooling: "No",
      coShareSeats: 0,
      landmarks: "",
      travelRemarks: "",

      // Accommodation
      accommodation: "",
      accommodationCapacity: 0,
      accommodationLocation: "",
      accommodationRemarks: "",

      // Financial
      willContribute: false,
      contributionAmount: 0,
      proposedAmount: 0,

      // Optional fields
      spouseNavodayan: "",
      unmaFamilyGroups: false,
      mentorshipOptions: [],
      trainingOptions: [],
      seminarOptions: [],
      tshirtInterest: false,
      tshirtSizes: DEFAULT_TSHIRT_SIZES,
    },
  });

  // Watch specific fields for conditional rendering
  const email = watch("email");
  const profession = watch("profession");
  const isAttending = watch("isAttending");
  const accommodation = watch("accommodation");
  const carPooling = watch("carPooling");
  const willContribute = watch("willContribute");

  // Load saved data from local storage
  useEffect(() => {
    const savedRegistrationData = localStorage.getItem(storageKey);
    const savedStep = localStorage.getItem(`${storageKey}-step`);

    if (savedRegistrationData) {
      try {
        const parsedData = JSON.parse(savedRegistrationData);

        // Only load if it's an Alumni registration
        if (parsedData.registrationType === "Alumni") {
          reset(parsedData);
          setFormHasLocalData(true);

          // Restore verification states
          setEmailVerified(parsedData.emailVerified);
          setCaptchaVerified(parsedData.captchaVerified);
          setQuizCompleted(parsedData.verificationQuizPassed);

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
    setValue("verificationQuizPassed", quizCompleted);
  }, [emailVerified, captchaVerified, quizCompleted, setValue]);

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

  // Quiz completion handler
  const handleQuizComplete = (status) => {
    setQuizCompleted(status);
    setValue("verificationQuizPassed", status);
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
      if (!quizCompleted) {
        toast.error("Please complete the verification quiz");
        return false;
      }
      return true;
    }

    if (currentStep === 1) {
      // Personal info
      fieldsToValidate = [
        "name",
        "contactNumber",
        "school",
        "yearOfPassing",
        "country",
      ];

      if (watch("country") === "India") {
        fieldsToValidate.push("stateUT");
      }
    } else if (currentStep === 2) {
      // Professional info - all fields optional
      return true;
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
        } else {
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
      // Optional fields
      return true;
    } else if (currentStep === 8) {
      // Financial contribution
      const contributionAmount = watch("contributionAmount");
      if (
        !hasPreviousContribution &&
        (!contributionAmount || contributionAmount <= 0)
      ) {
        toast.error("Please enter a contribution amount");
        return false;
      }
      return true;
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
        registrationType: "Alumni",
        isAttending: isAttending ? "Yes" : "No",
      },
      onSuccess: (response) => {
        setValue("paymentStatus", "completed");
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

  // Add useEffect to show mission message when entering financial step
  useEffect(() => {
    if (currentStep === 8) {
      setShowMissionMessage(true);
    }
  }, [currentStep]);

  // Handle skipping optional step
  const handleSkipOptional = () => {
    // Clear all optional fields
    setValue("spouseNavodayan", "");
    setValue("unmaFamilyGroups", "No");
    setValue("mentorshipOptions", []);
    setValue("trainingOptions", []);
    setValue("seminarOptions", []);
    setValue("tshirtInterest", "no");
    setValue("tshirtSizes", DEFAULT_TSHIRT_SIZES);

    // Move to next step
    setCurrentStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
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

            <FormSection title="JNV Background Verification">
              {!quizCompleted && (
                <VerificationQuiz onQuizComplete={handleQuizComplete} />
              )}

              {quizCompleted && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
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
                    Background Verification Completed
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
                disabled={emailVerified}
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
              label="JNV School"
              name="school"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={jnvSchools}
            />

            <FormField
              label="Year of Passing (12th grade)"
              name="yearOfPassing"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={Array.from({ length: 2026 - 1993 }, (_, i) => {
                const year = 1993 + i;
                return { value: year.toString(), label: year.toString() };
              })}
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
              label="Current Profession"
              name="profession"
              type="select"
              control={control}
              errors={errors}
              options={PROFESSION_OPTIONS}
              placeholder="Select your profession"
            />

            {profession && profession !== "Student" && (
              <FormField
                label="Professional Details"
                name="professionalDetails"
                type="textarea"
                control={control}
                errors={errors}
                placeholder="Please provide details about your profession, role, and experience"
              />
            )}

            <FormField
              label="Area of Expertise"
              name="areaOfExpertise"
              type="text"
              control={control}
              errors={errors}
              placeholder="e.g., Engineering, Medicine, Finance, etc."
            />

            <FormField
              label="Key Skills"
              name="keySkills"
              type="textarea"
              control={control}
              errors={errors}
              placeholder="Please list your key professional skills"
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
                      <h3 className="text-lg font-medium text-gray-900">
                        Event Participation
                      </h3>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800 text-sm">
                          Note: Your participation request will be reviewed by
                          the organizing team. While we try to accommodate
                          everyone, we cannot guarantee 100% acceptance due to
                          various constraints.
                        </p>
                      </div>

                      <FormField
                        label="What would you like to do for the event?"
                        name="eventParticipation"
                        type="multiselect"
                        control={control}
                        errors={errors}
                        options={[
                          { value: "none", label: "None" },
                          { value: "volunteering", label: "Volunteering" },
                          { value: "businessStalls", label: "Business Stalls" },
                          {
                            value: "artCraftBooks",
                            label: "Display art & craft or books",
                          },
                          {
                            value: "culturalTrainer",
                            label: "Cultural Program (as Trainer)",
                          },
                          {
                            value: "culturalParticipant",
                            label: "Cultural Program (as Participant)",
                          },
                          { value: "bookRelease", label: "Book Release" },
                          { value: "cinemaRelease", label: "Cinema Release" },
                          { value: "displayCinema", label: "Display Cinema" },
                          { value: "compliments", label: "Compliments" },
                          { value: "other", label: "Other" },
                        ]}
                      />

                      <FormField
                        label="Please explain your participation in detail"
                        name="participationDetails"
                        type="textarea"
                        control={control}
                        errors={errors}
                        placeholder="Provide detailed information about your proposed participation, including any specific requirements, duration, space needed, etc."
                        rows={4}
                      />
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
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Would you be interested in sponsoring the event? We offer
                various sponsorship tiers with different benefits and visibility
                levels.
              </p>
              <FormField
                label="Interested in Sponsorship"
                name="interestedInSponsorship"
                type="checkbox"
                control={control}
                errors={errors}
              />
            </div>

            {watch("interestedInSponsorship") && (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Please select your preferred sponsorship tier. Our team will
                    contact you directly to discuss the details and process.
                  </p>
                </div>

                <SponsorshipCards
                  selectedTier={watch("sponsorshipTier")}
                  onSelectTier={(tier) => setValue("sponsorshipTier", tier)}
                />

                <div className="mt-6">
                  <FormField
                    label="Additional Sponsorship Details"
                    name="sponsorshipDetails"
                    type="textarea"
                    control={control}
                    errors={errors}
                    placeholder="Any specific requirements or questions about sponsorship"
                  />
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
                  number of alumni from each area.
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

              {watch("modeOfTransport") !== "car" && (
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
                          Group you with other alumni from {watch("district")}{" "}
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
                              Coordinate ride sharing with other alumni in your
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
                  label: "I can share accommodation with fellow navodayans",
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

        {/* Optional Details Step */}
        {currentStep === 7 && (
          <FormSection title="Optional Information">
            <div className="space-y-6">
              {/* Spouse Navodayan */}
              <FormField
                label="Is your spouse a Navodayan?"
                name="spouseNavodayan"
                type="select"
                control={control}
                errors={errors}
                options={[
                  { value: "", label: "Select an option" },
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
              />

              {/* UNMA Family Groups */}
              <FormField
                label="Are you part of UNMA family groups?"
                name="unmaFamilyGroups"
                type="select"
                control={control}
                errors={errors}
                required={true}
                options={[
                  { value: "", label: "Select an option" },
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
              />

              {/* Mentorship Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Groups you can mentor
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {MENTORSHIP_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`mentorship-${option.value}`}
                        checked={watch("mentorshipOptions")?.includes(
                          option.value
                        )}
                        onChange={(checked) => {
                          const current = watch("mentorshipOptions") || [];
                          setValue(
                            "mentorshipOptions",
                            checked
                              ? [...current, option.value]
                              : current.filter((v) => v !== option.value)
                          );
                        }}
                      />
                      <label
                        htmlFor={`mentorship-${option.value}`}
                        className="text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Groups you can train
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TRAINING_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`training-${option.value}`}
                        checked={watch("trainingOptions")?.includes(
                          option.value
                        )}
                        onChange={(checked) => {
                          const current = watch("trainingOptions") || [];
                          setValue(
                            "trainingOptions",
                            checked
                              ? [...current, option.value]
                              : current.filter((v) => v !== option.value)
                          );
                        }}
                      />
                      <label
                        htmlFor={`training-${option.value}`}
                        className="text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seminar Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Groups you can provide seminars to
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SEMINAR_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`seminar-${option.value}`}
                        checked={watch("seminarOptions")?.includes(
                          option.value
                        )}
                        onChange={(checked) => {
                          const current = watch("seminarOptions") || [];
                          setValue(
                            "seminarOptions",
                            checked
                              ? [...current, option.value]
                              : current.filter((v) => v !== option.value)
                          );
                        }}
                      />
                      <label
                        htmlFor={`seminar-${option.value}`}
                        className="text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* T-Shirt Interest */}
              <div className="space-y-4">
                <FormField
                  label="Are you interested in buying UNMA Custom T-Shirt?"
                  name="tshirtInterest"
                  type="select"
                  control={control}
                  errors={errors}
                  required={true}
                  options={[
                    { value: "", label: "Select an option" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />

                {/* T-Shirt Sizes */}
                {watch("tshirtInterest") === "yes" && (
                  <div className="mt-4 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Select sizes and quantities:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {TSHIRT_SIZES.map((size) => (
                        <div key={size.value} className="space-y-2">
                          <label className="block text-sm text-gray-700">
                            {size.label}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={watch(`tshirtSizes.${size.value}`) || 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setValue(`tshirtSizes.${size.value}`, value, {
                                shouldValidate: true,
                              });
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FormSection>
        )}

        {/* Financial Contribution Step */}
        {currentStep === 8 && (
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

        {/* Hide navigation buttons on final step */}
        {currentStep < 8 && (
          <NavigationButtons
            currentStep={currentStep}
            stepsCount={steps.length}
            onBack={handleBackStep}
            onNext={handleNextStep}
            onSkip={handleSkipOptional}
            isSubmitting={isSubmitting}
            isNextDisabled={
              currentStep === 0 &&
              (!emailVerified || !captchaVerified || !quizCompleted)
            }
            nextButtonText="Next"
            showSkipButton={currentStep === 7}
          />
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Form data is automatically saved in your browser
          </p>
        </div>
      </form>
    </>
  );
};

export default AlumniRegistrationForm;
