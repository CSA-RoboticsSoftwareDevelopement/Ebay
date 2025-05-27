/**
 * Formatters for displaying data in a consistent way throughout the application
 */

/**
 * Format a number as currency
 * @param value The numeric value to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | undefined | null, currency: string = 'USD'): string => {
  if (value === undefined || value === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a percentage value
 * @param value The decimal value to format (e.g., 0.25 for 25%)
 * @param digits Number of decimal places to include
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | undefined | null, digits: number = 1): string => {
  if (value === undefined || value === null) return 'N/A';
  
  return `${(value * 100).toFixed(digits)}%`;
};

/**
 * Format a date in a user-friendly way
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | undefined | null): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Format days to a readable format (e.g., "5 days")
 * @param days Number of days
 * @returns Formatted days string
 */
export const formatDays = (days: number | undefined | null): string => {
  if (days === undefined || days === null) return 'N/A';
  
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}; 