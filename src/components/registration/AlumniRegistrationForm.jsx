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

const AlumniRegistrationForm = ({ onBack, storageKey }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [formHasLocalData, setFormHasLocalData] = useState(false);

  const { submitRegistration, calculateContribution } = useRegistration();

  // Steps in the registration form
  const steps = [
    "Verification",
    "Personal Info",
    "Professional",
    "Event Attendance",
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
      isAttending: true,
      foodPreference: undefined,
      totalVeg: 0,
      totalNonVeg: 0,
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
      bloodGroup: "",
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
        fieldsToValidate.push("foodPreference", "totalVeg", "totalNonVeg");
      }
    } else if (currentStep === 4) {
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
    } else if (currentStep === 5) {
      // Accommodation
      if (isAttending) {
        fieldsToValidate = ["accommodation"];

        if (accommodation === "provide") {
          fieldsToValidate.push("accommodationCapacity");
        }
      } else {
        return true;
      }
    } else if (currentStep === 6) {
      // Financial contribution
      fieldsToValidate = ["willContribute"];

      if (willContribute) {
        fieldsToValidate.push("contributionAmount");
      }
    } else if (currentStep === 7) {
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
              label="JNV School"
              name="school"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={[
                { value: "JNV Kasaragod", label: "JNV Kasaragod" },
                { value: "JNV Kannur", label: "JNV Kannur" },
                { value: "JNV Kozhikode", label: "JNV Kozhikode" },
                { value: "JNV Wayanad", label: "JNV Wayanad" },
                { value: "JNV Malappuram", label: "JNV Malappuram" },
                { value: "JNV Palakkad", label: "JNV Palakkad" },
                { value: "JNV Thrissur", label: "JNV Thrissur" },
                { value: "JNV Ernakulam", label: "JNV Ernakulam" },
                { value: "JNV Idukki", label: "JNV Idukki" },
                { value: "JNV Kottayam", label: "JNV Kottayam" },
                { value: "JNV Alappuzha", label: "JNV Alappuzha" },
                { value: "JNV Pathanamthitta", label: "JNV Pathanamthitta" },
                { value: "JNV Kollam", label: "JNV Kollam" },
                {
                  value: "JNV Thiruvananthapuram",
                  label: "JNV Thiruvananthapuram",
                },
                { value: "Other", label: "Other" },
              ]}
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
            <FormField
              label="Will you attend the event?"
              name="isAttending"
              type="checkbox"
              control={control}
              errors={errors}
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
                    { value: "Veg", label: "Vegetarian" },
                    { value: "Non-Veg", label: "Non-Vegetarian" },
                  ]}
                />

                <p className="text-sm text-gray-500">
                  If you have any accompanying guests, please add their dietery
                  preferences to the list below.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Number of Vegetarian Meals"
                    name="totalVeg"
                    type="number"
                    control={control}
                    errors={errors}
                    required={true}
                    min={0}
                    valueAsNumber={true}
                  />

                  <FormField
                    label="Number of Non-Vegetarian Meals"
                    name="totalNonVeg"
                    type="number"
                    control={control}
                    errors={errors}
                    required={true}
                    min={0}
                    valueAsNumber={true}
                  />
                </div>

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
              </>
            )}
          </FormSection>
        )}

        {/* Transportation Step */}
        {currentStep === 4 && isAttending && (
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
        {currentStep === 5 && isAttending && (
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
                { value: "need", label: "I need accommodation" },
                {
                  value: "provide",
                  label: "I can provide accommodation to others",
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
        {currentStep === 6 && (
          <FormSection title="Financial Contribution">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                The estimated cost per person for the event is ₹500, which
                includes food, venue, and event materials.
              </p>
              {isAttending && (
                <p className="text-blue-800 mt-2">
                  Based on your meal selections, your estimated contribution
                  would be ₹
                  {(watch("totalVeg") || 0) * 500 +
                    (watch("totalNonVeg") || 0) * 500}
                  .
                </p>
              )}
            </div>

            <FormField
              label="Would you like to make a financial contribution to the event?"
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
                min={1}
                valueAsNumber={true}
              />
            )}
          </FormSection>
        )}

        {/* Optional Details Step */}
        {currentStep === 7 && (
          <FormSection title="Optional Information">
            <FormField
              label="Is your spouse also a Navodayan?"
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

            <FormField
              label="Would you like to join UNMA family WhatsApp groups?"
              name="unmaFamilyGroups"
              type="checkbox"
              control={control}
              errors={errors}
            />

            <FormField
              label="Mentorship: I can mentor Navodayan students/alumni in"
              name="mentorshipOptions"
              type="multiselect"
              control={control}
              errors={errors}
              options={[
                { value: "Career Guidance", label: "Career Guidance" },
                { value: "Higher Education", label: "Higher Education" },
                { value: "Entrepreneurship", label: "Entrepreneurship" },
                { value: "Technology", label: "Technology" },
                { value: "Arts and Culture", label: "Arts and Culture" },
                { value: "Sports", label: "Sports" },
              ]}
            />

            <FormField
              label="Training: I can conduct training sessions on"
              name="trainingOptions"
              type="multiselect"
              control={control}
              errors={errors}
              options={[
                { value: "Technical Skills", label: "Technical Skills" },
                { value: "Soft Skills", label: "Soft Skills" },
                { value: "Leadership", label: "Leadership" },
                { value: "Financial Literacy", label: "Financial Literacy" },
                { value: "Other", label: "Other" },
              ]}
            />

            <FormField
              label="Seminars: I can participate in seminars on"
              name="seminarOptions"
              type="multiselect"
              control={control}
              errors={errors}
              options={[
                { value: "Education", label: "Education" },
                { value: "Healthcare", label: "Healthcare" },
                { value: "Technology", label: "Technology" },
                { value: "Environment", label: "Environment" },
                { value: "Social Issues", label: "Social Issues" },
                { value: "Other", label: "Other" },
              ]}
            />

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
