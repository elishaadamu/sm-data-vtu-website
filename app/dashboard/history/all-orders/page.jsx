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
  InformationCircleIcon,
  ClipboardDocumentListIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
} from "@heroicons/react/24/outline";
import { Empty, Modal, Card, Tag, Badge, Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export default function AllOrdersHistory() {
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
    successful: 0,
    credits: 0,
    debits: 0,
  });

  const fetchAllOrders = React.useCallback(async () => {
    if (!userId || authLoading) return;

    setLoading(true);
    try {
      const apiLink = apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.ALL_HISTORY + userId);
      const response = await axios.get(apiLink, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const allTransactions =
        response.data?.transactions || response.data?.data || [];

      const processedTransactions = allTransactions.map((transaction) => {
        let network = transaction.network;
        let phone = transaction.phone || transaction.phoneNumber;

        // Extract network from description if not present
        if (!network && transaction.description) {
          const networkMatch = transaction.description.match(/:\s*([^-]+)\s*-/);
          if (networkMatch) {
            network = networkMatch[1].trim();
          }
        }

        // Extract phone from description if not present
        if (!phone && transaction.description) {
          const phoneMatch = transaction.description.match(/(?:for|-)\s*(\d{11})/);
          if (phoneMatch) {
            phone = phoneMatch[1];
          }
        }

        return {
          ...transaction,
          reference:
            transaction.transactionReference ||
            transaction.reference ||
            transaction.transactionId ||
            transaction._id ||
            "N/A",
          method:
            transaction.method ||
            transaction.paymentMethod ||
            transaction.TransactionType?.replace(/_/g, " ").toUpperCase() ||
            "Wallet",
          phone: phone || "N/A",
          network: network || "N/A",
          plan: transaction.plan || transaction.description || "N/A",
          oldBalance: transaction.oldBalance !== undefined ? transaction.oldBalance : (transaction.balanceBefore !== undefined ? transaction.balanceBefore : (transaction.previousBalance !== undefined ? transaction.previousBalance : "N/A")),
          newBalance: transaction.newBalance !== undefined ? transaction.newBalance : (transaction.balanceAfter !== undefined ? transaction.balanceAfter : (transaction.currentBalance !== undefined ? transaction.currentBalance : "N/A")),
        };
      });

      setApiData(processedTransactions);

      // Calculate stats
      const successful = processedTransactions.filter(
        (t) =>
          t.status?.toLowerCase().includes("success") ||
          t.status?.toLowerCase().includes("completed"),
      ).length;
      const credits = processedTransactions.filter(
        (t) => t.type === "credit",
      ).length;
      const debits = processedTransactions.filter(
        (t) => t.type === "debit",
      ).length;

      setStats({
        total: processedTransactions.length,
        successful,
        credits,
        debits,
      });
    } catch (error) {
      console.error("Error fetching all orders:", error);
      setApiData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, authLoading]);

  // Filter transactions based on search term
  const filteredTransactions = apiData.filter((transaction) => {
    const searchStr = searchTerm.toLowerCase();
    const transactionDate = new Date(transaction.createdAt || transaction.date);

    const passesDateFilter =
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate);

    const passesSearchFilter =
      !searchTerm ||
      transaction.amount?.toString().includes(searchStr) ||
      transaction.reference?.toLowerCase().includes(searchStr) ||
      transaction.status?.toLowerCase().includes(searchStr) ||
      transaction.TransactionType?.toLowerCase().includes(searchStr) ||
      transaction.description?.toLowerCase().includes(searchStr);

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
        return sortConfig.direction === "asc"
          ? amountA - amountB
          : amountB - amountA;
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
    } else if (
      statusLower.includes("pending") ||
      statusLower.includes("processing")
    ) {
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

  React.useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const sortedTransactions = getSortedData(filteredTransactions);
  const paginatedData = sortedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const totalPages = Math.ceil(sortedTransactions.length / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                All Orders & Transactions
              </h1>
              <p className="text-gray-600 mt-2">
                A complete history of all your wallet activities
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge count={stats.total} showZero className="bg-indigo-500" />
              <span className="text-sm text-gray-600">Total Activities</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Entries
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <ClipboardDocumentListIcon className="w-10 h-10 text-indigo-500" />
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
                  <span className="text-2xl text-green-600">✓</span>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Credits
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {stats.credits}
                  </p>
                </div>
                <ArrowLeftCircleIcon className="w-10 h-10 text-emerald-500" />
              </div>
            </Card>

            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Debits
                  </p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">
                    {stats.debits}
                  </p>
                </div>
                <ArrowRightCircleIcon className="w-10 h-10 text-rose-500" />
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
                placeholder="Search by reference, amount, description, type..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
                className="w-full lg:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                dateFormat="dd/MM/yyyy"
                isClearable
              />
              <span className="text-gray-400">to</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="End Date"
                className="w-full lg:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                dateFormat="dd/MM/yyyy"
                isClearable
              />
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading history...</p>
          </div>
        )}

        {/* Data Table */}
        {!loading && sortedTransactions.length > 0 ? (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-indigo-50/50">
                    <tr>
                      <TableHeader
                        label="Date"
                        sortKey="createdAt"
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      />
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Network
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Plan
                      </th>
                      <TableHeader
                        label="Amount"
                        sortKey="amount"
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      />
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Prev Balance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        New Balance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedData.map((transaction, index) => (
                      <tr
                        key={transaction._id || index}
                        className="hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(
                              new Date(
                                transaction.createdAt || transaction.date,
                              ),
                              "dd/MM/yyyy",
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {format(
                              new Date(
                                transaction.createdAt || transaction.date,
                              ),
                              "HH:mm:ss",
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">
                          {transaction.reference}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {transaction.phone}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {transaction.network}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                          {transaction.plan}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`text-sm font-bold ${transaction.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}₦
                            {parseFloat(
                              transaction.amount || 0,
                            ).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {transaction.oldBalance !== "N/A" ? `₦${parseFloat(transaction.oldBalance).toLocaleString()}` : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {transaction.newBalance !== "N/A" ? `₦${parseFloat(transaction.newBalance).toLocaleString()}` : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            status={getStatusColor(transaction.status)}
                            text={
                              <span className="font-medium capitalize text-xs">
                                {transaction.status || "Unknown"}
                              </span>
                            }
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <Tooltip title="View Details">
                            <button
                              onClick={() => showModal(transaction)}
                              className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                              <InformationCircleIcon className="w-5 h-5" />
                            </button>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls (similar to funding page) */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(
                      currentPage * pageSize,
                      sortedTransactions.length,
                    )}{" "}
                    of {sortedTransactions.length} entries
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-white border disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-white border disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : !loading ? (
          <Card className="shadow-sm border-0">
            <Empty description="No transaction history found" />
          </Card>
        ) : null}

        {/* Details Modal */}
        <Modal
          title={
            <span className="font-bold text-indigo-900">
              Transaction Details
            </span>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedTransaction && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">Amount</p>
                  <p
                    className={`text-lg font-bold ${selectedTransaction.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {selectedTransaction.type === "credit" ? "+" : "-"}₦
                    {parseFloat(
                      selectedTransaction.amount || 0,
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <Tag
                    color={getStatusColor(selectedTransaction.status)}
                    className="mt-1"
                  >
                    {selectedTransaction.status?.toUpperCase()}
                  </Tag>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Transaction ID</span>
                  <span className="text-gray-900 text-sm font-mono">
                    {selectedTransaction.reference}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Phone Number</span>
                  <span className="text-gray-900 text-sm">
                    {selectedTransaction.phone}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Network</span>
                  <span className="text-gray-900 text-sm capitalize">
                    {selectedTransaction.network}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Plan</span>
                  <span className="text-gray-900 text-sm text-right ml-4 max-w-[70%] truncate">
                    {selectedTransaction.plan}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Previous Balance</span>
                  <span className="text-gray-900 text-sm">
                    {selectedTransaction.oldBalance !== "N/A" ? `₦${parseFloat(selectedTransaction.oldBalance).toLocaleString()}` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">New Balance</span>
                  <span className="text-gray-900 text-sm">
                    {selectedTransaction.newBalance !== "N/A" ? `₦${parseFloat(selectedTransaction.newBalance).toLocaleString()}` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Date & Time</span>
                  <span className="text-gray-900 text-sm">
                    {format(
                      new Date(
                        selectedTransaction.createdAt ||
                          selectedTransaction.date,
                      ),
                      "dd/MM/yyyy HH:mm:ss",
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
