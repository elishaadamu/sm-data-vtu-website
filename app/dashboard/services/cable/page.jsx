"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { message } from "antd";
import { useAppContext } from "@/context/AppContext";
import { apiUrl, API_CONFIG } from "@/configs/api";
import {
  FaWallet,
  FaTv,
  FaRegMoneyBillAlt,
  FaIdCard,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaInfoCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdLiveTv, MdSubscriptions } from "react-icons/md";

const CablePage = () => {
  const { userData } = useAppContext();
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [currentPackage, setCurrentPackage] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // Nigerian Cable TV Providers
  const providers = [
    { 
      id: "dstv", 
      name: "DStv", 
      fullName: "Digital Satellite Television",
      icon: "📡"
    },
    { 
      id: "gotv", 
      name: "GOtv", 
      fullName: "GOtv Nigeria",
      icon: "📺"
    },
    { 
      id: "startimes", 
      name: "StarTimes", 
      fullName: "StarTimes Nigeria",
      icon: "⭐"
    },
    { 
      id: "showmax", 
      name: "Showmax", 
      fullName: "Showmax Streaming",
      icon: "🎬"
    },
  ];

  // Sample packages - Replace with API data
  const samplePackages = {
    dstv: [
      { id: "dstv-padi", name: "DStv Padi", price: 2500, duration: "Monthly" },
      { id: "dstv-yanga", name: "DStv Yanga", price: 3500, duration: "Monthly" },
      { id: "dstv-confam", name: "DStv Confam", price: 6200, duration: "Monthly" },
      { id: "dstv-compact", name: "DStv Compact", price: 10500, duration: "Monthly" },
      { id: "dstv-compact-plus", name: "DStv Compact Plus", price: 16600, duration: "Monthly" },
      { id: "dstv-premium", name: "DStv Premium", price: 24500, duration: "Monthly" },
    ],
    gotv: [
      { id: "gotv-smallie", name: "GOtv Smallie", price: 1300, duration: "Monthly" },
      { id: "gotv-jinja", name: "GOtv Jinja", price: 2250, duration: "Monthly" },
      { id: "gotv-jolli", name: "GOtv Jolli", price: 3300, duration: "Monthly" },
      { id: "gotv-max", name: "GOtv Max", price: 4850, duration: "Monthly" },
      { id: "gotv-supa", name: "GOtv Supa", price: 6400, duration: "Monthly" },
    ],
    startimes: [
      { id: "startimes-nova", name: "Nova Bouquet", price: 1200, duration: "Monthly" },
      { id: "startimes-basic", name: "Basic Bouquet", price: 2100, duration: "Monthly" },
      { id: "startimes-smart", name: "Smart Bouquet", price: 2800, duration: "Monthly" },
      { id: "startimes-classic", name: "Classic Bouquet", price: 3200, duration: "Monthly" },
      { id: "startimes-super", name: "Super Bouquet", price: 5200, duration: "Monthly" },
    ],
    showmax: [
      { id: "showmax-mobile", name: "Mobile", price: 1450, duration: "Monthly" },
      { id: "showmax-standard", name: "Standard", price: 2900, duration: "Monthly" },
      { id: "showmax-pro", name: "Pro", price: 4400, duration: "Monthly" },
    ],
  };

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!userData) return;
      const userId = userData?.id || userData?._id;
      if (!userId) return;

      try {
        setWalletLoading(true);
        const response = await axios.get(
          apiUrl(
            API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId
          )
        );
        setWalletBalance(response.data?.wallet?.balance || 0);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWalletBalance();
  }, [userData]);

  // Load packages when provider is selected
  useEffect(() => {
    if (selectedProvider) {
      setPackagesLoading(true);
      // Simulated API call - Replace with actual API
      setTimeout(() => {
        setPackages(samplePackages[selectedProvider] || []);
        setPackagesLoading(false);
      }, 500);
    } else {
      setPackages([]);
    }
  }, [selectedProvider]);

  // Verify smart card number
  const handleVerifyCard = async () => {
    if (!selectedProvider || !smartCardNumber) {
      message.warning("Please select provider and enter smart card number");
      return;
    }

    try {
      setVerifying(true);
      // Simulated verification - replace with actual API call
      // const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.CABLE.VERIFY), {
      //   provider: selectedProvider,
      //   smartCardNumber,
      // });

      // Simulated response
      setTimeout(() => {
        setCustomerName("John Doe"); // Replace with response.data.customerName
        setCurrentPackage("DStv Compact"); // Replace with response.data.currentPackage
        setVerified(true);
        message.success("Smart card verified successfully!");
        setVerifying(false);
      }, 1500);
    } catch (error) {
      console.error("Error verifying smart card:", error);
      message.error("Failed to verify smart card number. Please check and try again.");
      setVerifying(false);
    }
  };

  // Handle subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();

    const userId = userData?.id || userData?._id;
    if (!userId) {
      message.error("User not found. Please log in again.");
      return;
    }

    if (!verified) {
      message.warning("Please verify your smart card number first");
      return;
    }

    const selectedPkg = packages.find((p) => p.id === selectedPackage);
    if (!selectedPkg) {
      message.error("Please select a valid package");
      return;
    }

    const payload = {
      provider: selectedProvider,
      smartCardNumber,
      package: selectedPackage,
      amount: selectedPkg.price,
      phoneNumber,
      userId,
    };

    console.log("Cable Subscription Payload:", payload);

    try {
      setLoading(true);
      // Replace with actual API endpoint
      // const response = await axios.post(
      //   apiUrl(API_CONFIG.ENDPOINTS.CABLE.SUBSCRIBE),
      //   payload
      // );

      // Simulated success
      setTimeout(() => {
        message.success("Cable subscription successful!");

        // Reset form
        setSelectedProvider("");
        setSmartCardNumber("");
        setSelectedPackage("");
        setPhoneNumber("");
        setCustomerName("");
        setCurrentPackage("");
        setVerified(false);
        setPackages([]);

        // Refresh wallet balance
        const fetchBalance = async () => {
          const balanceResponse = await axios.get(
            apiUrl(
              API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId
            )
          );
          setWalletBalance(balanceResponse.data?.wallet?.balance || 0);
        };
        fetchBalance();
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error processing subscription:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to process subscription. Please try again."
      );
      setLoading(false);
    }
  };

  // Reset verification when provider or card number changes
  useEffect(() => {
    setVerified(false);
    setCustomerName("");
    setCurrentPackage("");
    setSelectedPackage("");
  }, [selectedProvider, smartCardNumber]);

  const selectedPackageDetails = packages.find((p) => p.id === selectedPackage);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="bg-gradient-to-br from-red-500 to-rose-600 p-4 rounded-2xl shadow-lg">
            <FaTv className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
          Cable TV Subscription
        </h1>
        <p className="text-slate-600 mt-2">
          Subscribe to your favorite cable TV packages instantly
        </p>
      </div>

      {/* Wallet Balance */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mb-8 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
            <FaWallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-slate-600 font-medium">Available Balance</p>
            {walletLoading ? (
              <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                ₦ {walletBalance.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Form */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
        <form onSubmit={handleSubscribe} className="space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              1. Select Cable TV Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedProvider === provider.id
                      ? "border-red-500 bg-red-50 shadow-md"
                      : "border-slate-200 bg-slate-50 hover:border-red-300"
                  }`}
                  title={provider.fullName}
                >
                  <span className="text-3xl">{provider.icon}</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {provider.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Smart Card Number Input */}
          {selectedProvider && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                2. Enter Smart Card Number / IUC Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter your smart card number"
                    value={smartCardNumber}
                    onChange={(e) => setSmartCardNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyCard}
                  disabled={verifying || !smartCardNumber}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          )}

          {/* Customer Details Display */}
          {verified && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <div className="flex items-start gap-3">
                <FaCheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 mb-1">
                    Smart Card Verified Successfully
                  </p>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="font-medium">Customer Name:</span>{" "}
                      {customerName}
                    </p>
                    <p>
                      <span className="font-medium">Current Package:</span>{" "}
                      {currentPackage}
                    </p>
                    <p>
                      <span className="font-medium">Smart Card:</span>{" "}
                      {smartCardNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Package Selection */}
          {verified && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                3. Select Subscription Package
              </label>
              {packagesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedPackage === pkg.id
                          ? "border-red-500 bg-red-50 shadow-md"
                          : "border-slate-200 bg-slate-50 hover:border-red-300"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MdSubscriptions className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-slate-800">
                            {pkg.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>{pkg.duration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          ₦{pkg.price.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Package Details Display */}
          {selectedPackageDetails && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">
                  {selectedPackageDetails.name}
                </p>
                <p className="text-sm text-slate-600">
                  {selectedPackageDetails.duration} Subscription
                </p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                ₦{selectedPackageDetails.price.toLocaleString()}
              </p>
            </div>
          )}

          {/* Phone Number Input */}
          {selectedPackage && (
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                4. Phone Number (for confirmation)
              </label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                required
              />
            </div>
          )}



          {/* Info Banner */}
          {selectedPackageDetails && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-700">
                  <p className="font-semibold mb-1">Subscription Summary</p>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">Provider:</span>{" "}
                      {providers.find((p) => p.id === selectedProvider)?.fullName}
                    </p>
                    <p>
                      <span className="font-medium">Package:</span>{" "}
                      {selectedPackageDetails.name}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      {selectedPackageDetails.duration}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span> ₦
                      {selectedPackageDetails.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !verified || !selectedPackage || !phoneNumber}
            className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing Subscription..." : selectedPackageDetails ? `Subscribe for ₦${selectedPackageDetails.price.toLocaleString()}` : "Subscribe Now"}
          </button>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <FaInfoCircle className="text-red-600" />
          Important Information
        </h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-red-600 mt-1">•</span>
            <span>Ensure your smart card/IUC number is correct before verification</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 mt-1">•</span>
            <span>Subscription is activated instantly after successful payment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 mt-1">•</span>
            <span>You can renew your subscription before it expires</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 mt-1">•</span>
            <span>Contact support if you don't receive confirmation within 5 minutes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 mt-1">•</span>
            <span>Keep your transaction reference for future inquiries</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CablePage;
