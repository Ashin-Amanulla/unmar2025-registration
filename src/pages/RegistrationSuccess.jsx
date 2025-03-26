import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registrationId = location.state?.registrationId;

  useEffect(() => {
    // If no registration ID is provided, redirect to registration page
    if (!registrationId) {
      toast.error("Invalid registration session. Please register again.");
      navigate("/registration");
    }
  }, [registrationId, navigate]);

  // Safely return if no registration ID
  if (!registrationId) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-green-600"
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
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Registration Successful!
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Thank you for registering for UNMA 2025. Your registration ID is:
        </p>

        <div className="bg-gray-100 rounded-md py-3 px-6 mb-8 inline-block">
          <code className="text-xl font-mono font-semibold text-blue-800">
            {registrationId}
          </code>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <p className="text-gray-600 mb-4">
            We've sent a confirmation email with your registration details.
            Please save your registration ID for future reference.
          </p>
          <p className="text-gray-600">
            If you need to make any changes to your registration, please contact
            the UNMA 2025 organizing committee with your registration ID.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Home
          </Link>

          <Link
            to="/event-details"
            className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
          >
            View Event Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
