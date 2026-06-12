"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { message } from "antd";
import { useAppContext } from "@/context/AppContext";
import { apiUrl, API_CONFIG } from "@/configs/api";
import {
  FaWallet,
  FaBolt,
  FaRegMoneyBillAlt,
  FaIdCard,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { MdElectricBolt } from "react-icons/md";

const ElectricPage = () => {
  const { userData } = useAppContext();
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedDisco, setSelectedDisco] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [meterType, setMeterType] = useState("");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Nigerian Electricity Distribution Companies
  const discos = [
    { id: "aedc", name: "AEDC", fullName: "Abuja Electricity Distribution Company" },
    { id: "ekedc", name: "EKEDC", fullName: "Eko Electricity Distribution Company" },
    { id: "ikedc", name: "IKEDC", fullName: "Ikeja Electric" },
    { id: "phed", name: "PHED", fullName: "Port Harcourt Electricity Distribution" },
    { id: "jedc", name: "JED", fullName: "Jos Electricity Distribution" },
    { id: "kaedco", name: "KAEDCO", fullName: "Kaduna Electric" },
    { id: "kedco", name: "KEDCO", fullName: "Kano Electricity Distribution" },
    { id: "ibedc", name: "IBEDC", fullName: "Ibadan Electricity Distribution" },
    { id: "eedc", name: "EEDC", fullName: "Enugu Electricity Distribution" },
  ];

  const meterTypes = [
    { value: "prepaid", label: "Prepaid Meter" },
    { value: "postpaid", label: "Postpaid Meter" },
  ];

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

  // Verify meter number
  const handleVerifyMeter = async () => {
    if (!selectedDisco || !meterNumber || !meterType) {
      message.warning("Please select DISCO, meter type, and enter meter number");
      return;
    }

    try {
      setVerifying(true);
      // Simulated verification - replace with actual API call
      // const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.ELECTRIC.VERIFY), {
      //   disco: selectedDisco,
      //   meterNumber,
      //   meterType,
      // });

      // Simulated response
      setTimeout(() => {
        setCustomerName("John Doe"); // Replace with response.data.customerName
        setCustomerAddress("123 Main Street, Lagos"); // Replace with response.data.address
        setVerified(true);
        message.success("Meter verified successfully!");
        setVerifying(false);
      }, 1500);
    } catch (error) {
      console.error("Error verifying meter:", error);
      message.error("Failed to verify meter number. Please check and try again.");
      setVerifying(false);
    }
  };

  // Handle purchase
  const handlePurchase = async (e) => {
    e.preventDefault();

    const userId = userData?.id || userData?._id;
    if (!userId) {
      message.error("User not found. Please log in again.");
      return;
    }

    if (!verified) {
      message.warning("Please verify your meter number first");
      return;
    }

    const payload = {
      disco: selectedDisco,
      meterNumber,
      meterType,
      amount: parseFloat(amount),
      phoneNumber,
      userId,
    };

    console.log("Electric Bill Payment Payload:", payload);

    try {
      setLoading(true);
      // Replace with actual API endpoint
      // const response = await axios.post(
      //   apiUrl(API_CONFIG.ENDPOINTS.ELECTRIC.PURCHASE),
      //   payload
      // );

      // Simulated success
      setTimeout(() => {
        message.success("Electricity bill payment successful!");

        // Reset form
        setSelectedDisco("");
        setMeterNumber("");
        setMeterType("");
        setAmount("");
        setPhoneNumber("");
        setCustomerName("");
        setCustomerAddress("");
        setVerified(false);

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
      console.error("Error processing payment:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to process payment. Please try again."
      );
      setLoading(false);
    }
  };

  // Reset verification when disco, meter number, or meter type changes
  useEffect(() => {
    setVerified(false);
    setCustomerName("");
    setCustomerAddress("");
  }, [selectedDisco, meterNumber, meterType]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-4 rounded-2xl shadow-lg">
            <FaBolt className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
          Electricity Bill Payment
        </h1>
        <p className="text-slate-600 mt-2">
          Pay your electricity bills instantly and securely
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

      {/* Payment Form */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
        <form onSubmit={handlePurchase} className="space-y-6">
          {/* DISCO Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              1. Select Electricity Distribution Company
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {discos.map((disco) => (
                <button
                  key={disco.id}
                  type="button"
                  onClick={() => setSelectedDisco(disco.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedDisco === disco.id
                      ? "border-yellow-500 bg-yellow-50 shadow-md"
                      : "border-slate-200 bg-slate-50 hover:border-yellow-300"
                  }`}
                  title={disco.fullName}
                >
                  <MdElectricBolt className="w-6 h-6 text-yellow-600" />
                  <span className="font-semibold text-slate-800 text-sm">
                    {disco.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Meter Type Selection */}
          {selectedDisco && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                2. Select Meter Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {meterTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setMeterType(type.value)}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                      meterType === type.value
                        ? "border-yellow-500 bg-yellow-50 shadow-md"
                        : "border-slate-200 bg-slate-50 hover:border-yellow-300"
                    }`}
                  >
                    <FaBolt className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-slate-800">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Meter Number Input */}
          {meterType && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                3. Enter Meter Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter your meter number"
                    value={meterNumber}
                    onChange={(e) => setMeterNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyMeter}
                  disabled={verifying || !meterNumber}
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
                    Meter Verified Successfully
                  </p>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="font-medium">Customer Name:</span>{" "}
                      {customerName}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {customerAddress}
                    </p>
                    <p>
                      <span className="font-medium">Meter Type:</span>{" "}
                      {meterType === "prepaid" ? "Prepaid" : "Postpaid"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amount Input */}
          {verified && (
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                4. Enter Amount
              </label>
              <FaRegMoneyBillAlt className="absolute left-4 top-1/2 -translate-y-1/2 mt-3.5 w-5 h-5 text-slate-400" />
              <input
                type="number"
                placeholder="Enter amount (₦)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                step="0.01"
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition"
                required
              />
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[1000, 2000, 5000, 10000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    ₦{quickAmount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Phone Number Input */}
          {amount && (
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                5. Phone Number (for receipt)
              </label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition"
                required
              />
            </div>
          )}



          {/* Info Banner */}
          {amount && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-700">
                  <p className="font-semibold mb-1">Payment Summary</p>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">DISCO:</span>{" "}
                      {discos.find((d) => d.id === selectedDisco)?.fullName}
                    </p>
                    <p>
                      <span className="font-medium">Meter Number:</span>{" "}
                      {meterNumber}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span> ₦
                      {parseFloat(amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !verified || !amount || !phoneNumber}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing Payment..." : `Pay ₦${parseFloat(amount || 0).toLocaleString()}`}
          </button>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <FaInfoCircle className="text-yellow-600" />
          Important Information
        </h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Ensure your meter number is correct before verification</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Tokens are delivered instantly after successful payment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Minimum purchase amount is ₦100</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Keep your transaction receipt for reference</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ElectricPage;
