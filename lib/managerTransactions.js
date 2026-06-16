export const unwrapList = (payload, keys = []) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const formatCurrency = (value) => {
  if (value === "" || value === null || value === undefined) return "N/A";
  const numericValue = Number(String(value).replace(/,/g, ""));
  return Number.isNaN(numericValue)
    ? `₦${value}`
    : `₦${numericValue.toLocaleString()}`;
};

export const normalizeTransaction = (transaction) => {
  let network = transaction.network;
  let phone = transaction.phone || transaction.phoneNumber || transaction.recipient;

  if (!network && transaction.description) {
    const networkMatch = transaction.description.match(/:\s*([^-]+)\s*-/);
    if (networkMatch) network = networkMatch[1].trim();
  }

  if (!phone && transaction.description) {
    const phoneMatch = transaction.description.match(/(?:for|-)\s*(\d{11})/);
    if (phoneMatch) phone = phoneMatch[1];
  }

  const type =
    transaction.type ||
    transaction.transactionType ||
    transaction.TransactionType ||
    transaction.category ||
    "";

  const status = transaction.status || transaction.paymentStatus || "N/A";

  return {
    raw: transaction,
    id:
      transaction.transactionReference ||
      transaction.reference ||
      transaction.transactionId ||
      transaction._id ||
      transaction.id ||
      "N/A",
    date:
      transaction.createdAt ||
      transaction.date ||
      transaction.updatedAt ||
      transaction.created_at ||
      "N/A",
    network: network || "N/A",
    type: type ? String(type).replace(/_/g, " ") : "N/A",
    amount: transaction.amount ?? transaction.price ?? transaction.totalAmount ?? "N/A",
    plan:
      transaction.plan ||
      transaction.planName ||
      transaction.plan_name ||
      transaction.description ||
      "N/A",
    phone: phone || "N/A",
    agentPhone:
      transaction.agentPhone ||
      transaction.userPhone ||
      transaction.customerPhone ||
      transaction.phone ||
      "N/A",
    status,
    prevBal:
      transaction.oldBalance ??
      transaction.balanceBefore ??
      transaction.previousBalance ??
      transaction.prevBal ??
      "N/A",
    newBal:
      transaction.newBalance ??
      transaction.balanceAfter ??
      transaction.currentBalance ??
      transaction.newBal ??
      "N/A",
  };
};

export const isPaymentTransaction = (transaction) => {
  const haystack = [
    transaction.type,
    transaction.transactionType,
    transaction.TransactionType,
    transaction.category,
    transaction.method,
    transaction.paymentMethod,
    transaction.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes("fund") ||
    haystack.includes("deposit") ||
    haystack.includes("credit") ||
    haystack.includes("wallet")
  );
};

export const isOrderTransaction = (transaction) => !isPaymentTransaction(transaction);
