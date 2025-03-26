import React from "react";

const RegistrationType = ({ onSelectType }) => {
  const registrationTypes = [
    {
      id: "Alumni",
      title: "Alumni",
      description:
        "Register as a former JNV student who graduated from the school.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: "Staff",
      title: "Staff",
      description:
        "Register as a current or former staff member of any JNV school.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "Other",
      title: "Other",
      description:
        "Register as a family member, guest, or any other connection to JNV.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Select Your Connection to JNV
        </h2>
        <p className="text-gray-600 mt-2">
          Please select how you are connected to JNV for the UNMA 2025 event
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {registrationTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelectType(type.id)}
            className="border rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <div className="mb-4">{type.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
            <p className="text-gray-600 text-sm">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RegistrationType;
