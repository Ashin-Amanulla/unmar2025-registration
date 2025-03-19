import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking a link
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-2"
          : "bg-white/90 py-4 border-b border-gray-200"
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="UNMA 2025"
            className="h-10 w-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://media.licdn.com/dms/image/v2/C4E0BAQHBiErpz5o1lQ/company-logo_200_200/company-logo_200_200/0/1631331050086?e=2147483647&v=beta&t=4nyvBmOtfitoTakRa43Jj5aP37obR-FqNF80JBm2VQk";
            }}
          />
          {/* <span className="ml-2 text-xl font-bold text-primary">UNMA 2025</span> */}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-base font-medium hover:text-primary transition-colors ${
                isActive ? "text-primary" : "text-gray-600"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `text-base font-medium hover:text-primary transition-colors ${
                isActive ? "text-primary" : "text-gray-600"
              }`
            }
          >
            Register
          </NavLink>
          <NavLink to="/admin/login" className="btn btn-outline py-2 px-4">
            Admin Login
          </NavLink>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 md:hidden"
        >
          <span className="sr-only">Open main menu</span>
          {isMenuOpen ? (
            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "text-primary bg-gray-50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/register"
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "text-primary bg-gray-50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`
              }
            >
              Register
            </NavLink>
            <NavLink
              to="/admin/login"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary"
            >
              Admin Login
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
