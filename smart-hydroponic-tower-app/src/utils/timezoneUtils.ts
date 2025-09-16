/**
 * Utility functions for handling timezone conversions between UTC and Eastern European Time (EET/EEST)
 * 
 * Problem: Database timestamps are stored with +00:00 timezone but actually represent 
 * Eastern European Time (UTC+2 in winter, UTC+3 in summer with DST)
 */

/**
 * Convert a database timestamp to the correct EET/EEST local time
 * @param dbTimestamp - The timestamp from the database (with +00:00 but actually EET/EEST)
 * @returns Date object representing the correct local time
 */
export const convertDbTimestampToLocalTime = (dbTimestamp: string): Date => {
  // Parse the timestamp - JavaScript treats this as UTC time
  const utcDate = new Date(dbTimestamp);
  
  // The UTC components actually represent the local EET/EEST time
  // So we need to create a new date using the UTC components as local components
  const localDate = new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds(),
    utcDate.getUTCMilliseconds()
  );
  
  return localDate;
};

/**
 * Get the last Sunday of a given month and year
 * @param year - The year
 * @param month - The month (0-indexed)
 * @returns Date object for the last Sunday of the month
 */
function getLastSundayOfMonth(year: number, month: number): Date {
  // Get the last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Find the last Sunday
  const lastSunday = new Date(lastDay);
  lastSunday.setDate(lastDay.getDate() - lastDay.getDay());
  
  // Set time to 3 AM (when DST changes occur)
  lastSunday.setHours(3, 0, 0, 0);
  
  return lastSunday;
}

/**
 * Format a date for display in local EET/EEST timezone
 * @param date - The date to format (already in correct local time)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatLocalTime = (
  date: Date, 
  options: Intl.DateTimeFormatOptions = {}
): string => {
  // Since the date is already in the correct local time, 
  // we just need to format it without timezone conversion
  const defaultOptions: Intl.DateTimeFormatOptions = {
    ...options
  };
  
  return date.toLocaleString('en-US', defaultOptions);
};

/**
 * Get hour label for chart display in EET/EEST
 * @param date - The date to format
 * @returns Hour label string (e.g., "14:30")
 */
export const getHourLabel = (date: Date): string => {
  return formatLocalTime(date, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Get date label for chart display in EET/EEST
 * @param date - The date to format
 * @param includeTime - Whether to include time (AM/PM)
 * @returns Date label string (e.g., "Jan 15" or "Jan 15 PM")
 */
export const getDateLabel = (date: Date, includeTime: boolean = false): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };
  
  if (includeTime) {
    const hour = parseInt(formatLocalTime(date, { hour: '2-digit', hour12: false }));
    const period = hour < 12 ? 'AM' : 'PM';
    return `${formatLocalTime(date, options)} ${period}`;
  }
  
  return formatLocalTime(date, options);
};

/**
 * Check if we're currently in DST period
 * @returns boolean indicating if current time is in DST
 */
export const isCurrentlyDST = (): boolean => {
  const now = new Date();
  const year = now.getFullYear();
  const dstStart = getLastSundayOfMonth(year, 2); // March
  const dstEnd = getLastSundayOfMonth(year, 9);   // October
  
  return now >= dstStart && now < dstEnd;
};

/**
 * Get current EET/EEST offset from UTC
 * @returns number of hours offset from UTC
 */
export const getCurrentEETOffset = (): number => {
  return isCurrentlyDST() ? 3 : 2; // EEST = UTC+3, EET = UTC+2
};