import { addressDummyData } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import PinInput from "./PinInput";
import Swal from "sweetalert2";
import {
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaShippingFast,
  FaTag,
  FaLock,
} from "react-icons/fa";

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    userData,
    cartItems,
    products,
    states,
  } = useAppContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Delivery logic states
  const [deliveryState, setDeliveryState] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingPercentage, setShippingPercentage] = useState(0);
  const [isInterState, setIsInterState] = useState(false);
  const [interStateAddress, setInterStateAddress] = useState("");

  // Coupon logic states
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [finalAmount, setFinalAmount] = useState(null);

  const createOrder = async () => {
    if (!pin || pin.length !== 4) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter your 4-digit transaction PIN.",
      });
      return;
    }
    setLoading(true);

    if (!deliveryState) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please select a delivery state.",
      });
      setLoading(false);
      return;
    }

    if (isInterState && !interStateAddress) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter the inter-state delivery address.",
      });
      setLoading(false);
      return;
    }

    const orderProducts = Object.keys(cartItems)
      .map((itemId) => {
        const product = products.find((p) => p._id === itemId);
        if (product && cartItems[itemId] > 0) {
          return {
            productId: product._id,
            name: product.name,
            quantity: cartItems[itemId],
            price: product.price,
            vendorId: product.vendor?._id,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (orderProducts.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Empty Cart",
        text: "Your cart is empty.",
      });
      setLoading(false);
      return;
    }

    const subtotal = getCartAmount();
    const tax = Math.floor(subtotal * 0.02);
    const totalAmount =
      finalAmount !== null
        ? finalAmount
        : subtotal + shippingFee + tax - couponDiscount;

    const vendorId = orderProducts[0]?.vendorId;
    const payload = {
      userId: userData?.id,
      vendorId: vendorId,
      products: orderProducts,
      deliveryAddress: isInterState
        ? interStateAddress
        : addresses.shippingAddress,
      state: deliveryState,
      zipcode: addresses.zipCode,
      shippingFee: shippingFee,
      tax: tax,
      phone: userData?.phone,
      pin,
      totalAmount: totalAmount,
      couponCode: couponDiscount > 0 ? couponCode : null,
    };
    console.log(payload);
    if (!payload.vendorId) {
      Swal.fire({
        icon: "error",
        title: "Order Error",
        text: "Could not determine vendor for this order.",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.ORDER.CREATE),
        payload
      );
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Order placed successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      if (userData.id === "vendor") {
        router.push("vendor-dashboard/orders/pending");
      } else {
        router.push("dashboard/orders/pending");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to place order. Please try again.";
      Swal.fire({ icon: "error", title: "Order Failed", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setPageLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET)}/${userData.id}`
      );

      setAddresses(response.data.user || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch shipping addresses.",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      Swal.fire({
        icon: "error",
        title: "Input Required",
        text: "Please enter a coupon code.",
      });
      return;
    }
    setCouponLoading(true);
    try {
      const subtotal = getCartAmount();
      const tax = Math.floor(subtotal * 0.02);
      const totalOrderAmount = subtotal + shippingFee + tax;
      const payload = { code: couponCode, orderAmount: totalOrderAmount };

      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.COUPON.VALIDATE),
        payload
      );

      const { discountAmount, finalAmount: apiFinalAmount } =
        response.data.coupon;
      setCouponDiscount(discountAmount || 0);
      setFinalAmount(apiFinalAmount || null);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Coupon applied successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error validating coupon:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to validate coupon. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Coupon Error",
        text: errorMessage,
      });
      setCouponDiscount(0);
      setCouponCode("");
      setFinalAmount(null);
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchAddresses();
    }
  }, []);

  useEffect(() => {
    const cartAmount = getCartAmount();
    if (deliveryState && addresses.shippingState) {
      if (deliveryState === addresses.shippingState) {
        setShippingPercentage(5);
        setShippingFee(Math.floor(cartAmount * 0.05));
        setIsInterState(false);
      } else {
        setShippingPercentage(10);
        setShippingFee(Math.floor(cartAmount * 0.1));
        setIsInterState(true);
      }
    } else {
      setShippingFee(0);
      setShippingPercentage(0);
      setIsInterState(false);
    }
  }, [deliveryState, addresses.shippingState, getCartAmount]);

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FaShippingFast className="text-blue-600 text-xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
      </div>

      <hr className="border-gray-200 my-6" />

      {/* Shipping Information Section */}
      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaMapMarkerAlt className="text-red-500" />
          Shipping Information
        </legend>

        <div className="space-y-4">
          {/* Shipping From */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Shipping From
            </label>
            <div className="relative inline-block w-full">
              <div
                className="peer w-full text-left px-4 pr-3 py-3 bg-gray-50 text-gray-700 rounded-lg border border-gray-300 flex justify-between items-center cursor-pointer transition-all hover:border-gray-400"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex-1">
                  <span className="block text-gray-900 font-medium">
                    {addresses.shippingAddress || "Select Address"}
                  </span>
                  {addresses.shippingState && (
                    <span className="text-sm text-gray-500">
                      {addresses.shippingState} State • {addresses.zipCode}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="absolute w-full bg-white border border-gray-300 shadow-lg mt-2 z-10 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="font-medium text-gray-900">
                        {userData.firstName} {userData.lastName}
                      </div>
                      <div>{addresses.shippingAddress}</div>
                      <div>
                        {addresses.shippingState} State • {addresses.zipCode}
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => router.push("/dashboard/shipping")}
                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer text-center text-blue-600 font-medium transition-colors"
                  >
                    Edit Shipping Address
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery State Selection */}
          <div>
            <label
              htmlFor="delivery-state"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Delivery To <span className="text-red-500">*</span>
            </label>
            <select
              id="delivery-state"
              value={deliveryState}
              onChange={(e) => setDeliveryState(e.target.value)}
              className="w-full outline-none p-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50"
              required
            >
              <option value="" disabled className="text-gray-400">
                Select delivery state
              </option>
              {states.map((s) => (
                <option key={s} value={s} className="text-gray-700">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Inter-state Address Form */}
          {isInterState && (
            <div className="animate-fadeIn">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Inter-State Delivery Address{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={interStateAddress}
                onChange={(e) => setInterStateAddress(e.target.value)}
                placeholder="Enter the full delivery address for the selected state..."
                className="w-full outline-none p-3 text-gray-700 border border-gray-300 resize-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50"
                rows="3"
              />
            </div>
          )}
        </div>
      </fieldset>

      <hr className="border-gray-200 my-6" />

      {/* Cost Breakdown Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-800 mb-4">
          Cost Breakdown
        </legend>
        <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <p className="text-gray-600">Items ({getCartCount()})</p>
            <p className="font-medium text-gray-800">
              {currency}
              {getCartAmount().toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between items-center py-2">
            <p className="text-gray-600">
              Shipping Fee
              {shippingPercentage > 0 && ` (${shippingPercentage}%)`}
            </p>
            <p className="font-medium text-gray-800">
              {currency}
              {shippingFee.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between items-center py-2">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {Math.floor(getCartAmount() * 0.02).toFixed(2)}
            </p>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between items-center py-2 text-green-600 bg-green-50 -mx-4 px-4 border-y border-green-100">
              <p className="font-medium">Discount Applied</p>
              <p className="font-bold">
                -{currency}
                {couponDiscount.toFixed(2)}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-300 pt-4 mt-2">
          <p>Order Total</p>
          <p className="text-blue-600 text-xl">
            {currency}
            {(finalAmount !== null
              ? finalAmount
              : getCartAmount() +
                shippingFee +
                Math.floor(getCartAmount() * 0.02) -
                couponDiscount
            ).toFixed(2)}
          </p>
        </div>
      </fieldset>

      <hr className="border-gray-200 my-6" />

      {/* Coupon Section */}
      <fieldset className="space-y-3">
        <label className="text-sm font-medium text-gray-700 block flex items-center gap-2">
          <FaTag className="text-green-500" />
          Have a coupon?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 outline-none p-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={couponDiscount > 0}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={couponLoading || !couponCode || couponDiscount > 0}
            className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all whitespace-nowrap min-w-[100px]"
          >
            {couponLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Applying
              </div>
            ) : (
              "Apply"
            )}
          </button>
        </div>
        {couponDiscount > 0 && (
          <p className="text-green-600 text-sm font-medium flex items-center gap-1">
            ✓ Coupon applied successfully! You saved {currency}
            {couponDiscount.toFixed(2)}
          </p>
        )}
      </fieldset>

      <hr className="border-gray-200 my-6" />

      {/* Payment Section */}
      <fieldset className="space-y-3">
        <label className="text-sm font-medium text-gray-700 block flex items-center gap-2">
          <FaLock className="text-red-500" />
          Transaction PIN <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <PinInput
              length={4}
              onChange={setPin}
              inputType={showPin ? "text" : "password"}
              className="justify-center"
            />
          </div>

          {/* Enhanced Toggle Button */}
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full border border-gray-300 shadow-sm hover:shadow-md"
            title={showPin ? "Hide PIN" : "Show PIN"}
          >
            {showPin ? (
              <FaEyeSlash className="w-4 h-4" />
            ) : (
              <FaEye className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Enter your 4-digit transaction PIN to complete the order
        </p>
      </fieldset>

      {/* Place Order Button */}
      <button
        onClick={createOrder}
        disabled={loading || !pin || pin.length !== 4}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 mt-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Placing Order...
          </div>
        ) : (
          `Place Order • ${currency}${(finalAmount !== null
            ? finalAmount
            : getCartAmount() +
              shippingFee +
              Math.floor(getCartAmount() * 0.02) -
              couponDiscount
          ).toFixed(2)}`
        )}
      </button>
    </div>
  );
};

export default OrderSummary;
