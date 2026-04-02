import { format } from "date-fns";

// ✅ CURRENCY FORMATTING
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

// ✅ DATE FORMATTING
export const formatDate = (
  date: Date | string,
  formatStr: string = "dd MMM yyyy"
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
};

// ✅ GET CURRENT MONTH DATE RANGE (1st to last day)
export const getCurrentMonthDateRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // First day of current month
  const startDate = new Date(year, month, 1);
  // Last day of current month
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: formatDateToISO(startDate),
    endDate: formatDateToISO(endDate),
  };
};

// ✅ FORMAT DATE TO ISO STRING (YYYY-MM-DD)
export const formatDateToISO = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

// ✅ GET DATE RANGE (custom start and end date)
export const getCustomDateRange = (startDate: Date, endDate: Date) => {
  return {
    startDate: formatDateToISO(startDate),
    endDate: formatDateToISO(endDate),
  };
};

// ✅ CALCULATE TOTAL EARNINGS
export const calculateTotalEarnings = (
  pieceCount: number,
  ratePerPiece: number
): number => {
  return pieceCount * ratePerPiece;
};

// ✅ CALCULATE AVERAGE
export const calculateAverage = (total: number, count: number): number => {
  return count > 0 ? total / count : 0;
};

// ✅ TRUNCATE TEXT
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// ✅ FORMAT NUMBER WITH COMMAS
export const formatNumber = (num: number): string => {
  return num.toLocaleString("en-IN");
};

// ✅ GET MONTH NAME
export const getMonthName = (date: Date = new Date()): string => {
  return format(date, "MMMM yyyy");
};

// ✅ GET DAY NAME
export const getDayName = (date: Date = new Date()): string => {
  return format(date, "EEEE");
};

// ✅ CHECK IF DATE IS TODAY
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

// ✅ CHECK IF DATE IS THIS MONTH
export const isThisMonth = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

// ✅ GET TIME AGO (e.g., "2 hours ago")
export const getTimeAgo = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
};

// ✅ PARSE ISO DATE STRING
export const parseISODate = (dateString: string): Date => {
  return new Date(dateString);
};

// ✅ GET WEEK DATES (Monday to Sunday)
export const getWeekDateRange = (date: Date = new Date()) => {
  const current = new Date(date);
  const first = current.getDate() - current.getDay() + 1; // Monday
  const last = first + 6; // Sunday

  const startDate = new Date(current.setDate(first));
  const endDate = new Date(current.setDate(last));

  return {
    startDate: formatDateToISO(startDate),
    endDate: formatDateToISO(endDate),
  };
};

// ✅ ROUND NUMBER TO 2 DECIMALS
export const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100;
};

// ✅ CALCULATE PERCENTAGE
export const calculatePercentage = (
  value: number,
  total: number
): number => {
  return total > 0 ? (value / total) * 100 : 0;
};

export const formatDateLocal = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};



// import {
//   formatCurrency,
//   formatDate,
//   getCurrentMonthDateRange,
//   calculateTotalEarnings,
//   getMonthName,
//   getTimeAgo,
//   roundToTwo,
// } from "../utils/helpers";

// // ✅ Currency
// console.log(formatCurrency(1307.5)); // ₹1,307.50

// // ✅ Date Range (Current Month)
// const { startDate, endDate } = getCurrentMonthDateRange();
// console.log(startDate, endDate); // 2025-12-01, 2025-12-31

// // ✅ Total Earnings
// const total = calculateTotalEarnings(100, 50); // 5000

// // ✅ Month Name
// console.log(getMonthName()); // December 2025

// // ✅ Time Ago
// console.log(getTimeAgo(new Date())); // just now
// console.log(getTimeAgo("2025-12-11")); // 4 days ago

// // ✅ Round Number
// console.log(roundToTwo(1307.556)); // 1307.56
