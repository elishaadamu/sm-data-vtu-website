"use client";
import { format, subDays, subHours } from "date-fns";
import { API_CONFIG, apiUrl } from "@/configs/api";

// Keys for local storage
const KEYS = {
  USERS: "admin_mock_users",
  PLANS: "admin_mock_plans",
  ORDERS: "admin_mock_orders",
  PAYMENTS: "admin_mock_payments",
};

// --- INITIAL DUMMY DATA ---
const initialUsers = [
  { id: "u1", sn: 1, phone: "08012345678", fullName: "John Doe", email: "john@example.com", balance: 15000, date: format(new Date(), "yyyy-MM-dd") },
  { id: "u2", sn: 2, phone: "08187654321", fullName: "Jane Smith", email: "jane@example.com", balance: 8500, date: format(new Date(), "yyyy-MM-dd") },
  { id: "u3", sn: 3, phone: "09023456789", fullName: "Abiodun Alao", email: "abiodun@example.com", balance: 35000, date: format(subDays(new Date(), 1), "yyyy-MM-dd") },
  { id: "u4", sn: 4, phone: "07098765432", fullName: "Chidi Okafor", email: "chidi@example.com", balance: 2000, date: format(subDays(new Date(), 2), "yyyy-MM-dd") },
  { id: "u5", sn: 5, phone: "08099887766", fullName: "Musa Ibrahim", email: "musa@example.com", balance: 120000, date: format(subDays(new Date(), 5), "yyyy-MM-dd") },
  { id: "u6", sn: 6, phone: "09123456780", fullName: "Amina Yusuf", email: "amina@example.com", balance: 500, date: format(new Date(), "yyyy-MM-dd") },
  { id: "u7", sn: 7, phone: "08055554433", fullName: "Oluwaseun David", email: "seun@example.com", balance: 12500, date: format(subDays(new Date(), 3), "yyyy-MM-dd") },
  { id: "u8", sn: 8, phone: "08111223344", fullName: "Fatima Bello", email: "fatima@example.com", balance: 4500, date: format(new Date(), "yyyy-MM-dd") },
];

const initialPlans = [
  { id: "p1", network: "MTN", type: "Data", planId: "101", name: "MTN SME 1GB", price: 250, duration: "30 days" },
  { id: "p2", network: "MTN", type: "Data", planId: "102", name: "MTN SME 2GB", price: 500, duration: "30 days" },
  { id: "p3", network: "MTN", type: "Data", planId: "103", name: "MTN SME 5GB", price: 1250, duration: "30 days" },
  { id: "p4", network: "Airtel", type: "Data", planId: "201", name: "Airtel CG 1.5GB", price: 400, duration: "30 days" },
  { id: "p5", network: "Airtel", type: "Data", planId: "202", name: "Airtel CG 3GB", price: 800, duration: "30 days" },
  { id: "p6", network: "Glo", type: "Data", planId: "301", name: "Glo Gifting 2GB", price: 600, duration: "30 days" },
  { id: "p7", network: "Glo", type: "Data", planId: "302", name: "Glo Gifting 5GB", price: 1400, duration: "30 days" },
  { id: "p8", network: "9mobile", type: "Data", planId: "401", name: "9mobile 1GB", price: 300, duration: "30 days" },
];

