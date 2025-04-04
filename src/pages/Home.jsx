import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  TicketIcon,
  CameraIcon,
  MusicalNoteIcon,
  SparklesIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2025-08-15T09:00:00");

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-flow-col gap-6 text-center auto-cols-max">
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Minutes" },
        { value: timeLeft.seconds, label: "Seconds" },
      ].map((item, index) => (
        <div
          key={index}
          className="flex flex-col p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg"
        >
          <span className="countdown font-mono text-6xl font-bold text-white">
            {item.value.toString().padStart(2, "0")}
          </span>
          <span className="text-lg text-white/80 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  const eventDetailsRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToEventDetails = () => {
    eventDetailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="bg-background">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/95 via-primary/80 to-primary-dark/95 z-10"></div>
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 z-20"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] z-30"></div>
            <img
              src="/hero-background.jpg"
              alt="JNV Kerala Alumni Meet"
              className="w-full h-full object-cover scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80";
              }}
            />
          </div>

          <div className="container relative z-40 pt-32 pb-20">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <span className="inline-block px-6 py-2.5 mb-8 text-sm font-semibold tracking-wider text-white uppercase bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                  JNV Kerala Alumni Meet
                </span>
                <h1 className="mb-8 text-6xl md:text-7xl font-bold text-white leading-tight">
                  UNMA 2025:{" "}
                  <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Reuniting Navodaya Memories
                  </span>
                </h1>
                <p className="mb-16 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Join us for a memorable gathering of Jawahar Navodaya
                  Vidyalaya alumni from across Kerala. Reconnect with old
                  friends, share stories, and create new memories.
                </p>

                {/* Event Details in Hero */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-xl bg-white/10 mr-4">
                        <CalendarIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white font-medium text-lg">
                        Date & Time
                      </span>
                    </div>
                    <p className="text-white text-2xl font-bold mb-2">
                      August 15, 2025
                    </p>
                    <p className="text-white/80 text-lg">9:00 AM - 5:00 PM</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-xl bg-white/10 mr-4">
                        <MapPinIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white font-medium text-lg">
                        Venue
                      </span>
                    </div>
                    <p className="text-white text-2xl font-bold mb-2">
                      Airport Convention Center
                    </p>
                    <p className="text-white/80 text-lg">Kochi, Kerala</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-xl bg-white/10 mr-4">
                        <UserGroupIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white font-medium text-lg">
                        Attendees
                      </span>
                    </div>
                    <p className="text-white text-2xl font-bold mb-2">
                      JNV Alumni
                    </p>
                    <p className="text-white/80 text-lg">
                      Family Members Welcome
                    </p>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="mb-16">
                  <h3 className="text-white text-2xl font-medium mb-8">
                    Event Starts In
                  </h3>
                  <div className="flex justify-center">
                    <CountdownTimer />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 justify-center">
                  <Link
                    to="/register"
                    className="btn bg-white text-primary hover:bg-gray-100 px-10 py-5 text-xl font-semibold rounded-full flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Register Now
                    <ArrowRightIcon className="w-6 h-6" />
                  </Link>
                  <button
                    onClick={scrollToEventDetails}
                    className="btn border-2 border-white text-white hover:bg-white hover:text-primary px-10 py-5 text-xl font-semibold rounded-full flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Learn More
                    <ChevronDownIcon className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Event Highlights */}
        <section className="py-24 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 mb-4 text-sm font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                Highlights
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What to Expect
              </h2>
              <div className="mx-auto w-24 h-1 bg-primary"></div>
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
                  icon: <MusicalNoteIcon className="w-12 h-12 text-primary" />,
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
                {
                  icon: <CameraIcon className="w-12 h-12 text-primary" />,
                  title: "Photo Gallery",
                  description:
                    "Capture memories with professional photography and share them with the community.",
                },
                {
                  icon: <TicketIcon className="w-12 h-12 text-primary" />,
                  title: "Raffle Draw",
                  description:
                    "Win exciting prizes in our special raffle draw for registered participants.",
                },
                {
                  icon: <SparklesIcon className="w-12 h-12 text-primary" />,
                  title: "Awards Ceremony",
                  description:
                    "Recognize outstanding achievements of alumni in various fields.",
                },
                {
                  icon: <ClockIcon className="w-12 h-12 text-primary" />,
                  title: "Time Capsule",
                  description:
                    "Contribute to a special time capsule that will be opened at the next reunion.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-8 text-center bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    {item.title}
                  </h3>
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
          className="py-24 bg-gray-50"
        >
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-2 mb-4 text-sm font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Key Information
                </span>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Event Details
                </h2>
                <div className="mx-auto w-24 h-1 bg-primary"></div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                <div className="p-8 md:p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <CalendarIcon className="w-8 h-8 text-primary mt-1 mr-4 flex-shrink-0" />
                        <div>
                          <h4 className="text-xl font-semibold mb-2 text-gray-900">
                            Date & Time
                          </h4>
                          <p className="text-gray-600 text-lg">
                            August 15, 2025
                          </p>
                          <p className="text-gray-600">9:00 AM - 5:00 PM</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="w-8 h-8 text-primary mt-1 mr-4 flex-shrink-0" />
                        <div>
                          <h4 className="text-xl font-semibold mb-2 text-gray-900">
                            Venue
                          </h4>
                          <p className="text-gray-600 text-lg">
                            Airport Convention Center
                          </p>
                          <p className="text-gray-600">Kochi, Kerala</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Detailed directions will be sent upon registration
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start">
                        <UserGroupIcon className="w-8 h-8 text-primary mt-1 mr-4 flex-shrink-0" />
                        <div>
                          <h4 className="text-xl font-semibold mb-2 text-gray-900">
                            Who Can Attend
                          </h4>
                          <p className="text-gray-600 text-lg">
                            JNV Kerala Alumni
                          </p>
                          <p className="text-gray-600">
                            Family Members Welcome
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg
                          className="w-8 h-8 text-primary mt-1 mr-4 flex-shrink-0"
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
                          <h4 className="text-xl font-semibold mb-2 text-gray-900">
                            Registration Fee
                          </h4>
                          <p className="text-gray-600 text-lg">Free entry</p>
                          <p className="text-gray-600">
                            Optional donation available
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-200">
                    <h4 className="text-xl font-semibold mb-4 text-gray-900">
                      Additional Information
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Accommodation options for outstation alumni
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Food and refreshments provided
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Cultural performances and interactive sessions
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Special arrangements for talent showcase
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
          <div className="container relative z-10 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Join the Reunion?
            </h2>
            <p className="max-w-2xl mx-auto mb-12 text-xl text-white/90">
              Don't miss this opportunity to reconnect with your Navodaya
              family. Register now to secure your spot at UNMA 2025.
            </p>
            <Link
              to="/register"
              className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full inline-flex items-center gap-2"
            >
              Register Today
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 mb-4 text-sm font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                Questions?
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <div className="mx-auto w-24 h-1 bg-primary"></div>
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
                <div
                  key={index}
                  className="mb-8 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    {item.question}
                  </h3>
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
