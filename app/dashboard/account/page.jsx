"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { FaExclamationTriangle, FaPauseCircle, FaTrashAlt } from "react-icons/fa";

export default function AccountControlsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  const getCurrentUser = () => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? decryptData(storedUser) : null;
    if (!user?._id) throw new Error("Your session has expired. Please sign in again.");
    return user;
  };

  const disableAccount = async () => {
    if (!window.confirm("Disable your account? You can contact support to reactivate it later.")) return;
    setLoading("disable");
    try {
      const user = getCurrentUser();
      await axios.put(`${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.UPDATE_USER)}/${user._id}`, { isActive: false });
      localStorage.removeItem("user");
      toast.success("Your account has been disabled.");
      setTimeout(() => router.push("/signin"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to disable your account.");
    } finally {
      setLoading("");
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete your account permanently? This action cannot be undone.")) return;
    setLoading("delete");
    try {
      const user = getCurrentUser();
      await axios.delete(`${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.DELETE)}/${user._id}`);
      localStorage.removeItem("user");
      toast.success("Your account has been deleted.");
      setTimeout(() => router.push("/signup"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to delete your account.");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <ToastContainer />
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Account settings</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Account controls</h1>
        <p className="mt-2 text-slate-500">Choose whether to take a temporary break or permanently remove your SM DATA account.</p>
      </div>

      <div className="space-y-5">
        <section className="border border-amber-200 bg-amber-50 p-6">
          <div className="flex gap-4">
            <FaPauseCircle className="mt-1 h-6 w-6 shrink-0 text-amber-600" />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">Disable account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Temporarily stop access to your account. Your profile and transaction records remain available for reactivation through support.</p>
              <button onClick={disableAccount} disabled={Boolean(loading)} className="mt-5 inline-flex items-center gap-2 bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60">
                <FaPauseCircle /> {loading === "disable" ? "Disabling..." : "Disable account"}
              </button>
            </div>
          </div>
        </section>

        <section className="border border-red-200 bg-white p-6">
          <div className="flex gap-4">
            <FaExclamationTriangle className="mt-1 h-6 w-6 shrink-0 text-red-600" />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">Delete account permanently</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">This permanently removes your account from SM DATA. Completed transaction and financial records may be retained where required by law.</p>
              <button onClick={deleteAccount} disabled={Boolean(loading)} className="mt-5 inline-flex items-center gap-2 border border-red-300 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
                <FaTrashAlt /> {loading === "delete" ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}