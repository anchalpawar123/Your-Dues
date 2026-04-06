 // src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Top Bar */}
      {/* <div className="bg-blue-900 text-white text-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>info@cdgi.edu.in</span>
          </div>
          <div className="flex gap-4">
            <a href="https://facebook.com" className="text-white">FB</a>
            <a href="https://instagram.com" className="text-white">IG</a>
            <a href="https://linkedin.com" className="text-white">IN</a>
          </div>
        </div>
      </div> */}

      {/* Main Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-blue-800">CDGi</div>
            <div className="text-xs text-red-600 font-semibold">Knowledge is Power</div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/" className={`font-semibold ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-700'}`}>
              Home
            </Link>
            <Link to="/about" className={`font-semibold ${location.pathname === '/about' ? 'text-blue-600' : 'text-gray-700'}`}>
              About
            </Link>
            <Link to="/apply" className={`font-semibold ${location.pathname === '/apply' ? 'text-blue-600' : 'text-gray-700'}`}>
              How To Apply
            </Link>
            <Link to="/contact" className={`font-semibold ${location.pathname === '/contact' ? 'text-blue-600' : 'text-gray-700'}`}>
              Contact Us
            </Link>
            <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700">
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-2xl text-gray-700"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
              <Link to="/" className="font-semibold py-2">Home</Link>
              <Link to="/about" className="font-semibold py-2">About</Link>
              <Link to="/apply" className="font-semibold py-2">How To Apply</Link>
              <Link to="/contact" className="font-semibold py-2">Contact Us</Link>
              <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold text-center">
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;