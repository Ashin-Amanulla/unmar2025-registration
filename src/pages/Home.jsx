import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  const eventDetailsRef = useRef(null);

  const scrollToEventDetails = () => {
    eventDetailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="bg-background">
        {/* Hero Section */}
        <section className="relative min-h-screen pt-32 pb-20 flex items-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 to-primary/70 z-10"></div>
            <img
              src="/hero-background.jpg"
              alt="JNV Kerala Alumni Meet"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80";
              }}
            />
          </div>

          <div className="container relative z-20">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-white uppercase bg-accent rounded-full">
                  JNV Kerala Alumni Meet
                </span>
                <h1 className="mb-6 text-white">
                  UNMA 2025: Reuniting Navodaya Memories
                </h1>
                <p className="mb-8 text-xl text-white/90">
                  Join us for a memorable gathering of Jawahar Navodaya Vidyalaya
                  alumni from across Kerala. Reconnect with old friends, share
                  stories, and create new memories.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register" className="btn btn-primary border-2 border-white">
                    Register Now
                  </Link>
                  <button
                    onClick={scrollToEventDetails}
                    className="btn btn-outline border-white text-blue-500 hover:bg-white hover:text-primary"
                  >
                    Event Details
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Event Highlights */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                Highlights
              </span>
              <h2 className="text-gray-800">What to Expect</h2>
              <div className="mx-auto mt-4 w-16 h-1 bg-primary"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <UserGroupIcon className="w-12 h-12 text-primary" />,
                  title: "Reconnect",
                  description:
                    "Meet your batchmates and teachers after years. Share stories and relive the golden days.",
                },
                {
                  icon: <ClockIcon className="w-12 h-12 text-primary" />,
                  title: "Cultural Events",
                  description:
                    "Enjoy performances, music, and cultural activities that celebrate the Navodaya spirit.",
                },
                {
                  icon: <MapPinIcon className="w-12 h-12 text-primary" />,
                  title: "Networking",
                  description:
                    "Connect with alumni from different professions and expand your network.",
                },
                {
                  icon: <CalendarIcon className="w-12 h-12 text-primary" />,
                  title: "Workshops",
                  description:
                    "Participate in interactive sessions and workshops on various topics.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Event Details */}
        <section
          ref={eventDetailsRef}
          id="event-details"
          className="py-20 bg-gray-50"
        >
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Key Information
                </span>
                <h2 className="text-gray-800">Event Details</h2>
                <div className="mx-auto mt-4 w-16 h-1 bg-primary"></div>
              </div>

              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row mb-8 gap-6">
                    <div className="flex-1">
                      <div className="flex items-start mb-6">
                        <CalendarIcon className="w-6 h-6 text-primary mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold mb-1">
                            Date & Time
                          </h4>
                          <p className="text-gray-600">
                            August 15, 2025 | 9:00 AM - 5:00 PM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="w-6 h-6 text-primary mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold mb-1">Venue</h4>
                          <p className="text-gray-600">
                            Airport Convention Center, Kochi, Kerala
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Detailed directions will be sent upon registration
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start mb-6">
                        <UserGroupIcon className="w-6 h-6 text-primary mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold mb-1">
                            Who Can Attend
                          </h4>
                          <p className="text-gray-600">
                            JNV Kerala Alumni and their families
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg
                          className="w-6 h-6 text-primary mt-1 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        <div>
                          <h4 className="text-lg font-semibold mb-1">
                            Registration Fee
                          </h4>
                          <p className="text-gray-600">
                            Free entry / Optional donation
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold mb-3">
                      Additional Information
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>
                        Accommodation options will be available for outstation
                        alumni
                      </li>
                      <li>
                        Food and refreshments will be provided during the event
                      </li>
                      <li>
                        Cultural performances and interactive sessions planned
                      </li>
                      <li>
                        Special arrangements for alumni interested in showcasing
                        their talents
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-white">
          <div className="container text-center">
            <h2 className="mb-6">Ready to Join the Reunion?</h2>
            <p className="max-w-2xl mx-auto mb-8 text-white/90 text-lg">
              Don't miss this opportunity to reconnect with your Navodaya family.
              Register now to secure your spot at UNMA 2025.
            </p>
            <Link
              to="/register"
              className="btn bg-white text-primary hover:bg-gray-100"
            >
              Register Today
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                Questions?
              </span>
              <h2 className="text-gray-800">Frequently Asked Questions</h2>
              <div className="mx-auto mt-4 w-16 h-1 bg-primary"></div>
            </div>

            <div className="max-w-3xl mx-auto">
              {[
                {
                  question: "Who can attend the UNMA 2025 event?",
                  answer:
                    "The event is open to all JNV Kerala alumni. You can also bring your immediate family members along.",
                },
                {
                  question: "How can I register for the event?",
                  answer:
                    "You can register through our online portal. Click on the 'Register' button and follow the instructions.",
                },
                {
                  question: "Is there a registration fee?",
                  answer:
                    "The basic registration is free. However, there are optional donation tiers if you wish to contribute to the event.",
                },
                {
                  question:
                    "What if I'm from JNV Malappuram, Thrissur, or Alappuzha?",
                  answer:
                    "Alumni from these schools are advised to contact their respective associations for separate registration processes.",
                },
                {
                  question: "Will accommodation be arranged?",
                  answer:
                    "Yes, we will provide information about accommodation options near the venue. You can specify your requirements during registration.",
                },
              ].map((item, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{item.question}</h3>
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
};

export default Home;
