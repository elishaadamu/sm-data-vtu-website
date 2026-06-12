"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { message, Card, Tabs, Spin } from "antd";
import { decryptData } from "@/lib/encryption";
import { 
  LockOutlined, 
  SafetyCertificateOutlined, 
  SyncOutlined 
} from "@ant-design/icons";

const Header = ({ title }) => (
  <div className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg p-6 mb-6">
    <div className="flex items-center space-x-3">
      <SafetyCertificateOutlined className="text-2xl text-white" />
      <h1 className="text-3xl font-bold text-white">{title}</h1>
    </div>
    <p className="text-gray-300 mt-2">
      Secure your account with a 4-digit PIN for enhanced security
    </p>
  </div>
);

const PinInput = ({ 
  length = 4, 
  onChange, 
  disabled = false,
  value = "",
  className = "",
  autoFocus = false 
}) => {
  const [pin, setPin] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  // Sync external value with internal state
  useEffect(() => {
    if (value && value.length === length) {
      const newPin = value.split("");
      setPin(newPin);
    } else if (!value) {
      setPin(new Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const { value: inputValue } = e.target;
    
    // Only allow single digits
    if (/^[0-9]$/.test(inputValue) || inputValue === "") {
      const newPin = [...pin];
      newPin[index] = inputValue;
      setPin(newPin);
      
      const pinString = newPin.join("");
      onChange(pinString);

      // Auto-focus next input
      if (inputValue && index < length - 1) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 10);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();
    
    if (paste.length === length && /^[0-9]+$/.test(paste)) {
      const newPin = paste.split("");
      setPin(newPin);
      onChange(paste);
      inputRefs.current[length - 1]?.focus();
    } else {
      message.warning(`Please paste exactly ${length} digits`);
    }
  };

  return (
    <div className={`flex justify-center space-x-3 ${className}`}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="password"
          maxLength="1"
          value={pin[index]}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          autoFocus={autoFocus && index === 0}
          className="w-14 h-14 text-center text-2xl font-bold 
                   border-2 border-gray-300 rounded-xl
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                   transition-all duration-200
                   disabled:bg-gray-100 disabled:cursor-not-allowed
                   shadow-sm hover:border-gray-400"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      ))}
    </div>
  );
};

const PinFormCard = ({ title, icon, children }) => (
  <Card
    className="shadow-lg border-0 rounded-2xl"
    styles={{
      body: { padding: 0 }
    }}
  >
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          {React.cloneElement(icon, { className: "text-2xl text-blue-600" })}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  </Card>
);

const SetPinForm = () => {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const decryptedData = decryptData(user);
        setUserId(decryptedData.id);
      } catch (error) {
        console.error("Failed to decrypt user data:", error);
        message.error("Failed to load user data");
      }
    }
  }, []);

  const validatePins = () => {
    if (newPin.length !== 4) {
      message.error("PIN must be exactly 4 digits");
      return false;
    }
    
    if (newPin !== confirmPin) {
      message.error("PINs do not match");
      return false;
    }
    
    // Check for simple patterns
    const isSequential = /^(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)$/.test(newPin);
    const isRepeated = /^(\d)\1{3}$/.test(newPin);
    
    if (isSequential) {
      message.warning("Avoid sequential numbers for better security");
      return false;
    }
    
    if (isRepeated) {
      message.warning("Avoid repeated numbers for better security");
      return false;
    }
    
    return true;
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    
    if (!validatePins()) return;
    
    setLoading(true);
    
    try {
      await axios.post(
        apiUrl(`${API_CONFIG.ENDPOINTS.SECURITY.SET_PIN}/${userId}`),
        { newPin },
        { timeout: 10000 }
      );
      
      message.success({
        content: "PIN set successfully!",
        icon: <SafetyCertificateOutlined />,
        duration: 3,
      });
      
      setNewPin("");
      setConfirmPin("");
      
    } catch (error) {
      console.error("Error setting PIN:", error);
      
      let errorMessage = "Failed to set PIN";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection";
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = newPin.length === 4 && confirmPin.length === 4;

  return (
    <PinFormCard
      title="Set New PIN"
      icon={<LockOutlined />}
    >
      <form onSubmit={handleSetPin} className="space-y-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Create a 4-digit PIN for account security
          </label>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Enter New PIN
              </label>
              <PinInput
                length={4}
                value={newPin}
                onChange={setNewPin}
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Use 4 unique digits for better security
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Confirm PIN
              </label>
              <PinInput
                length={4}
                value={confirmPin}
                onChange={setConfirmPin}
                disabled={loading}
              />
              {confirmPin && newPin === confirmPin && confirmPin.length === 4 && (
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <SafetyCertificateOutlined className="mr-1" />
                  PINs match
                </p>
              )}
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 
                   text-white font-semibold rounded-xl
                   hover:from-blue-700 hover:to-blue-800
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200
                   shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Spin size="small" className="mr-2" />
              Setting PIN...
            </span>
          ) : (
            "Set PIN"
          )}
        </button>
        
        <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
          <p className="flex items-center">
            <SafetyCertificateOutlined className="mr-2" />
            Your PIN is encrypted and stored securely
          </p>
          <p>• Avoid obvious patterns like 1234 or 0000</p>
          <p>• Don't share your PIN with anyone</p>
          <p>• Change your PIN regularly for maximum security</p>
        </div>
      </form>
    </PinFormCard>
  );
};

