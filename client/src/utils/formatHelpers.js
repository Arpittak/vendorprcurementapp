export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const calculateTotalWithGst = (itemAmount, taxPercentage) => {
  const amount = Number(itemAmount) || 0;
  const tax = Number(taxPercentage) || 0;
  const gstAmount = (amount * tax) / 100;
  return amount + gstAmount;
};

export const formatDate = (date, locale = 'en-IN') => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

export const formatNumber = (value, decimals = 2) => {
  return Number(value || 0).toFixed(decimals);
};

export const pluralize = (count, singular, plural = null) => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};