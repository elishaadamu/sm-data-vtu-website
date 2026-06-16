"use client";
import React, { useState, useEffect } from "react";
import {
  fetchAdminStats,
  fetchAdminDailyStats,
  fetchAdminWeeklyStats,
  getAdminStats,
} from "@/lib/adminStore";
import { useAppContext } from "@/context/AppContext";
import { FaUsers, FaUserCheck, FaWallet, FaUserPlus } from "react-icons/fa";
import { format } from "date-fns";

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 mt-2">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  </div>
);

const colorMap = {
  blue:    { bar: "bg-blue-500",    hover: "hover:bg-blue-600",    tab: "bg-blue-600 text-white",    pill: "bg-blue-50 text-blue-700" },
  purple:  { bar: "bg-purple-500",  hover: "hover:bg-purple-600",  tab: "bg-purple-600 text-white",  pill: "bg-purple-50 text-purple-700" },
  indigo:  { bar: "bg-indigo-500",  hover: "hover:bg-indigo-600",  tab: "bg-indigo-600 text-white",  pill: "bg-indigo-50 text-indigo-700" },
  emerald: { bar: "bg-emerald-500", hover: "hover:bg-emerald-600", tab: "bg-emerald-600 text-white", pill: "bg-emerald-50 text-emerald-700" },
};

// Single bar chart
const BarChart = ({ data = [], labels = [], prefix = "", color = "blue" }) => {
  const c = colorMap[color] || colorMap.blue;
  const maxVal = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-between h-44 gap-1.5 mt-4">
      {data.map((val, i) => {
        const heightPct = Math.max((val / maxVal) * 100, 2);
        return (
          <div key={i} className="flex flex-col items-center flex-1 group">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-slate-800 text-white text-xs py-0.5 px-2 rounded whitespace-nowrap z-10">
              {prefix}{(val || 0).toLocaleString()}
            </div>
            <div className="w-full bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
              <div
                className={`w-full ${c.bar} ${c.hover} rounded-t-lg transition-all duration-500 ease-out`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-2 text-center truncate w-full">
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Tabbed chart panel
const ChartPanel = ({ title, tabs = [], labels = [] }) => {
  const [active, setActive] = useState(tabs[0]?.key || "");
  const current = tabs.find((t) => t.key === active) || tabs[0];
  const c = colorMap[current?.color] || colorMap.blue;

  const total = (current?.data || []).reduce((s, v) => s + (v || 0), 0);

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                active === tab.key
                  ? c.tab
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary pill */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 ${c.pill}`}>
        Total: {current?.prefix}{total.toLocaleString()}
      </div>

      {(current?.data || []).length === 0 ? (
        <div className="flex items-center justify-center h-44 text-slate-400 text-sm">
          No data available
        </div>
      ) : (
        <BarChart
          data={current?.data || []}
          labels={labels}
          prefix={current?.prefix || ""}
          color={current?.color || "blue"}
        />
      )}
    </div>
  );
};

export default function ManagerDashboard() {
  const { managerData } = useAppContext();
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const adminId = managerData?._id || managerData?.id;
        if (adminId) {
          const [statsRes, dailyRes, weeklyRes] = await Promise.all([
            fetchAdminStats(adminId),
            fetchAdminDailyStats(adminId),
            fetchAdminWeeklyStats(adminId),
          ]);
          setStats(statsRes);
          setDailyData(dailyRes);
          setWeeklyData(weeklyRes);
        } else {
          const fallback = getAdminStats();
          setStats(fallback);
          setDailyData(fallback.dailySales || []);
          setWeeklyData(fallback.weeklySales || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        const fallback = getAdminStats();
        setStats(fallback);
        setDailyData(fallback.dailySales || []);
        setWeeklyData(fallback.weeklySales || []);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchAll, 400);
    return () => clearTimeout(timer);
  }, [managerData]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Daily data: array of { date, usersRegistered, transactionsCount, totalTransactionAmount }
  const rawDailyData = Array.isArray(dailyData)
    ? dailyData
    : Array.isArray(dailyData?.sales)
    ? dailyData.sales
    : [];
  const dailySales = rawDailyData.map((d) => d?.totalTransactionAmount || 0);
  const dailyTransactions = rawDailyData.map((d) => d?.transactionsCount || 0);
  const dailyUsers = rawDailyData.map((d) => d?.usersRegistered || 0);
  const dailyLabels = rawDailyData.map((d) =>
    d?.date ? format(new Date(d.date), "MMM dd") : ""
  );

  // Weekly data: array of { week, usersRegistered, transactionsCount, totalTransactionAmount }
  const rawWeeklyData = Array.isArray(weeklyData)
    ? weeklyData
    : Array.isArray(weeklyData?.sales)
    ? weeklyData.sales
    : [];
  const weeklySales = rawWeeklyData.map((d) => d?.totalTransactionAmount || 0);
  const weeklyTransactions = rawWeeklyData.map((d) => d?.transactionsCount || 0);
  const weeklyUsers = rawWeeklyData.map((d) => d?.usersRegistered || 0);
  const weeklyLabels = rawWeeklyData.map((d) => {
    if (!d?.week) return "";
    // format "2026-06-10 to 2026-06-16" -> "Jun 10–16"
    const parts = d.week.split(" to ");
    if (parts.length === 2) {
      const start = format(new Date(parts[0]), "MMM d");
      const end = format(new Date(parts[1]), "d");
      return `${start}–${end}`;
    }
    return d.week;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here is what&apos;s happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={(stats?.totalUsers || 0).toLocaleString()}
          icon={FaUsers}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatCard
          title="Active Users"
          value={(stats?.activeUsers || 0).toLocaleString()}
          icon={FaUserCheck}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <StatCard
          title="Total Funds"
          value={`₦${(stats?.totalFunds || 0).toLocaleString()}`}
          icon={FaWallet}
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
        <StatCard
          title="New Users (Today)"
          value={(stats?.newUsersToday || 0).toLocaleString()}
          icon={FaUserPlus}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Chart */}
        <ChartPanel
          title="Daily Stats (Last 7 Days)"
          tabs={[
            { key: "revenue", label: "Revenue", data: dailySales, prefix: "₦", color: "blue" },
            { key: "txns", label: "Transactions", data: dailyTransactions, prefix: "", color: "indigo" },
            { key: "users", label: "New Users", data: dailyUsers, prefix: "", color: "emerald" },
          ]}
          labels={dailyLabels}
        />
        {/* Weekly Chart */}
        <ChartPanel
          title="Weekly Stats (Last 4 Weeks)"
          tabs={[
            { key: "revenue", label: "Revenue", data: weeklySales, prefix: "₦", color: "purple" },
            { key: "txns", label: "Transactions", data: weeklyTransactions, prefix: "", color: "indigo" },
            { key: "users", label: "New Users", data: weeklyUsers, prefix: "", color: "emerald" },
          ]}
          labels={weeklyLabels}
        />
      </div>
    </div>
  );
}
