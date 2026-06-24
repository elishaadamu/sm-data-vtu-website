"use client";
import React, { useState, useEffect, useRef } from "react";
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

const chartColors = {
  blue: {
    stroke: "#3b82f6", // blue-500
    fillGradStart: "rgba(59, 130, 246, 0.25)",
    fillGradEnd: "rgba(59, 130, 246, 0.01)",
    dotStroke: "#2563eb", // blue-600
    dotFill: "#ffffff",
  },
  purple: {
    stroke: "#a855f7", // purple-500
    fillGradStart: "rgba(168, 85, 247, 0.25)",
    fillGradEnd: "rgba(168, 85, 247, 0.01)",
    dotStroke: "#9333ea", // purple-600
    dotFill: "#ffffff",
  },
  indigo: {
    stroke: "#6366f1", // indigo-500
    fillGradStart: "rgba(99, 102, 241, 0.25)",
    fillGradEnd: "rgba(99, 102, 241, 0.01)",
    dotStroke: "#4f46e5", // indigo-600
    dotFill: "#ffffff",
  },
  emerald: {
    stroke: "#10b981", // emerald-500
    fillGradStart: "rgba(16, 185, 129, 0.25)",
    fillGradEnd: "rgba(16, 185, 129, 0.01)",
    dotStroke: "#059669", // emerald-600
    dotFill: "#ffffff",
  },
};

