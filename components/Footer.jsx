import React from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logo/sm-data.png";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowRight,
  FaShieldAlt,
  FaHeadset,
  FaAward,
  FaShippingFast,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section with Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-12 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-full">
              <FaShippingFast className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white"> Shipping</h4>
              <p className="text-sm text-gray-400">100% Secured</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600 rounded-full">
              <FaShieldAlt className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Secure Payment</h4>
              <p className="text-sm text-gray-400">100% Protected</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600 rounded-full">
              <FaHeadset className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">24/7 Support</h4>
              <p className="text-sm text-gray-400">Ready to Help</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-600 rounded-full">
              <FaAward className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Quality Products</h4>
              <p className="text-sm text-gray-400">Guaranteed</p>
            </div>
          </div>
        </div>

        {/* Main Footer Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image
                className="w-[180px] h-auto"
                src={Logo}
                alt="MISAL SUB Logo"
              />
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your premier VTU platform for data, airtime, and bill payments. We
              bring you quality services at competitive prices with exceptional
              customer support.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: FaFacebookF, href: "#", color: "hover:bg-blue-600" },
                { icon: FaTwitter, href: "#", color: "hover:bg-blue-400" },
                { icon: FaInstagram, href: "#", color: "hover:bg-pink-600" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`p-3 bg-gray-700 rounded-lg transition-all duration-300 hover:scale-110 ${social.color}`}
                  aria-label={`Follow us on ${social.icon.name}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "Shop", href: "/products" },
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
                { name: "FAQ", href: "/faq" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <FaArrowRight className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative inline-block">
              Customer Service
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-green-500"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Shipping Info", href: "/shipping" },
                { name: "Returns & Refunds", href: "/returns" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Size Guide", href: "/size-guide" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <FaArrowRight className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-purple-500"></span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    123 Business District,
                    <br />
                    Central Area,
                    <br />
                    Abuja, Nigeria
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaPhoneAlt className="w-4 h-4 text-blue-400" />
                <a
                  href="tel:+2348140950947"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  +234 814 095 0947
                </a>
              </div>

              <div className="flex items-center gap-3">
                <FaEnvelope className="w-4 h-4 text-green-400" />
                <a
                  href="mailto:support@kasuwarzamani.com.ng"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  support@kasuwarzamani.com.ng
                </a>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3 text-white">
                Newsletter
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 w-48 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} MISAL SUB. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Accepted Payment Methods:</span>
              <div className="flex gap-2">
                {["Visa", "Mastercard", "Verve", "Wallet Deposit"].map(
                  (method, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 rounded text-xs"
                    >
                      {method}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        aria-label="Back to top"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
