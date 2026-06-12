# Dynamic Pricing Implementation Guide

## Overview
This document explains how dynamic pricing is fetched from the API and applied to different products (NIN, BVN, and Data services).

## API Configuration

### Endpoint
```javascript
API_CONFIG.ENDPOINTS.FETCH_PRICES.PRICES = "/transactions/prices"
```

### Expected API Response Format
```json
[
  {
    "key": "nin",
    "prices": {
      "agent": 100,
      "user": 120,
      "reseller": 90
    }
  },
  {
    "key": "bvn",
    "prices": {
      "agent": 50,
      "user": 60,
      "reseller": 45
    }
  },
  {
    "key": "data",
    "plans": [
      {
        "planId": "mtn-1",
        "networkId": "mtn",
        "name": "1GB Data",
        "validity": "30 Days",
        "price": 300
      },
      // ... more plans
    ]
  }
]
```

## Implementation Pattern

### 1. NIN Slip Page (`app/dashboard/services/nin-slip/page.jsx`)

#### State Management
```javascript
const [priceLoading, setPriceLoading] = useState(false);
const [agentPrices, setAgentPrices] = useState([]);
```

#### Fetching Prices
```javascript
useEffect(() => {
  const fetchPrices = async () => {
    setPriceLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.FETCH_PRICES.PRICES)
      );
      
      // Find NIN pricing
      const ninPricingData = Array.isArray(response.data)
        ? response.data.find((item) => item.key === "nin")
        : response.data;

      const ninPricing = ninPricingData?.key === "nin" ? ninPricingData : null;

      if (ninPricing && ninPricing.prices) {
        // Update slipTypes with new prices
        const updatedSlipTypes = slipTypes.map((slip) => ({
          ...slip,
          price: `₦${ninPricing.prices.agent}`,
        }));

        setAgentPrices(updatedSlipTypes);
      } else {
        // Fallback to default slipTypes
        setAgentPrices(slipTypes);
      }
    } catch (error) {
      console.error("Error fetching API prices:", error);
      message.error("Failed to fetch current prices");
      setAgentPrices(slipTypes);
    } finally {
      setPriceLoading(false);
    }
  };

  fetchPrices();
}, []);
```

#### Using Dynamic Prices
```javascript
// In handleVerify function
const currentSlipTypes = agentPrices.length > 0 ? agentPrices : slipTypes;
const selectedSlipData = currentSlipTypes.find((s) => s.id === selectedSlip);

// In render
{(agentPrices.length > 0 ? agentPrices : slipTypes).map((slip) => (
  // ... slip rendering
))}
```

### 2. BVN Slip Page (`app/dashboard/services/bvn-slip/page.jsx`)

Same pattern as NIN, but searches for `key === "bvn"`:

```javascript
const bvnPricingData = Array.isArray(response.data)
  ? response.data.find((item) => item.key === "bvn")
  : response.data;
```

### 3. Data Page (`app/dashboard/services/data/page.jsx`)

Different approach - fetches complete plan list:

```javascript
useEffect(() => {
  const fetchDataPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.FETCH_PRICES.PRICES)
      );
      
      // Find data pricing
      const dataPricingData = Array.isArray(response.data)
        ? response.data.find((item) => item.key === "data")
        : response.data;

      if (dataPricingData && dataPricingData.plans) {
        // Use plans from API
        setPlans(dataPricingData.plans);
      } else {
        // Fallback to default plans
        setPlans(allPlans);
      }
    } catch (error) {
      console.error("Error fetching data plans:", error);
      setPlans(allPlans);
    } finally {
      setLoading(false);
    }
  };

  fetchDataPlans();
}, []);
```

## Key Features

### 1. **Graceful Fallback**
- If API fails, uses hardcoded default prices
- Ensures app continues to function even with API issues

### 2. **Loading States**
- `priceLoading` state tracks API call status
- Can be used to show loading indicators

### 3. **Error Handling**
- Catches API errors
- Shows user-friendly error messages using Ant Design's `message` component
- Falls back to default values

### 4. **Flexible Data Structure**
- Supports both simple pricing (NIN, BVN) and complex plan structures (Data)
- API response can be array or object

## Benefits

1. **Centralized Pricing**: All prices managed from backend
2. **Real-time Updates**: Prices can be changed without code deployment
3. **Type-specific Pricing**: Different prices for agent, user, reseller
4. **Reliability**: Fallback ensures app always works

## Testing

### Test Scenarios
1. ✅ API returns valid pricing data
2. ✅ API returns empty/invalid data → Falls back to defaults
3. ✅ API request fails → Falls back to defaults
4. ✅ Network timeout → Falls back to defaults

### Console Logs
Each implementation logs the API response:
```javascript
console.log("API Prices Response:", response.data);
```

## Future Enhancements

1. **Caching**: Cache prices to reduce API calls
2. **Refresh Button**: Allow manual price refresh
3. **Price History**: Track price changes over time
4. **Admin Panel**: UI for managing prices
