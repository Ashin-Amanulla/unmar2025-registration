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
import StepIndicator from "./StepIndicator";
import { jnvSchools, indianStatesOptions } from "../../assets/data";
import SponsorshipCards from "./SponsorshipCards";
import AttendeeCounter from "./AttendeeCounter";
import { motion } from "framer-motion";
import AlertDialog from "../ui/AlertDialog";
import { Checkbox } from "../ui/Checkbox";
import { usePayment } from "../../hooks/usePayment";
// Initialize countries data
countries.registerLocale(enLocale);

// Get all countries and sort them alphabetically
const countryOptions = Object.entries(countries.getNames("en"))
  .map(([code, label]) => ({
    value: code,
    label: label,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// Add new constants for options
const MENTORSHIP_OPTIONS = [
  { value: "students", label: "Students" },
  { value: "young_alumni", label: "Young Alumni" },
  { value: "career_guidance", label: "Career Guidance" },
  { value: "startup_mentoring", label: "Startup Mentoring" },
];

const TRAINING_OPTIONS = [
  { value: "technical", label: "Technical Skills" },
  { value: "soft_skills", label: "Soft Skills" },
  { value: "leadership", label: "Leadership" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
];

const SEMINAR_OPTIONS = [
  { value: "technical", label: "Technical Topics" },
  { value: "career", label: "Career Development" },
  { value: "industry", label: "Industry Trends" },
  { value: "personal", label: "Personal Growth" },
];

const TSHIRT_SIZES = [
  { value: "S", label: "Small" },
  { value: "M", label: "Medium" },
  { value: "L", label: "Large" },
  { value: "XL", label: "Extra Large" },
  { value: "XXL", label: "2X Large" },
  { value: "XXXL", label: "3X Large" },
];

// Add this constant at the top with other constants
const DEFAULT_TSHIRT_SIZES = {
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
  XXL: 0,
  XXXL: 0,
};

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
    "Financial",
    "Optional",
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
          "travellingFrom",
          "travelDateTime",
          "modeOfTravel",
          "needParking",
          "carPooling",
        ];

        if (carPooling !== "No") {
          fieldsToValidate.push("coShareSeats");
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
    } else if (currentStep === 8) {
      // Optional fields
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
    setIsSubmitting(true);

    try {
      // Calculate proposed contribution based on attendance
      if (data.isAttending) {
        data.proposedAmount = data.totalVeg * 500 + data.totalNonVeg * 500;
      }
      console.log(data);

      // Submit registration
      // const result = await submitRegistration(data);

      // Clear saved data on successful submission
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-step`);

      toast.success("Registration submitted successfully!");
      navigate("/registration-success", {
        // state: { registrationId: result.registrationId },
        state: { registrationId: "1234567890" },
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
            message: `Your contribution (₹${contributionAmount}) is less than the estimated expenses (₹${totalExpense}) for your group. Would you like to continue with the current amount?`,
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
        handleNextStep();
      },
      onFailure: (error) => {
        console.error("Payment failed:", error);
      },
    });
  };

  // Add useEffect to show mission message when entering financial step
  useEffect(() => {
    if (currentStep === 7) {
      setShowMissionMessage(true);
    }
  }, [currentStep]);

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

            <FormSection title="JNV Background Verification">
              <VerificationQuiz onQuizComplete={handleQuizComplete} />
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
              options={[
                { value: "Student", label: "Student" },
                { value: "Government Service", label: "Government Service" },
                { value: "Private Sector", label: "Private Sector" },
                { value: "Business", label: "Business" },
                { value: "Self Employed", label: "Self Employed" },
                { value: "Homemaker", label: "Homemaker" },
                { value: "Retired", label: "Retired" },
                { value: "Other", label: "Other" },
              ]}
            />

            {profession === "Business" && (
              <FormField
                label="Business Details"
                name="businessDetails"
                type="textarea"
                control={control}
                errors={errors}
                placeholder="Please provide brief details about your business"
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
                        Additional Participation
                      </h3>

                      <FormField
                        label="How would you like to contribute to the event?"
                        name="eventContribution"
                        type="multiselect"
                        control={control}
                        errors={errors}
                        options={[
                          { value: "Speaker", label: "As a Speaker" },
                          { value: "Panelist", label: "As a Panelist" },
                          { value: "Volunteer", label: "As a Volunteer" },
                          { value: "Sponsor", label: "As a Sponsor" },
                          { value: "Organizer", label: "As an Organizer" },
                        ]}
                      />

                      <FormField
                        label="Additional Details (if any)"
                        name="contributionDetails"
                        type="textarea"
                        control={control}
                        errors={errors}
                        placeholder="Any specific details about your contribution"
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
            <FormField
              label="Travelling From"
              name="travellingFrom"
              type="text"
              control={control}
              errors={errors}
              required={true}
              placeholder="City/Town you'll be travelling from"
            />

            <FormField
              label="Expected Travel Date/Time"
              name="travelDateTime"
              type="datetime-local"
              control={control}
              errors={errors}
              required={true}
            />

            <FormField
              label="Mode of Travel"
              name="modeOfTravel"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={[
                { value: "Car", label: "Car" },
                { value: "Train", label: "Train" },
                { value: "Flight", label: "Flight" },
                { value: "Other", label: "Other" },
              ]}
            />

            <FormField
              label="Need Parking at the Venue?"
              name="needParking"
              type="checkbox"
              control={control}
              errors={errors}
            />

            <FormField
              label="Car Pooling"
              name="carPooling"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={[
                { value: "No", label: "No" },
                {
                  value: "Yes To Venue",
                  label: "Yes - I can offer rides to the venue",
                },
                {
                  value: "Yes From Venue",
                  label: "Yes - I can offer rides from the venue",
                },
                {
                  value: "Yes Both Ways",
                  label: "Yes - I can offer rides both ways",
                },
              ]}
            />

            {carPooling !== "No" && (
              <FormField
                label="Number of Co-Passenger Seats Available"
                name="coShareSeats"
                type="number"
                control={control}
                errors={errors}
                required={true}
                min={1}
                valueAsNumber={true}
              />
            )}

            <FormField
              label="Landmarks Near Your Location (for pickup coordination)"
              name="landmarks"
              type="text"
              control={control}
              errors={errors}
              placeholder="Any prominent landmarks near your location"
            />

            <FormField
              label="Additional Travel Remarks"
              name="travelRemarks"
              type="textarea"
              control={control}
              errors={errors}
              placeholder="Any specific travel requirements or information"
            />
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
                  placeholder="Area/locality where you can provide accommodation"
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

              {watch("contributionAmount") > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
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
                </motion.div>
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

        {/* Optional Details Step */}
        {currentStep === 8 && (
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
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />

              {/* UNMA Family Groups */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unmaFamilyGroups"
                  checked={watch("unmaFamilyGroups")}
                  onChange={(checked) => setValue("unmaFamilyGroups", checked)}
                />
                <label
                  htmlFor="unmaFamilyGroups"
                  className="text-sm font-medium text-gray-700"
                >
                  I am part of UNMA family groups
                </label>
              </div>

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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tshirtInterest"
                    checked={watch("tshirtInterest")}
                    onChange={(checked) => setValue("tshirtInterest", checked)}
                  />
                  <label
                    htmlFor="tshirtInterest"
                    className="text-sm font-medium text-gray-700"
                  >
                    I am interested in buying UNMA Custom T-Shirt
                  </label>
                </div>

                {/* T-Shirt Sizes */}
                {watch("tshirtInterest") && (
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
            currentStep === 0 &&
            (!emailVerified || !captchaVerified || !quizCompleted)
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

export default AlumniRegistrationForm;
