"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  FaWallet,
  FaIdCard,
  FaPhone,
  FaCheckCircle,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Image from "next/image";
import { message, Modal } from "antd";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import RegularSlip from "@/app/dashboard/assets/regular.png";
import StandardSlip from "@/app/dashboard/assets/standard.png";
import PremiumSlip from "@/app/dashboard/assets/premium.png";
import { useRouter } from "next/navigation";

import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";

const MySwal = withReactContent(Swal);

const NinVerificationPage = () => {
  const router = useRouter();
  const { userData, viewNinSlip } = useAppContext();
  const [verificationMethod, setVerificationMethod] = useState("nin"); // 'nin' or 'phone'
  const [selectedSlip, setSelectedSlip] = useState("standard"); // 'regular', 'standard', 'premium'
  const [idNumber, setIdNumber] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [priceLoading, setPriceLoading] = useState(false);
  const [agentPrices, setAgentPrices] = useState([]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!userData) return;
      const userId = userData?.id || userData?._id;
      if (!userId) return;

      try {
        setWalletLoading(true);
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId)
        );
        setWalletBalance(response.data?.wallet?.balance || 0);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWalletBalance();
  }, [userData]);

  // Fetch prices from API
  useEffect(() => {
    const fetchPrices = async () => {
      setPriceLoading(true);
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.FETCH_PRICES.PRICES)
        );
        
        // Find NIN pricing
        const ninPricingData = Array.isArray(response.data)
          ? response.data.find((item) => item.key === "nin")
          : response.data;

        const ninPricing =
          ninPricingData?.key === "nin" ? ninPricingData : null;

        if (ninPricing && ninPricing.prices) {
          // Update slipTypes with new prices
          const updatedSlipTypes = slipTypes.map((slip) => ({
            ...slip,
            price: `₦${ninPricing.prices.agent}`,
          }));

          setAgentPrices(updatedSlipTypes);
        } else {
          // If no pricing data, use default slipTypes
          setAgentPrices(slipTypes);
        }
      } catch (error) {
        message.error("Failed to fetch current prices");
        // Use default slipTypes on error
        setAgentPrices(slipTypes);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!idNumber) {
      message.error("Please enter your ID Number");
      return;
    }
    if (!consent) {
      message.error("You must agree to the consent clause");
      return;
    }

    // Find the selected slip to get the price
    const currentSlipTypes = agentPrices.length > 0 ? agentPrices : slipTypes;
    const selectedSlipData = currentSlipTypes.find((s) => s.id === selectedSlip);
    const slipAmount = selectedSlipData
      ? parseInt(selectedSlipData.price.replace(/[₦,]/g, ""))
      : 0;

    Modal.confirm({
      title: (
        <span className="text-xl font-bold text-gray-800">
          Confirm Verification
        </span>
      ),
      width: 600,
      centered: true,
      content: (
        <div className="py-4">
          <p className="text-base text-gray-600 mb-4">
            Are you sure you want to proceed with the verification?
          </p>
          <div className="bg-gray-50 p-6 rounded-xl space-y-3 border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-500">Method</span>
              <span className="font-semibold text-gray-800 uppercase">
                {verificationMethod === "nin" ? "NIN" : "Phone"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-500">ID Number</span>
              <span className="font-semibold text-gray-800 font-mono text-lg">
                {idNumber}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-500">Slip Type</span>
              <span className="font-semibold text-blue-600">
                {selectedSlipData?.name}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500">Total Cost</span>
              <span className="font-bold text-xl text-green-600">
                ₦{slipAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ),
      okText: "Yes, Verify",
      cancelText: "Cancel",
      okButtonProps: { className: "bg-blue-600 hover:bg-blue-700" },
      onOk: async () => {
        setIsLoading(true);
        try {
          if (!userData) {
            MySwal.fire({
              icon: "error",
              title: "Authentication Error",
              text: "User session not found. Please login again.",
            });
            setIsLoading(false);
            return;
          }

          const userId = userData?.id || userData?._id;

          if (!userId) {
            MySwal.fire({
              icon: "error",
              title: "Authentication Error",
              text: "Invalid user session.",
            });
            setIsLoading(false);
            return;
          }

          const payload = {
            verifyWith: verificationMethod,
            slipLayout: selectedSlip,
            amount: slipAmount,
            userId,
          };

          if (verificationMethod === "phone") {
            payload.phone = idNumber;
          } else {
            payload.nin = idNumber;
          }

          const response = await axios.post(
            apiUrl(API_CONFIG.ENDPOINTS.NIN_VERIFICATION.CREATE),
            payload
          );
          MySwal.fire({
            icon: "success",
            title: "Success",
            text: response.data.message || "Verification request submitted successfully!",
          });

          // Refresh wallet balance after successful transaction
          const balanceResponse = await axios.get(
            apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId)
          );
          setWalletBalance(balanceResponse.data?.wallet?.balance || 0);

          // Store verification data in context
          const verificationData = response.data?.data?.result || response.data;
          if (typeof viewNinSlip === "function") {
            viewNinSlip(verificationData, selectedSlip);
          }

          // Navigate to appropriate slip view page
          const lowerCaseSlipType = String(selectedSlip || "").toLowerCase();
          if (lowerCaseSlipType === "regular") {
            router.push("/regular-nin");
          } else if (lowerCaseSlipType === "standard") {
            router.push("/standard-nin");
          } else if (lowerCaseSlipType === "premium") {
            router.push("/premium-nin");
          }

          // Reset form
          setIdNumber("");
          setConsent(false);
        } catch (error) {
          MySwal.fire({
            icon: "error",
            title: "Verification Failed",
            text: error.response?.data?.message || "Verification failed. Please check your details and try again.",
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const slipTypes = [
    {
      id: "regular",
      name: "Regular Slip",
      price: "₦100",
      features: ["Basic Details", "Black & White"],
      color: "blue",
      image: RegularSlip,
    },
    {
      id: "standard",
      name: "Standard Slip",
      price: "₦200",
      features: ["Full Details", "Color Print", "Laminated look"],
      color: "purple",
      popular: true,
      image: StandardSlip,
    },
    {
      id: "premium",
      name: "Premium Slip",
      price: "₦300",
      features: ["Full Details", "High Quality", "Priority Processing"],
      color: "orange",
      image: PremiumSlip,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Wallet Balance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">NIN Verification</h1>
          <p className="text-gray-500 text-sm">
            Verify identity securely and instantly
          </p>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-4 w-full md:w-fit">
          <div className="bg-white/10 p-2 rounded-lg">
            <FaWallet className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Wallet Balance</p>
            {walletLoading ? (
              <div className="h-6 w-24 bg-white/20 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-lg font-bold">
                ₦ {walletBalance.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Verification Method Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setVerificationMethod("nin")}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              verificationMethod === "nin"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <FaIdCard className="w-4 h-4" />
            Verify with NIN
          </button>
          <button
            onClick={() => setVerificationMethod("phone")}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              verificationMethod === "phone"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <FaPhone className="w-4 h-4" />
            Verify with Phone
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Slip Selection */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Select Slip Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3  gap-10 md:gap-4">
              {(agentPrices.length > 0 ? agentPrices : slipTypes).map((slip) => (
                <div
                  key={slip.id}
                  onClick={() => setSelectedSlip(slip.id)}
                  className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 ${
                    selectedSlip === slip.id
                      ? `border-${slip.color}-500 bg-${slip.color}-50 shadow-lg scale-[1.02]`
                      : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  {slip.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                      POPULAR
                    </div>
                  )}

                  {/* Slip Image */}
                  <div className="mb-4 relative h-32 w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <Image
                      src={slip.image}
                      alt={slip.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex justify-between items-start mb-3">
                    <h4 className={`font-bold text-${slip.color}-700`}>
                      {slip.name}
                    </h4>
                    {selectedSlip === slip.id && (
                      <FaCheckCircle
                        className={`text-${slip.color}-500 w-5 h-5`}
                      />
                    )}
                  </div>
                  {priceLoading ? (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-800 mb-3">
                      {slip.price}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {slip.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-gray-500 flex items-center gap-2"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full bg-${slip.color}-400`}
                        ></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Input Form */}
          <form onSubmit={handleVerify} className="space-y-6 max-w-2xl mx-auto">
            {/* ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {verificationMethod === "nin"
                  ? "National Identity Number (NIN)"
                  : "Phone Number"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {verificationMethod === "nin" ? (
                    <FaIdCard className="text-gray-400" />
                  ) : (
                    <FaPhone className="text-gray-400" />
                  )}
                </div>
                <input
                  type={verificationMethod === "nin" ? "text" : "tel"}
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={
                    verificationMethod === "nin"
                      ? "Enter 11-digit NIN"
                      : "Enter Phone Number"
                  }
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>


            {/* Consent Checkbox */}
            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
              <div className="pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                />
              </div>
              <label
                htmlFor="consent"
                className="text-sm text-blue-800 cursor-pointer leading-relaxed"
              >
                By checking this box, you agree that the owner of the ID has
                granted you consent to verify his/her identity.
                <span className="mt-1 text-xs text-blue-600 font-medium flex items-center gap-1">
                  <FaShieldAlt /> Secure Verification Protocol
                </span>
              </label>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Verifying...
                </span>
              ) : (
                "Verify Identity"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NinVerificationPage;
