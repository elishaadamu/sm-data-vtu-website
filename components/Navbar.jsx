"use client";
import React, { useState } from "react";
import Logo from "@/assets/logo/sm-data.png";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

const Navbar = () => {
  const { router } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className=" border-b border-gray-300 text-gray-700 relative bg-white shadow-md z-10">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-2 md:px-4 lg:px-4 py-3">
        <Image
          className="cursor-pointer w-[140px] md:w-[180px]"
          onClick={() => router.push("/")}
          src={Logo}
          alt="SM Data"
        />
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-x-4 md:gap-x-6">
          <Link
            href="/signin-bd"
            className="text-gray-600 hover:text-gray-900 transition text-sm md:text-base"
          >
            Business Developer
          </Link>
          <Link
            href="/signin-bdm"
            className="text-gray-600 hover:text-gray-900 transition text-sm md:text-base"
          >
            BD Manager
          </Link>
          <Link
            href="/signin-agent"
            className="bg-blue-600 text-white hover:bg-blue-700 transition px-4 py-2 rounded-md text-sm md:text-base"
          >
            Agent Signin
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(true)} className="text-gray-700">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full bg-white w-64 shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end p-4">
            <button onClick={() => setIsMenuOpen(false)}>
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <nav className="flex flex-col p-4 space-y-4">
            <Link
              href="/signin-bd"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-700 hover:text-gray-900"
            >
              Business Developer
            </Link>
            <Link
              href="/signin-bdm"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-700 hover:text-gray-900"
            >
              BD Manager
            </Link>
            <Link
              href="/signin-agent"
              onClick={() => setIsMenuOpen(false)}
              className="bg-blue-600 text-white hover:bg-blue-700 transition px-4 py-2 rounded-md text-center"
            >
              Agent Signin
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
