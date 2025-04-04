import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ReportIssue = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const funnyPlaceholders = [
    "The form is acting like it had too much coffee ☕",
    "My registration disappeared like my JNV homework 📚",
    "The payment button is playing hide and seek 🙈",
    "Everything's spinning like PT morning drill 🌪️",
    "The website is slower than mess queue on Sunday 🐌",
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Here you would typically send the issue to your backend
      console.log("Issue reported:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        "🎯 Issue reported successfully! We're on it like a Navodayan on morning bell!"
      );
      reset();
    } catch (error) {
      toast.error(
        "Oops! Something went wrong. Even our best prefects couldn't handle this one! 😅"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-8 py-12 text-center">
            <div className="text-5xl mb-4 flex justify-center gap-4">
              <span>🔧</span>
              <span>🐛</span>
              <span>🎯</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Houston, We Have a Problem!
            </h1>
            <p className="text-purple-100 text-lg">
              Don't worry, our tech team is better at fixing bugs than we were
              at fixing mess food! 😄
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Issue Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What kind of issue are you facing? 🤔
                </label>
                <select
                  {...register("issueType", {
                    required: "Please select an issue type",
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="">Select issue type</option>
                  <option value="registration">Registration Issues 📝</option>
                  <option value="payment">Payment Problems 💰</option>
                  <option value="technical">Technical Glitches 💻</option>
                  <option value="content">Content/Information Issues ℹ️</option>
                  <option value="other">
                    Other (Because life is complicated!) 🤷
                  </option>
                </select>
                {errors.issueType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.issueType.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us what's bothering you 🎭
                </label>
                <textarea
                  {...register("description", {
                    required: "Please describe the issue",
                    minLength: {
                      value: 20,
                      message:
                        "A bit more detail would help us understand better!",
                    },
                  })}
                  placeholder={
                    funnyPlaceholders[
                      Math.floor(Math.random() * funnyPlaceholders.length)
                    ]
                  }
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How can we reach you? 📞
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message:
                        "That doesn't look like an email we learned in computer class! 🤓",
                    },
                  })}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
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
                    Sending to our Fix-it Squad...
                  </span>
                ) : (
                  "🚀 Send it to the Tech Team!"
                )}
              </motion.button>
            </form>

            {/* Fun Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Remember when we used to fix everything with "Have you tried
                turning it off and on again?" We've evolved! 😎
              </p>
            </div>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Did You Know? 🤓
            </h3>
            <p className="text-gray-600">
              Our tech team solves bugs faster than we solved JNV morning
              puzzles!
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Fun Fact! 🎈
            </h3>
            <p className="text-gray-600">
              99% of issues are solved before the next assembly bell!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
