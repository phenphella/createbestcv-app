// Payment configuration settings
export const paymentConfig = {
  // Your business details
  business: {
    name: 'Create Best CV',
    email: 'payments@createbestcv.com',
    website: 'https://www.createbestcv.com',
  },
  
  // Product details
  product: {
    name: 'Tailored CV and Cover Letter',
    price: 0.20, // Price in GBP (£0.20)
    currency: 'GBP',
  },
  
  // PayPal settings
  paypal: {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AYEO4t1f2LKyxa7G1mqhIPLpHVZyGCs-4irztMpbvBXk1USc0V6-S4VTEE8DMAXZ5Lz9kMkyFJLykcp2',
    currency: 'GBP',
    apiEndpoint: 'https://api-m.paypal.com' // Production API endpoint
  }
};

// Payment methods supported
export const paymentMethods = [
  {
    id: 'paypal',
    name: 'PayPal',
    icon: 'CreditCard',
    description: 'Pay securely with PayPal or card',
    enabled: true,
  }
];

// Function to get formatted price with currency conversion
export const getFormattedPrice = (price: number = paymentConfig.product.price): string => {
  // Get user's locale for currency display
  const userLocale = navigator.language || 'en-GB';
  const userCurrency = getUserCurrency(userLocale);
  
  // Convert price if needed
  const convertedPrice = convertCurrency(price, paymentConfig.product.currency, userCurrency);
  
  // Format the price according to user's locale and currency
  return new Intl.NumberFormat(userLocale, {
    style: 'currency',
    currency: userCurrency,
  }).format(convertedPrice);
};

// Helper function to determine user's currency based on locale
function getUserCurrency(locale: string): string {
  // Map of common locales to currencies
  const localeCurrencyMap: Record<string, string> = {
    'en-US': 'USD',
    'en-CA': 'CAD',
    'en-AU': 'AUD',
    'en-NZ': 'NZD',
    'en-IE': 'EUR',
    'fr-FR': 'EUR',
    'de-DE': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'ja-JP': 'JPY',
  };
  
  // Default to GBP for UK and unknown locales
  if (locale.startsWith('en-GB') || !localeCurrencyMap[locale]) {
    return 'GBP';
  }
  
  // For other European countries, use EUR
  if (locale.includes('-') && ['AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 
                              'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES'].includes(locale.split('-')[1])) {
    return 'EUR';
  }
  
  return localeCurrencyMap[locale] || 'GBP';
}

// Helper function to convert currency
function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Simple conversion rates (as of 2025)
  // In a production app, you would use a currency API
  const conversionRates: Record<string, Record<string, number>> = {
    'GBP': {
      'USD': 1.28,
      'EUR': 1.17,
      'CAD': 1.73,
      'AUD': 1.91,
      'NZD': 2.05,
      'JPY': 191.5
    }
  };
  
  // If we have a conversion rate, apply it
  if (conversionRates[fromCurrency] && conversionRates[fromCurrency][toCurrency]) {
    return amount * conversionRates[fromCurrency][toCurrency];
  }
  
  // Fallback to original amount if no conversion rate is available
  return amount;
}