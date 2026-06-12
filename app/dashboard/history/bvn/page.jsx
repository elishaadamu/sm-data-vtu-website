"use client";
import * as React from "react";
import axios from "axios";
import { API_CONFIG, apiUrl } from "@/configs/api.jsx";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  EyeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Empty, Modal, Card, Tag, Badge, Tooltip } from "antd";
import { EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

// in getting response, change data.result.data to data.data

export default function BVNVerificationHistory() {
  const router = useRouter();
  const { userData, authLoading, viewBvnSlip } = useAppContext();

  // Get userId from context
  const userId = React.useMemo(() => {
    return userData?._id || userData?.id || null;
  }, [userData]);

  const [loading, setLoading] = React.useState(false);
  const [apiData, setApiData] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [sortConfig, setSortConfig] = React.useState({
    key: "createdAt",
    direction: "desc",
  });
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState(null);
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [stats, setStats] = React.useState({
    total: 0,
    basic: 0,
    advanced: 0,
  });

  const fetchVerificationHistory = React.useCallback(async () => {
    if (!userId || authLoading) return;

    setLoading(true);
    try {
      const apiLink = apiUrl(
        API_CONFIG.ENDPOINTS.BVN_VERIFICATION.DATA_HISTORY + userId
      );
      const response = await axios.get(apiLink, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("BVN Verification History Response:", response.data);

      const details = response.data?.findData || [];
      setApiData(details || []);

      // Calculate stats
      const bvnTransactions = details.filter((t) => t.dataFor === "BVN-Slip");
      const basicCount = bvnTransactions.filter(
        (t) => String(t.slipLayout || "").toLowerCase() === "basic"
      ).length;
      const advancedCount = bvnTransactions.filter(
        (t) => String(t.slipLayout || "").toLowerCase() === "advanced"
      ).length;

      setStats({
        total: bvnTransactions.length,
        basic: basicCount,
        advanced: advancedCount,
      });
    } catch (error) {
      console.error("Error fetching verification history:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, authLoading]);

  // Filter transactions based on search term and only show BVN-Slip data
  const filteredTransactions = apiData.filter((transaction) => {
    // First filter for BVN-Slip only
    if (transaction.dataFor !== "BVN-Slip") return false;

    const searchStr = searchTerm.toLowerCase();
    const transactionDate = new Date(transaction.createdAt);

    // Date filter
    const passesDateFilter =
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate);

    // Text search filter for BVN specific fields
    const passesSearchFilter =
      !searchTerm ||
      transaction.slipLayout?.toLowerCase().includes(searchStr) ||
      transaction.data?.verification?.reference
        ?.toLowerCase()
        .includes(searchStr) ||
      transaction.data?.verification?.status
        ?.toLowerCase()
        .includes(searchStr) ||
      transaction.data?.result?.data?.firstName
        ?.toLowerCase()
        .includes(searchStr) ||
      transaction.data?.result?.data?.lastName
        ?.toLowerCase()
        .includes(searchStr) ||
      transaction.data?.detail?.toLowerCase().includes(searchStr) ||
      transaction.data?.result?.data?.bvn?.toLowerCase().includes(searchStr);

    return passesDateFilter && passesSearchFilter;
  });

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const TableHeader = ({ label, sortKey, className }) => {
    const isSorted = sortConfig.key === sortKey;
    const icon = isSorted ? (
      sortConfig.direction === "asc" ? (
        <ArrowUpIcon className="w-3 h-3 text-blue-600" />
      ) : (
        <ArrowDownIcon className="w-3 h-3 text-blue-600" />
      )
    ) : (
      <ArrowsUpDownIcon className="w-3 h-3 text-gray-400" />
    );

    return (
      <th
        scope="col"
        className={`${className} group cursor-pointer transition-colors duration-200`}
        onClick={() => sortKey && sortData(sortKey)}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold">{label}</span>
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {icon}
          </span>
        </div>
      </th>
    );
  };

  const showModal = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  const handleViewSlip = (transaction) => {
    const slipType = transaction.slipLayout;
    const apiData = transaction.data?.result.data;

    if (typeof viewBvnSlip === "function") {
      viewBvnSlip(apiData, slipType);
    }

    if (String(slipType || "").toLowerCase() === "basic") {
      router.push("/basic-bvn");
    } else {
      router.push("/advanced-bvn");
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "gray";
    const statusLower = status.toLowerCase();
    if (statusLower.includes("success") || statusLower.includes("verified")) {
      return "green";
    } else if (statusLower.includes("pending")) {
      return "orange";
    } else if (
      statusLower.includes("failed") ||
      statusLower.includes("error")
    ) {
      return "red";
    }
    return "blue";
  };

  const getSlipTypeColor = (type) => {
    const typeLower = String(type || "").toLowerCase();
    return typeLower === "advanced" ? "purple" : "blue";
  };

  React.useEffect(() => {
    fetchVerificationHistory();
  }, [fetchVerificationHistory]);

  const sortedTransactions = getSortedData(filteredTransactions);
  const paginatedData = sortedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(sortedTransactions.length / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                BVN Verification History
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage your BVN verification records
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge count={stats.total} showZero className="bg-blue-500" />
              <span className="text-sm text-gray-600">Total Records</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Verifications
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <DocumentTextIcon className="w-10 h-10 text-blue-500" />
              </div>
            </Card>
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Basic Slips
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.basic}
                  </p>
                </div>
                <Tag color="blue" className="text-sm">
                  Basic
                </Tag>
              </div>
            </Card>
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Advanced Slips
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.advanced}
                  </p>
                </div>
                <Tag color="purple" className="text-sm">
                  Advanced
                </Tag>
              </div>
            </Card>
          </div>
        </div>

        {/* Filter Controls */}
        <Card className="shadow-sm border-0 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by BVN, name, reference..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText="Start Date"
                className="w-full lg:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                dateFormat="dd/MM/yyyy"
                isClearable
              />
              <span className="text-gray-400">to</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="End Date"
                className="w-full lg:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                dateFormat="dd/MM/yyyy"
                isClearable
              />
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <DocumentTextIcon className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading verification history...
            </p>
          </div>
        )}

        {/* Data Table */}
        {!loading && sortedTransactions.length > 0 ? (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                    <tr>
                      <TableHeader
                        label="Date & Time"
                        sortKey="createdAt"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      />
                      <TableHeader
                        label="Type"
                        sortKey="slipLayout"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      />
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        BVN Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((transaction, index) => (
                      <tr
                        key={transaction._id || index}
                        className="hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(
                              new Date(transaction.createdAt),
                              "dd/MM/yyyy"
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(
                              new Date(transaction.createdAt),
                              "HH:mm:ss"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Tag
                            color={getSlipTypeColor(transaction.slipLayout)}
                            className="font-medium rounded-full px-3 py-1"
                          >
                            {transaction.slipLayout}
                          </Tag>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="font-mono bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
                              {transaction.data?.result?.data?.bvn || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            status={getStatusColor(
                              transaction.data?.result?.data
                                ?.verification_status
                            )}
                            text={
                              <span className="text-sm bg-green-200 text-green-900 p-2 rounded-full font-medium capitalize">
                                {transaction.data?.result?.data
                                  ?.verification_status || "Unknown"}
                              </span>
                            }
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Tooltip title="View Slip">
                              <button
                                onClick={() => handleViewSlip(transaction)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <button
                                onClick={() => showModal(transaction)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <InformationCircleIcon className="w-5 h-5" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(
                      currentPage * pageSize,
                      sortedTransactions.length
                    )}{" "}
                    of {sortedTransactions.length} entries
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {[5, 10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-all ${
                            currentPage === pageNum
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : !loading ? (
          <Card className="shadow-sm border-0">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="py-8">
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    No BVN verification records found
                  </p>
                  <p className="text-gray-600">
                    {searchTerm || startDate || endDate
                      ? "Try adjusting your search filters"
                      : "Start verifying BVNs to see your history here"}
                  </p>
                </div>
              }
            />
          </Card>
        ) : null}

        {/* Details Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6 text-blue-500" />
              <span>BVN Verification Details</span>
            </div>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={700}
          className="rounded-xl"
        >
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    Verification Date
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {format(
                      new Date(selectedTransaction.createdAt),
                      "dd/MM/yyyy HH:mm:ss"
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <Tag
                    color={getSlipTypeColor(selectedTransaction.slipLayout)}
                    className="font-medium"
                  >
                    {selectedTransaction.slipLayout}
                  </Tag>
                </div>
              </div>

              {/* BVN Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  BVN Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">BVN Number</p>
                    <p className="font-mono text-gray-900">
                      {selectedTransaction.data?.result?.data?.bvn || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reference</p>
                    <p className="text-gray-900">
                      {selectedTransaction.data?.result?.data
                        ?.verification_details?.reference || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">First Name</p>
                    <p className="text-gray-900">
                      {selectedTransaction.data?.result?.data
                        ?.personal_information?.first_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Name</p>
                    <p className="text-gray-900">
                      {selectedTransaction.data?.result?.data
                        ?.personal_information?.last_name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Message</p>
                  <Badge
                    status={getStatusColor(
                      selectedTransaction.data?.verification?.status
                    )}
                    text={
                      <span className="font-medium capitalize">
                        {selectedTransaction.data?.message || "Unknown"}
                      </span>
                    }
                    className="text-lg"
                  />
                </div>
                <button
                  onClick={() => handleViewSlip(selectedTransaction)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <EyeIcon className="w-5 h-5" />
                  View Full Slip
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
