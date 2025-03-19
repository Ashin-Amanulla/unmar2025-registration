import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegistration } from "../hooks";

const VerifyRegistration = () => {
  const [registrationId, setRegistrationId] = useState("");
  const [email, setEmail] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { verifyRegistration } = useRegistration();

  const handleVerify = async (e) => {
    e.preventDefault();

    // Reset previous results
    setVerificationResult(null);
    setError("");

    // Basic validation
    if (!registrationId || !email) {
      setError("Please enter both Registration ID and Email");
      return;
    }

    setIsLoading(true);

    try {
      // Call our verification function from hook
      const result = await verifyRegistration(registrationId);

      if (result.success) {
        // Normally we would check if the email matches, but for demo we'll accept any email
        setVerificationResult(result);
      } else {
        setError(
          result.error ||
            "Verification failed. Please check your details and try again."
        );
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Verify Registration
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Check the status of your UNMA 2025 registration
        </p>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {!verificationResult ? (
            <div className="p-8">
              <form onSubmit={handleVerify} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="registrationId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Registration ID
                  </label>
                  <input
                    type="text"
                    id="registrationId"
                    className="form-input"
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    placeholder="Enter your registration ID"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Registration"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/register"
                  className="text-primary hover:text-primary-dark"
                >
                  Don't have a registration? Register now
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-blue-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Registration Verified
              </h2>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Registration ID</p>
                    <p className="text-lg font-medium">{registrationId}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-lg font-medium">
                      {verificationResult.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Registration Type</p>
                    <p className="text-lg font-medium">
                      {verificationResult.registrationType}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Registration Date</p>
                    <p className="text-lg font-medium">
                      {verificationResult.registrationDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-lg font-medium text-green-600">
                      {verificationResult.status}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p
                      className={`text-lg font-medium ${
                        verificationResult.paymentStatus === "Paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {verificationResult.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>

              {verificationResult.paymentStatus === "Pending" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-700 mb-2">
                    Payment Pending
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Your registration is confirmed, but payment is pending.
                    Please complete the payment.
                  </p>
                  <button className="btn btn-primary w-full">
                    Complete Payment
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => setVerificationResult(null)}
                  className="btn btn-outline"
                >
                  Verify Another Registration
                </button>
                <Link to="/" className="btn btn-secondary">
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyRegistration;