const initialOrders = [
  { id: "TXN-DAT-98274", network: "MTN", type: "Data", amount: "₦250 / 1Gb", phone: "08034567890", agentPhone: "08012345678", status: "Successful", prevBal: 15250, newBal: 15000, date: format(subHours(new Date(), 2), "yyyy-MM-dd HH:mm a") },
  { id: "TXN-AIR-78214", network: "Airtel", type: "Airtime", amount: "₦200 / Airtime", phone: "08187654321", agentPhone: "08187654321", status: "Successful", prevBal: 8700, newBal: 8500, date: format(subHours(new Date(), 4), "yyyy-MM-dd HH:mm a") },
  { id: "TXN-DAT-12789", network: "Glo", type: "Data", amount: "₦1400 / 5Gb", phone: "08055554433", agentPhone: "09023456789", status: "Failed", prevBal: 35000, newBal: 35000, date: format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm a") },
  { id: "TXN-DAT-33455", network: "MTN", type: "Data", amount: "₦500 / 2Gb", phone: "08111223344", agentPhone: "08111223344", status: "Successful", prevBal: 5000, newBal: 4500, date: format(subDays(new Date(), 2), "yyyy-MM-dd HH:mm a") },
  { id: "TXN-AIR-44512", network: "9mobile", type: "Airtime", amount: "₦500 / Airtime", phone: "09023456789", agentPhone: "08012345678", status: "Successful", prevBal: 15500, newBal: 15000, date: format(subDays(new Date(), 4), "yyyy-MM-dd HH:mm a") },
];

const initialPayments = [
  { id: "PAY-MON-87124", amount: 5000, agentPhone: "08012345678", status: "Successful", prevBal: 10000, newBal: 15000, date: format(subHours(new Date(), 5), "yyyy-MM-dd HH:mm a") },
  { id: "PAY-MON-12498", amount: 10000, agentPhone: "09023456789", status: "Successful", prevBal: 25000, newBal: 35000, date: format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm a") },
  { id: "PAY-MON-55612", amount: 2000, agentPhone: "08187654321", status: "Failed", prevBal: 8500, newBal: 8500, date: format(subDays(new Date(), 2), "yyyy-MM-dd HH:mm a") },
  { id: "PAY-MON-77890", amount: 50000, agentPhone: "08099887766", status: "Successful", prevBal: 70000, newBal: 120000, date: format(subDays(new Date(), 4), "yyyy-MM-dd HH:mm a") },
];

// --- INITIALIZATION ---
export const initAdminStore = () => {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(KEYS.USERS)) localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
  if (!localStorage.getItem(KEYS.PLANS)) localStorage.setItem(KEYS.PLANS, JSON.stringify(initialPlans));
  if (!localStorage.getItem(KEYS.ORDERS)) localStorage.setItem(KEYS.ORDERS, JSON.stringify(initialOrders));
  if (!localStorage.getItem(KEYS.PAYMENTS)) localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(initialPayments));
};

// --- USERS ---
export const getAdminUsers = () => {
  if (typeof window === "undefined") return [];
  initAdminStore();
  return JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
};

export const updateAdminUserBalance = (userId, newBalance) => {
  const users = getAdminUsers();
  const updated = users.map((u) => (u.id === userId ? { ...u, balance: Number(newBalance) } : u));
  localStorage.setItem(KEYS.USERS, JSON.stringify(updated));
  return updated;
};

export const deleteAdminUser = (userId) => {
  const users = getAdminUsers();
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem(KEYS.USERS, JSON.stringify(filtered));
  return filtered;
};

// --- PLANS ---
export const getAdminPlans = () => {
  if (typeof window === "undefined") return [];
  initAdminStore();
  return JSON.parse(localStorage.getItem(KEYS.PLANS) || "[]");
};

export const addAdminPlan = (plan) => {
  const plans = getAdminPlans();
  const newPlan = { ...plan, id: "p" + new Date().getTime() };
  plans.push(newPlan);
  localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
  return plans;
};

export const deleteAdminPlan = (planId) => {
  const plans = getAdminPlans();
  const filtered = plans.filter((p) => p.id !== planId);
  localStorage.setItem(KEYS.PLANS, JSON.stringify(filtered));
  return filtered;
};

// --- ORDERS ---
export const getAdminOrders = () => {
  if (typeof window === "undefined") return [];
  initAdminStore();
  return JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
};

export const addAdminOrder = (order) => {
  const orders = getAdminOrders();
  const newOrder = { ...order, id: "TXN-" + new Date().getTime() };
  orders.unshift(newOrder);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  return orders;
};

// --- PAYMENTS ---
export const getAdminPayments = () => {
  if (typeof window === "undefined") return [];
  initAdminStore();
  return JSON.parse(localStorage.getItem(KEYS.PAYMENTS) || "[]");
};

