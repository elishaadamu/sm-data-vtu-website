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
  PhoneIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { Empty, Modal, Card, Tag, Badge, Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export default function AirtimeHistory() {
  const router = useRouter();
  const { userData, authLoading } = useAppContext();

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
    totalAmount: 0,
    successful: 0,
    failed: 0,
  });

  const fetchAirtimeHistory = React.useCallback(async () => {
    if (!userId || authLoading) return;

    setLoading(true);
    try {
      // Using airtime history endpoint
      const apiLink = apiUrl(
        API_CONFIG.ENDPOINTS.AIRTIME.HISTORY + userId
      );
      const response = await axios.get(apiLink, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Airtime History Response:", response.data);
      
      // Filter for airtime transactions only
      const allTransactions = response.data?.transactions || response.data?.data || [];
      const airtimeTransactions = allTransactions.filter(
        (t) => t.TransactionType === "Airtime-Purchase" || 
               t.type === "airtime" || 
               t.category === "airtime" || 
               t.service === "airtime"
      );
      
      // Extract network and phone from description if not directly available
      const processedTransactions = airtimeTransactions.map(transaction => {
        // Extract network from description (e.g., "Airtime purchase via PeyFlex: MTN - 07067206984")
        let network = transaction.network;
        let phone = transaction.phone || transaction.phoneNumber;
        
        if (!network && transaction.description) {
          const networkMatch = transaction.description.match(/:\s*([^-]+)\s*-/);
          if (networkMatch) {
            network = networkMatch[1].trim();
          }
        }
        
        // Extract phone from description (e.g., "...MTN - 07067206984")
        if (!phone && transaction.description) {
          const phoneMatch = transaction.description.match(/-\s*(\d+)/);
          if (phoneMatch) {
            phone = phoneMatch[1];
          }
        }
        
        return {
          ...transaction,
          network: network || "N/A",
          phoneNumber: phone || transaction.phoneNumber || "N/A",
          reference: transaction.transactionReference || transaction.reference || transaction.transactionId || "N/A",
          oldBalance: transaction.oldBalance !== undefined ? transaction.oldBalance : (transaction.balanceBefore !== undefined ? transaction.balanceBefore : (transaction.previousBalance !== undefined ? transaction.previousBalance : "N/A")),
          newBalance: transaction.newBalance !== undefined ? transaction.newBalance : (transaction.balanceAfter !== undefined ? transaction.balanceAfter : (transaction.currentBalance !== undefined ? transaction.currentBalance : "N/A")),
        };
      });
      
      setApiData(processedTransactions);

      // Calculate stats
      const successful = processedTransactions.filter(
        (t) => t.status?.toLowerCase().includes("success")
      ).length;
      const failed = processedTransactions.filter(
        (t) => t.status?.toLowerCase().includes("fail")
      ).length;
      const totalAmount = processedTransactions
        .filter((t) => t.status?.toLowerCase().includes("success"))
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      setStats({
        total: processedTransactions.length,
        totalAmount,
        successful,
        failed,
      });
    } catch (error) {
      console.error("Error fetching airtime history:", error);
      // Set empty data on error
      setApiData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, authLoading]);

  // Filter transactions based on search term
  const filteredTransactions = apiData.filter((transaction) => {
    const searchStr = searchTerm.toLowerCase();
    const transactionDate = new Date(transaction.createdAt || transaction.date);

    // Date filter
    const passesDateFilter =
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate);

    // Text search filter
    const passesSearchFilter =
      !searchTerm ||
      transaction.phoneNumber?.toLowerCase().includes(searchStr) ||
      transaction.network?.toLowerCase().includes(searchStr) ||
      transaction.amount?.toString().includes(searchStr) ||
      transaction.reference?.toLowerCase().includes(searchStr) ||
      transaction.status?.toLowerCase().includes(searchStr);

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
      if (sortConfig.key === "createdAt" || sortConfig.key === "date") {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (sortConfig.key === "amount") {
        const amountA = parseFloat(a.amount) || 0;
        const amountB = parseFloat(b.amount) || 0;
        return sortConfig.direction === "asc" ? amountA - amountB : amountB - amountA;
      }

      const valueA = a[sortConfig.key] || "";
      const valueB = b[sortConfig.key] || "";
      
      if (valueA < valueB) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
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

  const getStatusColor = (status) => {
    if (!status) return "default";
    const statusLower = status.toLowerCase();
    if (statusLower.includes("success") || statusLower.includes("completed")) {
      return "success";
    } else if (statusLower.includes("pending") || statusLower.includes("processing")) {
      return "processing";
    } else if (
      statusLower.includes("failed") ||
      statusLower.includes("error") ||
      statusLower.includes("declined")
    ) {
      return "error";
    }
    return "default";
  };

  const getNetworkColor = (network) => {
    if (!network) return "default";
    const networkLower = network.toLowerCase();
    if (networkLower.includes("mtn")) return "gold";
    if (networkLower.includes("glo")) return "green";
    if (networkLower.includes("airtel")) return "red";
    if (networkLower.includes("9mobile")) return "cyan";
    return "blue";
  };

  React.useEffect(() => {
    fetchAirtimeHistory();
  }, [fetchAirtimeHistory]);

  const sortedTransactions = getSortedData(filteredTransactions);
  const paginatedData = sortedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(sortedTransactions.length / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Airtime Purchase History
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage your airtime purchase records
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge count={stats.total} showZero className="bg-purple-500" />
              <span className="text-sm text-gray-600">Total Purchases</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Purchases
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <PhoneIcon className="w-10 h-10 text-purple-500" />
              </div>
            </Card>

            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₦{stats.totalAmount.toLocaleString()}
                  </p>
                </div>
                <CurrencyDollarIcon className="w-10 h-10 text-green-500" />
              </div>
            </Card>

            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Successful
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.successful}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.failed}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">✗</span>
                </div>
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
                placeholder="Search by phone number, network, amount, reference..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
                className="w-full lg:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                dateFormat="dd/MM/yyyy"
                isClearable
              />
              <span className="text-gray-400">to</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="End Date"
                className="w-full lg:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <PhoneIcon className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading airtime history...
            </p>
          </div>
        )}

        {/* Data Table */}
        {!loading && sortedTransactions.length > 0 ? (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-purple-50/50">
                    <tr>
                      <TableHeader
                        label="Date & Time"
                        sortKey="createdAt"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      />
                      <TableHeader
                        label="Network"
                        sortKey="network"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      />
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <TableHeader
                        label="Amount"
                        sortKey="amount"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      />
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((transaction, index) => (
                      <tr
                        key={transaction._id || transaction.id || index}
                        className="hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(
                              new Date(transaction.createdAt || transaction.date),
                              "dd/MM/yyyy"
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(
                              new Date(transaction.createdAt || transaction.date),
                              "HH:mm:ss"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Tag color={getNetworkColor(transaction.network)} className="font-medium uppercase">
                            {transaction.network || "N/A"}
                          </Tag>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 font-medium">
                              {transaction.phoneNumber || transaction.phone || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">
                            ₦{parseFloat(transaction.amount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Tooltip title="View Details">
                              <button
                                onClick={() => showModal(transaction)}
                                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all"
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
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
                              ? "bg-purple-500 text-white"
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
                    No airtime purchase records found
                  </p>
                  <p className="text-gray-600">
                    {searchTerm || startDate || endDate
                      ? "Try adjusting your search filters"
                      : "Start purchasing airtime to see your history here"}
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
              <PhoneIcon className="w-6 h-6 text-purple-500" />
              <span>Airtime Purchase Details</span>
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
                    Purchase Date
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {format(
                      new Date(selectedTransaction.createdAt || selectedTransaction.date),
                      "dd/MM/yyyy HH:mm:ss"
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Network</p>
                  <Tag color={getNetworkColor(selectedTransaction.network)} className="font-medium uppercase">
                    {selectedTransaction.network || "N/A"}
                  </Tag>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Transaction Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="text-gray-900 font-medium">
                      {selectedTransaction.phoneNumber || selectedTransaction.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-gray-900 font-bold text-lg">
                      ₦{parseFloat(selectedTransaction.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reference</p>
                    <p className="text-gray-900 font-mono text-xs">
                      {selectedTransaction.reference || selectedTransaction.transactionId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Previous Balance</p>
                    <p className="text-gray-900 font-medium">
                      {selectedTransaction.oldBalance !== "N/A" ? `₦${parseFloat(selectedTransaction.oldBalance).toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">New Balance</p>
                    <p className="text-gray-900 font-medium">
                      {selectedTransaction.newBalance !== "N/A" ? `₦${parseFloat(selectedTransaction.newBalance).toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge
                      status={getStatusColor(selectedTransaction.status)}
                      text={
                        <span className="font-medium capitalize">
                          {selectedTransaction.status || "Unknown"}
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedTransaction.description && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900">{selectedTransaction.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsModalVisible(false)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
