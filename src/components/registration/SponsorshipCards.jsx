import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const useWindowSize = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

const SponsorshipCards = ({ selectedTier, onSelectTier }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useWindowSize();

  const tiers = [
    {
      name: "Title Sponsor",
      price: "₹5,00,000",
      description: "Primary sponsor with maximum visibility",
      benefits: [
        "Logo placement on all event materials",
        "Keynote speaking opportunity",
        "VIP seating at all events",
        "Full-page ad in event brochure",
        "Social media spotlight",
        "Exclusive networking session",
        "Recognition in press releases",
        "Banner placement at venue",
      ],
      color: "bg-indigo-50",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-100",
    },
    {
      name: "Co-Sponsor",
      price: "₹3,00,000",
      description: "Secondary sponsor with high visibility",
      benefits: [
        "Logo placement on main event materials",
        "Speaking opportunity in panel discussions",
        "Premium seating at events",
        "Half-page ad in event brochure",
        "Social media mentions",
        "Networking session access",
        "Press release mention",
        "Banner placement at venue",
      ],
      color: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      name: "Gold Sponsor",
      price: "₹1,50,000",
      description: "Supporting sponsor with good visibility",
      benefits: [
        "Logo on event materials",
        "Panel discussion participation",
        "Preferred seating",
        "Quarter-page ad in brochure",
        "Social media recognition",
        "Networking access",
        "Press release mention",
        "Table banner at venue",
      ],
      color: "bg-yellow-50",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-100",
    },
    {
      name: "Platinum Sponsor",
      price: "₹75,000",
      description: "Contributing sponsor with standard visibility",
      benefits: [
        "Logo on event materials",
        "Event participation",
        "Standard seating",
        "Business card ad in brochure",
        "Social media mention",
        "Basic networking access",
        "Press release mention",
        "Name display at venue",
      ],
      color: "bg-gray-50",
      textColor: "text-gray-600",
      borderColor: "border-gray-100",
    },
  ];

  const nextCard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const increment = isMobile ? 1 : 2;
    setActiveIndex((prev) =>
      prev + increment >= tiers.length ? 0 : prev + increment
    );
  };

  const prevCard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const increment = isMobile ? 1 : 2;
    setActiveIndex((prev) =>
      prev - increment < 0 ? tiers.length - increment : prev - increment
    );
  };

  const visibleTiers = isMobile
    ? [tiers[activeIndex]]
    : [
        tiers[activeIndex],
        tiers[activeIndex + 1 < tiers.length ? activeIndex + 1 : 0],
      ];

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8">
      {/* Navigation Arrows */}
      <button
        onClick={prevCard}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
      >
        <svg
          className="w-4 h-4 md:w-6 md:h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextCard}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
      >
        <svg
          className="w-4 h-4 md:w-6 md:h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Cards Container */}
      <div className="relative overflow-hidden py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8"
          >
            {visibleTiers.map((tier, idx) => (
              <div
                key={`${activeIndex}-${idx}`}
                onClick={() => onSelectTier(tier.name)}
                className={`relative rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer ${
                  tier.color
                } border ${tier.borderColor} ${
                  selectedTier === tier.name
                    ? "ring-2 ring-blue-500 transform scale-[1.02]"
                    : "hover:shadow-xl hover:scale-[1.01]"
                }`}
              >
                <div className="p-6 md:p-8">
                  <h3
                    className={`text-base md:text-lg font-medium ${tier.textColor} mb-1`}
                  >
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">
                      {tier.price}
                    </span>
                  </div>
                  <p className="mt-3 md:mt-4 text-gray-600 text-sm">
                    {tier.description}
                  </p>

                  <ul className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                    {tier.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 text-xs md:text-sm"
                      >
                        <svg
                          className={`h-4 w-4 md:h-5 md:w-5 ${tier.textColor} flex-shrink-0`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-600">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTier(tier.name);
                    }}
                    className={`mt-6 md:mt-8 w-full py-2.5 md:py-3 px-4 md:px-6 rounded-xl font-medium transition-colors ${
                      selectedTier === tier.name
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {selectedTier === tier.name
                      ? "Selected"
                      : "Select this tier"}
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center mt-6 md:mt-8 space-x-2">
        {Array.from({
          length: isMobile ? tiers.length : Math.ceil(tiers.length / 2),
        }).map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveIndex(isMobile ? index : index * 2);
            }}
            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors ${
              isMobile
                ? index === activeIndex
                : Math.floor(activeIndex / 2) === index
                ? "bg-blue-600"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SponsorshipCards;
