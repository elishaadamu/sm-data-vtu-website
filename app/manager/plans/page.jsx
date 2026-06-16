"use client";
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import { API_CONFIG, apiUrl } from "@/configs/api";
import {
  FaEdit,
  FaPlus,
  FaSearch,
  FaRedo,
  FaTrash,
  FaEllipsisV,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { formatCurrency, unwrapList } from "@/lib/managerTransactions";

const NETWORKS = ["MTN", "AIRTEL", "9MOBILE", "GLO"];
const NETWORK_COLORS = {
  MTN: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-400" },
  AIRTEL: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-400" },
  "9MOBILE": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-400" },
  GLO: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
};

const emptyForm = {
  network: "",
  planId: "",
  planName: "",
  validity: "",
  price: "",
  isActive: true,
};

// ── Reusable Modal ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, maxWidth = "max-w-lg" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} animate-fade-in overflow-hidden`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-colors text-lg"
        >
          ×
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
const normalizePlan = (plan, index) => {
  const planId =
    plan?.planId ?? plan?.plan_id ?? plan?.planID ?? plan?.plan_code ?? plan?.code ?? "";
  const _id = plan?._id ?? plan?.id ?? "";

  return {
    _id,
    key: _id || planId || `plan-${index}`,
    network: plan?.network ?? plan?.networkName ?? plan?.network_name ?? "N/A",
    planId,
    planName:
      plan?.planName ?? plan?.plan_name ?? plan?.name ?? plan?.label ?? plan?.data_plan ?? "Data Plan",
    validity: plan?.validity ?? plan?.duration ?? plan?.validity_days ?? "N/A",
    price: plan?.price ?? plan?.amount ?? plan?.sellingPrice ?? plan?.selling_price ?? "",
    isActive: plan?.isActive ?? plan?.active ?? true,
  };
};

const planPayload = (formData, includeStatus = false) => {
  const payload = {
    network: formData.network,
    planId: formData.planId.trim(),
    planName: formData.planName.trim(),
    validity: formData.validity.trim(),
    price: Number(formData.price),
  };
  if (includeStatus) payload.isActive = Boolean(formData.isActive);
  return payload;
};

// ── Toggle Switch ──────────────────────────────────────────────────────────────
const ToggleSwitch = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    className="group flex items-center gap-2.5 disabled:opacity-50"
    aria-label={label}
  >
    <div
      className={`relative w-10 h-[22px] rounded-full transition-colors duration-300 ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <div
        className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
          checked ? "left-[22px]" : "left-[3px]"
        }`}
      />
    </div>
    <span
      className={`text-xs font-bold uppercase tracking-wide transition-colors ${
        checked ? "text-emerald-600" : "text-slate-400"
      }`}
    >
      {checked ? "Active" : "Inactive"}
    </span>
  </button>
);

