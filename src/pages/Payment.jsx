import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

const PaymentTier = ({
  title,
  amount,
  features,
  recommended,
  onSelect,
  selected,
}) => (
  <div
    className={`border rounded-lg p-6 cursor-pointer transition-all ${
      recommended ? "border-primary shadow-md" : "border-gray-200"
    } ${
      selected
        ? "ring-2 ring-primary bg-primary bg-opacity-5"
        : "hover:shadow-md"
    }`}
    onClick={onSelect}
  >
    {recommended && (
      <div className="bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full inline-block mb-4">
        Recommended
      </div>
    )}
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <div className="text-3xl font-bold mb-4 text-primary">₹{amount}</div>
    <ul className="space-y-3 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <svg
            className="h-5 w-5 text-green-500 mt-0.5 mr-2"
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
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      className={`w-full py-2 px-4 rounded-md transition-colors ${
        selected
          ? "bg-primary text-white"
          : "bg-white text-primary border border-primary hover:bg-primary hover:text-white"
      }`}
    >
      {selected ? "Selected" : "Select"}
    </button>
  </div>
);

const Payment = () => {
  const [selectedTier, setSelectedTier] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const tiers = {
    basic: {
      title: "Basic Registration",
      amount: "0",
      features: ["Event Entry", "Basic ID Card", "Access to Common Activities"],
    },
    standard: {
      title: "Standard Registration",
      amount: "500",
      features: [
        "Everything in Basic",
        "Lunch & Dinner",
        "Event T-shirt",
        "Certificate of Participation",
      ],
      recommended: true,
    },
    premium: {
      title: "Premium Registration",
      amount: "1000",
      features: [
        "Everything in Standard",
        "Premium ID Card",
        "Welcome Kit",
        "Priority Seating",
        "Special Recognition",
      ],
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      navigate("/confirmation");
    }, 2000);
  };

  return (
    <div className="py-32 bg-gray-50 min-h-screen">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-primary">Complete Your Registration</h1>
            <p className="text-gray-600 mt-2">
              Choose your registration tier and payment method
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {Object.entries(tiers).map(([key, tier]) => (
              <PaymentTier
                key={key}
                {...tier}
                selected={selectedTier === key}
                onSelect={() => setSelectedTier(key)}
              />
            ))}
          </div>

          {selectedTier !== "basic" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  type="button"
                  className={`flex items-center px-6 py-3 rounded-lg border ${
                    paymentMethod === "card"
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCardIcon className="h-6 w-6 mr-2" />
                  <span>Credit Card</span>
                </button>

                <button
                  type="button"
                  className={`flex items-center px-6 py-3 rounded-lg border ${
                    paymentMethod === "upi"
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <QrCodeIcon className="h-6 w-6 mr-2" />
                  <span>UPI</span>
                </button>

                <button
                  type="button"
                  className={`flex items-center px-6 py-3 rounded-lg border ${
                    paymentMethod === "cash"
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <BanknotesIcon className="h-6 w-6 mr-2" />
                  <span>Pay at Venue</span>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        className="input"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        value={cardDetails.cardNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        className="input"
                        placeholder="John Doe"
                        value={cardDetails.cardName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          className="input"
                          placeholder="MM/YY"
                          maxLength="5"
                          value={cardDetails.expiryDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          className="input"
                          placeholder="123"
                          maxLength="3"
                          value={cardDetails.cvv}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div>
                    <div className="mb-6">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="username@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                      />
                    </div>

                    <div className="bg-gray-100 p-6 rounded-lg mb-6 flex flex-col items-center">
                      <p className="text-gray-700 mb-4">
                        Or scan this QR code to pay
                      </p>
                      <div className="bg-white p-4 rounded-lg inline-block">
                        {/* This would be a real QR code in production */}
                        <div className="h-48 w-48 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <span className="text-gray-400">
                            QR Code Placeholder
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "cash" && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                      Pay at the Venue
                    </h3>
                    <p className="text-yellow-700 mb-4">
                      You've chosen to pay at the venue. Please note:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-yellow-700">
                      <li>
                        Your registration is not confirmed until payment is
                        received
                      </li>
                      <li>Please bring the exact amount in cash</li>
                      <li>
                        You'll need to arrive 30 minutes earlier for on-site
                        payment
                      </li>
                      <li>
                        A temporary confirmation will be sent to your email
                      </li>
                    </ul>
                  </div>
                )}

                <div className="mt-8">
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                      <span>
                        Registration Fee ({tiers[selectedTier].title})
                      </span>
                      <span>₹{tiers[selectedTier].amount}</span>
                    </div>
                    {selectedTier !== "basic" && (
                      <div className="flex justify-between mb-2">
                        <span>Processing Fee</span>
                        <span>₹25</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 my-2 pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>
                        ₹
                        {Number(tiers[selectedTier].amount) +
                          (selectedTier !== "basic" ? 25 : 0)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full py-3"
                    disabled={
                      processing ||
                      (paymentMethod === "upi" &&
                        !upiId &&
                        selectedTier !== "basic")
                    }
                  >
                    {processing ? (
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
                      <>Complete Registration</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {selectedTier === "basic" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Free Registration</h2>
                <p className="text-gray-600">
                  You've selected the basic registration option which is free of
                  charge.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Important Note
                </h3>
                <p className="text-blue-700 mb-4">
                  Basic registration provides limited benefits:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-blue-700">
                  <li>Entry to the event venue</li>
                  <li>Basic ID card</li>
                  <li>Access to common activities</li>
                  <li>Food and merchandise not included</li>
                </ul>
              </div>

              <button
                onClick={() => navigate("/confirmation")}
                className="btn btn-primary w-full py-3"
              >
                Complete Free Registration
              </button>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              By completing registration, you agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
