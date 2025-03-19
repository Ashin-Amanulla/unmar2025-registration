import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState(null);

  useEffect(() => {
    // Get registration data from location state or redirect to home
    if (location.state?.registration) {
      setRegistrationData(location.state.registration);
    } else {
      // If no registration data found, try to get from session storage
      const savedData = sessionStorage.getItem("registrationData");
      if (savedData) {
        setRegistrationData(JSON.parse(savedData));
      } else {
        // If still no data, redirect to home after a short delay
        const timer = setTimeout(() => {
          navigate("/");
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [location, navigate]);

  // If we have registration data, save it to session storage
  useEffect(() => {
    if (registrationData) {
      sessionStorage.setItem(
        "registrationData",
        JSON.stringify(registrationData)
      );
    }
  }, [registrationData]);

  if (!registrationData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading registration details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-green-600"
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

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Registration Successful!
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Thank you for registering for UNMA 2025.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Registration Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Registration ID</p>
                <p className="text-lg font-medium">
                  {registrationData.registrationId}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg font-medium">{registrationData.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium">{registrationData.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Registration Type</p>
                <p className="text-lg font-medium">
                  {registrationData.registrationType}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-lg font-medium">
                  ₹{registrationData.amount}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p
                  className={`text-lg font-medium ${
                    registrationData.paymentStatus === "Paid"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {registrationData.paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {registrationData.paymentStatus === "Pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-700 mb-2">
                Payment Pending
              </h3>
              <p className="text-yellow-700 mb-4">
                Your registration is complete, but payment is pending. Please
                complete the payment to confirm your registration.
              </p>
              <button className="btn btn-primary w-full">
                Complete Payment
              </button>
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              An email with these details has been sent to your registered email
              address.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/" className="btn btn-outline">
                Return to Home
              </Link>
              <Link to="/verify" className="btn btn-secondary">
                Verify Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
