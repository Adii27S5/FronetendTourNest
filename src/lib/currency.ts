// Currency conversion and formatting utilities
const USD_TO_INR_RATE = 83.5; // Approximate exchange rate

export const formatPrice = (priceUSD: number): { usd: string; inr: string } => {
  const inrValue = Math.round(priceUSD * USD_TO_INR_RATE);
  
  return {
    usd: `$${priceUSD.toLocaleString()}`,
    inr: `₹${inrValue.toLocaleString()}`
  };
};

export const formatPriceRange = (minUSD: number, maxUSD: number): { usd: string; inr: string } => {
  const minINR = Math.round(minUSD * USD_TO_INR_RATE);
  const maxINR = Math.round(maxUSD * USD_TO_INR_RATE);
  
  return {
    usd: `$${minUSD.toLocaleString()} - $${maxUSD.toLocaleString()}`,
    inr: `₹${minINR.toLocaleString()} - ₹${maxINR.toLocaleString()}`
  };
};