const UpdatePinForm = () => {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const decryptedData = decryptData(user);
        setUserId(decryptedData.id);
      } catch (error) {
        console.error("Failed to decrypt user data:", error);
        message.error("Failed to load user data");
      }
    }
  }, []);

  const validatePins = () => {
    if (oldPin.length !== 4 || newPin.length !== 4) {
      message.error("PIN must be exactly 4 digits");
      return false;
    }
    
    if (oldPin === newPin) {
      message.error("New PIN must be different from old PIN");
      return false;
    }
    
    if (newPin !== confirmPin) {
      message.error("New PINs do not match");
      return false;
    }
    
    return true;
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    
    if (!validatePins()) return;
    
    setLoading(true);
    
    try {
      await axios.put(
        apiUrl(`${API_CONFIG.ENDPOINTS.SECURITY.UPDATE_PIN}/${userId}`),
        { oldPin, newPin },
        { timeout: 10000 }
      );
      
      message.success({
        content: "PIN updated successfully!",
        icon: <SafetyCertificateOutlined />,
        duration: 3,
      });
      
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
      
    } catch (error) {
      console.error("Error updating PIN:", error);
      
      let errorMessage = "Failed to update PIN";
      if (error.response?.status === 401) {
        errorMessage = "Incorrect current PIN";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = oldPin.length === 4 && newPin.length === 4 && confirmPin.length === 4;

  return (
    <PinFormCard
      title="Update PIN"
      icon={<SyncOutlined />}
    >
      <form onSubmit={handleUpdatePin} className="space-y-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Current PIN
            </label>
            <PinInput
              length={4}
              value={oldPin}
              onChange={setOldPin}
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className="space-y-6 pt-4 border-t">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                New PIN
              </label>
              <PinInput
                length={4}
                value={newPin}
                onChange={setNewPin}
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Confirm New PIN
              </label>
              <PinInput
                length={4}
                value={confirmPin}
                onChange={setConfirmPin}
                disabled={loading}
              />
              {confirmPin && newPin === confirmPin && confirmPin.length === 4 && (
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <SafetyCertificateOutlined className="mr-1" />
                  PINs match
                </p>
              )}
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 
                   text-white font-semibold rounded-xl
                   hover:from-gray-900 hover:to-black
                   focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200
                   shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Spin size="small" className="mr-2" />
              Updating PIN...
            </span>
          ) : (
            "Update PIN"
          )}
        </button>
      </form>
    </PinFormCard>
  );
};

const PinManagementPage = () => {
  const [activeTab, setActiveTab] = useState("set-pin");

  const tabItems = [
    {
      key: "set-pin",
      label: (
        <span className="flex items-center space-x-2">
          <LockOutlined />
          <span>Set PIN</span>
        </span>
      ),
      children: <SetPinForm />
    },
    {
      key: "update-pin",
      label: (
        <span className="flex items-center space-x-2">
          <SyncOutlined />
          <span>Update PIN</span>
        </span>
      ),
      children: <UpdatePinForm />
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header title="PIN Management" />
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 border-r border-gray-200 bg-gray-50 p-6">
              <div className="sticky top-6 space-y-2">
                {tabItems.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full px-4 py-3 text-left rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === tab.key
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Mobile Tabs */}
            <div className="md:hidden">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                centered
                className="px-4 pt-4"
                tabBarStyle={{
                  marginBottom: 0,
                }}
              />
            </div>
            
            {/* Content Area - Desktop Only */}
            <div className="hidden md:block flex-1">
              <div className="p-6 md:p-8">
                {activeTab === "set-pin" && <SetPinForm />}
                {activeTab === "update-pin" && <UpdatePinForm />}
              </div>
            </div>
          </div>
        </div>
        
        {/* Security Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <SafetyCertificateOutlined className="mr-2 text-blue-600" />
            Security Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">Strong PIN</h4>
              <p className="text-sm text-gray-600">
                Use a combination that's hard to guess, avoiding birthdays or sequential numbers.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">Regular Updates</h4>
              <p className="text-sm text-gray-600">
                Change your PIN periodically to maintain account security.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">Confidentiality</h4>
              <p className="text-sm text-gray-600">
                Never share your PIN with anyone, including customer support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinManagementPage;