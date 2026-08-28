export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  BASE_URL_DATA:
    process.env.NEXT_PUBLIC_API_BASE_URL_DATA ||
    "https://client.peyflex.com.ng/api/data",
  ENDPOINTS: {
    AUTH: {
      SIGNUP: "/auth/register",
      SIGNIN: "/auth/login",
      DISABLE_ACCOUNT: "/auth/disable-account",
      DELETE_ACCOUNT: "/auth/delete-account",
    },

    ACCOUNT: {
      CREATE: "/account/create/",
      CREATE_VIRTUAL: "/wallet/topup/initiate/",
      GET: "/account/",
      walletBalance: "/wallet/",
      allWalletTransactions: "/wallet/",
      ALL_HISTORY: "/transactions/history/",
    },

    PROFILE: {
      UPDATE: "/profile/update",
      GET: "/user/profile",
      UPDATE_USER: "/user/update",
      DELETE: "/user/delete/",
      SHIPPING: "/profile/shipping",
    },

    FUNDING_HISTORY: {
      GET: "/wallet/",
    },

    NIN_VERIFICATION: {
      CREATE: "/verify/nin",
      DATA_HISTORY: "/transactions/dataHistory/", // append userId
    },
    BVN_VERIFICATION: {
      CREATE: "/verify/bvn",
      DATA_HISTORY: "/transactions/dataHistory/", // append userId
    },
    WAEC: {
      BUY_PIN: "/verify/waec", // endpoint for WAEC scratch card
      DATA_HISTORY: "/transactions/dataHistory/", // append userId
    },
    NECO: {
      BUY_PIN: "/verify/neco", // endpoint for NECO scratch card
      DATA_HISTORY: "/transactions/dataHistory/", // append userId
    },
    IPE_VERIFICATION: {
      CREATE: "/verify/submit/ipe",
      CHECK: "/verify/freeStatus/ipe",
      DATA_HISTORY: "/transactions/dataHistory/", // append userId
    },
    SECURITY: {
      SET_PIN: "/wallet/set-pin",
      UPDATE_PIN: "/wallet/change-pin",
      CHANGE_PASSWORD: "/security/change-password",
      RESET_PASSWORD: "/security/reset-password",
    },
    FETCH_PRICES: {
      PRICES: "/transactions/prices",
    },
    DATA: {
      GET_ALL: "/data-plan",
      GET_BY_NETWORK: "/data-plan/network/", // append {network}
      GET_BY_PLAN_ID: "/data-plan/", // append {planId}
      CREATE_PLAN: "/data-plan/", // append {adminUserId}
      UPDATE_PLAN: "/data-plan/", // append {planId}/{adminUserId}
      DELETE_PLAN: "/data-plan/", // append {planId}/{adminUserId}
      TOGGLE_PLAN_STATUS: "/data-plan/", // append {planId}/toggle-status/{adminUserId}
      CREATE: "/vtu/data",
      HISTORY: "/transactions/history/", // append userId
    },
    TRANSACTIONS: {
      HISTORY: "/transactions/history/", // append {userId}
    },
    AIRTIME: {
      GET_ALL: "/airtime-plan",
      GET_BY_NETWORK: "/airtime-plan/network", // append /{network}
      CREATE: "/vtu/airtime",
      HISTORY: "/transactions/history/", // append userId
    },
    NOTIFICATIONS: {
      GET: "/notifications/",                            // append {userId}
      GET_ADMIN: "/notifications/admin/",                 // append {adminUserId}
      READ: "/notifications/",                            // append {notificationId}/mark-read/{userId}, POST
      DELETE: "/notifications/",                          // append {notificationId}/{adminUserId}, DELETE
    },
    REFERRALS: {
      COMMISSIONS: "/wallet/referral-commissions/",  // append {userId}
      REFERRED_USERS: "/wallet/referred-users/",     // append {userId}
    },
    ADMIN: {
      DASHBOARD_STATS: "/admin/dashboard/stats/",        // append {adminId}
      DASHBOARD_DAILY: "/admin/dashboard/daily/",        // append {adminId}
      DASHBOARD_WEEKLY: "/admin/dashboard/weekly/",      // append {adminId}
      PROFIT_DAILY: "/admin/dashboard/profit/daily/",      // append {adminUserId}
      PROFIT_WEEKLY: "/admin/dashboard/profit/weekly/",    // append {adminUserId}
      PROFIT_MONTHLY: "/admin/dashboard/profit/monthly/",  // append {adminUserId}
      USERS: "/admin/users/",                            // append {adminUserId}
      USER_STATS: "/admin/users/",                       // append {userId}/stats/{adminUserId}
      UPDATE_USER: "/admin/updateUser/",                 // append {adminUserId}, PUT
      DELETE_USER: "/admin/deleteUser/",                 // append {adminUserId}, DELETE
      ADD_BALANCE: "/admin/addBalance/",                 // append {adminUserId}, POST
      DEBIT_BALANCE: "/admin/debitBalance/",             // append {adminUserId}, POST
      UPGRADE_USER: "/admin/upgradeuser/",               // append {adminUserId}, POST (super admin only)
      DOWNGRADE_USER: "/admin/downgradeuser/",           // append {adminUserId}, POST (super admin only)
      SEND_NOTIFICATION: "/notifications/send/",         // append {adminUserId}, POST
    },
  },
};

export const apiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;

export const apiUrlData = (endpoint) =>
  `${API_CONFIG.BASE_URL_DATA}${endpoint}`;
