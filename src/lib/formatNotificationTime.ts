import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  isYesterday,
  isToday,
  isFuture,
} from "date-fns";

export const formatNotificationTime = (date: string): string => {
  const notificationDate = new Date(date);
  const now = new Date();

  // Handle invalid date
  if (isNaN(notificationDate.getTime())) {
    return "Invalid date";
  }

  // Handle future dates
  if (isFuture(notificationDate)) {
    return "In the future";
  }

  // Handle today (less than 24 hours but show minutes/hours)
  if (isToday(notificationDate)) {
    const minutes = differenceInMinutes(now, notificationDate);

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    }

    const hours = differenceInHours(now, notificationDate);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // Handle yesterday
  if (isYesterday(notificationDate)) {
    return "Yesterday";
  }

  // Handle within the last week
  const weeks = differenceInWeeks(now, notificationDate);
  if (weeks < 1) {
    const days = differenceInDays(now, notificationDate);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  // Handle within the last month
  const months = differenceInMonths(now, notificationDate);
  if (months < 1) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  // Handle within the last year
  const years = differenceInYears(now, notificationDate);
  if (years < 1) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  // Handle more than a year ago
  return `${years} year${years > 1 ? "s" : ""} ago`;
};
