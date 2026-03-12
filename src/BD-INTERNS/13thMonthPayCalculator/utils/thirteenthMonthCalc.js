/**
 * 13th month pay calculation utilities.
 * Formula: 13th Month Pay = Total Basic Salary Earned in Calendar Year ÷ 12
 * Prorated when employed for less than 12 months.
 */

/**
 * Count weekdays (Mon–Fri) between two dates, inclusive.
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number}
 */
export function countWeekdaysInRange(startDate, endDate) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  if (end < start) return 0;
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    const day = d.getDay();
    if (day >= 1 && day <= 5) count += 1;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

/**
 * Get days in a given month (1-indexed).
 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Compute total basic salary earned from startDate to endDate (inclusive),
 * at the given monthly basic salary. Prorates partial months by days worked.
 * @param {number} monthlyBasicSalary - Monthly basic salary
 * @param {Date} startDate - First day of employment in the year
 * @param {Date} endDate - Last day of employment in the year
 * @param {number} unpaidAbsenceDays - Optional unpaid absence days to deduct
 * @returns {{ totalBasicEarned: number, dailyRate: number, workingDays: number, unpaidDeduction: number }}
 */
export function computeTotalBasicEarned(monthlyBasicSalary, startDate, endDate, unpaidAbsenceDays = 0) {
  if (!monthlyBasicSalary || monthlyBasicSalary <= 0) {
    return { totalBasicEarned: 0, dailyRate: 0, workingDays: 0, unpaidDeduction: 0 };
  }

  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (end < start) {
    return { totalBasicEarned: 0, dailyRate: 0, workingDays: 0, unpaidDeduction: 0 };
  }

  let totalEarned = 0;
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const daysInMonth = getDaysInMonth(year, month + 1);

    let firstWorked = 1;
    let lastWorked = daysInMonth;

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth);

    if (monthStart < start) firstWorked = start.getDate();
    if (monthEnd > end) lastWorked = end.getDate();

    const daysWorked = Math.max(0, lastWorked - firstWorked + 1);
    const fraction = daysWorked / daysInMonth;
    totalEarned += monthlyBasicSalary * fraction;

    current.setMonth(current.getMonth() + 1);
  }

  const dailyRate = monthlyBasicSalary / 22;
  const unpaidDeduction = Math.min(unpaidAbsenceDays * dailyRate, totalEarned);
  const totalBasicEarned = Math.max(0, totalEarned - unpaidDeduction);

  return {
    totalBasicEarned,
    dailyRate,
    workingDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
    unpaidDeduction,
  };
}

/**
 * Compute 13th month pay.
 * 13th Month Pay = Total Basic Salary Earned ÷ 12
 */
export function compute13thMonthPay(totalBasicEarned) {
  return totalBasicEarned / 12;
}
