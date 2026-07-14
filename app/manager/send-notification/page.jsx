"use client";
import React, { useState, useEffect } from "react";
import {
  fetchAdminUsers,
  apiSendNotification,
} from "@/lib/adminStore";
import { useAppContext } from "@/context/AppContext";
import {
  FaPaperPlane,
  FaUsers,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function SendNotification() {
  const { managerData } = useAppContext();
  const adminId = managerData?._id || managerData?.id;

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAll, setTargetAll] = useState(true);

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    // Only fetch users if we want to target specific users
    if (!targetAll && allUsers.length === 0 && adminId) {
      loadUsers();
    }
  }, [targetAll, adminId]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await fetchAdminUsers(adminId);
      const list = Array.isArray(data) ? data : data?.users || [];
      setAllUsers(list);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleToggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredUsers.map((u) => u._id || u.id || "");
    setSelectedUserIds((prev) => {
      const newSelections = [...prev];
      filteredIds.forEach((id) => {
        if (!newSelections.includes(id)) {
          newSelections.push(id);
        }
      });
      return newSelections;
    });
  };

  const handleDeselectAllFiltered = () => {
    const filteredIds = filteredUsers.map((u) => u._id || u.id || "");
    setSelectedUserIds((prev) =>
      prev.filter((id) => !filteredIds.includes(id))
    );
  };

  const filteredUsers = allUsers.filter((user) => {
    const fullName = (user.fullName || user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const phone = (user.phone || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search)
    );
  });

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!adminId) {
      toast.error("You must be logged in as an administrator.");
      return;
    }

    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required.");
      return;
    }

    if (!targetAll && selectedUserIds.length === 0) {
      toast.error("Please select at least one user to notify.");
      return;
    }

    try {
      setIsSending(true);
      const payload = {
        title: title.trim(),
        message: message.trim(),
        userIds: targetAll ? [] : selectedUserIds,
        targetAll,
      };

      await apiSendNotification(adminId, payload);
      toast.success("Notification sent successfully!");

      // Reset form
      setTitle("");
      setMessage("");
      setSearchTerm("");
      if (!targetAll) {
        setTargetAll(true);
        setSelectedUserIds([]);
      }
    } catch (error) {
      toast.error(error.message || "Failed to send notification.");
    } finally {
      setIsSending(false);
    }
  };

  const getUserInitials = (user) => {
    const name = user.fullName || user.name || "";
    if (!name) return "?";
    const parts = name.split(" ");
    const first = parts[0] ? parts[0].charAt(0).toUpperCase() : "";
    const last = parts[1] ? parts[1].charAt(0).toUpperCase() : "";
    return `${first}${last}` || "?";
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FaPaperPlane className="text-blue-600 w-6 h-6" />
          Send General Notification
        </h1>
        <p className="text-slate-500 mt-1">
          Broadcast message to all users or select specific users.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
        <form onSubmit={handleSendNotification} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Notification Title
            </label>
            <input
              type="text"
              placeholder="e.g. System Maintenance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white placeholder-slate-400 font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Notification Message
            </label>
            <textarea
              placeholder="Type notification content..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white placeholder-slate-400 font-medium transition-all resize-y"
            />
          </div>

          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={targetAll}
                onChange={(e) => setTargetAll(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-850 flex items-center gap-2">
                  <FaUsers className="text-slate-500" />
                  Target All Users
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sends this notification to every user registered on the portal.
                </p>
              </div>
            </label>

            {!targetAll && (
              <div className="mt-5 pt-5 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Select Specific Recipients ({selectedUserIds.length} selected)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Search and select users.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      disabled={filteredUsers.length === 0}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-50 transition-colors"
                    >
                      Select Visible
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllFiltered}
                      disabled={filteredUsers.length === 0}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-50 transition-colors"
                    >
                      Deselect Visible
                    </button>
                  </div>
                </div>

                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white placeholder-slate-400 transition-all text-sm"
                  />
                </div>

                {isLoadingUsers ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <FaSpinner className="animate-spin w-6 h-6 text-blue-500" />
                    <span className="text-xs font-medium">Fetching users...</span>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1 scrollbar-thin">
                    {filteredUsers.map((user) => {
                      const id = user._id || user.id || "";
                      const isSelected = selectedUserIds.includes(id);
                      return (
                        <div
                          key={id}
                          onClick={() => handleToggleUser(id)}
                          className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/40"
                              : "border-slate-200 hover:border-blue-200 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="pointer-events-none w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {getUserInitials(user)}
                          </div>
                          <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {user.fullName || user.name || "—"}
                            </p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {user.email || user.phone || "—"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl flex items-center gap-2 text-sm font-semibold">
                    <FaExclamationTriangle className="text-red-500 shrink-0" />
                    No users found matching search criteria.
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSending || (!targetAll && selectedUserIds.length === 0) || !title.trim() || !message.trim()}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
              isSending || (!targetAll && selectedUserIds.length === 0) || !title.trim() || !message.trim()
                ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
            }`}
          >
            {isSending ? (
              <>
                <FaSpinner className="animate-spin w-5 h-5" />
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane className="w-4 h-4" />
                Send Notification
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
