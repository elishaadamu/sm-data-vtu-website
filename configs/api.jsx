export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  BASE_URL_DATA:
    process.env.NEXT_PUBLIC_API_BASE_URL_DATA ||
    "https://client.peyflex.com.ng/api/data",
  ENDPOINTS: {
    AUTH: {
      SIGNUP: "/auth/register",
      SIGNIN: "/auth/login",
    },

    ACCOUNT: {
      CREATE: "/account/create/",
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
      GET_ALL: "/networks/",
      GET_BY_NETWORK: "/plans/?network", // append /{network}
      CREATE: "/vtu/data",
      HISTORY: "/transactions/history/", // append userId
    },
    AIRTIME: {
      GET_ALL: "/airtime-plan",
      GET_BY_NETWORK: "/airtime-plan/network", // append /{network}
      CREATE: "/vtu/airtime",
      HISTORY: "/transactions/history/", // append userId
    },
  },
};

export const apiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;

export const apiUrlData = (endpoint) =>
  `${API_CONFIG.BASE_URL_DATA}${endpoint}`;