// ── Network Badge ──────────────────────────────────────────────────────────────
const NetworkBadge = ({ network }) => {
  const c = NETWORK_COLORS[network] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${c.bg} ${c.text} ${c.border} border`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {network}
    </span>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
export default function ManagePlans() {
  const { managerData } = useAppContext();
  const adminUserId = managerData?._id || managerData?.id;

  const [plans, setPlans] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [planIdSearch, setPlanIdSearch] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [lastEndpoint, setLastEndpoint] = useState(API_CONFIG.ENDPOINTS.DATA.GET_ALL);

  // Action dropdown
  const [menuOpen, setMenuOpen] = useState(null); // plan key
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPlans = useCallback(async (endpoint, successMessage) => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl(endpoint || lastEndpoint));
      setPlans(unwrapList(response.data, ["plans", "dataPlans"]));
      setLastEndpoint(endpoint || lastEndpoint);
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      console.error("Error fetching data plans:", error);
      setPlans([]);
      toast.error(error?.response?.data?.message || "Unable to fetch data plans.");
    } finally {
      setLoading(false);
    }
  }, [lastEndpoint]);

  useEffect(() => {
    fetchPlans(API_CONFIG.ENDPOINTS.DATA.GET_ALL);
  }, []);

  // Close menu on outside click, scroll, and resize
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    const handleScroll = () => {
      setMenuOpen(null);
    };
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll, true);
    };
  }, []);

  const normalizedPlans = useMemo(
    () => plans.map((plan, index) => normalizePlan(plan, index)),
    [plans],
  );

  const refreshPlans = () => fetchPlans(lastEndpoint);

  const ensureAdmin = () => {
    if (adminUserId) return true;
    toast.error("Manager account not found. Please log in again.");
    return false;
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingPlan(null);
  };

  // ── Submit (create / edit) ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ensureAdmin()) return;
    if (!formData.network || !formData.planId || !formData.planName || !formData.validity || !formData.price) {
      toast.error("Please fill in all plan fields.");
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingPlan) {
        await axios.put(
          apiUrl(`${API_CONFIG.ENDPOINTS.DATA.UPDATE_PLAN}${encodeURIComponent(editingPlan._id)}/${adminUserId}`),
          planPayload(formData, true),
        );
        toast.success("Plan updated successfully.");
      } else {
        await axios.post(
          apiUrl(`${API_CONFIG.ENDPOINTS.DATA.CREATE_PLAN}${adminUserId}`),
          planPayload(formData),
        );
        toast.success("Plan created successfully.");
      }
      resetForm();
      await refreshPlans();
    } catch (error) {
      console.error("Error saving data plan:", error);
      toast.error(error?.response?.data?.message || "Unable to save data plan.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const startEdit = (plan) => {
    setMenuOpen(null);
    setEditingPlan(plan);
    setFormData({
      network: plan.network === "N/A" ? "" : plan.network,
      planId: plan.planId,
      planName: plan.planName,
      validity: plan.validity === "N/A" ? "" : plan.validity,
      price: plan.price,
      isActive: Boolean(plan.isActive),
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget || !ensureAdmin()) return;
    if (!deleteTarget._id) {
      toast.error("This plan is missing a backend ID.");
      return;
    }

    setActionLoading(true);
    try {
      await axios.delete(
        apiUrl(`${API_CONFIG.ENDPOINTS.DATA.DELETE_PLAN}${encodeURIComponent(deleteTarget._id)}/${adminUserId}`),
      );
      toast.success("Plan deleted successfully.");
      setDeleteTarget(null);
      await refreshPlans();
    } catch (error) {
      console.error("Error deleting data plan:", error);
      toast.error(error?.response?.data?.message || "Unable to delete data plan.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Toggle Active ──────────────────────────────────────────────────────────
  const handleToggle = async (plan) => {
    if (!ensureAdmin()) return;
    if (!plan._id) {
      toast.error("This plan is missing a backend ID.");
      return;
    }

    setActionLoading(true);
    try {
      await axios.patch(
        apiUrl(`${API_CONFIG.ENDPOINTS.DATA.TOGGLE_PLAN_STATUS}${encodeURIComponent(plan._id)}/toggle-status/${adminUserId}`),
      );
      toast.success(`Plan ${plan.isActive ? "deactivated" : "activated"} successfully.`);
      await refreshPlans();
    } catch (error) {
      console.error("Error toggling data plan:", error);
      toast.error(error?.response?.data?.message || "Unable to update plan status.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Filters ────────────────────────────────────────────────────────────────
  const handleNetworkFilter = (network) => {
    setSelectedNetwork(network);
    setPlanIdSearch("");
    fetchPlans(`${API_CONFIG.ENDPOINTS.DATA.GET_BY_NETWORK}${network}`);
  };

  const handlePlanSearch = (e) => {
    e.preventDefault();
    const trimmedPlanId = planIdSearch.trim();
    if (!trimmedPlanId) {
      toast.error("Enter a plan ID to search.");
      return;
    }
    setSelectedNetwork("");
    fetchPlans(
      `${API_CONFIG.ENDPOINTS.DATA.GET_BY_PLAN_ID}${encodeURIComponent(trimmedPlanId)}`
    );
  };

  const handleReset = () => {
    setSelectedNetwork("");
    setPlanIdSearch("");
    fetchPlans(API_CONFIG.ENDPOINTS.DATA.GET_ALL);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Plans</h1>
          <p className="text-slate-500 mt-1">Create, update, activate, and remove live data plans.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">{normalizedPlans.length} plan{normalizedPlans.length !== 1 && "s"}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* ── Create / Edit Form ──────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${editingPlan ? "bg-amber-100" : "bg-blue-100"}`}>
              {editingPlan ? <FaEdit className="text-amber-600 w-3.5 h-3.5" /> : <FaPlus className="text-blue-600 w-3.5 h-3.5" />}
            </div>
            <h2 className="font-bold text-slate-800">{editingPlan ? "Edit Plan" : "Create New Plan"}</h2>
          </div>
          {editingPlan && (
            <button
              onClick={resetForm}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-all"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Network</label>
              <select
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm transition-all"
                required
              >
                <option value="" disabled>Select Network</option>
                {NETWORKS.map((network) => (
                  <option key={network} value={network}>{network}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Plan ID</label>
              <input
                type="text"
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                placeholder="e.g. 1"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Plan Name</label>
              <input
                type="text"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                placeholder="e.g. MTN-1GB"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Validity (Days)</label>
              <input
                type="text"
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                placeholder="e.g. 30"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Price (₦)</label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 300"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                required
              />
            </div>
            {editingPlan && (
              <div className="flex items-end pb-1">
                <ToggleSwitch
                  checked={formData.isActive}
                  onChange={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  label="Toggle plan status"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitLoading}
              className={`px-8 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 min-w-[180px] ${
                editingPlan
                  ? "bg-amber-500 hover:bg-amber-600 text-white disabled:bg-amber-300"
                  : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300"
              }`}
            >
              {submitLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {editingPlan ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {editingPlan ? <FaEdit /> : <FaPlus />}
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Network chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-1">Filter:</span>
            {NETWORKS.map((network) => {
              const nc = NETWORK_COLORS[network];
              const isActive = selectedNetwork === network;
              return (
                <button
                  key={network}
                  type="button"
                  onClick={() => handleNetworkFilter(network)}
                  disabled={loading}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isActive
                      ? `${nc.bg} ${nc.text} ${nc.border} ring-2 ring-offset-1 ring-${network === "MTN" ? "yellow" : network === "AIRTEL" ? "red" : "emerald"}-300`
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {network}
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="hidden lg:block flex-1" />

          {/* Search + Reset */}
          <form onSubmit={handlePlanSearch} className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-52">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={planIdSearch}
                onChange={(e) => setPlanIdSearch(e.target.value)}
                placeholder="Search plan ID..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-3 py-2 bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-200 disabled:opacity-60 transition-colors flex items-center gap-1.5"
            >
              <FaRedo className="w-3 h-3" /> Reset
            </button>
          </form>
        </div>
      </div>

      {/* ── Plans Table ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Loading overlay */}
        {loading && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2.5">
            <FaSpinner className="animate-spin text-blue-500 w-4 h-4" />
            <span className="text-sm text-blue-600 font-medium">Loading plans...</span>
          </div>
        )}

        <div className="w-full overflow-x-auto overflow-y-auto max-h-[520px]">
          <table className="min-w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Network</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Plan ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Validity</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Price</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center bg-slate-50">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right bg-slate-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {normalizedPlans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center gap-3">
                        <FaSpinner className="animate-spin text-slate-300 w-8 h-8" />
                        <span className="text-slate-400 text-sm">Fetching plans...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <FaSearch className="text-slate-300 w-5 h-5" />
                        </div>
                        <span className="text-slate-400 font-medium">No data plans found.</span>
                        <span className="text-slate-300 text-xs">Create a new plan or adjust your filters.</span>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                normalizedPlans.map((plan) => (
                  <tr key={plan.key} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-5 py-4">
                      <NetworkBadge network={plan.network} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                        {plan.planId || "N/A"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{plan.planName}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {plan.validity}{plan.validity !== "N/A" && " days"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-blue-600">{formatCurrency(plan.price)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <ToggleSwitch
                          checked={plan.isActive}
                          onChange={() => handleToggle(plan)}
                          disabled={actionLoading}
                          label={`Toggle ${plan.planName}`}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            if (menuOpen === plan.key) {
                              setMenuOpen(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const dropdownHeight = 152; // ~3 items
                              const dropdownWidth = 176; // w-44
                              const spaceBelow = window.innerHeight - rect.bottom;
                              const spaceAbove = rect.top;
                              
                              let top = rect.bottom + 6;
                              if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                                top = rect.top - dropdownHeight - 6;
                              }
                              
                              let left = rect.right - dropdownWidth;
                              if (left < 12) {
                                left = 12;
                              }
                              
                              setMenuPos({ top, left });
                              setMenuOpen(plan.key);
                            }
                          }}
                          className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:shadow-sm flex items-center justify-center transition-all"
                          aria-label="Open actions"
                        >
                          <FaEllipsisV className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Floating Action Dropdown ───────────────────────────────────────── */}
      {menuOpen && (() => {
        const plan = normalizedPlans.find((p) => p.key === menuOpen);
        if (!plan) return null;
        return (
          <>
            {/* Invisible backdrop to close */}
            <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(null)} />
            <div
              ref={menuRef}
              className="fixed z-[100] w-44 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in"
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              <button
                onClick={() => startEdit(plan)}
                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <FaEdit className="w-3.5 h-3.5 text-amber-500" />
                Edit Plan
              </button>
              <button
                onClick={() => {
                  setMenuOpen(null);
                  handleToggle(plan);
                }}
                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                {plan.isActive ? (
                  <>
                    <FaToggleOff className="w-3.5 h-3.5 text-slate-400" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <FaToggleOn className="w-3.5 h-3.5 text-emerald-500" />
                    Activate
                  </>
                )}
              </button>
              <div className="border-t border-slate-100" />
              <button
                onClick={() => {
                  setMenuOpen(null);
                  setDeleteTarget(plan);
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
              >
                <FaTrash className="w-3.5 h-3.5" />
                Delete Plan
              </button>
            </div>
          </>
        );
      })()}

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      {deleteTarget && (
        <Modal title="Delete Data Plan" onClose={() => setDeleteTarget(null)} maxWidth="max-w-sm">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <FaExclamationTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-slate-700 font-medium mb-1">Are you sure you want to delete</p>
            <p className="text-lg font-bold text-slate-900 mb-1">{deleteTarget.planName}</p>
            <p className="text-xs text-slate-400 mb-6">
              {deleteTarget.network} · {formatCurrency(deleteTarget.price)} · {deleteTarget.validity} days
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
