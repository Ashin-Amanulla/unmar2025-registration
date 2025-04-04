import { Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import { useController } from "react-hook-form";
import { useRegistration } from "../../hooks";
import Select from "react-select";
import { CheckCircle } from "lucide-react";

// Form section component
export const FormSection = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-800">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

// Form field component using React Hook Form
export const FormField = ({
  label,
  name,
  type,
  control,
  errors,
  required,
  placeholder,
  options,
  min,
  max,
  disabled,
  onChange,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: "",
  });

  // Handle different field types
  const renderFieldByType = () => {
    switch (type) {
      case "text":
      case "email":
      case "tel":
      case "number":
        return (
          <input
            type={type}
            id={name}
            {...field}
            disabled={disabled}
            min={min}
            max={max}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e);
              }
            }}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              error ? "border-red-500" : "border-gray-300"
            } ${disabled ? "bg-gray-100" : ""}`}
            placeholder={placeholder || ""}
          />
        );

      case "textarea":
        return (
          <textarea
            id={name}
            {...field}
            disabled={disabled}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              error ? "border-red-500" : "border-gray-300"
            } ${disabled ? "bg-gray-100" : ""}`}
            placeholder={placeholder || ""}
          />
        );

      case "select":
        return (
          <select
            id={name}
            {...field}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              error ? "border-red-500" : "border-gray-300"
            } ${disabled ? "bg-gray-100" : ""}`}
          >
            <option value="">Select {label}</option>
            {options &&
              options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={name}
              checked={field.value === true}
              onChange={(e) => field.onChange(e.target.checked)}
              disabled={disabled}
              className={`h-5 w-5 rounded focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              } ${disabled ? "bg-gray-100" : ""}`}
            />
            <span className="ml-2 text-gray-700">{label}</span>
          </div>
        );

      case "multiselect":
        return (
          <Select
            isMulti
            id={name}
            options={options}
            value={options?.filter((option) =>
              field.value?.includes(option.value)
            )}
            onChange={(selectedOptions) =>
              field.onChange(
                selectedOptions?.map((option) => option.value) || []
              )
            }
            isDisabled={disabled}
            className={`${error ? "border-red-500" : ""}`}
            placeholder={`Select ${label}`}
            classNamePrefix="react-select"
          />
        );

      case "date":
        return (
          <input
            type="date"
            id={name}
            {...field}
            disabled={disabled}
            min={min}
            max={max}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              error ? "border-red-500" : "border-gray-300"
            } ${disabled ? "bg-gray-100" : ""} date-picker`}
            placeholder={placeholder || ""}
          />
        );

      case "time":
        return (
          <input
            type="time"
            id={name}
            {...field}
            disabled={disabled}
            min={min}
            max={max}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              error ? "border-red-500" : "border-gray-300"
            } ${disabled ? "bg-gray-100" : ""} time-picker`}
            placeholder={placeholder || ""}
          />
        );

      default:
        return (
          <input
            type="text"
            id={name}
            {...field}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              error ? "border-red-500" : "border-gray-300"
            } ${disabled ? "bg-gray-100" : ""}`}
            placeholder={placeholder || ""}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      {type !== "checkbox" && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {renderFieldByType()}

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error.message || "This field is required"}
        </p>
      )}
    </div>
  );
};

// OTP Input component
export const OtpInput = ({ onVerify, email, phone }) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  const { sendOtp, verifyOtp } = useRegistration();

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle sending OTP
  const handleSendOtp = async () => {
    if (!email && !phone) return;

    setIsSendingOtp(true);

    try {
      // await sendOtp(email);
      setSentOtp(true);
      setCountdown(60); // 60 seconds countdown
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle verifying OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return;

    setIsVerifying(true);

    try {
      // const result = await verifyOtp(email, otp);
      // onVerify(result.verified);
      onVerify(true);
      setIsVerified(true);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      onVerify(false);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        Verify your email address
      </h4>

      {!sentOtp ? (
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={isSendingOtp || !email}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSendingOtp ? "Sending OTP..." : "Send OTP"}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              maxLength={6}
            />

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.length < 6 || isVerified}
              className={`px-4 py-2 flex items-center gap-2 rounded-md ${
                isVerified
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
              }`}
            >
              {isVerified ? (
                <>
                  Verified <CheckCircle className="w-5 h-5 text-white" />
                </>
              ) : isVerifying ? (
                "Verifying..."
              ) : (
                "Verify"
              )}
            </button>
          </div>

          <div className="flex justify-between text-sm">
            {isVerified ? (
              <>
                <p className="text-gray-600">✅ OTP verified successfully</p>
              </>
            ) : (
              <>
                <p className="text-gray-600">OTP sent to {email}</p>
                {countdown > 0 ? (
                  <p className="text-gray-600">Resend in {countdown}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="text-blue-600 hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// CAPTCHA component
export const CaptchaVerification = ({ onVerify }) => {
  // Handle CAPTCHA verification
  const handleCaptchaChange = (value) => {
    if (value) {
      onVerify(true);
      toast.success("CAPTCHA verified successfully");
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        CAPTCHA Verification
      </h4>

      <div className="flex justify-center">
        <ReCAPTCHA
          sitekey={
            import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
            "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          }
          onChange={handleCaptchaChange}
        />
      </div>

      {!import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Using test key. Set REACT_APP_RECAPTCHA_SITE_KEY in .env for
          production.
        </p>
      )}
    </div>
  );
};

// Navigation Buttons
export const NavigationButtons = ({
  currentStep,
  stepsCount,
  onBack,
  onNext,
  onSkip,
  isSubmitting,
  isNextDisabled,
  nextButtonText = "Next",
  showSkipButton = false,
}) => {
  return (
    <div className="mt-8 flex justify-between items-center">
      <button
        type="button"
        onClick={onBack}
        disabled={currentStep === 0}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
          currentStep === 0
            ? "text-gray-400 cursor-not-allowed"
            : "text-blue-600 hover:text-blue-700"
        }`}
      >
        Back
      </button>
      <div className="flex gap-3">
        {showSkipButton && (
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Skip Optional
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting || isNextDisabled}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Submitting...
            </>
          ) : (
            <>
              {nextButtonText}
              {nextButtonText === "Next" && (
                <svg
                  className="ml-2 -mr-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Progress Indicator for mobile
export const MobileProgressIndicator = ({ currentStep, stepsCount }) => {
  const progress = ((currentStep + 1) / stepsCount) * 100;

  return (
    <div className="md:hidden mt-8">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>
          Step {currentStep + 1} of {stepsCount}
        </span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
