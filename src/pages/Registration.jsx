import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReCAPTCHA from "react-google-recaptcha";
import VerificationQuiz from "../components/VerificationQuiz";
import RegistrationSchema from "../zod-form-validators/registrationform";

// Form section component
const FormSection = ({ title, children }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 border-b border-gray-200">
        {title}
      </h2>
      <div className="flex flex-col space-y-4">{children}</div>
    </div>
  );
};

// Form field component using React Hook Form
const FormField = ({
  label,
  name,
  type,
  control,
  options,
  required,
  placeholder,
  errors,
  disabled = false,
}) => {
  if (
    type === "text" ||
    type === "email" ||
    type === "tel" ||
    type === "date" ||
    type === "number"
  ) {
    return (
      <div className="w-full">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              type={type}
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full px-4 py-2 border ${
                errors[name] ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                disabled ? "bg-gray-100" : ""
              }`}
              {...field}
            />
          )}
        />
        {errors[name] && (
          <p className="mt-1 text-xs text-red-500">{errors[name].message}</p>
        )}
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className="w-full">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <select
              id={name}
              disabled={disabled}
              className={`w-full px-4 py-2 border ${
                errors[name] ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                disabled ? "bg-gray-100" : ""
              }`}
              {...field}
            >
              <option value="">Select {label}</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        />
        {errors[name] && (
          <p className="mt-1 text-xs text-red-500">{errors[name].message}</p>
        )}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="w-full">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <textarea
              id={name}
              rows={3}
              disabled={disabled}
              placeholder={placeholder}
              className={`w-full px-4 py-2 border ${
                errors[name] ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                disabled ? "bg-gray-100" : ""
              }`}
              {...field}
            />
          )}
        />
        {errors[name] && (
          <p className="mt-1 text-xs text-red-500">{errors[name].message}</p>
        )}
      </div>
    );
  }

  return null;
};

// Step indicators
const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4 sm:py-6 mb-4 sm:mb-8 overflow-x-auto">
      <div className="flex items-center justify-start sm:justify-evenly min-w-max sm:min-w-0 px-4 sm:px-0">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center mx-2 sm:mx-0"
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-sm sm:text-lg font-bold ${
                index < currentStep
                  ? "bg-green-500 text-white"
                  : index === currentStep
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <div className="text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-center max-w-[80px] sm:max-w-none whitespace-nowrap">
              {step}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`hidden sm:block absolute h-[2px] w-full top-5 -right-1/2 transform translate-x-1/2 ${
                  index < currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// OTP Input component
const OtpInput = ({ onVerify, email }) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = () => {
    if (!email) {
      toast.error("Please enter a valid email first");
      return;
    }

    setIsLoading(true);

    // Simulate API call to send OTP
    setTimeout(() => {
      // This would be an actual API call in production
      console.log("OTP sent to your email", email);
      alert("OTP sent to your email", email);
      setOtpSent(true);
      setIsLoading(false);
      setCountdown(60); // 60 seconds countdown
      toast.success("OTP sent to your email");
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setIsLoading(true);

    // Simulate API call to verify OTP
    setTimeout(() => {
      // In a real app, this would validate against the backend
      setIsLoading(false);

      // For demo purposes, any 4-digit code is accepted
      if (otp.length === 4) {
        onVerify(true);
        toast.success("Email verified successfully");
      } else {
        toast.error("Invalid OTP, please try again");
      }
    }, 1500);
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">
          {otpSent
            ? "Enter the OTP sent to your email"
            : "Verify your email to continue"}
        </p>

        {otpSent ? (
          <div className="flex space-x-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 4))}
              placeholder="Enter 4-digit OTP"
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={4}
            />
            <button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length < 4}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSendOtp}
            disabled={isLoading || countdown > 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading
              ? "Sending..."
              : countdown > 0
              ? `Resend in ${countdown}s`
              : "Send OTP"}
          </button>
        )}
      </div>
    </div>
  );
};

const Registration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [formHasLocalData, setFormHasLocalData] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Local storage key for this form
  const STORAGE_KEY = "unma-registration-form-data";

  // Set up React Hook Form with Zod resolver
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(RegistrationSchema),
    mode: "onChange", // Validate on change for better user experience
    defaultValues: {
      // Personal Data
      name: "",
      contactNumber: "",
      email: "",
      emailVerified: false,
      whatsappNumber: "",
      school: "",
      yearOfPassing: "",
      country: "",
      district: "",

      // Professional Data
      highestQualification: "",
      jobTitle: "",
      decisionMaker: "No",
      areaOfExpertise: "",

      // Transportation
      travellingFrom: "",
      travelDate: "",
      modeOfTravel: "",
      transportMode: "",

      // Accommodation
      location: "",
      accommodationStatus: "",

      // Finance
      sponsorHelp: "No",
      contributionAmount: "",
      canSpendTime: "No",

      // Skills
      keySkills: "",
    },
  });

  // Watch fields for conditional logic
  const sponsorHelp = watch("sponsorHelp");
  const email = watch("email");

  // Load saved form data from local storage on initial mount
  useEffect(() => {
    const savedFormData = localStorage.getItem(STORAGE_KEY);
    const savedStep = localStorage.getItem(`${STORAGE_KEY}-step`);
    const savedEmailVerified = localStorage.getItem(
      `${STORAGE_KEY}-email-verified`
    );

    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        reset(parsedData);
        setFormHasLocalData(true);

        if (savedEmailVerified === "true") {
          setEmailVerified(true);
          setValue("emailVerified", true);
        }

        if (savedStep) {
          setCurrentStep(parseInt(savedStep, 10));
        }

        toast.info("Your previous form data has been restored");
      } catch (error) {
        console.error("Error parsing saved form data:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [reset, setValue]);

  // Save form data to local storage whenever form values change
  const saveFormToLocalStorage = () => {
    const formData = getValues();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    localStorage.setItem(`${STORAGE_KEY}-step`, currentStep.toString());
    localStorage.setItem(
      `${STORAGE_KEY}-email-verified`,
      emailVerified.toString()
    );
  };

  // Auto-save form data whenever any field changes or step changes
  useEffect(() => {
    if (isDirty) {
      saveFormToLocalStorage();
    }
  }, [watch(), currentStep, emailVerified, isDirty]);

  // Update form value when email is verified
  useEffect(() => {
    setValue("emailVerified", emailVerified);
  }, [emailVerified, setValue]);

  // Initialize Razorpay
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle payment
  const handlePayment = async (amount) => {
    try {
      // Create order on your backend
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
        }),
      });

      const order = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "UNMA 2025",
        description: "Event Registration Contribution",
        order_id: order.id,
        handler: function (response) {
          setPaymentStatus("success");
          toast.success("Payment successful!");
          // Verify payment on backend
          verifyPayment(response);
        },
        prefill: {
          name: getValues("firstName") + " " + getValues("lastName"),
          email: getValues("email"),
          contact: getValues("contactNumber"),
        },
        theme: {
          color: "#2563EB",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment initialization failed. Please try again.");
    }
  };

  // Verify payment
  const verifyPayment = async (paymentResponse) => {
    try {
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentResponse),
      });

      const data = await response.json();
      if (data.verified) {
        setValue("paymentVerified", true);
      } else {
        toast.error("Payment verification failed. Please contact support.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Payment verification failed. Please contact support.");
    }
  };

  // Handle reCAPTCHA verification
  const handleCaptchaVerify = (value) => {
    if (value) {
      setCaptchaVerified(true);
      toast.success("CAPTCHA verified successfully!");
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (passed) => {
    setQuizCompleted(passed);
  };

  // All steps in the form
  const steps = [
    "Personal Info",
    "Verification",
    "Professional",
    "Skills",
    "Travel",
    "Accommodation",
    "Finance",
  ];

  // Handle email verification
  const handleEmailVerified = (status) => {
    setEmailVerified(status);
    setValue("emailVerified", status);
    saveFormToLocalStorage();
  };

  // Validate only the fields in the current step
  const validateCurrentStep = async () => {
    let fieldsToValidate = [];

    if (currentStep === 0) {
      fieldsToValidate = [
        "firstName",
        "lastName",
        "contactNumber",
        "email",
        "emailVerified",
        "school",
        "yearOfPassing",
        "country",
        "district",
      ];

      if (!emailVerified) {
        toast.error("Please verify your email to continue");
        return false;
      }

      if (!captchaVerified) {
        toast.error("Please complete the CAPTCHA verification");
        return false;
      }
    } else if (currentStep === 1) {
      if (!quizCompleted) {
        toast.error("Please complete the verification quiz");
        return false;
      }
    } else if (currentStep === 2) {
      fieldsToValidate = ["decisionMaker"];
    } else if (currentStep === 3) {
      fieldsToValidate = [
        "travellingFrom",
        "travelDate",
        "modeOfTravel",
        "transportMode",
      ];
    } else if (currentStep === 4) {
      fieldsToValidate = ["accommodationStatus"];
    } else if (currentStep === 5) {
      fieldsToValidate = ["sponsorHelp", "canSpendTime"];
      if (sponsorHelp === "Yes") {
        fieldsToValidate.push("contributionAmount");
      }
    }

    // Trigger validation only for the fields in the current step
    const result = await trigger(fieldsToValidate);
    return result;
  };

  // Handle next button click
  const handleNextStep = async () => {
    const isStepValid = await validateCurrentStep();

    if (isStepValid) {
      setCurrentStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
      saveFormToLocalStorage();
    }
  };

  // Clear saved form data
  const clearSavedFormData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}-step`);
    localStorage.removeItem(`${STORAGE_KEY}-email-verified`);
    setFormHasLocalData(false);
    toast.success("Saved form data has been cleared");
  };

  // Handle step validation and navigation
  const onStepSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // If this is the final step, submit the form
      if (currentStep === steps.length - 1) {
        console.log("Final form data:", data);

        // Success! Clear local storage as form is successfully submitted
        clearSavedFormData();

        toast.success("Registration submitted successfully!");
        navigate("/confirmation");
      } else {
        // Otherwise, go to the next step
        console.log("Current step:", currentStep, data);
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
        saveFormToLocalStorage();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("There was an error processing your form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 py-6 sm:py-12 px-3 sm:px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 mt-6 sm:mt-12">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            UNMA 2025 Event Registration
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600">
            Please complete all sections to register for the event
          </p>

          {formHasLocalData && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-md mx-3 sm:mx-0">
              <p className="text-sm sm:text-base text-blue-800">
                We've restored your previously saved data.
              </p>
              <button
                onClick={clearSavedFormData}
                className="mt-2 text-xs sm:text-sm text-red-600 hover:text-red-800 underline"
              >
                Clear saved data and start over
              </button>
            </div>
          )}
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <form
          onSubmit={handleSubmit(onStepSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          {/* Step 1: Personal Data */}
          {currentStep === 0 && (
            <>
              <FormSection title="Personal Information">
                <FormField
                  label="Name"
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
                  label="Email Address"
                  name="email"
                  type="email"
                  control={control}
                  errors={errors}
                  required={true}
                  disabled={emailVerified}
                />

                {email && email.includes("@") && (
                  <div className="w-full">
                    <OtpInput onVerify={handleEmailVerified} email={email} />
                  </div>
                )}

                <FormField
                  label="WhatsApp Number"
                  name="whatsappNumber"
                  type="tel"
                  control={control}
                  errors={errors}
                />

                <FormField
                  label="School"
                  name="school"
                  type="text"
                  control={control}
                  errors={errors}
                  required={true}
                />

                <FormField
                  label="Year of Passing"
                  name="yearOfPassing"
                  type="text"
                  control={control}
                  errors={errors}
                  required={true}
                />

                <FormField
                  label="Country"
                  name="country"
                  type="select"
                  control={control}
                  errors={errors}
                  options={[
                    { value: "India", label: "India" },
                    { value: "UAE", label: "UAE" },
                    { value: "USA", label: "USA" },
                    { value: "UK", label: "UK" },
                    { value: "Canada", label: "Canada" },
                    { value: "Australia", label: "Australia" },
                    { value: "Other", label: "Other" },
                  ]}
                  required={true}
                />

                <FormField
                  label="District"
                  name="district"
                  type="select"
                  control={control}
                  errors={errors}
                  options={[
                    { value: "Kasaragod", label: "Kasaragod" },
                    { value: "Kannur", label: "Kannur" },
                    { value: "Kozhikode", label: "Kozhikode" },
                    { value: "Wayanad", label: "Wayanad" },
                    { value: "Malappuram", label: "Malappuram" },
                    { value: "Palakkad", label: "Palakkad" },
                    { value: "Thrissur", label: "Thrissur" },
                    { value: "Ernakulam", label: "Ernakulam" },
                    { value: "Idukki", label: "Idukki" },
                    { value: "Kottayam", label: "Kottayam" },
                    { value: "Alappuzha", label: "Alappuzha" },
                    { value: "Pathanamthitta", label: "Pathanamthitta" },
                    { value: "Kollam", label: "Kollam" },
                    {
                      value: "Thiruvananthapuram",
                      label: "Thiruvananthapuram",
                    },
                  ]}
                  required={true}
                />
              </FormSection>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Verification
                </h3>
                <div className="flex justify-center mb-6">
                  <ReCAPTCHA
                    sitekey="6Leh4foqAAAAAJdvp8w03nOJDyX8pTW2otzI8G42"
                    onChange={handleCaptchaVerify}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Verification Quiz */}
          {currentStep === 1 && (
            <FormSection title="JNV Background Verification">
              <div className="col-span-2">
                <VerificationQuiz onQuizComplete={handleQuizComplete} />
              </div>
            </FormSection>
          )}

          {/* Step 3: Professional Data */}
          {currentStep === 2 && (
            <FormSection title="Professional Information">
              <FormField
                label="Highest Qualification"
                name="highestQualification"
                type="text"
                control={control}
                errors={errors}
              />

              <FormField
                label="Job Title"
                name="jobTitle"
                type="text"
                control={control}
                errors={errors}
              />

              <FormField
                label="Decision Maker in Job"
                name="decisionMaker"
                type="select"
                control={control}
                errors={errors}
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
                required={true}
              />

              <FormField
                label="Area of Expertise"
                name="areaOfExpertise"
                type="text"
                control={control}
                errors={errors}
              />
            </FormSection>
          )}

          {/* Step 4: Skills */}
          {currentStep === 3 && (
            <FormSection title="Skills & Strengths">
              <FormField
                label="Key Skills"
                name="keySkills"
                type="textarea"
                control={control}
                errors={errors}
                placeholder="e.g., Coordination, Friends, Technology, Creativity, etc."
              />
            </FormSection>
          )}

          {/* Step 5: Transportation */}
          {currentStep === 4 && (
            <FormSection title="Transportation Details">
              <FormField
                label="Travelling From"
                name="travellingFrom"
                type="text"
                control={control}
                errors={errors}
                required={true}
              />

              <FormField
                label="Travel Date/Time"
                name="travelDate"
                type="date"
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
                options={[
                  { value: "Car", label: "Car" },
                  { value: "Train", label: "Train" },
                  { value: "Flight", label: "Flight" },
                  { value: "Other", label: "Other" },
                ]}
                required={true}
              />

              <FormField
                label="Do you need transport?"
                name="needTransport"
                type="select"
                control={control}
                errors={errors}
                options={[
                  { value: "No", label: "No, I have my own transport" },
                  { value: "Yes", label: "Yes, I need transport" },
                  {
                    value: "CoShare",
                    label: "Yes, willing to co-share transport",
                  },
                ]}
                required={true}
              />

              {watch("needTransport") === "CoShare" && (
                <FormField
                  label="Number of seats you can share"
                  name="coShareSeats"
                  type="number"
                  control={control}
                  errors={errors}
                  placeholder="How many people can you accommodate?"
                />
              )}
            </FormSection>
          )}

          {/* Step 6: Accommodation */}
          {currentStep === 5 && (
            <FormSection title="Accommodation Details">
              <FormField
                label="Accommodation Requirement"
                name="accommodationStatus"
                type="select"
                control={control}
                errors={errors}
                options={[
                  { value: "need", label: "I need accommodation" },
                  { value: "provide", label: "I can provide accommodation" },
                  { value: "none", label: "I don't need accommodation" },
                ]}
                required={true}
              />

              {watch("accommodationStatus") === "provide" && (
                <FormField
                  label="Number of people you can accommodate"
                  name="accommodationCapacity"
                  type="number"
                  control={control}
                  errors={errors}
                  placeholder="How many people can you accommodate?"
                />
              )}

              <FormField
                label="Location"
                name="location"
                type="text"
                control={control}
                errors={errors}
                placeholder="Your location or preferred accommodation area"
              />
            </FormSection>
          )}

          {/* Step 7: Finance */}
          {currentStep === 6 && (
            <FormSection title="Financial Contribution">
              <FormField
                label="Would you like to contribute financially?"
                name="sponsorHelp"
                type="select"
                control={control}
                errors={errors}
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
                required={true}
              />

              {watch("sponsorHelp") === "Yes" && (
                <>
                  <FormField
                    label="Contribution Amount (₹)"
                    name="contributionAmount"
                    type="number"
                    control={control}
                    errors={errors}
                    placeholder="Enter amount in INR"
                  />

                  {watch("contributionAmount") && (
                    <div className="col-span-2 mt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handlePayment(watch("contributionAmount"))
                        }
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  )}
                </>
              )}

              <FormField
                label="Can you volunteer time for the event?"
                name="canSpendTime"
                type="select"
                control={control}
                errors={errors}
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
                required={true}
              />
            </FormSection>
          )}

          {/* Progress Indicator for mobile */}
          <div className="md:hidden mt-6">
            <p className="text-sm text-gray-600 text-center">
              Step {currentStep + 1} of {steps.length} (
              {Math.round(((currentStep + 1) / steps.length) * 100)}%)
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between">
            {currentStep > 0 && (
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </button>
            )}

            <button
              type="button"
              onClick={
                currentStep === steps.length - 1
                  ? handleSubmit(onStepSubmit)
                  : handleNextStep
              }
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
                currentStep === 0 ? "ml-auto" : ""
              }`}
              disabled={
                isSubmitting ||
                (currentStep === 0 && !captchaVerified) ||
                (currentStep === 1 && !quizCompleted)
              }
            >
              {isSubmitting
                ? "Processing..."
                : currentStep === steps.length - 1
                ? "Submit Registration"
                : "Continue"}
            </button>
          </div>

          {/* Save status indicator */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Form data is automatically saved in your browser
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;