const LineChart = ({ data = [], labels = [], prefix = "", color = "blue" }) => {
  const c = chartColors[color] || chartColors.blue;
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 176 });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: width || 500, height: height || 176 });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const { width, height } = dimensions;
  const paddingLeft = 56;
  const paddingRight = 20;
  const paddingTop = 16;
  const paddingBottom = 24;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data, 1);

  // Calculate coordinates
  const points = data.map((val, i) => {
    const x = paddingLeft + (data.length > 1 ? (i / (data.length - 1)) * plotWidth : plotWidth / 2);
    const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
    return { x, y, val, label: labels[i] };
  });

  // Build the line path description
  const linePath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    : "";

  // Build the gradient area path
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : "";

  const gradId = `grad-${color}`;

  const handleMouseMove = (e) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    let closestIndex = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    const stepX = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;
    if (minDiff < stepX / 1.5) {
      setHoveredIndex(closestIndex);
    } else {
      setHoveredIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Helper for formatting Y-axis scale values compactly
  const formatYLabel = (val) => {
    if (val === 0) return "0";
    const absVal = Math.abs(val);
    if (absVal >= 1e9) return `${prefix}${(val / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
    if (absVal >= 1e6) return `${prefix}${(val / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
    if (absVal >= 1e3) return `${prefix}${(val / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
    return `${prefix}${val.toLocaleString()}`;
  };

  return (
    <div className="mt-6">
      <div
        ref={containerRef}
        className="h-44 w-full relative overflow-visible cursor-pointer select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg width="100%" height="100%" className="overflow-visible">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.fillGradStart} />
              <stop offset="100%" stopColor={c.fillGradEnd} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={width - paddingRight}
            y2={paddingTop}
            stroke="rgba(148, 163, 184, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop + plotHeight / 2}
            x2={width - paddingRight}
            y2={paddingTop + plotHeight / 2}
            stroke="rgba(148, 163, 184, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="rgba(148, 163, 184, 0.18)"
            strokeWidth="1"
          />

          {/* Y Axis Left Scale Labels */}
          <text
            x={paddingLeft - 8}
            y={paddingTop + 3}
            textAnchor="end"
            className="text-[9px] font-bold fill-slate-400 select-none"
          >
            {formatYLabel(maxVal)}
          </text>
          <text
            x={paddingLeft - 8}
            y={paddingTop + plotHeight / 2 + 3}
            textAnchor="end"
            className="text-[9px] font-bold fill-slate-400 select-none"
          >
            {formatYLabel(maxVal / 2)}
          </text>
          <text
            x={paddingLeft - 8}
            y={height - paddingBottom + 3}
            textAnchor="end"
            className="text-[9px] font-bold fill-slate-400 select-none"
          >
            {formatYLabel(0)}
          </text>

          {/* Vertical indicator line when hovered */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <line
              x1={points[hoveredIndex].x}
              y1={paddingTop}
              x2={points[hoveredIndex].x}
              y2={height - paddingBottom}
              stroke={c.stroke}
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="transition-all duration-150"
            />
          )}

          {/* Gradient Fill under line */}
          {areaPath && (
            <path
              d={areaPath}
              fill={`url(#${gradId})`}
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Path Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={c.stroke}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Data point dots */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 4}
                fill={c.dotFill}
                stroke={isHovered ? c.stroke : c.dotStroke}
                strokeWidth={isHovered ? 3.5 : 2}
                className="transition-all duration-150 ease-out"
              />
            );
          })}

          {/* X Axis Labels inside SVG */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 4}
              textAnchor="middle"
              className={`text-[9px] font-semibold select-none transition-colors duration-150 ${
                hoveredIndex === idx ? "fill-slate-800 font-bold" : "fill-slate-400"
              }`}
            >
              {p.label}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute pointer-events-none bg-slate-900/95 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-xl z-20 transition-all duration-100 ease-out backdrop-blur-sm border border-slate-700/50"
            style={{
              left: `${points[hoveredIndex].x}px`,
              top: `${points[hoveredIndex].y - 12}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="text-[10px] text-slate-400 font-medium">
              {points[hoveredIndex].label}
            </div>
            <div className="text-sm font-bold mt-0.5">
              {prefix}{points[hoveredIndex].val.toLocaleString()}
            </div>
          </div>
        )}
      </div>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h3 className="text-base font-bold text-slate-800 shrink-0">{title}</h3>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit shrink-0">
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
        <LineChart
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
          const hasLocalUser = typeof window !== "undefined" && localStorage.getItem("manager_user");
          if (!hasLocalUser) {
            const fallback = getAdminStats();
            setStats(fallback);
            setDailyData(fallback.dailySales || []);
            setWeeklyData(fallback.weeklySales || []);
          }
        }
      } catch (error) {
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
    
  const dailySales = rawDailyData.map((d) => typeof d === "number" ? d : (d?.totalTransactionAmount || 0));
  const dailyTransactions = rawDailyData.map((d) => typeof d === "number" ? 0 : (d?.transactionsCount || 0));
  const dailyUsers = rawDailyData.map((d) => typeof d === "number" ? 0 : (d?.usersRegistered || 0));
  const dailyLabels = rawDailyData.map((d, i) =>
    (typeof d === "object" && d?.date) ? format(new Date(d.date), "MMM dd") : `Day ${i + 1}`
  );

  // Weekly data: array of { week, usersRegistered, transactionsCount, totalTransactionAmount }
  const rawWeeklyData = Array.isArray(weeklyData)
    ? weeklyData
    : Array.isArray(weeklyData?.sales)
    ? weeklyData.sales
    : [];
    
  const weeklySales = rawWeeklyData.map((d) => typeof d === "number" ? d : (d?.totalTransactionAmount || 0));
  const weeklyTransactions = rawWeeklyData.map((d) => typeof d === "number" ? 0 : (d?.transactionsCount || 0));
  const weeklyUsers = rawWeeklyData.map((d) => typeof d === "number" ? 0 : (d?.usersRegistered || 0));
  const weeklyLabels = rawWeeklyData.map((d, i) => {
    if (typeof d === "object" && d?.week) {
      const parts = d.week.split(" to ");
      if (parts.length === 2) {
        const start = format(new Date(parts[0]), "MMM d");
        const end = format(new Date(parts[1]), "d");
        return `${start}–${end}`;
      }
      return d.week;
    }
    return `Week ${i + 1}`;
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
