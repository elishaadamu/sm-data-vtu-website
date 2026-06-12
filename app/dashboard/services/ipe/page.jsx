"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  FaWallet,
  FaPhone,
  FaCheckCircle,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { message, Modal } from "antd";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";

const MySwal = withReactContent(Swal);

const IpeVerificationPage = () => {
  const { userData } = useAppContext();
  const [trackingId, setTrackingId] = useState("");
  const [amount, setAmount] = useState(0);
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAmount, setIsLoadingAmount] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [priceLoading, setPriceLoading] = useState(false);
  const [ipePrice, setIpePrice] = useState(0);

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

  // Fetch IPE price from API
  useEffect(() => {
    const fetchIpePrice = async () => {
      setPriceLoading(true);
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.FETCH_PRICES.PRICES)
        );
        
        // Find IPE pricing
        const ipePricingData = Array.isArray(response.data)
          ? response.data.find((item) => item.key === "ipe")
          : response.data;

        const ipePricing =
          ipePricingData?.key === "ipe" ? ipePricingData : null;

        if (ipePricing && ipePricing.prices) {
          // Set the agent price for IPE and update amount immediately
          setIpePrice(ipePricing.prices.agent);
          setAmount(ipePricing.prices.agent);
        } else {
          setIpePrice(0);
        }
      } catch (error) {
        setIpePrice(0);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchIpePrice();
  }, []);

  const fetchAmount = async (phone) => {
    if (!phone) {
      // Keep the current price even without tracking ID
      return;
    }

    setIsLoadingAmount(true);
    try {
      // Use the fetched IPE price
      if (ipePrice > 0) {
        setAmount(ipePrice);
      } else {
        // Silently set to 0 without showing alert
        setAmount(0);
      }
    } catch (error) {
      setAmount(0);
    } finally {
      setIsLoadingAmount(false);
    }
  };

  const handleTrackingIdChange = (e) => {
    const value = e.target.value;
    setTrackingId(value);

    // Fetch amount when tracking ID is entered
    if (value.length >= 11) {
      fetchAmount(value);
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!trackingId) {
      message.error("Please enter your tracking ID");
      return;
    }
    if (!consent) {
      message.error("You must agree to the consent clause");
      return;
    }
    if (amount <= 0) {
      message.error("Invalid amount. Please check your phone number.");
      return;
    }

    Modal.confirm({
      title: (
        <span className="text-xl font-bold text-gray-800">
          Confirm IPE Verification
        </span>
      ),
      width: 600,
      centered: true,
      content: (
        <div className="py-4">
          <p className="text-base text-gray-600 mb-4">
            Are you sure you want to proceed with IPE verification?
          </p>
          <div className="bg-gray-50 p-6 rounded-xl space-y-3 border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-500">Service</span>
              <span className="font-semibold text-gray-800 uppercase">
                IPE Clearance
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-500">Tracking ID</span>
              <span className="font-semibold text-gray-800 font-mono text-lg">
                {trackingId}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500">Total Cost</span>
              <span className="font-bold text-xl text-green-600">
                ₦{amount.toLocaleString()}
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
            trackingId: trackingId,
            amount,
            userId,
          };

          const response = await axios.post(
            apiUrl(API_CONFIG.ENDPOINTS.IPE_VERIFICATION?.CREATE),
            payload
          );
          MySwal.fire({
            icon: "success",
            title: "Success",
            text: response.data.message || "IPE verification request submitted successfully!",
          });

          // Refresh wallet balance after successful transaction
          const balanceResponse = await axios.get(
            apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId)
          );
          setWalletBalance(balanceResponse.data?.wallet?.balance || 0);

          // Reset form
          setTrackingId("");
          setConsent(false);
          setAmount(0);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Wallet Balance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">IPE Verification</h1>
          <p className="text-gray-500 text-sm">
            Individual PIN Enrollment - Verify securely and instantly
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
        <div className="p-6 md:p-8 space-y-8">
          {/* Input Form */}
          <form onSubmit={handleVerify} className="space-y-6 max-w-2xl mx-auto">
            {/* Tracking ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={trackingId}
                  onChange={handleTrackingIdChange}
                  placeholder="Enter tracking ID"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Amount Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">
                  Amount to Pay
                </span>
                {priceLoading || isLoadingAmount ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-green-600"
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
                    <span className="text-sm text-green-600">
                      {priceLoading ? "Loading price..." : "Fetching..."}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-green-600">
                    ₦{amount.toLocaleString()}
                  </span>
                )}
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
                By checking this box, you agree that you are authorizing the IPE
                verification process and that all information provided is
                accurate.
                <span className="mt-1 text-xs text-blue-600 font-medium flex items-center gap-1">
                  <FaShieldAlt /> Secure Verification Protocol
                </span>
              </label>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || isLoadingAmount || amount <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                isLoading || isLoadingAmount || amount <= 0
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
                "Verify IPE"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IpeVerificationPage;