export const addAdminPayment = (payment) => {
  const payments = getAdminPayments();
  const newPayment = { ...payment, id: "PAY-" + new Date().getTime() };
  payments.unshift(newPayment);
  localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
  return payments;
};

// --- ADMIN API HELPERS ---
const adminFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
  const json = await response.json();
  return json?.data !== undefined ? json.data : json;
};

// --- STATS ---
export const fetchAdminStats = async (adminId) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_STATS}${adminId}`;
    return await adminFetch(apiUrl(endpoint));
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return getAdminStatsMock();
  }
};

export const fetchAdminDailyStats = async (adminId) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_DAILY}${adminId}`;
    return await adminFetch(apiUrl(endpoint));
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    return null;
  }
};

export const fetchAdminWeeklyStats = async (adminId) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_WEEKLY}${adminId}`;
    return await adminFetch(apiUrl(endpoint));
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    return null;
  }
};

// --- USERS ---
export const fetchAdminUsers = async (adminUserId) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.USERS}${adminUserId}`;
    return await adminFetch(apiUrl(endpoint));
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return getAdminUsers(); // fallback to mock
  }
};

export const fetchUserStats = async (userId, adminUserId) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.USER_STATS}${userId}/stats/${adminUserId}`;
    return await adminFetch(apiUrl(endpoint));
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
};

export const apiUpdateUser = async (adminUserId, { userId, fullName, email, phone }) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.UPDATE_USER}${adminUserId}`;
    return await adminFetch(apiUrl(endpoint), {
      method: "PUT",
      body: JSON.stringify({ userId, fullName, email, phone }),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const apiDeleteUser = async (adminUserId, userId) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.DELETE_USER}${adminUserId}`;
    return await adminFetch(apiUrl(endpoint), {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const apiAddBalance = async (adminUserId, { phone, userId, amount }) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.ADD_BALANCE}${adminUserId}`;
    return await adminFetch(apiUrl(endpoint), {
      method: "POST",
      body: JSON.stringify({ phone, userId, amount }),
    });
  } catch (error) {
    console.error("Error adding balance:", error);
    throw error;
  }
};

export const apiDebitBalance = async (adminUserId, { phone, userId, amount }) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.DEBIT_BALANCE}${adminUserId}`;
    return await adminFetch(apiUrl(endpoint), {
      method: "POST",
      body: JSON.stringify({ phone, userId, amount }),
    });
  } catch (error) {
    console.error("Error debiting balance:", error);
    throw error;
  }
};

export const apiUpgradeUser = async (adminUserId, userId) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.UPGRADE_USER}${adminUserId}`;
    return await adminFetch(apiUrl(endpoint), {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error("Error upgrading user:", error);
    throw error;
  }
};

export const apiDowngradeUser = async (adminUserId, userId) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.DOWNGRADE_USER}${adminUserId}`;
    return await adminFetch(apiUrl(endpoint), {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error("Error downgrading user:", error);
    throw error;
  }
};

// Mock stats function (used as fallback)
const getAdminStatsMock = () => {
  const users = getAdminUsers();
  const orders = getAdminOrders();

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.balance > 0).length;
  const totalFunds = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const newUsersToday = users.filter((u) => u.date === todayStr).length;

  const dailySales = [0, 0, 0, 0, 0, 0, 0];
  const weeklySales = [0, 0, 0, 0];
  const today = new Date();

  orders.forEach((o) => {
    if (o.status !== "Successful") return;
    const orderDate = new Date(o.date);
    const diffDays = Math.floor(Math.abs(today - orderDate) / (1000 * 60 * 60 * 24));
    const value = parseInt(o.amount.replace(/[^0-9]/g, "")) || 0;
    if (diffDays < 7) dailySales[6 - diffDays] += value;
    const weekIndex = Math.floor(diffDays / 7);
    if (weekIndex < 4) weeklySales[3 - weekIndex] += value;
  });

  return { totalUsers, activeUsers, totalFunds, newUsersToday, dailySales, weeklySales };
};

// Keep getAdminStats for backward compatibility
export const getAdminStats = () => getAdminStatsMock();
