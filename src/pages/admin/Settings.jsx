import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../hooks";

const Settings = () => {
  const navigate = useNavigate();
  const {
    adminSettings,
    isSettingsLoading,
    updateSettings,
    isUpdatingSettings,
  } = useAdmin();

  // State for form
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    eventLocation: "",
    registrationFee: {
      standard: "",
      premium: "",
      supporter: "",
    },
    emailNotifications: true,
    allowRegistrations: true,
    maxRegistrations: "",
    paymentGateway: "razorpay",
    logoUrl: "",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
    },
  });

  // Load settings when component mounts
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // When settings data is loaded, update form
    if (adminSettings) {
      setFormData(adminSettings);
    }
  }, [adminSettings, navigate]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      // Handle nested properties (e.g., registrationFee.standard)
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      // Handle top-level properties
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
  };

  if (isSettingsLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/admin/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          {/* Event Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Event Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="eventName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Name
                </label>
                <input
                  type="text"
                  id="eventName"
                  name="eventName"
                  className="form-input"
                  value={formData.eventName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Date
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  className="form-input"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="eventLocation"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Location
                </label>
                <input
                  type="text"
                  id="eventLocation"
                  name="eventLocation"
                  className="form-input"
                  value={formData.eventLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="logoUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Logo URL
                </label>
                <input
                  type="text"
                  id="logoUrl"
                  name="logoUrl"
                  className="form-input"
                  value={formData.logoUrl}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Registration Fees */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Registration Fees
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="registrationFee.standard"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Standard (₹)
                </label>
                <input
                  type="number"
                  id="registrationFee.standard"
                  name="registrationFee.standard"
                  className="form-input"
                  value={formData.registrationFee.standard}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="registrationFee.premium"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Premium (₹)
                </label>
                <input
                  type="number"
                  id="registrationFee.premium"
                  name="registrationFee.premium"
                  className="form-input"
                  value={formData.registrationFee.premium}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="registrationFee.supporter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Supporter (₹)
                </label>
                <input
                  type="number"
                  id="registrationFee.supporter"
                  name="registrationFee.supporter"
                  className="form-input"
                  value={formData.registrationFee.supporter}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Registration Settings */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Registration Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowRegistrations"
                  name="allowRegistrations"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={formData.allowRegistrations}
                  onChange={handleChange}
                />
                <label
                  htmlFor="allowRegistrations"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Allow Registrations
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                />
                <label
                  htmlFor="emailNotifications"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Send Email Notifications
                </label>
              </div>

              <div>
                <label
                  htmlFor="maxRegistrations"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Maximum Registrations
                </label>
                <input
                  type="number"
                  id="maxRegistrations"
                  name="maxRegistrations"
                  className="form-input"
                  value={formData.maxRegistrations}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for unlimited
                </p>
              </div>

              <div>
                <label
                  htmlFor="paymentGateway"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Gateway
                </label>
                <select
                  id="paymentGateway"
                  name="paymentGateway"
                  className="form-input"
                  value={formData.paymentGateway}
                  onChange={handleChange}
                >
                  <option value="razorpay">Razorpay</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="manual">Manual Payment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Social Media Links
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="socialLinks.facebook"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Facebook URL
                </label>
                <input
                  type="text"
                  id="socialLinks.facebook"
                  name="socialLinks.facebook"
                  className="form-input"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="socialLinks.twitter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Twitter URL
                </label>
                <input
                  type="text"
                  id="socialLinks.twitter"
                  name="socialLinks.twitter"
                  className="form-input"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="socialLinks.instagram"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Instagram URL
                </label>
                <input
                  type="text"
                  id="socialLinks.instagram"
                  name="socialLinks.instagram"
                  className="form-input"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdatingSettings}
            >
              {isUpdatingSettings ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
