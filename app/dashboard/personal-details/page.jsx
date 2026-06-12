"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { decryptData, encryptData } from "@/lib/encryption";
import { ToastContainer, toast } from "react-toastify";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { FaUserEdit } from "react-icons/fa";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";

const FormField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  readOnly = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    {isEditing && !readOnly ? (
      type === "textarea" ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          rows="3"
          className="mt-1 p-3 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-0 sm:text-sm transition"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          className="mt-1 p-3 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-0 sm:text-sm transition"
        />
      )
    ) : (
      <p className="mt-1 p-3 text-gray-900 font-medium p-2 bg-gray-50 rounded-md min-h-[42px]">
        {value || <span className="text-gray-400">Not provided</span>}
      </p>
    )}
  </div>
);

const PersonalDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    businessDesc: "",
    avatar: null,
    banner: null,
  });

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const encryptedUser = localStorage.getItem("user");

        if (encryptedUser) {
          const userData = decryptData(encryptedUser);
          console.log("My details", userData);
          setProfile(userData);
        }
      } finally {
        setPageLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const encryptedUser = localStorage.getItem("user");
      const userData = decryptData(encryptedUser);

      const response = await axios.get(
        `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET)}/${userData._id}`
      );
      console.log("Profile data", response.data);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const encryptedUser = localStorage.getItem("user");
      const userData = decryptData(encryptedUser);

      let payload;
      if (userData.role === "vendor") {
        payload = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          address: profile.address,
          businessName: profile.businessName,
          businessDesc: profile.businessDesc,
        };
        console.log(payload);
      } else {
        const { role, ...userPayload } = profile;
        payload = userPayload;
      }

      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.UPDATE_USER)}/${userData._id}`,
        payload
      );

      if (response.data) {
        // Update the stored user data
        const updatedUser = {
          ...userData,
          ...profile,
        };
        localStorage.setItem("user", encryptData(updatedUser));

        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Personal Details
            </h1>
            <p className="text-gray-500 mt-1 p-3">
              Manage and protect your account.
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <FaUserEdit />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <FormField
            label="First Name"
            name="firstName"
            value={profile.firstName}
            isEditing={isEditing}
            onChange={handleInputChange}
          />
          <FormField
            label="Last Name"
            name="lastName"
            value={profile.lastName}
            isEditing={isEditing}
            onChange={handleInputChange}
          />
          <FormField
            label="Email"
            name="email"
            value={profile.email}
            isEditing={isEditing}
            readOnly
          />
          <FormField
            label="Phone Number"
            name="phone"
            value={profile.phone}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="tel"
          />
          <div className="md:col-span-2">
            <FormField
              label="Address"
              name="address"
              value={profile.address}
              isEditing={isEditing}
              onChange={handleInputChange}
              type="textarea"
            />
          </div>

          {profile.role === "vendor" && (
            <>
              <div className="md:col-span-2 pt-4 border-t mt-4">
                <h2 className="text-xl font-bold text-gray-700">
                  Business Information
                </h2>
              </div>
              <div className="md:col-span-2">
                <FormField
                  label="Business Name"
                  name="businessName"
                  value={profile.businessName}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  label="Business Description"
                  name="businessDesc"
                  value={profile.businessDesc}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  type="textarea"
                />
              </div>
            </>
          )}

          <div className="md:col-span-2 pt-4 border-t mt-4">
            <FormField
              label="Role"
              name="role"
              value={profile.role}
              isEditing={false}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end mt-8 pt-6 border-t">
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDetails;
