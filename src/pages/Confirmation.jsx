import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckBadgeIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const Confirmation = () => {
  const [registrationData, setRegistrationData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    registrationNumber:
      "UNMA-2025-" + Math.floor(100000 + Math.random() * 900000),
    registrationType: "Standard Registration",
    amount: "₹500",
    school: "JNV Kannur",
    timestamp: new Date().toISOString(),
  });

  // In a real implementation, this would fetch the registration details from API
  useEffect(() => {
    // Mock API call to get registration data
    const getRegistrationData = () => {
      // This would normally be an API call, but we're simulating it with a timeout
      setTimeout(() => {
        // Registration data would come from API in a real app
        console.log("Registration data fetched");
      }, 1000);
    };

    getRegistrationData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="py-32 bg-gray-50 min-h-screen">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-primary text-white p-8 text-center">
              <CheckBadgeIcon className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">
                Registration Successful!
              </h1>
              <p className="text-lg opacity-90">You're all set for UNMA 2025</p>
            </div>

            <div className="p-8">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start mb-8">
                <div className="flex-shrink-0 text-green-500 mt-1">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Registration Confirmation
                  </h3>
                  <div className="mt-1 text-sm text-green-700">
                    <p>
                      A confirmation email has been sent to{" "}
                      <strong>{registrationData.email}</strong> with all the
                      details. Please check your inbox.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Registration Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Name
                  </h3>
                  <p className="text-lg font-medium">{registrationData.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Registration Number
                  </h3>
                  <p className="text-lg font-medium font-mono">
                    {registrationData.registrationNumber}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Registration Type
                  </h3>
                  <p className="text-lg font-medium">
                    {registrationData.registrationType}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Amount Paid
                  </h3>
                  <p className="text-lg font-medium">
                    {registrationData.amount}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    School
                  </h3>
                  <p className="text-lg font-medium">
                    {registrationData.school}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Registration Date
                  </h3>
                  <p className="text-lg font-medium">
                    {formatDate(registrationData.timestamp)}
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Event Information
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CalendarIcon className="h-6 w-6 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">Event Date</h3>
                    <p className="text-gray-600">December 26-28, 2025</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPinIcon className="h-6 w-6 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">Venue</h3>
                    <p className="text-gray-600">JNV Kannur Campus, Kerala</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <ClockIcon className="h-6 w-6 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">Check-in Time</h3>
                    <p className="text-gray-600">
                      December 26, 2025 at 9:00 AM
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <DocumentTextIcon className="h-6 w-6 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">Important Note</h3>
                    <p className="text-gray-600">
                      Please bring your ID and registration confirmation when
                      checking in.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <Link to="/" className="text-primary hover:underline">
                    Back to Home
                  </Link>

                  <div className="flex space-x-4">
                    <button
                      className="btn btn-outline py-2 px-4 flex items-center"
                      onClick={() => window.print()}
                    >
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      Print
                    </button>

                    <button className="btn btn-primary py-2 px-4 flex items-center">
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Email Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              What's Next?
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-blue-700">
              <li>Add the event to your calendar</li>
              <li>Join our WhatsApp group for updates</li>
              <li>
                Share your registration on social media with hashtag #UNMA2025
              </li>
              <li>Prepare for your journey to the event location</li>
            </ul>

            <div className="mt-4 text-center">
              <Link to="/" className="btn btn-primary mt-4">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
